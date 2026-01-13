import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { useNavigate } from 'react-router-dom';

export const LoginAdmin = () => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const navigate = useNavigate();

    const handleLogin = () => {
        // TESTE MANUAL: Use admin@ad.com.br / admin123
        const SENHA_SECRETA = 'admin123';
        const EMAIL_ADMIN = 'admin@ad.com.br';

        if (email === EMAIL_ADMIN && senha === SENHA_SECRETA) {
            localStorage.setItem('user', JSON.stringify({ isLoggedIn: true, role: 'admin', name: 'Secretario AD' }));
            alert('Login Admin de teste realizado! Redirecionando...');
            navigate('/secretaria');
        } else {
            alert('Falha no login admin. Use admin@ad.com.br / admin123');
        }
    };

    return (
        <div className="flex align-items-center justify-content-center h-screen bg-bluegray-900">
            <Card title="Acesso Administrativo" className="w-full md:w-25rem bg-white border-round-xl">
                <div className="flex flex-column gap-3">
                    <InputText placeholder="E-mail (admin@ad.com.br)" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <InputText type="password" placeholder="Senha (admin123)" value={senha} onChange={(e) => setSenha(e.target.value)} />
                    <Button label="Acessar Sistema (Teste)" severity="danger" onClick={handleLogin} />
                </div>
            </Card>
        </div>
    );
};
