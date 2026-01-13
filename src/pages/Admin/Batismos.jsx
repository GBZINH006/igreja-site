import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';

export const Batismos = () => {
    const candidatos = [
        { id: 1, nome: 'Pedro Henrique', dataExame: '10/01/2026', aprovado: true },
        { id: 2, nome: 'Maria Clara', dataExame: '12/01/2026', aprovado: false }
    ];

    const imprimirCertificado = (nome) => alert(`Gerando PDF do Certificado de Batismo para: ${nome}`);

    return (
        <div className="p-4">
            <h2>Candidatos ao Batismo</h2>
            <DataTable value={candidatos} className="shadow-3">
                <Column field="nome" header="Nome do Candidato" />
                <Column field="dataExame" header="Data do Exame" />
                <Column header="Certificado" body={(rowData) => (
                    <Button icon="pi pi-print" disabled={!rowData.aprovado} onClick={() => imprimirCertificado(rowData.nome)} className="p-button-text" label="Imprimir" />
                )} />
            </DataTable>
        </div>
    );
};
