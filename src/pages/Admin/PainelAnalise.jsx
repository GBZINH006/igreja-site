import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { supabase } from '../../services/supabase';

export const PainelAnalise = () => {
    const [lista, setLista] = useState([]);

    const buscarDados = async () => {
        const { data } = await supabase.from('membros').select('*').order('criado_em', { ascending: false });
        setLista(data);
    };

    useEffect(() => {
        buscarDados();

        // ATIVA O MODO REALTIME (Sincroniza vários dispositivos na hora)
        const canal = supabase
            .channel('db-membros')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'membros' }, () => {
                buscarDados();
            })
            .subscribe();

        return () => supabase.removeChannel(canal);
    }, []);

    return (
        <div className="p-4">
            <h2 className="text-blue-700 font-bold mb-4">
                <i className="pi pi-users mr-2"></i>CADASTRADOS EM ANÁLISE
            </h2>
            <DataTable value={lista} responsiveLayout="stack" breakpoint="960px" className="shadow-4 border-round-lg overflow-hidden">
                <Column field="nome" header="Nome Completo" />
                <Column field="status" header="Situação" body={(r) => (
                    <Tag value={r.status} severity={r.status === 'análise' ? 'warning' : 'success'} />
                )} />
                <Column field="criado_em" header="Data/Hora" body={(r) => new Date(r.criado_em).toLocaleString('pt-BR')} />
            </DataTable>
        </div>
    );
};
