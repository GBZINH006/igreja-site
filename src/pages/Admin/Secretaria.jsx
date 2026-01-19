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
    const navigate = useNavigate();

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

    const downloadPdf = async (membro) => {
        const input = document.getElementById('ficha-pdf-template');
        
        // Preenche o template com TODOS os dados do membro ANTES de renderizar
        document.getElementById('pdf-nome').innerText = membro.nome || '';
        document.getElementById('pdf-data-nasc').innerText = membro.nascimento ? new Date(membro.nascimento).toLocaleDateString('pt-BR') : '';
        document.getElementById('pdf-sexo').innerText = membro.sexo || '';
        document.getElementById('pdf-estado-civil').innerText = membro.estadoCivil || '';
        document.getElementById('pdf-pais-nome').innerText = membro.pais_nome || '';
        document.getElementById('pdf-data-casamento').innerText = membro.data_casamento ? new Date(membro.data_casamento).toLocaleDateString('pt-BR') : '';
        document.getElementById('pdf-contato').innerText = membro.contato || '';
        document.getElementById('pdf-ocupacao').innerText = membro.ocupacao || '';
        document.getElementById('pdf-forma-recepcao').innerText = membro.forma_recepcao || '';
        document.getElementById('pdf-data-batismo-aguas').innerText = membro.data_batismo_aguas ? new Date(membro.data_batismo_aguas).toLocaleDateString('pt-BR') : '';
        document.getElementById('pdf-igreja-origem').innerText = membro.igreja_origem || '';
        document.getElementById('pdf-qtd-filhos').innerText = membro.qtd_filhos !== undefined && membro.qtd_filhos !== null ? membro.qtd_filhos.toString() : '0';
        document.getElementById('pdf-tem-computador').innerText = membro.tem_computador ? 'Sim' : 'Não';
        document.getElementById('pdf-inadimplente').innerText = membro.inadimplente ? 'Sim' : 'Não';


        try {
            const canvas = await html2canvas(input, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Ficha_Cadastral_${membro.nome}.pdf`);
        } catch (error) {
            console.error("Erro ao gerar o PDF:", error);
            alert("Não foi possível gerar o PDF. Verifique as dependências (html2canvas, jspdf) estão instaladas.");
        }
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
            {/* Adiciona Logo/Botão para Voltar para Home */}
            <div className="flex align-items-center mb-4 border-bottom-1 pb-3">
                 <img 
                    src="https://encrypted-tbn0.gstatic.com" 
                    alt="Logo ADBV" 
                    className="w-4rem cursor-pointer mr-3"
                    onClick={() => navigate('/')} 
                    style={{ cursor: 'pointer' }}
                />
                <h1 className="text-blue-900 font-bold m-0">Triagem de Novos Cadastros</h1>
            </div>
           
            <DataTable value={membros} paginator rows={10} className="shadow-4">
                <Column field="nome" header="Nome" sortable />
                <Column field="contato" header="Contato" />
                <Column header="Status" body={statusTemplate} sortable />
                <Column header="Ação" body={acaoTemplate} />
            </DataTable>

            {/* --- Template HTML INVISÍVEL PARA GERAR O PDF (Visual mais limpo) --- */}
            <div id="ficha-pdf-template" className="p-6" style={{ position: 'absolute', left: '-9999px', width: '210mm', fontSize: '10px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box' }}>
                <div className="border-2 border-black p-4">
                    
                    {/* Header do Formulário */}
                    <div className="flex justify-content-between align-items-center mb-4 text-xs">
                        <div>
                            Rua Frei Lauro, 44<br/>
                            Ponte do Imaruim CEP 88130-750<br/>
                            Palhoça - Santa Catarina<br/>
                            Fone: (48) 3242-2451
                        </div>
                        <div className="text-center">
                            <h1 className="text-lg font-bold uppercase border-1 border-black px-4 py-2">FICHA CADASTRAL</h1>
                        </div>
                    </div>

                    {/* Tipo de Membro */}
                    <div className="flex gap-4 mb-4 text-sm">
                        <div className="flex align-items-center">
                            <input type="checkbox" className="mr-2" /> <span>MEMBRO</span>
                        </div>
                        <div className="flex align-items-center">
                            <input type="checkbox" className="mr-2" /> <span>CONGREGADO</span>
                        </div>
                    </div>

                    {/* Seção DADOS PESSOAIS */}
                    <h3 className="bg-gray-200 p-2 font-bold mb-0 border-x-2 border-t-2 border-black">1. DADOS PESSOAIS</h3>
                    <div className="grid grid-nogutter text-sm">
                        <div className="col-12 p-2 border-1 border-top-none border-black">Nome Completo: <b id="pdf-nome"></b></div>
                        
                        <div className="col-4 p-2 border-1 border-top-none border-right-1 border-black">Data Nascimento: <b id="pdf-data-nasc"></b></div>
                        <div className="col-4 p-2 border-1 border-top-none border-right-1 border-black">Sexo: <b id="pdf-sexo"></b></div>
                        <div className="col-4 p-2 border-1 border-top-none border-black">Estado Civil: <b id="pdf-estado-civil"></b></div>
                        
                        <div className="col-12 p-2 border-1 border-top-none border-black">Nome do Pai/Mãe (Opcional): <b id="pdf-pais-nome"></b></div>

                        <div className="col-12 p-2 border-1 border-top-none border-black">Data Casamento (se aplicável): <b id="pdf-data-casamento"></b></div>
                    </div>

                    {/* Seção DADOS PROFISSIONAIS E CONTATO */}
                    <h3 className="bg-gray-200 p-2 font-bold mt-4 mb-0 border-x-2 border-t-2 border-black">2. DADOS PROFISSIONAIS E CONTATO</h3>
                     <div className="grid grid-nogutter text-sm">
                         <div className="col-12 p-2 border-1 border-top-none border-black">Ocupação/Profissão: <b id="pdf-ocupacao"></b></div>
                         <div className="col-12 p-2 border-1 border-top-none border-black">Contato/WhatsApp Principal: <b id="pdf-contato"></b></div>
                    </div>

                    {/* Seção IGREJA */}
                    <h3 className="bg-gray-200 p-2 font-bold mt-4 mb-0 border-x-2 border-t-2 border-black">3. IGREJA</h3>
                     <div className="grid grid-nogutter text-sm">
                         <div className="col-12 p-2 border-1 border-top-none border-black">Forma de Recepção na Igreja: <b id="pdf-forma-recepcao"></b></div>
                         <div className="col-12 p-2 border-1 border-top-none border-black">Igreja de Origem/Cidade: <b id="pdf-igreja-origem"></b></div>
                         <div className="col-12 p-2 border-1 border-top-none border-black">Data Batismo nas Águas: <b id="pdf-data-batismo-aguas"></b></div>
                    </div>
                    
                    {/* Seção FAMÍLIA E HABILIDADES */}
                    <h3 className="bg-gray-200 p-2 font-bold mt-4 mb-0 border-x-2 border-t-2 border-black">4. FAMÍLIA E HABILIDADES</h3>
                     <div className="grid grid-nogutter text-sm">
                         <div className="col-12 p-2 border-1 border-top-none border-black">Quantidade de Filhos: <b id="pdf-qtd-filhos"></b></div>
                         
                         <div className="col-12 p-2 border-1 border-top-none border-black">
                            Tem computador em casa? <b id="pdf-tem-computador"></b>
                         </div>
                         <div className="col-12 p-2 border-1 border-top-none border-black">
                            Inadimplente? <b id="pdf-inadimplente"></b>
                         </div>
                    </div>

                    <p className="mt-6 text-xs text-right">Data de Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
                </div>
            </div>
            {/* --- FIM DO TEMPLATE PDF --- */}
        </div>
    );
};
