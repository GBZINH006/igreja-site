import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';
import { Link, Navigate } from 'react-router-dom';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        // Lógica de login aqui (ex: chamada de API)
        console.log('Login attempt with:', { email, password });
        setTimeout(() => setLoading(false), 2000); // Simulação de API
    };

    return (
        <div className="flex align-items-center justify-content-center min-h-screen bg-gray-200">
            <div className="p-fluid">
                <Card className="max-w-md shadow-2x2" style={{ borderRadius: '30px' }}>
                    <div className="text-center mb-5">
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzJVKsXgOQMSsC2HaVNYw9XeATeJZ7lo4TWw&shttps://encrypted-tbn0.gstatic.com" alt="Logo" className="w-5rem mb-3" />
                        <h2 className="text-2xl font-bold text-900">Acesse sua Conta</h2>
                        <p className="text-600">Portal do Membro AD Bela Vista</p>
                    </div>

                    <form onSubmit={handleLogin} className="flex flex-column gap-2">
                        <span className="p-input-icon-left">
                            <i className="pi pi-user" />
                            <InputText 
                                id="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                placeholder="E-mail ou CPF"
                                required
                            />
                        </span>

                        <Password 
                            id="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Senha"
                            toggleMask
                            feedback={false}
                            required
                        />

                        <div className="flex align-items-center justify-content-between">
                            <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                                Esqueceu a senha?
                            </Link>
                            <Link to="/cadastrar" className="text-sm text-gray-600 hover:text-gray-800 transition-colors">
                                Quero me cadastrar
                            </Link>
                        </div>

                        <Button 
                            label="ENTRAR" 
                            type="submit" 
                            loading={loading}
                            className="mt-3 p-button-lg p-button-rounded font-bold"
                            onClick={() => Navigate('/Home')}
                        />
                    </form>
                </Card>
            </div>
        </div>
    );
};
export default Login;