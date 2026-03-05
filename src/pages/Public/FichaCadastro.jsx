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
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { RadioButton } from 'primereact/radiobutton';

import SignatureCanvas from 'react-signature-canvas';
// Se der erro no import abaixo, use a linha comentada:
// import html2pdf from 'html2pdf.js/dist/html2pdf.bundle.js';
import html2pdf from 'html2pdf.js';

// ----------------------
// Mapeamentos e opções (JS puro)
// ----------------------
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

const opcoesEscolaridade = [
  'Fundamental Incompleto',
  'Fundamental Completo',
  'Médio Incompleto',
  'Médio Completo',
  'Superior Incompleto',
  'Superior Completo',
  'Pós/Especialização',
  'Mestrado',
  'Doutorado',
].map((x) => ({ label: x, value: x }));

const opcoesCargosFuncoes = [
  'Pastor(a) Local',
  'Evangelista',
  'Presbítero',
  'Diácono(a)',
  'Cooperador(a)',
  'Líder de Setor',
  'Líder de Congregação',
  'Líder de Círculo de Oração',
  'Líder de Mocidade',
  'Líder de Jovens/Adolescentes',
  'Líder de Crianças',
  'Líder de Missões',
  'Professor(a) EBD',
  'Regente',
  'Músico(a)',
  'Obreiro(a) de Apoio',
  'Recepção',
  'Som/Multimídia',
  'Intercessão',
].map((x) => ({ label: x, value: x }));

const opcoesDonsMinisterios = [
  'Ensino',
  'Evangelismo',
  'Intercessão',
  'Louvor',
  'Instrumentista',
  'Conselhamento',
  'Missões',
  'Apoio Social',
  'Visitação',
  'Células/Pequenos Grupos',
].map((x) => ({ label: x, value: x }));

// ----------------------
// Estado inicial (JS puro)
// ----------------------
const initialFormData = {
  // Cabeçalho
  tipoVinculo: 'Membro', // 'Membro' ou 'Congregado'

  // Dados pessoais
  nome: '',
  cpf: '',
  rg: '',
  orgaoExpedidor: '',
  nascimento: null, // Date ou null
  sexo: '', // 'Masculino' | 'Feminino'
  estadoCivil: '',
  naturalidade: '', // cidade/UF onde nasceu
  contato: '',
  email: '',
  pai: '',
  mae: '',

  // Endereço
  cep: '',
  endereco: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '',
  setor: null, // número do setor (1..17) ou null

  // Profissionais
  ocupacao: '',
  empresa: '',
  escolaridade: '',
  trabalha: '', // 'Sim' | 'Não'
  possuiCursoTeologico: '', // 'Sim' | 'Não'
  cursoTeologicoQual: '',

  // Igreja (histórico)
  recebimento: '', // 'Batismo nas Águas' | 'Aclamação' | 'Transferência'
  dataConversao: null,
  igrejaConversao: '',
  batismoNasAguas: '', // 'Sim' | 'Não'
  dataBatismo: null,
  igrejaBatismo: '',
  porCarta: '', // 'Sim' | 'Não'
  igrejaOrigemCarta: '',
  dataCarta: null,
  aprovacao: '', // 'Sim' | 'Não'
  dataAprovacao: null,

  // Cargos/Funções
  cargosFuncoes: [], // array de strings
  congregacaoAtuacao: '',
  dataConsagracao: null,
  localConsagracao: '',

  // Família
  conjugeNome: '',
  conjugeContato: '',
  filhos: '', // texto livre (nomes/idades)
  moraCom: '', // Ex.: Pais / Cônjuge / Sozinho
  tempoDeCasa: '',

  // Dons/Ministérios
  donsMinisterios: [], // array de strings
  talentos: '',

  // Assinatura
  assinaturaBase64: '',
};

