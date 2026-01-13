import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../services/supabase';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import jsPDF from 'jspdf'; //
import html2canvas from 'html2canvas'; //

export const Secretaria = () => {
    const [membros, setMembros] = useState([]);
    const printRef = useRef(); // Referência para o HTML que será o PDF

    useEffect(() => {
        fetchMembros();
        const channel = supabase.channel('realtime-membros').on('postgres_changes', { event: '*', schema: 'public', table: 'membros' }, fetchMembros).subscribe();
        return () => supabase.removeChannel(channel);
    }, []);

    const fetchMembros = async () => {
        const { data } = await supabase.from('membros').select('*').order('criado_em', { ascending: false });
        setMembros(data || []);
    };

    const aprovarMembro = async (id) => {
        await supabase.from('membros').update({ status: 'aprovado' }).eq('id', id);
    };

    // --- FUNÇÃO PARA GERAR PDF (usa jspdf e html2canvas) ---
    const downloadPdf = async (membro) => {
        // Renderiza um componente HTML invisível em tela que será a ficha PDF
        const input = document.getElementById('ficha-pdf-template');
        // Preenche o template com os dados do membro
        document.getElementById('pdf-nome').innerText = membro.nome;
        document.getElementById('pdf-nascimento').innerText = new Date(membro.nascimento).toLocaleDateString('pt-BR');
        document.getElementById('pdf-contato').innerText = membro.contato;
        document.getElementById('pdf-status').innerText = membro.status;

        const canvas = await html2canvas(input, { scale: 2 }); // Captura o HTML como imagem
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Ficha_Cadastral_${membro.nome}.pdf`); // Salva o arquivo
    };

    const statusTemplate = (rowData) => <Tag value={rowData.status} severity={rowData.status === 'análise' ? 'warning' : 'success'} />;
    
    const acaoTemplate = (rowData) => (
        <div className="flex gap-2">
            <Button icon="pi pi-check" className="p-button-success p-button-sm" disabled={rowData.status === 'aprovado'} onClick={() => aprovarMembro(rowData.id)} />
            <Button icon="pi pi-file-pdf" label="Baixar Ficha PDF" className="p-button-info p-button-sm" onClick={() => downloadPdf(rowData)} />
        </div>
    );

    return (
        <div className="p-4">
            <h1 className="text-blue-900 font-bold mb-4">Triagem de Novos Cadastros</h1>
            <DataTable value={membros} paginator rows={10} className="shadow-4">
                <Column field="nome" header="Nome" sortable />
                <Column field="contato" header="Contato" />
                <Column header="Status" body={statusTemplate} sortable />
                <Column header="Ação" body={acaoTemplate} />
            </DataTable>

            {/* Este é o template HTML INVISÍVEL que o html2canvas usa para criar o PDF */}
            <div id="ficha-pdf-template" style={{ position: 'absolute', left: '-9999px', width: '210mm', padding: '10mm' }}>
                <h2>FICHA CADASTRAL - Assembleia de Deus</h2>
                <p>Nome: <b id="pdf-nome"></b></p>
                <p>Nascimento: <b id="pdf-nascimento"></b></p>
                <p>Contato: <b id="pdf-contato"></b></p>
                <p>Status: <b id="pdf-status"></b></p>
                <p>Data de Emissão: {new Date().toLocaleDateString()}</p>
                <p className="mt-4">______________________________________</p>
                <p>Assinatura do Secretário</p>
            </div>
        </div>
    );
};
