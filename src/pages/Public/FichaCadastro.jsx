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
import { Divider } from 'primereact/divider';

// Importação de estilos
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import "primeflex/primeflex.css";

// Mapeamento dos 17 Setores da AD Palhoça (2026)
const mapeamentoSetores = {
    1: { nome: "Templo Sede (Ponte do Imaruim)", tipo: "Sede" },
    2: { nome: "Caminho Novo", tipo: "Setor / Congregação" },
    3: { nome: "Pachecos", tipo: "Setor / Congregação" },
    4: { nome: "Aririú", tipo: "Setor / Congregação" },
    5: { nome: "Rio Grande", tipo: "Setor / Congregação" },
    6: { nome: "Alto Aririú", tipo: "Setor / Congregação" },
    7: { nome: "Enseada da Pinheira / Morretes", tipo: "Setor / Congregação" },
    8: { nome: "Passa Vinte", tipo: "Setor / Congregação" },
    9: { nome: "Bela Vista / Shalom / Vale da Benção", tipo: "Setor / Congregação" },
    10: { nome: "Madri / São Sebastião", tipo: "Setor / Congregação" },
    11: { nome: "Pagani", tipo: "Setor / Congregação" },
    12: { nome: "Jardim Eldorado", tipo: "Setor / Congregação" },
    13: { nome: "Brejaru", tipo: "Setor / Congregação" },
    14: { nome: "Frei Lauro", tipo: "Setor / Congregação" },
    15: { nome: "Barra do Aririú", tipo: "Setor / Congregação" },
    16: { nome: "Vila Nova", tipo: "Setor / Congregação" },
    17: { nome: "Alaor Silveira / São Luiz", tipo: "Setor / Congregação" }
};
const opcoesSetores = Object.entries(mapeamentoSetores).map(([id, info]) => ({
    label: `${id} - ${info.nome}`, value: parseInt(id)
}));

// Opções para Dropdowns (padronizado)
const opcoesRecebimento = [
    { label: 'Batismo nas Águas', value: 'Batismo nas Águas' },
    { label: 'Aclamação', value: 'Aclamacao' },
    { label: 'Transferência', value: 'Transferencia' },
];