// ----------------------
// Componente
// ----------------------
export const FichaCadastro = () => {
  const navigate = useNavigate();
  const sigCanvas = useRef(null);

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [cpfValido, setCpfValido] = useState(true);
  const [enviado, setEnviado] = useState(false);

  // ----------------------
  // Helpers
  // ----------------------
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validarCPF = (cpf) => {
    if (!cpf) return false;
    const limpo = String(cpf).replace(/\D/g, '');
    if (limpo.length !== 11 || /(\d)\1{10}/.test(limpo)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += Number(limpo[i]) * (10 - i);
    let digito = (soma * 10) % 11;
    if (digito === 10) digito = 0;
    if (digito !== Number(limpo[9])) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += Number(limpo[i]) * (11 - i);
    digito = (soma * 10) % 11;
    if (digito === 10) digito = 0;

    return digito === Number(limpo[10]);
  };

  const handleCPFChange = (e) => {
    updateField('cpf', e.value);
    if (!e.value || String(e.value).includes('_')) {
      setCpfValido(true);
      return;
    }
    setCpfValido(validarCPF(e.value));
  };

  const handleCEPBlur = async (e) => {
    const cep = (e.target.value || '').replace(/\D/g, '');
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
    } catch (err) {
      // console.error('Erro no ViaCEP:', err);
    }
  };

  const limparAssinatura = () => {
    if (sigCanvas.current) sigCanvas.current.clear();
  };

  const toISO = (d) => (d ? new Date(d).toISOString().split('T')[0] : null);

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

  const camposObrigatoriosMinimos = () => {
    const obrig = ['nome', 'cpf', 'nascimento', 'sexo', 'contato', 'setor'];

    for (const c of obrig) {
      const v = formData[c];

      if (v === null || v === undefined) return false;

      if (typeof v === 'string' && v.trim() === '') return false;

      if (c === 'nascimento') {
        const d = v instanceof Date ? v : new Date(v);
        if (!(d instanceof Date) || isNaN(d.getTime())) return false;
      }

      if (c === 'setor') {
        if (typeof v !== 'number') return false;
      }
    }
    return true;
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
    if (!camposObrigatoriosMinimos()) {
      alert('Preencha os campos obrigatórios: Nome, CPF, Data de Nascimento, Sexo, Contato e Setor.');
      return;
    }

    setLoading(true);

   
const assinatura = sigCanvas.current.toDataURL('image/png');

const toISO = (d) => (d ? new Date(d).toISOString().split('T')[0] : null);

// 🔴 tira assinaturaBase64 do formData ANTES de montar o payload
const { assinaturaBase64, ...rest } = formData;

const payload = {
  ...rest, // tudo menos assinaturaBase64
  nascimento: toISO(formData.nascimento),
  dataConversao: toISO(formData.dataConversao),
  dataBatismo: toISO(formData.dataBatismo),
  dataCarta: toISO(formData.dataCarta),
  dataAprovacao: toISO(formData.dataAprovacao),
  dataConsagracao: toISO(formData.dataConsagracao),

  // ✅ envia com snake_case (coluna criada no banco)
  assinatura_base64: assinatura,

  criado_em: new Date().toISOString(),
};

const { error } = await supabase.from('membros').insert([payload]);
if (error) {
  alert(`Erro ao salvar: ${error.message}`);
  setLoading(false);
  return;
}

// mantém a base64 em memória só para o PDF/preview
setFormData((prev) => ({ ...prev, assinaturaBase64: assinatura }));

    gerarPDF();
    setEnviado(true);
    setLoading(false);
  };

  // Para o template de PDF (render) — tenta pegar a assinatura atual
  const assinaturaDataUrl =
    (sigCanvas.current && !sigCanvas.current.isEmpty()
      ? sigCanvas.current.toDataURL('image/png')
      : formData.assinaturaBase64) || '';

  // ----------------------
  // Tela de sucesso
  // ----------------------
  if (enviado) {
    return (
      <div className="flex align-items-center justify-content-center h-screen bg-gray-100 p-4">
        <Card className="text-center w-full md:w-30rem">
          <i className="pi pi-check-circle text-5xl text-green-600 mb-3"></i>
          <h2>CADASTRO ENVIADO!</h2>
          <p>Dados salvos e PDF gerado.</p>
          <Button label="Voltar para Home" onClick={() => navigate('/')} />
        </Card>
      </div>
    );
  }

  // ----------------------
  // UI principal
  // ----------------------
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
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
            {/* Tipo de vínculo */}
            <div className="flex gap-4 mb-3">
              <div className="flex align-items-center gap-2">
                <RadioButton
                  inputId="rb-membro"
                  name="tipoVinculo"
                  value="Membro"
                  onChange={(e) => updateField('tipoVinculo', e.value)}
                  checked={formData.tipoVinculo === 'Membro'}
                />
                <label htmlFor="rb-membro">Membro</label>
              </div>
              <div className="flex align-items-center gap-2">
                <RadioButton
                  inputId="rb-congregado"
                  name="tipoVinculo"
                  value="Congregado"
                  onChange={(e) => updateField('tipoVinculo', e.value)}
                  checked={formData.tipoVinculo === 'Congregado'}
                />
                <label htmlFor="rb-congregado">Congregado</label>
              </div>
            </div>

            <Divider />

            {/* Dados Pessoais */}
            <h3>Dados Pessoais</h3>
            <div className="grid">
              <div className="col-12 md:col-6">
                <label>Nome*</label>
                <InputText
                  value={formData.nome}
                  onChange={(e) => updateField('nome', e.target.value)}
                />
              </div>

              <div className="col-12 md:col-3">
                <label>CPF*</label>
                <InputMask
                  mask="999.999.999-99"
                  value={formData.cpf}
                  onChange={handleCPFChange}
                  className={!cpfValido ? 'p-invalid' : ''}
                />
                {!cpfValido && <small className="p-error">CPF inválido</small>}
              </div>

              <div className="col-12 md:col-3">
                <label>RG</label>
                <InputText
                  value={formData.rg}
                  onChange={(e) => updateField('rg', e.target.value)}
                />
              </div>

              <div className="col-12 md:col-3">
                <label>Órgão Expedidor</label>
                <InputText
                  value={formData.orgaoExpedidor}
                  onChange={(e) => updateField('orgaoExpedidor', e.target.value)}
                />
              </div>

              <div className="col-12 md:col-3">
                <label>Nascimento*</label>
                <Calendar
                  value={formData.nascimento}
                  onChange={(e) => updateField('nascimento', e.value)}
                  dateFormat="dd/mm/yy"
                  showIcon
                />
              </div>

              <div className="col-12 md:col-3">
                <label>Sexo*</label>
                <Dropdown
                  value={formData.sexo}
                  options={opcoesSexo}
                  onChange={(e) => updateField('sexo', e.value)}
                  placeholder="Selecione"
                />
              </div>

              <div className="col-12 md:col-3">
                <label>Estado Civil</label>
                <Dropdown
                  value={formData.estadoCivil}
                  options={opcoesEstadoCivil}
                  onChange={(e) => updateField('estadoCivil', e.value)}
                  placeholder="Selecione"
                />
              </div>

              <div className="col-12 md:col-6">
                <label>Naturalidade (Cidade/UF)</label>
                <InputText
                  value={formData.naturalidade}
                  onChange={(e) => updateField('naturalidade', e.target.value)}
                />
              </div>

              <div className="col-12 md:col-3">
                <label>Contato (celular)*</label>
                <InputMask
                  mask="(99) 99999-9999"
                  value={formData.contato}
                  onChange={(e) => updateField('contato', e.value)}
                />
              </div>

              <div className="col-12 md:col-3">
                <label>E-mail</label>
                <InputText
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                />
              </div>

              <div className="col-12 md:col-6">
                <label>Nome do Pai</label>
                <InputText
                  value={formData.pai}
                  onChange={(e) => updateField('pai', e.target.value)}
                />
              </div>

              <div className="col-12 md:col-6">
                <label>Nome da Mãe</label>
                <InputText
                  value={formData.mae}
                  onChange={(e) => updateField('mae', e.target.value)}
                />
              </div>
            </div>

            {/* Endereço */}
            <Divider />
            <h3>Endereço</h3>
            <div className="grid">
              <div className="col-12 md:col-2">
                <label>CEP</label>
                <InputMask
                  mask="99999-999"
                  value={formData.cep}
                  onChange={(e) => updateField('cep', e.value)}
                  onBlur={handleCEPBlur}
                />
              </div>
              <div className="col-12 md:col-6">
                <label>Endereço</label>
                <InputText
                  value={formData.endereco}
                  onChange={(e) => updateField('endereco', e.target.value)}
                />
              </div>
              <div className="col-12 md:col-2">
                <label>Número</label>
                <InputText
                  value={formData.numero}
                  onChange={(e) => updateField('numero', e.target.value)}
                />
              </div>
              <div className="col-12 md:col-2">
                <label>Complemento</label>
                <InputText
                  value={formData.complemento}
                  onChange={(e) => updateField('complemento', e.target.value)}
                />
              </div>

              <div className="col-12 md:col-4">
                <label>Bairro</label>
                <InputText
                  value={formData.bairro}
                  onChange={(e) => updateField('bairro', e.target.value)}
                />
              </div>
              <div className="col-12 md:col-4">
                <label>Cidade</label>
                <InputText
                  value={formData.cidade}
                  onChange={(e) => updateField('cidade', e.target.value)}
                />
              </div>
              <div className="col-12 md:col-2">
                <label>UF</label>
                <InputText
                  value={formData.uf}
                  onChange={(e) => updateField('uf', e.target.value)}
                  maxLength={2}
                />
              </div>
              <div className="col-12 md:col-2">
                <label>Setor*</label>
                <Dropdown
                  value={formData.setor}
                  options={opcoesSetores}
                  onChange={(e) => updateField('setor', e.value)}
                  placeholder="Selecione"
                  filter
                />
              </div>
            </div>

            {/* Dados Profissionais */}
            <Divider />
            <h3>Dados Profissionais</h3>
            <div className="grid">
              <div className="col-12 md:col-4">
                <label>Ocupação/Profissão</label>
                <InputText
                  value={formData.ocupacao}
                  onChange={(e) => updateField('ocupacao', e.target.value)}
                />
              </div>
              <div className="col-12 md:col-4">
                <label>Empresa/Local de Trabalho</label>
                <InputText
                  value={formData.empresa}
                  onChange={(e) => updateField('empresa', e.target.value)}
                />
              </div>
              <div className="col-12 md:col-4">
                <label>Escolaridade</label>
                <Dropdown
                  value={formData.escolaridade}
                  options={opcoesEscolaridade}
                  onChange={(e) => updateField('escolaridade', e.value)}
                  placeholder="Selecione"
                />
              </div>
              <div className="col-12 md:col-3">
                <label>Trabalha?</label>
                <Dropdown
                  value={formData.trabalha}
                  options={[
                    { label: 'Sim', value: 'Sim' },
                    { label: 'Não', value: 'Não' },
                  ]}
                  onChange={(e) => updateField('trabalha', e.value)}
                  placeholder="Selecione"
                />
              </div>
              <div className="col-12 md:col-3">
                <label>Curso Teológico?</label>
                <Dropdown
                  value={formData.possuiCursoTeologico}
                  options={[
                    { label: 'Sim', value: 'Sim' },
                    { label: 'Não', value: 'Não' },
                  ]}
                  onChange={(e) => updateField('possuiCursoTeologico', e.value)}
                  placeholder="Selecione"
                />
              </div>
              <div className="col-12 md:col-6">
                <label>Qual curso? (se aplicável)</label>
                <InputText
                  value={formData.cursoTeologicoQual}
                  onChange={(e) =>
                    updateField('cursoTeologicoQual', e.target.value)
                  }
                />
              </div>
            </div>

            {/* IGREJA */}
            <Divider />
            <h3>Igreja</h3>
            <div className="grid">
              <div className="col-12 md:col-4">
                <label>Forma de Recebimento</label>
                <Dropdown
                  value={formData.recebimento}
                  options={opcoesRecebimento}
                  onChange={(e) => updateField('recebimento', e.value)}
                  placeholder="Selecione"
                />
              </div>

              <div className="col-12 md:col-4">
                <label>Data da Conversão</label>
                <Calendar
                  value={formData.dataConversao}
                  onChange={(e) => updateField('dataConversao', e.value)}
                  dateFormat="dd/mm/yy"
                  showIcon
                />
              </div>

              <div className="col-12 md:col-4">
                <label>Igreja onde se converteu</label>
                <InputText
                  value={formData.igrejaConversao}
                  onChange={(e) =>
                    updateField('igrejaConversao', e.target.value)
                  }
                />
              </div>

              <div className="col-12 md:col-3">
                <label>Batismo nas Águas?</label>
                <Dropdown
                  value={formData.batismoNasAguas}
                  options={[
                    { label: 'Sim', value: 'Sim' },
                    { label: 'Não', value: 'Não' },
                  ]}
                  onChange={(e) => updateField('batismoNasAguas', e.value)}
                  placeholder="Selecione"
                />
              </div>

              <div className="col-12 md:col-3">
                <label>Data do Batismo</label>
                <Calendar
                  value={formData.dataBatismo}
                  onChange={(e) => updateField('dataBatismo', e.value)}
                  dateFormat="dd/mm/yy"
                  showIcon
                />
              </div>

              <div className="col-12 md:col-6">
                <label>Igreja do Batismo</label>
                <InputText
                  value={formData.igrejaBatismo}
                  onChange={(e) =>
                    updateField('igrejaBatismo', e.target.value)
                  }
                />
              </div>

              <div className="col-12 md:col-3">
                <label>Recebido por Carta?</label>
                <Dropdown
                  value={formData.porCarta}
                  options={[
                    { label: 'Sim', value: 'Sim' },
                    { label: 'Não', value: 'Não' },
                  ]}
                  onChange={(e) => updateField('porCarta', e.value)}
                  placeholder="Selecione"
                />
              </div>

              <div className="col-12 md:col-5">
                <label>Igreja de Origem (Carta)</label>
                <InputText
                  value={formData.igrejaOrigemCarta}
                  onChange={(e) =>
                    updateField('igrejaOrigemCarta', e.target.value)
                  }
                />
              </div>

              <div className="col-12 md:col-4">
                <label>Data da Carta</label>
                <Calendar
                  value={formData.dataCarta}
                  onChange={(e) => updateField('dataCarta', e.value)}
                  dateFormat="dd/mm/yy"
                  showIcon
                />
              </div>

              <div className="col-12 md:col-3">
                <label>Aprovação?</label>
                <Dropdown
                  value={formData.aprovacao}
                  options={[
                    { label: 'Sim', value: 'Sim' },
                    { label: 'Não', value: 'Não' },
                  ]}
                  onChange={(e) => updateField('aprovacao', e.value)}
                  placeholder="Selecione"
                />
              </div>

              <div className="col-12 md:col-3">
                <label>Data da Aprovação</label>
                <Calendar
                  value={formData.dataAprovacao}
                  onChange={(e) =>
                    updateField('dataAprovacao', e.value)
                  }
                  dateFormat="dd/mm/yy"
                  showIcon
                />
              </div>
            </div>

            {/* Cargos / Funções */}
            <Divider />
            <h3>Cargos / Funções</h3>
            <div className="grid">
              <div className="col-12">
                <div className="flex flex-wrap gap-3">
                  {opcoesCargosFuncoes.map((opt) => (
                    <div key={opt.value} className="flex align-items-center gap-2">
                      <Checkbox
                        inputId={`cargo-${opt.value}`}
                        checked={formData.cargosFuncoes.includes(opt.value)}
                        onChange={(e) => {
                          const checked = e.checked;
                          let novo = [...formData.cargosFuncoes];
                          if (checked) {
                            if (!novo.includes(opt.value)) novo.push(opt.value);
                          } else {
                            novo = novo.filter((v) => v !== opt.value);
                          }
                          updateField('cargosFuncoes', novo);
                        }}
                      />
                      <label htmlFor={`cargo-${opt.value}`}>{opt.label}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-12 md:col-4">
                <label>Congregação/Setor de Atuação</label>
                <InputText
                  value={formData.congregacaoAtuacao}
                  onChange={(e) =>
                    updateField('congregacaoAtuacao', e.target.value)
                  }
                />
              </div>
              <div className="col-12 md:col-4">
                <label>Data de Consagração</label>
                <Calendar
                  value={formData.dataConsagracao}
                  onChange={(e) =>
                    updateField('dataConsagracao', e.value)
                  }
                  dateFormat="dd/mm/yy"
                  showIcon
                />
              </div>
              <div className="col-12 md:col-4">
                <label>Local da Consagração</label>
                <InputText
                  value={formData.localConsagracao}
                  onChange={(e) =>
                    updateField('localConsagracao', e.target.value)
                  }
                />
              </div>
            </div>

            {/* Família */}
            <Divider />
            <h3>Família</h3>
            <div className="grid">
              <div className="col-12 md:col-4">
                <label>Estado Civil</label>
                <Dropdown
                  value={formData.estadoCivil}
                  options={opcoesEstadoCivil}
                  onChange={(e) => updateField('estadoCivil', e.value)}
                  placeholder="Selecione"
                />
              </div>
              <div className="col-12 md:col-4">
                <label>Nome do Cônjuge</label>
                <InputText
                  value={formData.conjugeNome}
                  onChange={(e) => updateField('conjugeNome', e.target.value)}
                />
              </div>
              <div className="col-12 md:col-4">
                <label>Contato do Cônjuge</label>
                <InputMask
                  mask="(99) 99999-9999"
                  value={formData.conjugeContato}
                  onChange={(e) => updateField('conjugeContato', e.value)}
                />
              </div>
              <div className="col-12 md:col-6">
                <label>Filhos (nomes/idades)</label>
                <InputTextarea
                  autoResize
                  rows={3}
                  value={formData.filhos}
                  onChange={(e) => updateField('filhos', e.target.value)}
                />
              </div>
              <div className="col-12 md:col-3">
                <label>Mora com</label>
                <InputText
                  value={formData.moraCom}
                  onChange={(e) => updateField('moraCom', e.target.value)}
                  placeholder="Ex.: Pais / Cônjuge / Sozinho"
                />
              </div>
              <div className="col-12 md:col-3">
                <label>Tempo de Casa (igreja)</label>
                <InputText
                  value={formData.tempoDeCasa}
                  onChange={(e) => updateField('tempoDeCasa', e.target.value)}
                  placeholder="Ex.: 2 anos"
                />
              </div>
            </div>

            {/* Dons, Talentos e Habilidades */}
            <Divider />
            <h3>Dons, Ministérios, Talentos e Habilidades</h3>
            <div className="grid">
              <div className="col-12">
                <div className="flex flex-wrap gap-3">
                  {opcoesDonsMinisterios.map((opt) => (
                    <div key={opt.value} className="flex align-items-center gap-2">
                      <Checkbox
                        inputId={`don-${opt.value}`}
                        checked={formData.donsMinisterios.includes(opt.value)}
                        onChange={(e) => {
                          const checked = e.checked;
                          let novo = [...formData.donsMinisterios];
                          if (checked) {
                            if (!novo.includes(opt.value)) novo.push(opt.value);
                          } else {
                            novo = novo.filter((v) => v !== opt.value);
                          }
                          updateField('donsMinisterios', novo);
                        }}
                      />
                      <label htmlFor={`don-${opt.value}`}>{opt.label}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-12">
                <label>Talentos e Habilidades (texto livre)</label>
                <InputTextarea
                  autoResize
                  rows={4}
                  value={formData.talentos}
                  onChange={(e) => updateField('talentos', e.target.value)}
                  placeholder="Ex.: Informática, elétrica, cozinha, marcenaria, design, fotografia..."
                />
              </div>
            </div>

            {/* Assinatura */}
            <Divider />
            <h3>Assinatura</h3>
            <div className="border-2 p-2 bg-white">
              <SignatureCanvas
                ref={sigCanvas}
                canvasProps={{
                  width: 600,
                  height: 180,
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

            {/* Ações */}
            <div className="mt-4 flex gap-2">
              <Button
                type="submit"
                label="Salvar Cadastro e Gerar PDF"
                loading={loading}
                className="p-button-success"
              />
              <Button
                type="button"
                label="Baixar PDF (prévia)"
                className="p-button-info p-button-outlined"
                onClick={gerarPDF}
              />
            </div>
          </form>
        </Card>
      </div>

      {/* TEMPLATE PDF (oculto) */}
      <div
        id="ficha-pdf-template"
        style={{
          position: 'absolute',
          left: '-9999px',
          width: '210mm',
          background: '#fff',
          padding: '12mm',
          fontFamily: 'Arial, sans-serif',
          fontSize: '11pt',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '8mm' }}>
          FICHA CADASTRAL
        </h2>

        <div>
          <strong>Vínculo:</strong> {formData.tipoVinculo}
        </div>

        <hr />

        <h3>Dados Pessoais</h3>
        <p><strong>Nome:</strong> {formData.nome}</p>
        <p><strong>CPF:</strong> {formData.cpf} &nbsp; | &nbsp; <strong>RG:</strong> {formData.rg} &nbsp; <strong>Órgão:</strong> {formData.orgaoExpedidor}</p>
        <p><strong>Nascimento:</strong> {formData.nascimento ? new Date(formData.nascimento).toLocaleDateString() : ''} &nbsp; | &nbsp; <strong>Sexo:</strong> {formData.sexo} &nbsp; | &nbsp; <strong>Estado Civil:</strong> {formData.estadoCivil}</p>
        <p><strong>Naturalidade:</strong> {formData.naturalidade}</p>
        <p><strong>Contato:</strong> {formData.contato} &nbsp; | &nbsp; <strong>E-mail:</strong> {formData.email}</p>
        <p><strong>Pai:</strong> {formData.pai} &nbsp; | &nbsp; <strong>Mãe:</strong> {formData.mae}</p>

        <h3>Endereço</h3>
        <p>
          <strong>CEP:</strong> {formData.cep} &nbsp; | &nbsp;
          <strong>Endereço:</strong> {formData.endereco}, {formData.numero} {formData.complemento ? `- ${formData.complemento}` : ''}
        </p>
        <p>
          <strong>Bairro:</strong> {formData.bairro} &nbsp; | &nbsp;
          <strong>Cidade/UF:</strong> {formData.cidade}/{formData.uf}
        </p>
        <p>
          <strong>Setor:</strong> {formData.setor ? `${formData.setor} - ${mapeamentoSetores[formData.setor]?.nome}` : ''}
        </p>

        <h3>Dados Profissionais</h3>
        <p><strong>Ocupação:</strong> {formData.ocupacao} &nbsp; | &nbsp; <strong>Empresa:</strong> {formData.empresa}</p>
        <p><strong>Escolaridade:</strong> {formData.escolaridade} &nbsp; | &nbsp; <strong>Trabalha:</strong> {formData.trabalha}</p>
        <p><strong>Curso Teológico:</strong> {formData.possuiCursoTeologico} {formData.cursoTeologicoQual ? `- ${formData.cursoTeologicoQual}` : ''}</p>

        <h3>Igreja</h3>
        <p><strong>Forma de Recebimento:</strong> {formData.recebimento}</p>
        <p><strong>Conversão:</strong> {formData.dataConversao ? new Date(formData.dataConversao).toLocaleDateString() : ''} &nbsp; | &nbsp; <strong>Igreja:</strong> {formData.igrejaConversao}</p>
        <p><strong>Batismo nas Águas:</strong> {formData.batismoNasAguas} &nbsp; | &nbsp; <strong>Data:</strong> {formData.dataBatismo ? new Date(formData.dataBatismo).toLocaleDateString() : ''} &nbsp; | &nbsp; <strong>Igreja:</strong> {formData.igrejaBatismo}</p>
        <p><strong>Por Carta:</strong> {formData.porCarta} &nbsp; | &nbsp; <strong>Igreja de Origem:</strong> {formData.igrejaOrigemCarta} &nbsp; | &nbsp; <strong>Data:</strong> {formData.dataCarta ? new Date(formData.dataCarta).toLocaleDateString() : ''}</p>
        <p><strong>Aprovação:</strong> {formData.aprovacao} &nbsp; | &nbsp; <strong>Data:</strong> {formData.dataAprovacao ? new Date(formData.dataAprovacao).toLocaleDateString() : ''}</p>

        <h3>Cargos / Funções</h3>
        <p><strong>Funções:</strong> {formData.cargosFuncoes.join(', ')}</p>
        <p><strong>Congregação/Setor:</strong> {formData.congregacaoAtuacao}</p>
        <p><strong>Consagração:</strong> {formData.dataConsagracao ? new Date(formData.dataConsagracao).toLocaleDateString() : ''} &nbsp; | &nbsp; <strong>Local:</strong> {formData.localConsagracao}</p>

        <h3>Família</h3>
        <p><strong>Estado Civil:</strong> {formData.estadoCivil}</p>
        <p><strong>Cônjuge:</strong> {formData.conjugeNome} &nbsp; | &nbsp; <strong>Contato:</strong> {formData.conjugeContato}</p>
        <p><strong>Filhos:</strong> {formData.filhos}</p>
        <p><strong>Mora com:</strong> {formData.moraCom} &nbsp; | &nbsp; <strong>Tempo de Casa:</strong> {formData.tempoDeCasa}</p>

        <h3>Dons, Ministérios, Talentos e Habilidades</h3>
        <p><strong>Dons/Ministérios:</strong> {formData.donsMinisterios.join(', ')}</p>
        <p><strong>Talentos/Habilidades:</strong> {formData.talentos}</p>

        <div style={{ marginTop: '10mm', display: 'flex', gap: '10mm' }}>
          <div style={{ flex: 1 }}>
            <div
              style={{
                height: '35mm',
                border: '1px solid #000',
                marginBottom: '2mm',
                backgroundImage: `url(${assinaturaDataUrl})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
              }}
            />
            <div style={{ textAlign: 'center' }}>
              ________________________________________
              <div>Assinatura do Membro</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
``