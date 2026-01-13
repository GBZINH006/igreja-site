import React, { useState } from 'react';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';

export const Financeiro = () => {
    const [movimentacao, setMovimentacao] = useState({ tipo: 'Dízimo', valor: 0, membro: '' });
    const tipos = ['Dízimo', 'Oferta Alçado', 'Missões', 'Oferta EBD', 'Cantina'];
    const chartData = {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'],
        datasets: [{ label: 'Entradas', backgroundColor: '#42A5F5', data: [65, 59, 80, 81, 56, 55, 40] }]
    };

    return (
        <div className="p-4">
            <h2 className="text-green-700"><i className="pi pi-money-bill mr-2"></i>Gestão Financeira</h2>
            <div className="grid">
                <div className="col-12 md:col-6">
                    <div className="card p-4 shadow-2">
                        <h5>Lançar Entrada</h5>
                        <div className="flex flex-column gap-3">
                            {/* ... (código de input financeiro) ... */}
                            <Button label="Registrar Entrada" icon="pi pi-plus" severity="success" />
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-6">
                    <div className="card p-4 shadow-2">
                        <h5>Visão Mensal</h5>
                        <Chart type="bar" data={chartData} />
                    </div>
                </div>
            </div>
        </div>
    );
};
