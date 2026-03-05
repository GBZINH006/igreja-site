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
    telefone: '',
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
        for (let i = 0; i < 9; i += 1) soma += Number(limpo[i]) * (10 - i);
        let digito = (soma * 10) % 11;
        if (digito === 10) digito = 0;
        if (digito !== Number(limpo[9])) return false;

        soma = 0;
        for (let i = 0; i < 10; i += 1) soma += Number(limpo[i]) * (11 - i);
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
        } catch {
            // se falhar, mantém fluxo normal
        }
    };

    const limparAssinatura = () => {
        if (sigCanvas.current) sigCanvas.current.clear();
    };

    const gerarPDF = () => {
        const input = document.getElementById('ficha-pdf-template');
        if (!input) return;

        const preencher = {
            'pdf-nome': formData.nome,
            'pdf-cpf': formData.cpf,
            'pdf-nascimento': formData.nascimento ? new Date(formData.nascimento).toLocaleDateString('pt-BR') : '---',
            'pdf-contato': formData.contato,
            'pdf-endereco': `${formData.endereco}, ${formData.numero}`,
            'pdf-bairro': formData.bairro,
            'pdf-cidade': formData.cidade,
            'pdf-uf': formData.uf,
            'pdf-cep': formData.cep,
            'pdf-setor': formData.setor ? `${formData.setor} - ${mapeamentoSetores[formData.setor]?.nome || ''}` : '---',
            'pdf-recebimento': formData.recebimento,
            'pdf-dataBatismo': formData.dataBatismo ? new Date(formData.dataBatismo).toLocaleDateString('pt-BR') : '---',
            'pdf-cargoAtual': formData.cargoAtual,
            'pdf-talentos': formData.talentos,
        };

        Object.entries(preencher).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.innerText = value || '---';
        });

        html2pdf()
            .set({
                margin: 10,
                filename: `ficha-${formData.nome || 'membro'}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
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
            alert('Por favor, insira um CPF válido.');
            return;
        }

        setLoading(true);

        const payload = {
            ...formData,
            nascimento: formData.nascimento ? new Date(formData.nascimento).toISOString().split('T')[0] : null,
            dataBatismo: formData.dataBatismo ? new Date(formData.dataBatismo).toISOString().split('T')[0] : null,
            assinatura: sigCanvas.current.toDataURL('image/png'),
            criado_em: new Date().toISOString(),
        };

        const { error } = await supabase.from('membros').insert([payload]);

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
                <Card className="text-center shadow-8 w-full md:w-30rem border-round-xl">
                    <i className="pi pi-check-circle text-5xl text-green-600 mb-3"></i>
                    <h2 className="text-900 mb-3">CADASTRO ENVIADO!</h2>
                    <p className="text-600 mb-5">Dados salvos e PDF gerado com sucesso.</p>
                    <Button label="Voltar para Home" onClick={() => navigate('/')} />
                </Card>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen p-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex align-items-center mb-4 bg-white p-3 shadow-2 border-round">
                    <Button icon="pi pi-arrow-left" className="p-button-text mr-3" onClick={() => navigate('/')} />
                    <h1 className="text-blue-900 font-bold m-0 text-2xl">Ficha de Cadastro de Membros 2026</h1>
                </div>

                <Card className="p-fluid shadow-8">
                    <form onSubmit={(e) => { e.preventDefault(); handleCadastroESalvar(); }}>
                        <h3 className="text-xl mb-3 text-blue-800">1. Dados Pessoais</h3>
                        <div className="grid">
                            <div className="col-12 md:col-6 lg:col-4">
                                <label htmlFor="nome">Nome Completo</label>
                                <InputText id="nome" value={formData.nome} onChange={(e) => updateField('nome', e.target.value)} required />
                            </div>
                            <div className="col-12 md:col-6 lg:col-4">
                                <label htmlFor="cpf">CPF</label>
                                <InputMask id="cpf" mask="999.999.999-99" value={formData.cpf} onChange={handleCPFChange} className={!cpfValido ? 'p-invalid' : ''} slotChar=" " required />
                                {!cpfValido && <small className="p-error">CPF inválido</small>}
                            </div>
                            <div className="col-12 md:col-6 lg:col-4">
                                <label htmlFor="nascimento">Data de Nascimento</label>
                                <Calendar id="nascimento" value={formData.nascimento} onChange={(e) => updateField('nascimento', e.value)} showIcon dateFormat="dd/mm/yy" />
                            </div>
                            <div className="col-12 md:col-4">
                                <label htmlFor="sexo">Sexo</label>
                                <Dropdown id="sexo" value={formData.sexo} options={opcoesSexo} onChange={(e) => updateField('sexo', e.value)} placeholder="Selecione" />
                            </div>
                            <div className="col-12 md:col-4">
                                <label htmlFor="estadoCivil">Estado Civil</label>
                                <Dropdown id="estadoCivil" value={formData.estadoCivil} options={opcoesEstadoCivil} onChange={(e) => updateField('estadoCivil', e.value)} placeholder="Selecione" />
                            </div>
                            <div className="col-12 md:col-4">
                                <label htmlFor="contato">WhatsApp</label>
                                <InputMask id="contato" mask="(99) 99999-9999" value={formData.contato} onChange={(e) => updateField('contato', e.target.value)} slotChar=" " required />
                            </div>
                        </div>

                        <Divider />

                        <h3 className="text-xl mb-3 text-blue-800">2. Endereço e Setor</h3>
                        <div className="grid">
                            <div className="col-12 md:col-3">
                                <label htmlFor="cep">CEP</label>
                                <InputMask id="cep" mask="99999-999" value={formData.cep} onChange={(e) => updateField('cep', e.target.value)} onBlur={handleCEPBlur} slotChar=" " />
                            </div>
                            <div className="col-12 md:col-6">
                                <label htmlFor="endereco">Endereço</label>
                                <InputText id="endereco" value={formData.endereco} onChange={(e) => updateField('endereco', e.target.value)} required />
                            </div>
                            <div className="col-12 md:col-3">
                                <label htmlFor="numero">Número</label>
                                <InputText id="numero" value={formData.numero} onChange={(e) => updateField('numero', e.target.value)} required />
                            </div>
                            <div className="col-12 md:col-4">
                                <label htmlFor="bairro">Bairro</label>
                                <InputText id="bairro" value={formData.bairro} onChange={(e) => updateField('bairro', e.target.value)} required />
                            </div>
                            <div className="col-12 md:col-4">
                                <label htmlFor="cidade">Cidade</label>
                                <InputText id="cidade" value={formData.cidade} onChange={(e) => updateField('cidade', e.target.value)} required />
                            </div>
                            <div className="col-12 md:col-1">
                                <label htmlFor="uf">UF</label>
                                <InputText id="uf" value={formData.uf} onChange={(e) => updateField('uf', e.target.value.toUpperCase())} maxLength={2} required />
                            </div>
                            <div className="col-12 md:col-3">
                                <label htmlFor="setor">Setor / Congregação</label>
                                <Dropdown id="setor" value={formData.setor} options={opcoesSetores} onChange={(e) => updateField('setor', e.value)} placeholder="Selecione" />
                            </div>
                        </div>

                        <Divider />

                        <h3 className="text-xl mb-3 text-blue-800">3. Vida Ministerial e Igreja</h3>
                        <div className="grid">
                            <div className="col-12 md:col-4">
                                <label htmlFor="recebimento">Forma de Recebimento</label>
                                <Dropdown id="recebimento" value={formData.recebimento} options={opcoesRecebimento} onChange={(e) => updateField('recebimento', e.value)} placeholder="Selecione" />
                            </div>
                            <div className="col-12 md:col-4">
                                <label htmlFor="dataBatismo">Data do Batismo</label>
                                <Calendar id="dataBatismo" value={formData.dataBatismo} onChange={(e) => updateField('dataBatismo', e.value)} showIcon dateFormat="dd/mm/yy" />
                            </div>
                            <div className="col-12 md:col-4">
                                <label htmlFor="cargoAtual">Cargo Atual</label>
                                <InputText id="cargoAtual" value={formData.cargoAtual} onChange={(e) => updateField('cargoAtual', e.target.value)} />
                            </div>
                            <div className="col-12">
                                <label htmlFor="talentos">Talentos e Habilidades</label>
                                <InputText id="talentos" value={formData.talentos} onChange={(e) => updateField('talentos', e.target.value)} />
                            </div>
                        </div>

                        <Divider />

                        <h3 className="text-xl mb-3 text-blue-800">4. Assinatura Digital</h3>
                        <div>
                            <label>Assine digitalmente abaixo:</label>
                            <div className="border-2 border-dashed border-gray-400 p-2 bg-white mt-2 mb-2">
                                <SignatureCanvas
                                    ref={sigCanvas}
                                    canvasProps={{ width: 500, height: 150, className: 'sigCanvas' }}
                                />
                            </div>
                            <Button type="button" label="Limpar Assinatura" icon="pi pi-times" className="p-button-sm p-button-secondary" onClick={limparAssinatura} />
                        </div>

                        <div className="mt-4">
                            <Button type="submit" label="Salvar Cadastro e Gerar PDF" icon="pi pi-check" loading={loading} className="p-button-success p-button-lg" />
                        </div>
                    </form>
                </Card>
            </div>

            <div id="ficha-pdf-template" style={{ position: 'absolute', left: '-9999px', width: '210mm', background: '#fff', padding: '15mm', fontFamily: 'Arial, sans-serif' }}>
                <h2 style={{ marginTop: 0 }}>FICHA CADASTRAL - AD BELA VISTA</h2>
                <p><strong>Nome:</strong> <span id="pdf-nome" /></p>
                <p><strong>CPF:</strong> <span id="pdf-cpf" /></p>
                <p><strong>Nascimento:</strong> <span id="pdf-nascimento" /></p>
                <p><strong>Contato:</strong> <span id="pdf-contato" /></p>
                <p><strong>Endereço:</strong> <span id="pdf-endereco" /> - <strong>Bairro:</strong> <span id="pdf-bairro" /></p>
                <p><strong>Cidade/UF:</strong> <span id="pdf-cidade" /> / <span id="pdf-uf" /> - <strong>CEP:</strong> <span id="pdf-cep" /></p>
                <p><strong>Setor:</strong> <span id="pdf-setor" /></p>
                <p><strong>Recebimento:</strong> <span id="pdf-recebimento" /></p>
                <p><strong>Data do Batismo:</strong> <span id="pdf-dataBatismo" /></p>
                <p><strong>Cargo Atual:</strong> <span id="pdf-cargoAtual" /></p>
                <p><strong>Talentos:</strong> <span id="pdf-talentos" /></p>
            </div>
        </div>
    );
};
