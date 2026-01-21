import React, { useState, useRef } from 'react';
import { supabase } from '../../services/supabase';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { Card } from 'primereact/card';
import { useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import html2pdf from 'html2pdf.js';
import { InputMask } from 'primereact/inputmask';
import { Dropdown } from 'primereact/dropdown';

// Importação de estilos
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import "primeflex/primeflex.css";
// import "./ficha.css"; 

export const FichaCadastro = () => {
    const navigate = useNavigate();
    const sigCanvas = useRef({});

    // Mapeamento dos 17 Setores da AD Palhoça (2026)
    const mapeamentoSetores = {
        1: { nome: "Templo Sede (Ponte do Imaruim)", tipo: "Sede" },
        2: { nome: "Caminho Novo", tipo: "Setor / Congregação" },
        // ... adicione os outros setores aqui ...
        17: { nome: "Alaor Silveira / São Luiz", tipo: "Setor / Congregação" }
    };

    // Opções para Dropdowns (padronizado)
    const opcoesSexo = [
        { label: 'Masculino', value: 'M' },
        { label: 'Feminino', value: 'F' }
    ];
    const opcoesEscolaridade = [
        { label: 'Ensino Fundamental Incompleto', value: 'Fundamental Incompleto' },
        { label: 'Ensino Fundamental Completo', value: 'Fundamental Completo' },
        { label: 'Ensino Médio Incompleto', value: 'Medio Incompleto' },
        { label: 'Ensino Médio Completo', value: 'Medio Completo' },
        { label: 'Ensino Superior Incompleto', value: 'Superior Incompleto' },
        { label: 'Ensino Superior Completo', value: 'Superior Completo' },
    ];
    const opcoesSimNao = [
        { label: 'Sim', value: 'Sim' },
        { label: 'Não', value: 'Não' }
    ];
    const opcoesRecebimento = [
        { label: 'Batismo nas Águas', value: 'Batismo nas Águas' },
        { label: 'Aclamação', value: 'Aclamacao' },
        { label: 'Transferência', value: 'Transferencia' },
    ];

    // 1. ESTADO ÚNICO PARA O FORMULÁRIO (TODOS OS CAMPOS)
    const [formData, setFormData] = useState({
        tipo: 'Membro', nome: '', nascimento: null, data_batismo: null, cpf: '', contato: '', telefone: '',
        cep: '', endereco: '', numero: '', bairro: '', cidade: '', uf: '', setor: 1, congregacao: '', tipo_unidade: '',
        sexo: "", doador: "", escolaridade: "", recebimento: "", aprovacao: "",
        cargo: "", chefeFamilia: "", computador: "", internet: "",
        dirigente: false, oracao: false, mocidade: false, prof: false, missoes: false,
        coordenador: false, evangelismo: false, familiar: false, discipulado: false,
        adicional: false, status: 'análise'
    });

    const [loading, setLoading] = useState(false);
    const [enviado, setEnviado] = useState(false);
    const [cpfValido, setCpfValido] = useState(true);

    // FUNÇÕES DE AÇÃO E AUTOMAÇÃO
    const limparAssinatura = () => sigCanvas.current.clear();

    const handleCadastroESalvar = async () => {
        if (sigCanvas.current.isEmpty()) return alert("Por favor, assine a ficha.");
        if (!cpfValido) return alert("Por favor, insira um CPF válido.");

        setLoading(true);

        const { error } = await supabase
            .from('membros')
            .insert([{ ...formData }]);

        if (error) {
            alert(`Erro ao salvar: ${error.message}`);
            setLoading(false);
        } else {
            gerarPDF();
            setEnviado(true);
        }
    };

    const validarCPF = (cpf) => { /* ... (sua função de validação de CPF aqui) ... */ 
        cpf = cpf.replace(/[^\d]+/g, '');
        if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
        let soma = 0, resto;
        for (let i = 1; i <= 9; i++) soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpf.substring(9, 10))) return false;
        soma = 0;
        for (let i = 1; i <= 10; i++) soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpf.substring(10, 11))) return false;
        return true;
    };

    const handleCPFChange = (e) => {
        const valor = e.value;
        setFormData({ ...formData, cpf: valor });
        if (valor && !valor.includes('_')) { const valido = validarCPF(valor); setCpfValido(valido); } else { setCpfValido(true); }
    };

    const handleCEPBlur = async (e) => { /* ... (sua função de CEP aqui) ... */
        const cep = e.target.value?.replace(/\D/g, '');
        if (cep && cep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br{cep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setFormData(prev => ({
                        ...prev, endereco: data.logradouro, bairro: data.bairro, cidade: data.localidade, uf: data.uf
                    }));
                } else { alert("CEP não encontrado."); }
            } catch (error) { console.error("Erro ao buscar CEP:", error); }
        }
    };

    const handleSetorChange = (e) => { /* ... (sua função de setor aqui) ... */
        const numSetor = e.value;
        const info = mapeamentoSetores[numSetor] || { nome: '', tipo: '' };
        setFormData(prev => ({
            ...prev, setor: numSetor, congregacao: info.nome, tipo_unidade: info.tipo
        }));
    };

    const gerarPDF = () => { /* ... (sua função de gerar PDF aqui) ... */
        const element = document.getElementById("ficha-pdf");
        const options = { margin: 10, filename: `ficha-${formData.nome}-${new Date().getFullYear()}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: "mm", format: "a4", orientation: "portrait" } };
        html2pdf().set(options).from(element).save();
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
            <form onSubmit={(e) => { e.preventDefault(); handleCadastroESalvar(); }}>
                {/* Botões Superiores */}
                <div className="max-w-7xl mx-auto mb-4 flex justify-content-between">
                    <Button icon="pi pi-home" label="Início" onClick={() => navigate('/')} className="p-button-text" />
                    <Button label="SALVAR E GERAR PDF" icon="pi pi-save" severity="success" loading={loading} type="submit" />
                </div>

                <div id='ficha-pdf' className='ficha bg-white shadow-3 p-6 mx-auto' style={{ maxWidth: '900px', borderRadius: '8px' }}>
                    {/* CABEÇALHO */}
                    <div className="flex justify-content-between align-items-start border-bottom-2 border-primary mb-4 pb-3">
                        <div className="flex flex-column">
                            <img src="https://encrypted-tbn0.gstatic.com" alt="Logo" style={{ height: '60px', width: '60px' }} />
                            <span className="text-xs mt-2 text-700">Rua Frei Lauro, 44 - Ponte do Imaruim<br />CEP 88130-750 - Palhoça/SC</span>
                        </div>
                        <div className="text-right">
                            <h2 className='m-0 text-primary uppercase font-bold text-xl'>Ficha Cadastral 2026</h2>
                            <span className="text-sm font-bold">Fone: (48) 3242-2451</span>
                        </div>
                    </div>

                    {/* DADOS PESSOAIS - INICIO */}
                    <div className='box mb-4'>
                        <h4 className="bg-blue-50 p-2 border-left-3 border-primary text-primary mb-3 uppercase">Dados Pessoais</h4>
                        <div className="p-fluid grid">
                            {/* Membro / Congregado */}
                            <div className="field col-12 md:col-6 flex gap-4 mt-2">
                                <div className="flex align-items-center">
                                    <Checkbox inputId="membro" value="Membro" onChange={e => setFormData({ ...formData, tipo: e.value })} checked={formData.tipo === 'Membro'} />
                                    <label htmlFor="membro" className="ml-2">Membro</label>
                                </div>
                                <div className="flex align-items-center">
                                    <Checkbox inputId="cong" value="Congregado" onChange={e => setFormData({ ...formData, tipo: e.value })} checked={formData.tipo === 'Congregado'} />
                                    <label htmlFor="cong" className="ml-2">Congregado</label>
                                </div>
                            </div>
                        </div>

                        {/* SEÇÃO DE SETORES E CONGREGAÇÃO */}
                        <div className="p-fluid grid mb-4">
                             <div className="field col-12 md:col-2">
                                <label className="font-bold text-xs">SETOR</label>
                                <InputNumber value={formData.setor} onValueChange={handleSetorChange} showButtons min={1} max={17} />
                            </div>
                            <div className="field col-12 md:col-6">
                                <label className="font-bold text-xs">CONGREGAÇÃO</label>
                                <InputText value={formData.congregacao || ''} readOnly className="bg-gray-100" />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label className="font-bold text-xs">CLASSIFICAÇÃO</label>
                                <InputText value={formData.tipo_unidade || ''} readOnly className="bg-gray-100" />
                            </div>
                        </div>

                        {/* DADOS PESSOAIS CONTINUAÇÃO */}
                        <div className="p-fluid grid">
                            <div className="field col-12">
                                <label className="font-bold text-xs">NOME COMPLETO</label>
                                <InputText value={formData.nome || ''} onChange={e => setFormData({ ...formData, nome: e.target.value })} required />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label className="font-bold text-xs">CPF</label>
                                <InputMask mask="999.999.999-99" value={formData.cpf || ''} onChange={handleCPFChange} placeholder="000.000.000-00" className={!cpfValido ? 'p-invalid' : ''} required />
                                {!cpfValido && <small className="p-error">CPF inválido. Verifique os números.</small>}
                            </div>
                            <div className="field col-12 md:col-4">
                                <label className="font-bold text-xs">SEXO</label>
                                <Dropdown value={formData.sexo} options={opcoesSexo} onChange={(e) => setFormData({...formData, sexo: e.value})} placeholder="Selecione o Sexo" required />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label className="font-bold text-xs">DOADOR DE SANGUE?</label>
                                <Dropdown value={formData.doador} options={opcoesSimNao} onChange={(e) => setFormData({...formData, doador: e.value})} placeholder="Sim ou Não" required />
                            </div>

                            <div className='field col-12 md:col-4'>
                                <label className='font-bold text-xs'>DATA DE NASCIMENTO</label>
                                <Calendar value={formData.nascimento} onChange={(e) => setFormData({ ...formData, nascimento: e.value })} dateFormat="dd/mm/yy" mask="99/99/9999" showIcon required />
                            </div>
                             <div className="field col-12 md:col-8">
                                <label className="font-bold text-xs">ESCOLARIDADE</label>
                                <Dropdown value={formData.escolaridade} options={opcoesEscolaridade} onChange={(e) => setFormData({...formData, escolaridade: e.value})} placeholder="Selecione a Escolaridade" required />
                            </div>


                            {/* CONTATO PRINCIPAL (WhatsApp) */}
                            <div className="field col-12 md:col-4">
                                <label className="font-bold text-xs">CONTATO / WHATSAPP</label>
                                <InputMask mask="(99) 9 9999-9999" value={formData.contato || ''} onChange={(e) => setFormData({...formData, contato: e.value})} placeholder="(48) 9 9999-9999" required />
                            </div>
                            {/* TELEFONE RESIDENCIAL */}
                            <div className='field col-12 md:col-4'>
                                <label className='font-bold text-xs'>TELEFONE RESIDENCIAL</label>
                                <InputMask mask="(99) 9999-9999" value={formData.telefone || ''} onChange={(e) => setFormData({ ...formData, telefone: e.value })} placeholder="(48) 3242-XXXX" />
                            </div>
                             <div className='field col-12 md:col-4'>
                                <label className='font-bold text-xs'>OCUPAÇÃO/PROFISSSÃO</label>
                                <InputText value={formData.cargo || ''} onChange={(e) => setFormData({...formData, cargo: e.target.value})} placeholder="Ex: Engenheiro, Vendedor..." />
                            </div>
                        </div>
                    </div>
                    {/* DADOS PESSOAIS - FIM */}


                    {/* SEÇÃO DE ENDEREÇO */}
                    <div className="box mb-4">
                        <h4 className="bg-blue-50 p-2 border-left-3 border-primary text-primary mb-3 uppercase">2. Endereço</h4>
                        <div className="p-fluid grid">
                            <div className="field col-12 md:col-3">
                                <label className="font-bold text-xs">CEP</label>
                                <InputMask mask="99999-999" value={formData.cep || ''} onBlur={handleCEPBlur} onChange={(e) => setFormData({ ...formData, cep: e.value })} placeholder="00000-000" />
                            </div>
                            <div className="field col-12 md:col-7">
                                <label className="font-bold text-xs">RUA / LOGRADOURO</label>
                                <InputText value={formData.endereco || ''} onChange={(e) => setFormData({ ...formData, endereco: e.target.value })} />
                            </div>
                            <div className="field col-12 md:col-2">
                                <label className="font-bold text-xs">Nº</label>
                                <InputText value={formData.numero || ''} onChange={(e) => setFormData({ ...formData, numero: e.target.value })} />
                            </div>
                            <div className="field col-12 md:col-5">
                                <label className="font-bold text-xs">BAIRRO</label>
                                <InputText value={formData.bairro || ''} onChange={(e) => setFormData({ ...formData, bairro: e.target.value })} />
                            </div>
                            <div className="field col-12 md:col-5">
                                <label className="font-bold text-xs">CIDADE</label>
                                <InputText value={formData.cidade || ''} onChange={(e) => setFormData({ ...formData, cidade: e.target.value })} />
                            </div>
                            <div className="field col-12 md:col-2">
                                <label className="font-bold text-xs">UF</label>
                                <InputText value={formData.uf || ''} maxLength={2} onChange={(e) => setFormData({ ...formData, uf: e.target.value.toUpperCase() })} />
                            </div>
                        </div>
                    </div>

                    {/* SEÇÃO MINISTERIAL/FUNÇÕES */}
                    <div className="box mb-4">
                        <h4 className="bg-blue-50 p-2 border-left-3 border-primary text-primary mb-3 uppercase">3. Vida Ministerial e Funções</h4>
                        <div className="p-fluid grid">
                            <div className="field col-12 md:col-4">
                                <label className="font-bold text-xs">FORMA DE RECEPÇÃO</label>
                                <Dropdown value={formData.recebimento} options={opcoesRecebimento} onChange={(e) => setFormData({...formData, recebimento: e.value})} placeholder="Selecione" required />
                            </div>
                             <div className='field col-12 md:col-4'>
                                <label className='font-bold text-xs'>DATA DE BATISMO</label>
                                <Calendar value={formData.data_batismo} onChange={(e) => setFormData({ ...formData, data_batismo: e.value })} dateFormat="dd/mm/yy" mask="99/99/9999" showIcon />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label className="font-bold text-xs">APROVAÇÃO</label>
                                <InputText value={formData.aprovacao || ''} onChange={(e) => setFormData({...formData, aprovacao: e.target.value})} placeholder="Aprovado por quem?" />
                            </div>
                            
                            {/* Checkboxes de Atuação */}
                            <div className="field col-12 mt-3">
                                <label className="font-bold text-xs block mb-2">Áreas de Interesse / Atuação:</label>
                                <div className="flex flex-wrap gap-3">
                                    <div className="flex align-items-center"><Checkbox inputId="chk_dirigente" onChange={e => setFormData({...formData, dirigente: e.checked})} checked={formData.dirigente} /><label htmlFor="chk_dirigente" className="ml-2">Dirigente</label></div>
                                    <div className="flex align-items-center"><Checkbox inputId="chk_oracao" onChange={e => setFormData({...formData, oracao: e.checked})} checked={formData.oracao} /><label htmlFor="chk_oracao" className="ml-2">Oração</label></div>
                                    <div className="flex align-items-center"><Checkbox inputId="chk_mocidade" onChange={e => setFormData({...formData, mocidade: e.checked})} checked={formData.mocidade} /><label htmlFor="chk_mocidade" className="ml-2">Mocidade</label></div>
                                    <div className="flex align-items-center"><Checkbox inputId="chk_prof" onChange={e => setFormData({...formData, prof: e.checked})} checked={formData.prof} /><label htmlFor="chk_prof" className="ml-2">Professores EBD</label></div>
                                    <div className="flex align-items-center"><Checkbox inputId="chk_missoes" onChange={e => setFormData({...formData, missoes: e.checked})} checked={formData.missoes} /><label htmlFor="chk_missoes" className="ml-2">Missões</label></div>
                                    <div className="flex align-items-center"><Checkbox inputId="chk_coordenador" onChange={e => setFormData({...formData, coordenador: e.checked})} checked={formData.coordenador} /><label htmlFor="chk_coordenador" className="ml-2">Coordenador</label></div>
                                    <div className="flex align-items-center"><Checkbox inputId="chk_evangelismo" onChange={e => setFormData({...formData, evangelismo: e.checked})} checked={formData.evangelismo} /><label htmlFor="chk_evangelismo" className="ml-2">Evangelismo</label></div>
                                    <div className="flex align-items-center"><Checkbox inputId="chk_familiar" onChange={e => setFormData({...formData, familiar: e.checked})} checked={formData.familiar} /><label htmlFor="chk_familiar" className="ml-2">Familiar</label></div>
                                    <div className="flex align-items-center"><Checkbox inputId="chk_discipulado" onChange={e => setFormData({...formData, discipulado: e.checked})} checked={formData.discipulado} /><label htmlFor="chk_discipulado" className="ml-2">Discipulado</label></div>
                                    <div className="flex align-items-center"><Checkbox inputId="chk_adicional" onChange={e => setFormData({...formData, adicional: e.checked})} checked={formData.adicional} /><label htmlFor="chk_adicional" className="ml-2">Adicional</label></div>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* SEÇÃO DE ASSINATURA */}
                    <div className="mt-6">
                        <h4 className="text-primary border-bottom-1 border-300 pb-2 mb-3 uppercase text-sm font-bold">Assinatura Digital</h4>
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <div style={{ border: '1px solid #ccc', background: '#f9f9f9', borderRadius: '4px' }}>
                                    <SignatureCanvas ref={sigCanvas} penColor='black' canvasProps={{ width: 400, height: 120, className: 'sigCanvas' }} />
                                </div>
                                <Button label="Limpar" icon="pi pi-trash" className="p-button-text p-button-sm mt-1" onClick={limparAssinatura} />
                            </div>
                            <div className="col-12 md:col-6 flex align-items-end justify-content-center pb-4">
                                <div className="border-top-1 border-900 w-10 text-center pt-2">
                                    <span className="text-xs uppercase font-bold">Assinatura do Membro / Responsável</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};
