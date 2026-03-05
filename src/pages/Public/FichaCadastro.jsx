import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';

import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { InputMask } from 'primereact/inputmask';
import { InputText } from 'primereact/inputtext';

import SignatureCanvas from 'react-signature-canvas';
import html2pdf from 'html2pdf.js';

const mapeamentoSetores = {
  1: { nome: 'Templo Sede (Ponte do Imaruim)' },
  2: { nome: 'Caminho Novo' },
  3: { nome: 'Pachecos' },
  4: { nome: 'Aririú' },
  5: { nome: 'Rio Grande' },
  6: { nome: 'Alto Aririú' },
  7: { nome: 'Enseada da Pinheira / Morretes' },
  8: { nome: 'Passa Vinte' },
  9: { nome: 'Bela Vista / Shalom / Vale da Benção' },
  10: { nome: 'Madri / São Sebastião' },
  11: { nome: 'Pagani' },
  12: { nome: 'Jardim Eldorado' },
  13: { nome: 'Brejaru' },
  14: { nome: 'Frei Lauro' },
  15: { nome: 'Barra do Aririú' },
  16: { nome: 'Vila Nova' },
  17: { nome: 'Alaor Silveira / São Luiz' },
};

const opcoesSetores = Object.entries(mapeamentoSetores).map(([id, info]) => ({
  label: `${id} - ${info.nome}`,
  value: Number(id),
}));

const opcoesSexo = [
  { label: 'Masculino', value: 'Masculino' },
  { label: 'Feminino', value: 'Feminino' },
];

const opcoesEstadoCivil = [
  { label: 'Solteiro(a)', value: 'Solteiro(a)' },
  { label: 'Casado(a)', value: 'Casado(a)' },
  { label: 'Divorciado(a)', value: 'Divorciado(a)' },
  { label: 'Viúvo(a)', value: 'Viúvo(a)' },
];

const opcoesRecebimento = [
  { label: 'Batismo nas Águas', value: 'Batismo nas Águas' },
  { label: 'Aclamação', value: 'Aclamação' },
  { label: 'Transferência', value: 'Transferência' },
];

const initialFormData = {
  nome: '',
  cpf: '',
  nascimento: null,
  sexo: '',
  estadoCivil: '',
  contato: '',
  cep: '',
  endereco: '',
  numero: '',
  bairro: '',
  cidade: '',
  uf: '',
  setor: null,
  recebimento: '',
  dataBatismo: null,
  cargoAtual: '',
  talentos: '',
};

export const FichaCadastro = () => {

  const navigate = useNavigate();
  const sigCanvas = useRef(null);

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [cpfValido, setCpfValido] = useState(true);
  const [enviado, setEnviado] = useState(false);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validarCPF = (cpf) => {

    const limpo = cpf.replace(/\D/g, '');

    if (limpo.length !== 11 || /(\d)\1{10}/.test(limpo)) return false;

    let soma = 0;

    for (let i = 0; i < 9; i++) {
      soma += Number(limpo[i]) * (10 - i);
    }

    let digito = (soma * 10) % 11;
    if (digito === 10) digito = 0;

    if (digito !== Number(limpo[9])) return false;

    soma = 0;

    for (let i = 0; i < 10; i++) {
      soma += Number(limpo[i]) * (11 - i);
    }

    digito = (soma * 10) % 11;
    if (digito === 10) digito = 0;

    return digito === Number(limpo[10]);
  };

  const handleCPFChange = (e) => {

    updateField('cpf', e.value);

    if (!e.value || e.value.includes('_')) {
      setCpfValido(true);
      return;
    }

    setCpfValido(validarCPF(e.value));
  };

  const handleCEPBlur = async (e) => {

    const cep = e.target.value?.replace(/\D/g, '');

    if (!cep || cep.length !== 8) return;

    try {

      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) return;

      setFormData((prev) => ({
        ...prev,
        endereco: data.logradouro || prev.endereco,
        bairro: data.bairro || prev.bairro,
        cidade: data.localidade || prev.cidade,
        uf: data.uf || prev.uf,
      }));

    } catch {}
  };

  const limparAssinatura = () => {

    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
  };

  const gerarPDF = () => {

    const input = document.getElementById('ficha-pdf-template');

    if (!input) return;

    html2pdf()
      .set({
        margin: 10,
        filename: `ficha-${formData.nome || 'membro'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(input)
      .save();
  };

  const handleCadastroESalvar = async () => {

    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      alert('Por favor, assine a ficha.');
      return;
    }

    if (!cpfValido) {
      alert('CPF inválido.');
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      nascimento: formData.nascimento
        ? new Date(formData.nascimento).toISOString().split('T')[0]
        : null,
      dataBatismo: formData.dataBatismo
        ? new Date(formData.dataBatismo).toISOString().split('T')[0]
        : null,
      assinatura: sigCanvas.current.toDataURL('image/png'),
      criado_em: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('membros')
      .insert([payload]);

    if (error) {

      alert(`Erro ao salvar: ${error.message}`);
      setLoading(false);
      return;
    }

    gerarPDF();
    setEnviado(true);
    setLoading(false);
  };

  if (enviado) {

    return (
      <div className="flex align-items-center justify-content-center h-screen bg-gray-100 p-4">

        <Card className="text-center w-full md:w-30rem">

          <i className="pi pi-check-circle text-5xl text-green-600 mb-3"></i>

          <h2>CADASTRO ENVIADO!</h2>

          <p>Dados salvos e PDF gerado.</p>

          <Button
            label="Voltar para Home"
            onClick={() => navigate('/')}
          />

        </Card>

      </div>
    );
  }

  return (

    <div className="min-h-screen p-4">

      <div className="max-w-7xl mx-auto">

        <div className="flex align-items-center mb-4 bg-white p-3 shadow-2 border-round">

          <Button
            icon="pi pi-arrow-left"
            className="p-button-text mr-3"
            onClick={() => navigate('/')}
          />

          <h1 className="text-blue-900 font-bold m-0 text-2xl">
            Ficha de Cadastro de Membros 2026
          </h1>

        </div>

        <Card className="p-fluid shadow-8">

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCadastroESalvar();
            }}
          >

            <h3>Dados Pessoais</h3>

            <div className="grid">

              <div className="col-12 md:col-6">
                <label>Nome</label>
                <InputText
                  value={formData.nome}
                  onChange={(e) =>
                    updateField('nome', e.target.value)
                  }
                />
              </div>

              <div className="col-12 md:col-6">
                <label>CPF</label>
                <InputMask
                  mask="999.999.999-99"
                  value={formData.cpf}
                  onChange={handleCPFChange}
                />
              </div>

            </div>

            <Divider />

            <h3>Assinatura</h3>

            <div className="border-2 p-2 bg-white">

              <SignatureCanvas
                ref={sigCanvas}
                canvasProps={{
                  width: 500,
                  height: 150,
                  className: 'sigCanvas',
                }}
              />

            </div>

            <Button
              type="button"
              label="Limpar"
              onClick={limparAssinatura}
              className="p-button-secondary mt-2"
            />

            <div className="mt-4">

              <Button
                type="submit"
                label="Salvar Cadastro e Gerar PDF"
                loading={loading}
                className="p-button-success"
              />

            </div>

          </form>

        </Card>

      </div>

      <div
        id="ficha-pdf-template"
        style={{
          position: 'absolute',
          left: '-9999px',
          width: '210mm',
          background: '#fff',
          padding: '15mm',
        }}
      >

        <h1>Ficha de Membro</h1>

        <p>Nome: {formData.nome}</p>
        <p>CPF: {formData.cpf}</p>

      </div>

    </div>
  );
};