import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';

export const DashboardMembro = () => {
    const membro = { nome: "João da Silva", matricula: "2026-0015", cargo: "Membro", classe: "Jovens (Geração Eleita)", foto: "via.placeholder.com" };
    return (
        <div className="p-4 flex flex-column align-items-center">
            <h2 className="text-blue-800">Meu Painel</h2>
            <Card className="w-full md:w-25rem shadow-5 bg-blue-700 text-white border-round-xl overflow-hidden">
                {/* ... (código do card/carteirinha digital) ... */}
            </Card>
            <div className="grid mt-4 w-full md:w-25rem">
                <div className="col-6"><Button label="Comprar Revista" icon="pi pi-book" className="w-full p-button-success" /></div>
                <div className="col-6"><Button label="Meus Dados" icon="pi pi-user-edit" className="w-full p-button-outlined" /></div>
            </div>
        </div>
    );
};
