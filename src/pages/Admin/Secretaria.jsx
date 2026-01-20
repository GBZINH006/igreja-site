import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas'; 
import { useNavigate } from 'react-router-dom';

export const Secretaria = () => {
    const [membros, setMembros] = useState([]);
    const [loading, setLoading] = useState(false); 
    const navigate = useNavigate();

    useEffect(() => {
        fetchMembros();
        const channel = supabase.channel('realtime-membros').on('postgres_changes', { event: '*', schema: 'public', table: 'membros' }, fetchMembros).subscribe();
        return () => supabase.removeChannel(channel);
    }, []);

    const fetchMembros = async () => {
        setLoading(true);
        const { data } = await supabase.from('membros').select('*').order('criado_em', { ascending: false });
        setMembros(data || []);
        setLoading(false);
    };

    const aprovarMembro = async (id) => {
        setLoading(true);
        await supabase.from('membros').update({ status: 'aprovado' }).eq('id', id);
        await fetchMembros(); 
        setLoading(false);
    };

    const downloadPdf = async (membro) => {
        const input = document.getElementById('ficha-pdf-template');
        
        // Preenche o template invisível com os dados no formato limpo
        document.getElementById('pdf-nome-completo').innerText = membro.nome || '';
        document.getElementById('pdf-contato-main').innerText = membro.contato || '';
        document.getElementById('pdf-tipo-membro').innerText = membro.tipo || 'N/A';
        // (Outros campos aqui se necessário)

        try {
            // Usa as opções da FichaCadastro.jsx para melhor qualidade
            const canvas = await html2canvas(input, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
            pdf.save(`Ficha_${membro.nome}.pdf`);
        } catch (error) {
            console.error(error);
            alert("Erro ao gerar PDF.");
        }
    };

    const statusTemplate = (rowData) => <Tag value={rowData.status} severity={rowData.status === 'análise' ? 'warning' : 'success'} />;
    
    const acaoTemplate = (rowData) => (
        <div className="flex gap-2">
            <Button icon="pi pi-check" className="p-button-success p-button-sm" disabled={rowData.status === 'aprovado'} onClick={() => aprovarMembro(rowData.id)} loading={loading} />
            <Button label="PDF" icon="pi pi-file-pdf" severity="info" className="p-button-sm" onClick={() => downloadPdf(rowData)} />
        </div>
    );

    return (
        <div className="p-4 bg-gray-50 min-h-screen font-sans">
            <div className="flex align-items-center mb-4 border-bottom-1 pb-3">
                 <img src="https://encrypted-tbn0.gstatic.com" alt="Logo ADBV" className="w-3rem cursor-pointer mr-3" onClick={() => navigate('/')} />
                <h1 className="text-blue-900 font-bold m-0 text-2xl">Secretaria - Triagem 2026</h1>
            </div>
           
            <DataTable value={membros} paginator rows={10} className="shadow-4" loading={loading}>
                <Column field="nome" header="Nome" sortable filter />
                <Column field="contato" header="Contato" />
                <Column header="Status" body={statusTemplate} sortable />
                <Column header="Ações" body={acaoTemplate} />
            </DataTable>

            {/* --- Template HTML INVISÍVEL PARA GERAR O PDF (ESTILO FICHA.JSX LIMPO) --- */}
            <div id="ficha-pdf-template" style={{ position: 'absolute', left: '-9999px', width: '210mm', padding: '15px', background: '#fff' }}>
                <div style={{ padding: '15px' }}>
                    
                    {/* Cabeçalho */}
                    <div className="flex justify-content-between align-items-center mb-4 pb-2" style={{ borderBottom: '2px solid #000' }}>
                        <img src="https://encrypted-tbn0.gstatic.com" alt="Logo" style={{ height: '40px' }} />
                        <h2 style={{ margin: 0, textTransform: 'uppercase', fontSize: '16px' }}>Ficha Cadastral ADBV</h2>
                    </div>

                    {/* DADOS */}
                    <div style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '15px' }}>
                        <h4 style={{ background: '#e0f2fe', padding: '8px', borderLeft: '3px solid #007bff' }}>DADOS PESSOAIS</h4>
                        <div className="grid">
                            <div className="col-12" style={{ marginBottom: '10px' }}>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 'bold' }}>NOME COMPLETO</label>
                                <span id="pdf-nome-completo" style={{ fontSize: '14px', borderBottom: '1px solid #ccc', paddingBottom: '2px', display: 'block' }}></span>
                            </div>
                            <div className="col-12" style={{ marginBottom: '10px' }}>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 'bold' }}>CONTATO / WHATSAPP</label>
                                <span id="pdf-contato-main" style={{ fontSize: '14px', borderBottom: '1px solid #ccc', paddingBottom: '2px', display: 'block' }}></span>
                            </div>
                            <div className="col-12">
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 'bold' }}>TIPO DE MEMBRO</label>
                                <span id="pdf-tipo-membro" style={{ fontSize: '14px', borderBottom: '1px solid #ccc', paddingBottom: '2px', display: 'block' }}></span>
                            </div>
                        </div>
                    </div>

                    {/* Assinatura Placeholder (Não podemos carregar a assinatura dinâmica de outra página) */}
                    <div style={{ marginTop: '50px', borderTop: '1px solid #000', paddingTop: '10px', width: '200px', textAlign: 'center' }}>
                        <span style={{ fontSize: '10px' }}>Assinatura do Membro / Responsável</span>
                    </div>

                </div>
            </div>
            {/* --- FIM DO TEMPLATE PDF --- */}
        </div>
    );
};
