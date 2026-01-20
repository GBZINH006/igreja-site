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
import { InputMask } from 'primereact/inputmask'


// Importação de estilos
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import "primeflex/primeflex.css";
import "./ficha.css";

export const FichaCadastro = () => {
    const navigate = useNavigate();
    const sigCanvas = useRef({});
    
    // 1. ESTADO ÚNICO PARA O FORMULÁRIO
    const [formData, setFormData] = useState({
        tipo: 'Membro', 
        nome: '', 
        nascimento: null, 
        sexo: '', 
        estadoCivil: '', 
        pais_nome: '', 
        data_casamento: null,
        contato: '', 
        ocupacao: '', 
        forma_recepcao: '', 
        data_batismo_aguas: null, 
        igreja_origem: '',
        cargo: '', 
        qtd_filhos: 0, 
        tem_computador: false, 
        inadimplente: false,
        status: 'análise',
    });

    const [loading, setLoading] = useState(false);
    const [enviado, setEnviado] = useState(false);
    const [value, setValue] = useState();
    const [sexo, setSexo] = useState("");
    const [doador, setDoador] = useState("");
    const [escolaridade, setEscolaridade] =  useState("");
    const [recebimento, setRecebimento] = useState("");
    const [batizado, setBatizado] = useState("");
    const [aprovacao, setAprovacao] = useState("");
    const [cargo, setCargo] = useState("");
    const [dirigente, setDigirigente] = useState(false);
    const [oracao, setOracao] = useState(false);
    const [mocidade, setMocidade] = useState(false);
    const [prof, setProf] = useState(false);
    const [missoes, setMissoes] = useState(false);
    const [coordenador, setCoordenador] = useState(false);
    const [envangelismo, setEvangelismo] = useState(false);
    const [familiar, setFamiliar] = useState(false);
    const [discipulado, setDiscipulado] = useState(false);
    const [adicional, setAdicional] = useState(false);
    const [chefeFamilia, setChefeFamilia] = useState("");
    const [computador, setComputador] = useState("");
    const [internet, setInternet] = useState("");

    // 2. FUNÇÕES DE AÇÃO
    const limparAssinatura = () => sigCanvas.current.clear();

    const handleCadastroESalvar = async () => {
        if (!formData.nome || !formData.contato) return alert("Preencha Nome e Contato.");
        if (sigCanvas.current.isEmpty()) return alert("Por favor, assine a ficha.");

        setLoading(true);

        // Salva no Supabase
        const { error } = await supabase
            .from('membros')
            .insert([{ ...formData, status: 'análise' }]);

        if (error) {
            alert(`Erro ao salvar: ${error.message}`);
        } else {
            // Se salvou com sucesso, gera o PDF e mostra tela de sucesso
            gerarPDF();
            setEnviado(true);
        }
        setLoading(false);
    };

    const gerarPDF = () => {
        const element = document.getElementById("ficha-pdf");
        const options = {
            margin: 10,
            filename: `ficha-${formData.nome}-${new Date().getFullYear()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
        };
        html2pdf().set(options).from(element).save();
    };

    // 3. TELA DE SUCESSO
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
            <div className="max-w-7xl mx-auto mb-4 flex justify-content-between">
                <Button icon="pi pi-home" label="Início" onClick={() => navigate('/')} className="p-button-text" />
                <Button label="SALVAR E GERAR PDF" icon="pi pi-save" severity="success" loading={loading} onClick={handleCadastroESalvar} />
            </div>

            <div id='ficha-pdf' className='ficha bg-white shadow-3 p-6 mx-auto' style={{ maxWidth: '900px', borderRadius: '8px' }}>
                
                {/* CABEÇALHO */}
                <div className="flex justify-content-between align-items-start border-bottom-2 border-primary mb-4 pb-3">
                    <div className="flex flex-column">
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzJVKsXgOQMSsC2HaVNYw9XeATeJZ7lo4TWw&s" alt="Logo" style={{ height: '60px', width: '60px' }} />
                        <span className="text-xs mt-2 text-700">Rua Frei Lauro, 44 - Ponte do Imaruim<br/>CEP 88130-750 - Palhoça/SC</span>
                    </div>
                    <div className="text-right">
                        <h2 className='m-0 text-primary uppercase font-bold text-xl'>Ficha Cadastral 2026</h2>
                        <span className="text-sm font-bold">Fone: (48) 3242-2451</span>
                    </div>
                </div>

                {/* CORPO DO FORMULÁRIO */}
                <div className='box mb-4'>
                    <h4 className="bg-blue-50 p-2 border-left-3 border-primary text-primary mb-3 uppercase">Dados Pessoais</h4>
                    <div className="p-fluid grid">
                        <div className="field col-12 md:col-6 flex gap-4 mt-2">
                            <div className="flex align-items-center">
                                <Checkbox inputId="membro" value="Membro" onChange={e => setFormData({...formData, tipo: e.value})} checked={formData.tipo === 'Membro'} />
                                <label htmlFor="membro" className="ml-2">Membro</label>
                            </div>
                            <div className="flex align-items-center">
                                <Checkbox inputId="cong" value="Congregado" onChange={e => setFormData({...formData, tipo: e.value})} checked={formData.tipo === 'Congregado'} />
                                <label htmlFor="cong" className="ml-2">Congregado</label>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="">CONGREGAÇÃO</label>
                            <InputText className='input' required/>
                        </div>
                        <div className="field col-12 md:col-3">
                            <label className="font-bold text-xs">SETOR</label>
                            <InputNumber 
                                value={formData.setor || 0} 
                                onValueChange={(e) => setFormData({...formData, setor: e.value})} 
                                mode="decimal" 
                                showButtons 
                                min={0} 
                                max={17} 
                                required
                            />
                        </div>
                        
                        <div className="field col-12">
                            <label className="font-bold text-xs">NOME COMPLETO</label>
                            <InputText value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} required/>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="font-bold text-xs">CONTATO / WHATSAPP</label>
                             <InputMask value={value} onChange={(e) => setValue(e.target.value)} mask="99-999999999" placeholder="99-999999999" required/>
                        </div>
                    </div>
                </div>

                {/* ASSINATURA */}
                <div className="mt-6">
                    <h4 className="text-primary border-bottom-1 border-300 pb-2 mb-3 uppercase text-sm font-bold">Assinatura membro</h4>
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <div style={{ border: '1px solid #ccc', background: '#f9f9f9', borderRadius: '4px', alignItems: 'center' }}>
                                <SignatureCanvas 
                                    ref={sigCanvas}
                                    penColor='black'
                                    canvasProps={{ width: 400, height: 120, className: 'sigCanvas' }} 
                                />
                            </div>
                            <Button label="Limpar" icon="pi pi-trash" className="p-button-text p-button-sm mt-1" onClick={limparAssinatura} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
