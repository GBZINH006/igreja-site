import React, { useState } from 'react';
import { supabase } from '../../services/supabase';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { RadioButton } from 'primereact/radiobutton';
import { Checkbox } from 'primereact/checkbox';
import { useNavigate } from 'react-router-dom';


export const Cadastro = () => {
    // Definimos os nomes das variáveis para bater EXATAMENTE com suas colunas no Supabase
    const [formData, setFormData] = useState({
        tipo: 'Membro', nome: '', nascimento: null, sexo: '', estadoCivil: '', pais_nome: '', data_casamento: null,
        contato: '', ocupacao: '', forma_recepcao: '', data_batismo_aguas: null, igreja_origem: '',
        cargo: '', qtd_filhos: 0, tem_computador: false, inadimplente: false,
        status: 'análise', // Status inicial
    });
    const [loading, setLoading] = useState(false);
    const [enviado, setEnviado] = useState(false);
    const navigate = useNavigate();


    const handleCadastro = async () => {
        if (!formData.nome || !formData.contato) return alert("Preencha os campos essenciais.");
        setLoading(true);

        // O objeto formData é enviado diretamente, com status garantido como 'análise'
        const dataToSend = { ...formData, status: 'análise' };

        const { error } = await supabase
            .from('membros')
            .insert([dataToSend]);

        if (error) {
            console.error(error);
            alert(`Erro ao salvar: ${error.message}. Verifique os nomes das suas colunas no Supabase.`);
        } else {
            setEnviado(true);
        }
        setLoading(false);
    };

    // TELA DE SUCESSO (IDÊNTICA À IMAGEM ENVIADA)
    if (enviado) {
        return (
            <div className="flex align-items-center justify-content-center h-screen bg-gray-100 p-4">
                <Card className="text-center shadow-8 w-full md:w-30rem border-round-xl">
                    <i className="pi pi-check-circle text-5xl text-green-600 mb-3"></i>
                    <h2 className="text-900 mb-3">CADASTRO ENVIADO!</h2>
                    <p className="text-600 mb-5">Seus dados foram enviados para análise ministerial.</p>
                    <Button label="Voltar para Home" onClick={() => navigate('/')} /> 
                </Card>
            </div>
        );
    }

    const estadosCivis = ['Solteiro(a)', 'Casado(a)', 'Viúvo(a)', 'Divorciado(a)'];
    const sexos = ['Masculino', 'Feminino'];

    return (
        <div className="p-4 flex justify-content-center bg-gray-100 min-h-screen">
            <Card title="FICHA CADASTRAL - Assembleia de Deus" className="w-full md:w-40rem shadow-4">
                <div className="p-fluid flex flex-column gap-4">
                    <div className="flex gap-4">
                        <label className="flex align-items-center gap-2"><RadioButton name="tipo" value="Membro" checked={formData.tipo === 'Membro'} onChange={(e) => setFormData({...formData, tipo: e.value})} /> Membro</label>
                        <label className="flex align-items-center gap-2"><RadioButton name="tipo" value="Congregado" checked={formData.tipo === 'Congregado'} onChange={(e) => setFormData({...formData, tipo: e.value})} /> Congregado</label>
                    </div>

                    <h4>1. DADOS PESSOAIS</h4>
                    <InputText placeholder="Nome Completo" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} />
                    <div className="grid">
                        <div className="col-12 md:col-6"><Calendar placeholder="Data Nasc." value={formData.nascimento} onChange={(e) => setFormData({...formData, nascimento: e.value})} dateFormat="dd/mm/yy" mask="99/99/9999" /></div>
                        <div className="col-12 md:col-6"><Dropdown placeholder="Sexo" value={formData.sexo} options={sexos} onChange={(e) => setFormData({...formData, sexo: e.value})} /></div>
                    </div>
                    <InputText placeholder="Nome do Pai/Mãe (Opcional)" value={formData.pais_nome} onChange={(e) => setFormData({...formData, pais_nome: e.target.value})} />
                    <div className="grid">
                        <div className="col-12 md:col-6"><Dropdown placeholder="Estado Civil" value={formData.estadoCivil} options={estadosCivis} onChange={(e) => setFormData({...formData, estadoCivil: e.value})} /></div>
                        {formData.estadoCivil === 'Casado(a)' && <div className="col-12 md:col-6"><Calendar placeholder="Data Casamento" value={formData.data_casamento} onChange={(e) => setFormData({...formData, data_casamento: e.value})} dateFormat="dd/mm/yy" mask="99/99/9999" /></div>}
                    </div>

                    <h4>2. DADOS PROFISSIONAIS E CONTATO</h4>
                    <InputText placeholder="Ocupação/Profissão" value={formData.ocupacao} onChange={(e) => setFormData({...formData, ocupacao: e.target.value})} />
                    <InputText placeholder="Contato/WhatsApp Principal" value={formData.contato} onChange={(e) => setFormData({...formData, contato: e.target.value})} />

                    <h4>3. IGREJA</h4>
                    <Dropdown placeholder="Forma de Recepção na Igreja" value={formData.forma_recepcao} options={['Batismo', 'Carta', 'Reconciliação']} onChange={(e) => setFormData({...formData, forma_recepcao: e.value})} />
                    <InputText placeholder="Igreja de Origem/Cidade" value={formData.igreja_origem} onChange={(e) => setFormData({...formData, igreja_origem: e.target.value})} />
                    <Calendar placeholder="Data Batismo nas Águas" value={formData.data_batismo_aguas} onChange={(e) => setFormData({...formData, data_batismo_aguas: e.value})} dateFormat="dd/mm/yy" mask="99/99/9999" />
                    
                    <h4>4. FAMÍLIA E HABILIDADES</h4>
                    <InputNumber placeholder="Quantidade de Filhos" value={formData.qtd_filhos} onChange={(e) => setFormData({...formData, qtd_filhos: e.value})} showButtons min={0} max={20} />
                    <div className="flex gap-4">
                        <label className="flex align-items-center gap-2"><Checkbox checked={formData.tem_computador} onChange={e => setFormData({...formData, tem_computador: e.checked})} /> Tem computador em casa?</label>
                        <label className="flex align-items-center gap-2"><Checkbox checked={formData.inadimplente} onChange={e => setFormData({...formData, inadimplente: e.checked})} /> Inadimplente?</label>
                    </div>

                    <Button label="SALVAR FICHA CADASTRAL COMPLETA" icon="pi pi-send" loading={loading} onClick={handleCadastro} className="mt-4 p-button-success" />
                </div>
            </Card>
        </div>
    );
};
