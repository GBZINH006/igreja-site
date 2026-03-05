import React, { useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { useNavigate } from 'react-router-dom';
import { Dialog } from 'primereact/dialog';
import { Password } from 'primereact/password';
import { Toast } from 'primereact/toast';
import './style.css';

export const Home = () => {
    const navigate = useNavigate();
    const toast = useRef(null);

    const [displayLogin, setDisplayLogin] = useState(false);
    const [isShaking, setIsShaking] = useState(false);
    const [password, setPassword] = useState('');

    const handleAdminAccess = () => {
        if (password === 'paodavida') {
            navigate('/admin-login');
            return;
        }

        setIsShaking(true);
        toast.current.show({
            severity: 'error',
            summary: 'Acesso Negado',
            detail: 'Senha administrativa incorreta.',
            life: 3000,
        });
        setTimeout(() => setIsShaking(false), 400);
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <Toast ref={toast} />

            <style>{`
                @keyframes shake {
                    0% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    50% { transform: translateX(10px); }
                    75% { transform: translateX(-10px); }
                    100% { transform: translateX(0); }
                }
                .shake-card { animation: shake 0.4s ease-in-out; }
            `}</style>

            <Dialog
                header="Acesso Restrito"
                visible={displayLogin}
                style={{ width: '350px' }}
                onHide={() => setDisplayLogin(false)}
                footer={(
                    <div>
                        <Button label="Cancelar" icon="pi pi-times" onClick={() => setDisplayLogin(false)} className="p-button-text" />
                        <Button label="Entrar" icon="pi pi-check" onClick={handleAdminAccess} autoFocus />
                    </div>
                )}
            >
                <div className="flex flex-column gap-2 mt-2">
                    <label htmlFor="pass">Digite a senha de administrador:</label>
                    <Password
                        id="pass"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        feedback={false}
                        toggleMask
                        className="w-full"
                        inputClassName="w-full"
                        onKeyDown={(e) => e.key === 'Enter' && handleAdminAccess()}
                    />
                </div>
            </Dialog>

            <div
                className="relative w-full h-30rem md:h-40rem flex align-items-center justify-content-center text-white"
                style={{
                    background: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url('src/pages/Public/Igreja1.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                <div className="text-center p-4">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzJVKsXgOQMSsC2HaVNYw9XeATeJZ7lo4TWw&s" alt="Logo" className="w-6rem mb-4" />
                    <h1 className="text-4xl md:text-7xl font-bold mb-2">AD BELA VISTA</h1>
                    <p className="text-xl md:text-2xl mb-5 font-light">Setor 9 - Palhoça/SC</p>
                    <div className="flex justify-content-center">
                        <Button label="CADASTRAR-SE" icon="pi pi-user-plus" className="p-button-warning p-button-raised p-button-lg px-6" onClick={() => navigate('/FichaCadastro')} />
                    </div>
                </div>
            </div>

            <div className="relative px-4 md:px-8 mt-6 z-1">
                <div className="grid justify-content-center">
                    <div className="col-12 md:col-4 lg:col-3">
                        <Card className="text-center shadow-8 border-none bg-black-alpha-20 backdrop-blur-md hover:bg-black-alpha-10 transition-duration-300" style={{ borderRadius: '15px' }}>
                            <div className="p-3 border-circle bg-blue-600 inline-flex align-items-center justify-content-center mb-3">
                                <i className="pi pi-users text-2xl text-black"></i>
                            </div>
                            <h3 className="m-0 mb-2 text-900 font-bold">Membros</h3>
                            <p className="text-700 text-sm mb-4">Cadastre-se para ter acesso ao portal de membros</p>
                            <Button label="ACESSAR" className="p-button-sm w-full p-button-rounded" onClick={() => navigate('/FichaCadastro')} />
                        </Card>
                    </div>

                    <div className="col-12 md:col-4 lg:col-3">
                        <Card
                            className={`text-center shadow-8 border-none bg-black-alpha-20 backdrop-blur-md hover:bg-black-alpha-10 transition-duration-300 ${isShaking ? 'shake-card border-1 border-red-500' : ''}`}
                            style={{ borderRadius: '15px' }}
                        >
                            <div className="p-3 border-circle bg-orange-600 inline-flex align-items-center justify-content-center mb-3">
                                <i className="pi pi-lock text-2xl text-black"></i>
                            </div>
                            <h3 className="m-0 mb-2 text-900 font-bold">Gestão</h3>
                            <p className="text-700 text-sm mb-4">Secretaria, Mídia e Painel Pastoral.</p>
                            <Button
                                label="GERENCIAR"
                                severity="warning"
                                className="p-button-sm w-full p-button-rounded"
                                onClick={() => setDisplayLogin(true)}
                            />
                        </Card>
                    </div>
                </div>
            </div>

            <section className="px-4 md:px-8 mt-4 mb-6">
                <div className="surface-card border-round-xl shadow-2 p-4 md:p-5 mx-auto" style={{ maxWidth: '950px' }}>
                    <h2 className="m-0 mb-3 text-2xl font-bold text-900">Como começar no site</h2>
                    <div className="grid">
                        <div className="col-12 md:col-4">
                            <p className="text-sm text-700 line-height-3 m-0">
                                <strong>1. Faça seu cadastro:</strong> preencha sua ficha para entrar no portal de membros.
                            </p>
                        </div>
                        <div className="col-12 md:col-4">
                            <p className="text-sm text-700 line-height-3 m-0">
                                <strong>2. Aguarde aprovação:</strong> a secretaria valida suas informações antes de liberar o acesso.
                            </p>
                        </div>
                        <div className="col-12 md:col-4">
                            <p className="text-sm text-700 line-height-3 m-0">
                                <strong>3. Acesse suas áreas:</strong> acompanhe eventos, secretaria e avisos em um só lugar.
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <Button label="Preencher ficha agora" icon="pi pi-file-edit" className="p-button-warning" onClick={() => navigate('/FichaCadastro')} />
                        <Button
                            label="Falar com a secretaria"
                            icon="pi pi-whatsapp"
                            severity="secondary"
                            outlined
                            onClick={() => window.open('https://wa.me/5592994410542', '_blank')}
                        />
                    </div>
                </div>
            </section>

            <footer className="bg-gray-900 text-white p-8 mt-8">
                <div className="grid container mx-auto">
                    <div className="col-12 md:col-6">
                        <h3 className="text-blue-400 font-bold mb-3 uppercase">AD Bela Vista - Setor 9</h3>
                        <p className="text-gray-400 line-height-3 text-sm">
                            R. Blumenau - Bela Vista<br />
                            Palhoça - SC | CEP: 88132-745<br />
                            <strong>Telefone:</strong> (92) 99441-0542
                        </p>
                    </div>
                    <div className="col-12 md:col-6 md:text-right">
                        <h3 className="text-white mb-4 font-bold">REDES SOCIAIS</h3>
                        <div className="flex justify-content-start md:justify-content-end gap-3">
                            <Button
                                icon="pi pi-facebook"
                                className="p-button-rounded p-button-outlined p-button-secondary"
                                onClick={() => window.open('www.facebook.com', '_blank')}
                            />
                            <Button
                                icon="pi pi-instagram"
                                className="p-button-rounded p-button-outlined p-button-secondary"
                                onClick={() => window.open('https://www.instagram.com/adpalhoca_belavista9?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==', '_blank')}
                            />
                        </div>
                    </div>
                </div>
                <div className="border-top-1 border-gray-800 mt-6 pt-4 text-center text-xs text-gray-500 font-light">
                    © 2026 Assembleia de Deus Bela Vista. Desenvolvido para a glória de Deus.
                </div>
            </footer>
        </div>
    );
};
