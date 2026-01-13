// src/components/Layout.jsx
import React from 'react';
import { Menubar } from 'primereact/menubar';
import { useNavigate } from 'react-router-dom';

export const LayoutGeral = ({ children }) => {
    const navigate = useNavigate();

    const items = [
        { label: 'Início', icon: 'pi pi-home', command: () => navigate('/') },
        { label: 'Meu Painel', icon: 'pi pi-id-card', command: () => navigate('/meu-painel') },
        { label: 'EBD', icon: 'pi pi-book', items: [
            { label: 'Fazer Chamada', icon: 'pi pi-check-square', command: () => navigate('/chamada') },
            { label: 'Secretaria EBD', icon: 'pi pi-chart-bar', command: () => navigate('/secretaria-ebd') }
        ]},
        { label: 'Admin', icon: 'pi pi-lock', items: [
             { label: 'Secretaria Geral', icon: 'pi pi-users', command: () => navigate('/secretaria') },
             { label: 'Financeiro', icon: 'pi pi-money-bill', command: () => navigate('/financeiro') },
             { label: 'Batismos', icon: 'pi pi-compass', command: () => navigate('/batismos') }
        ]},
        { label: 'Sair', icon: 'pi pi-power-off', command: () => { 
            localStorage.removeItem('user'); // Limpa o login
            navigate('/login'); 
        }}
    ];

    return (
        <div>
            <Menubar model={items} />
            <div className="p-4">
                {children}
            </div>
        </div>
    );
};
