// src/pages/Login/RecuperarAcesso.jsx
import React from 'react';
import { InputMask } from 'primereact/inputmask'; // Máscara para CPF

export const RecuperarAcesso = () => {
    return (
        <div className="flex justify-content-center p-4">
            <div className="card p-4 w-full md:w-30rem shadow-2">
                <h3>Recuperar Acesso</h3>
                <p className="text-sm text-600">Informe seu CPF para recuperar seu número de matrícula via WhatsApp.</p>
                <div className="flex flex-column gap-3">
                    <InputMask mask="999.999.999-99" placeholder="Digite seu CPF" />
                    <Button label="Enviar Matrícula por WhatsApp" icon="pi pi-whatsapp" severity="success" />
                </div>
            </div>
        </div>
    );
};
