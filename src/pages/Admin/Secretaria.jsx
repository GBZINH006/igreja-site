import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';

// Lembre-se de corrigir este caminho se o seu arquivo FichaCadastro.jsx estiver em outro local
// Import { FichaCadastro } from '../Public/FichaCadastro.jsx'; 

export const Secretaria = () => {
    const [membros, setMembros] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMembros();
        const channel = supabase
            .channel('realtime-membros')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'membros' }, fetchMembros)
            .subscribe();
        return () => supabase.removeChannel(channel);
    }, []);

    const fetchMembros = async () => {
        setLoading(true);
        const { data } = await supabase.from('membros').select('*').order('created_at', { ascending: false });
        setMembros(data || []);
        setLoading(false);
    };

    const aprovarMembro = async (id, nome) => {
        if (!window.confirm(`Tem certeza que deseja aprovar o membro ${nome}?`)) return;
        setLoading(true);
        const { error } = await supabase.from('membros').update({ status: 'aprovado' }).eq('id', id);
        if (error) alert(`Erro ao aprovar: ${error.message}`);
        await fetchMembros();
        setLoading(false);
    };

    const toggleDizimo = async (membro) => {
        setLoading(true);
        const { error } = await supabase.from('membros').update({ pagou_dizimo: !membro.pagou_dizimo }).eq('id', membro.id);
        if (error) alert(`Erro ao registrar dízimo: ${error.message}`);
        await fetchMembros();
        setLoading(false);
    };

    const downloadPdf = async (membro, type = 'ficha') => {
        const templateId = type === 'ficha' ? 'ficha-pdf-template' : 'carta-pdf-template';
        const input = document.getElementById(templateId);

        const fields = {
            'pdf-nome': membro.nome, 'pdf-cpf': membro.cpf, 'pdf-contato': membro.contato,
            'pdf-nascimento': membro.nascimento ? new Date(membro.nascimento).toLocaleDateString('pt-BR') : '---',
            'pdf-setor': membro.setor, 'pdf-congregacao': membro.congregacao,
            'pdf-endereco': `${membro.endereco}, ${membro.numero} - ${membro.bairro}`,
            'pdf-cidade-uf': `${membro.cidade}/${membro.uf}`, 'pdf-cargo': membro.cargo,
            'pdf-tipo-membro': membro.tipo,
            // Adicione aqui outros campos que você tenha no seu objeto 'membro'
            'pdf-bairro': membro.bairro,
            'pdf-cidade': membro.cidade,
            'pdf-uf': membro.uf,
            'pdf-profissao': membro.profissao,
            'pdf-ocupacao': membro.ocupacao,
            'pdf-aprovacao-data': membro.data_aprovacao ? new Date(membro.data_aprovacao).toLocaleDateString('pt-BR') : '---',
            'pdf-talentos': membro.talentos || '---',
            'pdf-casamento': membro.data_casamento ? new Date(membro.data_casamento).toLocaleDateString('pt-BR') : '---',
        };
        // Preenche os campos no template invisível
        Object.keys(fields).forEach(id => { const el = document.getElementById(id); if (el) el.innerText = fields[id] || '---'; });

        try {
            const canvas = await html2canvas(input, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
            const fileName = type === 'ficha' ? `Ficha_Cadastro_${membro.nome}.pdf` : `Carta_Aprovacao_${membro.nome}.pdf`;
            pdf.save(fileName.replace(/\s+/g, '_'));
        } catch (error) {
            alert("Erro ao gerar PDF.");
        }
    };

    // Templates da Tabela
    const statusTemplate = (rowData) => (
        <Tag value={rowData.status === 'análise' ? 'EM ANÁLISE' : 'APROVADO'}
            severity={rowData.status === 'análise' ? 'warning' : 'success'} />
    );

    const statusMembroTemplate = (rowData) => (
        <Tag value={rowData.status_membro === 'ativo' ? 'ATIVO' : 'INATIVO'}
            severity={rowData.status_membro === 'ativo' ? 'success' : 'danger'} />
    );

    const dizimoTemplate = (rowData) => (
        <Button
            label={rowData.pagou_dizimo ? 'Dízimo Pago' : '+ Registrar Dízimo'}
            icon={rowData.pagou_dizimo ? 'pi pi-check' : 'pi pi-plus'}
            severity={rowData.pagou_dizimo ? 'success' : 'secondary'}
            onClick={() => toggleDizimo(rowData)}
            className="p-button-sm w-full"
        />
    );

    const acaoTemplate = (rowData) => (
        <div className="flex gap-2 justify-content-center">
            <Button tooltip="Aprovar Cadastro" icon="pi pi-check" className="p-button-success p-button-sm p-button-icon-only"
                disabled={rowData.status === 'aprovado'} onClick={() => aprovarMembro(rowData.id, rowData.nome)} />
            <Button tooltip="Baixar Ficha de Cadastro" icon="pi pi-file-pdf" severity="info" className="p-button-sm p-button-icon-only"
                onClick={() => downloadPdf(rowData, 'ficha')} />
            {rowData.status === 'aprovado' && (
                <Button tooltip="Baixar Carta de Aprovação" icon="pi pi-envelope" severity="secondary" className="p-button-sm p-button-icon-only"
                    onClick={() => downloadPdf(rowData, 'carta')} />
            )}
        </div>
    );

    const header = (
        <div className="flex justify-content-between align-items-center">
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Pesquisar Membro..." />
            </span>
            <Button label="Atualizar Tabela" icon="pi pi-refresh" className="p-button-text" onClick={fetchMembros} />
        </div>
    );


    return (
        <div className="p-4 bg-gray-100 min-h-screen">
            <div className="flex align-items-center mb-4 bg-white p-3 shadow-2 border-round">
                <Button icon="pi pi-arrow-left" className="p-button-text mr-3" onClick={() => navigate('/')} />
                <h1 className="text-blue-900 font-bold m-0 text-2xl">Secretaria - Triagem 2026</h1>
            </div>

            <Card>
                <DataTable value={membros} paginator rows={10} header={header} globalFilter={globalFilter}
                    className="p-datatable-gridlines" loading={loading} responsiveLayout="stack"
                    dataKey="id">
                    <Column field="nome" header="Nome" sortable filter />
                    <Column field="contato" header="WhatsApp" />
                    <Column header="Status Triagem" body={statusTemplate} sortable />
                    <Column header="Status Membro" body={statusMembroTemplate} sortable />
                    <Column header="Dízimo/Registro" body={dizimoTemplate} />
                    <Column field="necessidade" header="Necessidade/Oração" />
                    <Column header="Ações" body={acaoTemplate} style={{ minWidth: '180px' }} />
                </DataTable>
            </Card>

            {/* --- TEMPLATE PDF INVISÍVEL (ESTILO FORMULÁRIO IMPRESSO DA IMAGEM) --- */}
            {/* Este template é renderizado fora da tela mas é capturado pelo html2canvas */}
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
                                <div style={{ flexGrow: 1 }}><small>NOME DO PAI: <u style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small></div>
                                <div style={{ flexGrow: 1 }}><small>NOME DA MÃE: <u style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small></div>
                            </div>
                            <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                                <div style={{ width: '60%' }}><small>NOME DO CÔNJUGE: <u style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small></div>
                                <div style={{ width: '40%' }}><small>DATA CASAMENTO: <u id="pdf-casamento" style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small></div>
                            </div>

                            {/* Linha 3: RG, CPF, Nascimento, Estado Civil */}
                            <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                                <div style={{ width: '25%' }}><small>RG: <u style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small></div>
                                <div style={{ width: '25%' }}><small>CPF: <u id="pdf-cpf" style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small></div>
                                <div style={{ width: '25%' }}><small>DATA NASCIMENTO: <u id="pdf-nascimento" style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small></div>
                                <div style={{ width: '25%' }}><small>ESTADO CIVIL: <u style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small></div>
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
                                <div style={{ width: '25%' }}><small>CEP: <u style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small></div>
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
                                    <small>DATA DO BATISMO: <u style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small><br/>
                                    <small>IGREJA: <u style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small><br/>
                                    <small>CIDADE: <u style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small>
                                </div>
                                <div style={{ width: '33%' }}>
                                    <p style={{margin: '0 0 5px 0'}}>CARTA</p>
                                    <small>IGREJA: <u style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small><br/>
                                    <small>DATA DA APROVAÇÃO: <u id="pdf-aprovacao-data" style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small><br/>
                                    <small>OBSERVAÇÃO(ÕES): <u style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- SEÇÃO CARGO(S)/FUNÇÃO(ÕES) --- */}
                    <div style={{ border: '1px solid #000', marginBottom: '10px' }}>
                        <h4 style={{ margin: 0, padding: '5px', background: '#f0f0f0', borderBottom: '1px solid #000', textTransform: 'uppercase' }}>CARGO(S)/FUNÇÃO(ÕES)</h4>
                        <div style={{ padding: '5px' }}>
                            <small>CARGO ATUAL: <u id="pdf-cargo" style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small>
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
                                <div style={{ width: '50%' }}><small>ESTADO CIVIL: <u style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small></div>
                                <div style={{ width: '50%' }}><small>QUANTIDADE DE FILHOS: <u style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100%', display: 'inline-block'}}></u></small></div>
                            </div>
                            <p style={{margin: '5px 0 2px 0'}}>DEMAIS INTEGRANTES DA CASA</p>
                            <table style={{width: '100%', borderCollapse: 'collapse'}}>
                                <thead><tr><th style={{border: '1px solid #000', padding: '3px'}}>NOME</th><th style={{border: '1px solid #000', padding: '3px'}}>PARENTESCO</th></tr></thead>
                                <tbody>
                                    <tr><td style={{border: '1px solid #000', padding: '3px', height: '15px'}}></td><td style={{border: '1px solid #000', padding: '3px'}}></td></tr>
                                    <tr><td style={{border: '1px solid #000', padding: '3px', height: '15px'}}></td><td style={{border: '1px solid #000', padding: '3px'}}></td></tr>
                                    <tr><td style={{border: '1px solid #000', padding: '3px', height: '15px'}}></td><td style={{border: '1px solid #000', padding: '3px'}}></td></tr>
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
                                    <small>OBSERVAÇÃO(ÕES): <u style={{textDecoration: 'none', borderBottom: '1px solid #000', paddingLeft: '5px', width: '100px', display: 'inline-block'}}></u></small>
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
    );
};
