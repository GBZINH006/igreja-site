import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { useNavigate } from 'react-router-dom';

export const LoginMembro = () => {
    const [matricula, setMatricula] = useState('');
    const [senha, setSenha] = useState('');
    const navigate = useNavigate();

    const handleLogin = () => {
        // TESTE MANUAL: Use "TESTE" como matrícula e "123" como senha
        if (matricula === 'TESTE' && senha === '123') {
            localStorage.setItem('user', JSON.stringify({ isLoggedIn: true, role: 'membro', name: 'Membro Teste' })); 
            alert('Login de teste realizado com sucesso! Redirecionando...');
            navigate('/meu-painel');
        } else {
            alert('Falha no login de teste. Use TESTE/123.');
        }
    };

    return (
        <div className="flex align-items-center justify-content-center h-screen">
            <Card title="Portal do Membro - Teste" className="w-full md:w-30rem shadow-4">
                <div className="flex flex-column gap-3">
                    <InputText placeholder="Nº da Matrícula (Use TESTE)" value={matricula} onChange={(e) => setMatricula(e.target.value)} />
                    <InputText type="password" placeholder="Senha (Use 123)" value={senha} onChange={(e) => setSenha(e.target.value)} />
                    <Button label="Entrar (Teste)" icon="pi pi-user" onClick={handleLogin} />
                    <a href="/cadastrar" className="text-center text-sm">Não tem matrícula? Cadastre-se aqui.</a>
                </div>
            </Card>
        </div>
    );
};