export const FichaCadastro = () => {
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
    
    const [loading, setLoading] = useState(false);
    const [cpfValido, setCpfValido] = useState(true);

    // FUNÇÕES DE AÇÃO E AUTOMAÇÃO
    const limparAssinatura = () => sigCanvas.current.clear();

    const handleCadastroESalvar = async () => {
        if (sigCanvas.current.isEmpty()) return alert("Por favor, assine a ficha.");
        if (!cpfValido) return alert("Por favor, insira um CPF válido.");

        setLoading(true);

        // Prepara os dados para o Supabase (ajuste os nomes das colunas se necessário)
        const dataToSubmit = {
            ...formData,
            // Formate datas para o formato ISO do Supabase (YYYY-MM-DD)
            nascimento: formData.nascimento?.toISOString().split('T')[0],
            dataCasamento: formData.dataCasamento?.toISOString().split('T')[0],
            dataBatismo: formData.dataBatismo?.toISOString().split('T')[0],
            dataAprovacao: formData.dataAprovacao?.toISOString().split('T')[0],
        };

        const { error } = await supabase
            .from('membros') // Certifique-se que o nome da tabela está correto
            .insert([dataToSubmit]);

        if (error) {
            alert(`Erro ao salvar: ${error.message}`);
            setLoading(false);
        } else {
            gerarPDF();
            setFormData(prev => ({...prev, enviado: true}));
        }
    };

    const validarCPF = (cpf) => { 
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

    const handleCEPBlur = async (e) => {
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
    
    // Função gerarPDF (ajustada para mapear todos os novos campos do formData)
    const gerarPDF = () => { 
        const templateId = 'ficha-pdf-template';
        const input = document.getElementById(templateId);

        const fields = {
            'pdf-nome': formData.nome,
            'pdf-nomePai': formData.nomePai,
            'pdf-nomeMae': formData.nomeMae,
            'pdf-nomeConjuge': formData.nomeConjuge,
            'pdf-casamento': formData.dataCasamento ? new Date(formData.dataCasamento).toLocaleDateString('pt-BR') : '---',
            'pdf-rg': formData.rg,
            'pdf-cpf': formData.cpf,
            'pdf-nascimento': formData.nascimento ? new Date(formData.nascimento).toLocaleDateString('pt-BR') : '---',
            'pdf-estadoCivil': formData.estadoCivil,
            'pdf-endereco': `${formData.endereco}, ${formData.numero}`,
            'pdf-bairro': formData.bairro,
            'pdf-cidade': formData.cidade,
            'pdf-uf': formData.uf,
            'pdf-cep': formData.cep,
            'pdf-contato': formData.contato,
            'pdf-telefone': formData.telefone,
            'pdf-profissao': formData.profissao,
            'pdf-ocupacao': formData.ocupacao,
            'pdf-cargo': formData.cargoAtual,
            'pdf-igrejaBatismo': formData.igrejaBatismo,
            'pdf-cidadeBatismo': formData.cidadeBatismo,
            'pdf-dataBatismo': formData.dataBatismo ? new Date(formData.dataBatismo).toLocaleDateString('pt-BR') : '---',
            'pdf-igrejaCarta': formData.igrejaCarta,
            'pdf-aprovacao-data': formData.dataAprovacao ? new Date(formData.dataAprovacao).toLocaleDateString('pt-BR') : '---',
            'pdf-obsIgreja': formData.obsIgreja,
            'pdf-talentos': formData.talentos || '---',
            // Campos de tabela de família e checkboxes são mais complexos de mapear para innerText, mas os principais estão aqui.
        };
        
        Object.keys(fields).forEach(id => { const el = document.getElementById(id); if (el) el.innerText = fields[id] || '---'; });

        const options = { 
            margin: 10, 
            filename: `ficha-${formData.nome}-${new Date().getFullYear()}.pdf`, 
            image: { type: 'jpeg', quality: 0.98 }, 
            html2canvas: { scale: 2, useCORS: true }, 
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" } 
        };
        html2pdf().set(options).from(input).save();
    };


    // ... (continuação da lógica do componente da Parte 1) ...

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

    // Código do formulário visível em PrimeReact, pronto para ser colocado dentro do seu 'return (...)':

    <div className="bg-gray-100 min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
            <div className="flex align-items-center mb-4 bg-white p-3 shadow-2 border-round">
                <Button icon="pi pi-arrow-left" className="p-button-text mr-3" onClick={() => navigate('/')} />
                <h1 className="text-blue-900 font-bold m-0 text-2xl">Ficha de Cadastro de Membros 2026</h1>
            </div>

            <Card className="p-fluid shadow-8">
                <form onSubmit={(e) => { e.preventDefault(); handleCadastroESalvar(); }}>
                    
                    {/* SEÇÃO 1: DADOS PESSOAIS */}
                    <h3 className="text-xl mb-3 text-blue-800">1. Dados Pessoais</h3>
                    
                    <div className="p-grid p-nogutter">
                        <div className="p-col-12 p-md-6 p-lg-4 p-field">
                            <label htmlFor="nome">Nome Completo</label>
                            <InputText id="nome" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} required />
                        </div>
                        <div className="p-col-12 p-md-6 p-lg-4 p-field">
                            <label htmlFor="cpf">CPF</label>
                            <InputMask id="cpf" mask="999.999.999-99" value={formData.cpf} onChange={handleCPFChange} slotChar=" " className={!cpfValido ? 'p-invalid' : ''} />
                            {!cpfValido && <small className="p-error">CPF Inválido</small>}
                        </div>
                        <div className="p-col-12 p-md-6 p-lg-4 p-field">
                            <label htmlFor="nascimento">Data de Nascimento</label>
                            <Calendar id="nascimento" value={formData.nascimento} onChange={(e) => setFormData({...formData, nascimento: e.value})} showIcon dateFormat="dd/mm/yy" mask="99/99/9999" />
                        </div>
                        <div className="p-col-12 p-md-6 p-lg-3 p-field">
                            <label htmlFor="sexo">Sexo</label>
                            <Dropdown id="sexo" value={formData.sexo} options={opcoesSexo} onChange={(e) => setFormData({...formData, sexo: e.value})} placeholder="Selecione o sexo" />
                        </div>
                        <div className="p-col-12 p-md-6 p-lg-3 p-field">
                            <label htmlFor="contato">WhatsApp</label>
                            <InputMask id="contato" mask="(99) 99999-9999" value={formData.contato} onChange={(e) => setFormData({...formData, contato: e.target.value})} required slotChar=" " />
                        </div>
                        <div className="p-col-12 p-md-6 p-lg-3 p-field">
                            <label htmlFor="telefone">Telefone Fixo (Opcional)</label>
                            <InputMask id="telefone" mask="(99) 9999-9999" value={formData.telefone} onChange={(e) => setFormData({...formData, telefone: e.target.value})} slotChar=" " />
                        </div>
                    </div>

                    <Divider />

                    {/* SEÇÃO 2: ENDEREÇO E LOCALIZAÇÃO */}
                    <h3 className="text-xl mb-3 text-blue-800">2. Endereço e Setor</h3>
                    <div className="p-grid p-nogutter">
                        <div className="p-col-12 p-md-4 p-field">
                            <label htmlFor="cep">CEP</label>
                            <InputMask id="cep" mask="99999-999" value={formData.cep} onChange={(e) => setFormData({...formData, cep: e.target.value})} onBlur={handleCEPBlur} slotChar=" " />
                        </div>
                        <div className="p-col-12 p-md-6 p-field">
                            <label htmlFor="endereco">Endereço (Rua, Av...)</label>
                            <InputText id="endereco" value={formData.endereco} onChange={(e) => setFormData({...formData, endereco: e.target.value})} required />
                        </div>
                            <div className="p-col-12 p-md-2 p-field">
                            <label htmlFor="numero">Número</label>
                            <InputText id="numero" value={formData.numero} onChange={(e) => setFormData({...formData, numero: e.target.value})} required />
                        </div>
                        <div className="p-col-12 p-md-4 p-field">
                            <label htmlFor="bairro">Bairro</label>
                            <InputText id="bairro" value={formData.bairro} onChange={(e) => setFormData({...formData, bairro: e.target.value})} required />
                        </div>
                        <div className="p-col-12 p-md-4 p-field">
                            <label htmlFor="cidade">Cidade</label>
                            <InputText id="cidade" value={formData.cidade} onChange={(e) => setFormData({...formData, cidade: e.target.value})} required />
                        </div>
                        <div className="p-col-12 p-md-1 p-field">
                            <label htmlFor="uf">UF</label>
                            <InputText id="uf" value={formData.uf} onChange={(e) => setFormData({...formData, uf: e.target.value})} maxLength={2} required />
                        </div>
                            <div className="p-col-12 p-md-3 p-field">
                            <label htmlFor="setor">Setor / Congregação</label>
                            <Dropdown id="setor" value={formData.setor} options={opcoesSetores} onChange={(e) => setFormData({...formData, setor: e.value})} placeholder="Selecione o setor" />
                        </div>
                    </div>

                    <Divider />

                    {/* SEÇÃO 3: VIDA MINISTERIAL & IGREJA */}
                    <h3 className="text-xl mb-3 text-blue-800">3. Vida Ministerial e Igreja</h3>
                    <div className="p-grid p-nogutter">
                        <div className="p-col-12 p-md-4 p-field">
                            <label htmlFor="recebimento">Forma de Recebimento</label>
                            <Dropdown id="recebimento" value={formData.recebimento} options={opcoesRecebimento} onChange={(e) => setFormData({...formData, recebimento: e.value})} placeholder="Selecione" />
                        </div>
                        <div className="p-col-12 p-md-4 p-field">
                            <label htmlFor="dataBatismo">Data do Batismo (Se aplicável)</label>
                            <Calendar id="dataBatismo" value={formData.dataBatismo} onChange={(e) => setFormData({...formData, dataBatismo: e.value})} showIcon dateFormat="dd/mm/yy" mask="99/99/9999" />
                        </div>
                            <div className="p-col-12 p-md-4 p-field">
                            <label htmlFor="cargoAtual">Cargo Atual (Opcional)</label>
                            <InputText id="cargoAtual" value={formData.cargoAtual} onChange={(e) => setFormData({...formData, cargoAtual: e.target.value})} />
                        </div>
                        <div className="p-col-12 p-field">
                            <label htmlFor="talentos">Talentos e Habilidades (Opcional)</label>
                            <InputText id="talentos" value={formData.talentos} onChange={(e) => setFormData({...formData, talentos: e.target.value})} />
                        </div>
                    </div>


                    <Divider />

                    {/* SEÇÃO 4: ASSINATURA E ENVIO */}
                    <h3 className="text-xl mb-3 text-blue-800">4. Assinatura Digital</h3>
                    <div className="p-field">
                        <label>Assine digitalmente abaixo (use o mouse ou dedo):</label>
                        <div className="border-2 border-dashed border-gray-400 p-2 bg-white">
                            <SignatureCanvas
                                ref={sigCanvas}
                                canvasProps={{ width: 500, height: 150, className: 'sigCanvas' }}
                            />
                        </div>
                        <Button type="button" label="Limpar Assinatura" icon="pi pi-times" className="p-button-sm p-button-secondary mt-2" onClick={limparAssinatura} />
                    </div>

                    <div className="mt-4">
                        <Button type="submit" label="Salvar Cadastro e Gerar PDF" icon="pi pi-check" loading={loading} className="p-button-success p-button-lg" />
                    </div>
                </form>
            </Card>
        </div>


        {/* --- TEMPLATE PDF INVISÍVEL (ESTILO FORMULÁRIO IMPRESSO DA IMAGEM) --- */}
        {/* Este template é renderizado fora da tela mas é capturado pelo html2pdf */}
        <div id="ficha-pdf-template" style={{ position: 'absolute', left: '-9999px', width: '210mm', minHeight: '297mm', background: '#fff', padding: '15mm' }}>
            {/* Container principal com borda externa */}
            <div style={{ border: '1px solid #000', padding: '5mm', fontSize: '9px', fontFamily: 'Arial, sans-serif' }}>

                {/* --- CABEÇALHO --- */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #000', paddingBottom: '5px', marginBottom: '5px' }}>
                    
                    {/* Bloco esquerdo (Endereço/Telefone) */}
                    <div style={{ width: '35%', lineHeight: '1.2' }}>
                        <p style={{ margin: 0 }}>Rua Frei Lauro, 44</p>
                        <p style={{ margin: 0 }}>Ponte do Imaruim, CEP 88130-750 Palhoça, Santa Catarina</p>
                        <p style={{ margin: 0 }}>Fone: (48) 3242-2451</p>
                    </div>

                    {/* Bloco central (Logo) */}
                    <div style={{ width: '30%', textAlign: 'center' }}>
                        <img src="https://encrypted-tbn0.gstatic.com" alt="Logo ADBV" style={{ height: '50px', maxWidth: '100%' }} />
                    </div>
                    
                    {/* Bloco direito (Título/Membro/Congregado) */}
                    <div style={{ width: '35%', textAlign: 'right', lineHeight: '1.2' }}>
                        <h2 style={{ padding: 0, margin: '0 0 5px 0', fontSize: '16px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                            FICHA CADASTRAL
                        </h2>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                            <span>MEMBRO [ ]</span>
                            <span>CONGREGADO [ ]</span>
                        </div>
                    </div>
                </div>

                {/* --- SEÇÃO DADOS PESSOAIS --- */}
                <div style={{ border: '1px solid #000', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, padding: '5px', background: '#f0f0f0', borderBottom: '1px solid #000', textTransform: 'uppercase' }}>DADOS PESSOAIS</h4>
                    <div style={{ padding: '5px' }}>
                        {/* Linha 1: Nome */}
                        <div style={{ display: 'flex', marginBottom: '5px' }}><small>NOME COMPLETO: <u id="pdf-nome" style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small></div>
                        
                        {/* Linha 2: Pai, Mãe, Cônjuge */}
                        <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                            <div style={{ flexGrow: 1 }}><small>NOME DO PAI: <u id="pdf-nomePai" style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small></div>
                            <div style={{ flexGrow: 1 }}><small>NOME DA MÃE: <u id="pdf-nomeMae" style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small></div>
                        </div>
                        <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                            <div style={{ width: '60%' }}><small>NOME DO CÔNJUGE: <u id="pdf-nomeConjuge" style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small></div>
                            <div style={{ width: '40%' }}><small>DATA CASAMENTO: <u id="pdf-casamento" style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small></div>
                        </div>

                        {/* Linha 3: RG, CPF, Nascimento, Estado Civil */}
                        <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                            <div style={{ width: '25%' }}><small>RG: <u id="pdf-rg" style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small></div>
                            <div style={{ width: '25%' }}><small>CPF: <u id="pdf-cpf" style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small></div>
                            <div style={{ width: '25%' }}><small>DATA NASCIMENTO: <u id="pdf-nascimento" style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small></div>
                            <div style={{ width: '25%' }}><small>ESTADO CIVIL: <u id="pdf-estadoCivil" style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small></div>
                        </div>

                        {/* Linha 4: Endereço, Bairro */}
                        <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                            <div style={{ width: '60%' }}><small>ENDEREÇO: <u id="pdf-endereco" style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small></div>
                            <div style={{ width: '40%' }}><small>BAIRRO: <u id="pdf-bairro" style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small></div>
                        </div>

                        {/* Linha 5: Cidade, Estado, CEP */}
                        <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                            <div style={{ width: '35%' }}><small>CIDADE: <u id="pdf-cidade" style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small></div>
                            <div style={{ width: '15%' }}><small>ESTADO: <u id="pdf-uf" style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small></div>
                            <div style={{ width: '25%' }}><small>CEP: <u id="pdf-cep" style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small></div>
                            <div style={{ width: '25%' }}><small>DDD/FONE CELULAR: <u id="pdf-contato" style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small></div>
                        </div>
                    </div>
                </div>
                
                {/* --- SEÇÃO DADOS PROFISSIONAIS --- */}
                <div style={{ border: '1px solid #000', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, padding: '5px', background: '#f0f0f0', borderBottom: '1px solid #000', textTransform: 'uppercase' }}>DADOS PROFISSIONAIS</h4>
                    <div style={{ padding: '5px' }}>
                        <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                            <div style={{ width: '40%' }}><small>PROFISSÃO: <u id="pdf-profissao" style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small></div>
                            <div style={{ width: '60%' }}><small>OCUPAÇÃO ATUAL: <u id="pdf-ocupacao" style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small></div>
                        </div>
                    </div>
                </div>

                {/* --- SEÇÃO IGREJA --- */}
                <div style={{ border: '1px solid #000', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, padding: '5px', background: '#f0f0f0', borderBottom: '1px solid #000', textTransform: 'uppercase' }}>IGREJA</h4>
                    <div style={{ padding: '5px' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ width: '33%', borderRight: '1px solid #000', paddingRight: '10px' }}>
                                <p style={{margin: '0 0 5px 0'}}>FORMA DE RECEBIMENTO NA IGREJA</p>
                                <div style={{display: 'flex', justifyContent: 'space-between'}}><small>POR BATISMO [ ]</small><small>POR CARTA [ ]</small><small>POR APROVAÇÃO [ ]</small></div>
                            </div>
                            <div style={{ width: '33%', borderRight: '1px solid #000', paddingRight: '10px' }}>
                                <p style={{margin: '0 0 5px 0'}}>BATISMO</p>
                                <small>DATA DO BATISMO: <u id="pdf-dataBatismo" style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small><br/>
                                <small>IGREJA: <u id="pdf-igrejaBatismo" style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small><br/>
                                <small>CIDADE: <u id="pdf-cidadeBatismo" style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small>
                            </div>
                            <div style={{ width: '33%' }}>
                                <p style={{margin: '0 0 5px 0'}}>CARTA</p>
                                <small>IGREJA: <u id="pdf-igrejaCarta" style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small><br/>
                                <small>DATA DA APROVAÇÃO: <u id="pdf-dataAprovacao" style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small><br/>
                                <small>OBSERVAÇÃO(ÕES): <u id="pdf-obsIgreja" style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small>
                            </div>
                        </div>
                    </div>

                    {/* --- SEÇÃO CARGO(S)/FUNÇÃO(ÕES) --- */}
                    <div style={{ border: '1px solid #000', marginBottom: '10px' }}>
                        <h4 style={{ margin: 0, padding: '5px', background: '#f0f0f0', borderBottom: '1px solid #000', textTransform: 'uppercase' }}>CARGO(S)/FUNÇÃO(ÕES)</h4>
                        <div style={{ padding: '5px' }}>
                            <small>CARGO ATUAL: <u id="pdf-cargoAtual" style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small>
                            <p style={{margin: '5px 0'}}>FUNÇÕES JÁ EXERCIDAS (MARQUE COM X)</p>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px'}}>
                                <small>[] DIÁCONO</small><small>[] PRESBÍTERO</small><small>[] EVANGELISTA</small>
                                <small>[] PASTOR</small><small>[] COORDENADOR GERAL</small><small>[] LÍDER DE CULTO FAMÍLIA</small>
                                <small>[] LÍDER DEPARTAMENTO</small><small>[] SECRETÁRIO</small><small>[] LÍDER DISCIPULADO</small>
                                <small>[] PROFESSOR ESCOLA DOMINICAL</small><small>[] LÍDER EVANGELISMO</small><small>[] COOPERADOR</small>
                            </div>
                        </div>
                    </div>

                    {/* --- SEÇÃO FAMÍLIA --- */}
                    <div style={{ border: '1px solid #000', marginBottom: '10px' }}>
                        <h4 style={{ margin: 0, padding: '5px', background: '#f0f0f0', borderBottom: '1px solid #000', textTransform: 'uppercase' }}>FAMÍLIA</h4>
                        <div style={{ padding: '5px' }}>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <div style={{ width: '50%' }}><small>ESTADO CIVIL: <u id="pdf-estadoCivil" style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small></div>
                                <div style={{ width: '50%' }}><small>QUANTIDADE DE FILHOS: <u id="pdf-qtdFilhos" style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small></div>
                            </div>
                            <p style={{margin: '5px 0 2px 0'}}>DEMAIS INTEGRANTES DA CASA</p>
                            <table style={{width: '100%', borderCollapse: 'collapse'}}>
                                <thead><tr><th style={{border: '1px solid #000', padding: '3px'}}>NOME</th><th style={{border: '1px solid #000', padding: '3px'}}>PARENTESCO</th></tr></thead>
                                <tbody>
                                    <tr><td style={{border: '1px solid #000', padding: '3px', height: '15px'}} id="pdf-integrante1Nome"></td><td style={{border: '1px solid #000', padding: '3px'}} id="pdf-integrante1Parentesco"></td></tr>
                                    <tr><td style={{border: '1px solid #000', padding: '3px', height: '15px'}} id="pdf-integrante2Nome"></td><td style={{border: '1px solid #000', padding: '3px'}} id="pdf-integrante2Parentesco"></td></tr>
                                    <tr><td style={{border: '1px solid #000', padding: '3px', height: '15px'}} id="pdf-integrante3Nome"></td><td style={{border: '1px solid #000', padding: '3px'}} id="pdf-integrante3Parentesco"></td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* --- SEÇÃO TALENTOS E HABILIDADES --- */}
                    <div style={{ border: '1px solid #000', marginBottom: '10px' }}>
                        <h4 style={{ margin: 0, padding: '5px', background: '#f0f0f0', borderBottom: '1px solid #000', textTransform: 'uppercase' }}>TALENTOS E HABILIDADES</h4>
                        <div style={{ padding: '5px' }}>
                            <p style={{margin: '0 0 5px 0'}}>VOCÊ TEM ALGUM TALENTO QUE GOSTARIA DE COMPARTILHAR? <u id="pdf-talentos" style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></p>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <small>TEM COMPUTADOR EM CASA? SIM [ ] NÃO [ ]</small>
                                <small>ACESSO A INTERNET? SIM [ ] NÃO [ ]</small>
                                <small>OBSERVAÇÃO(ÕES): <u id="pdf-obsGeral" style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100px', display: 'inline-block'}}></u></small>
                            </div>
                        </div>
                    </div>

                    {/* --- SEÇÃO ASSINATURA --- */}
                    <div style={{ paddingTop: '50px' }}>
                        <div style={{ borderTop: '1px solid #000', paddingTop: '5px', width: '300px', margin: '0 auto', textAlign: 'center' }}>
                            <small>Assinatura do Membro / Responsável</small>
                        </div>
                    </div>
                </div>
            </div>
            {/* --- FIM DO TEMPLATE PDF INVISÍVEL --- */}
        </div> 
       </div>

    }