import React from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { useNavigate } from 'react-router-dom';
import BeholdFeed from '../../components/BeholdFeed';

export const Home = () => {
    const navigate = useNavigate();

    const eventos = [];

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            
            {/* 1. BANNER PRINCIPAL */}
            <div
                className="relative w-full h-30rem md:h-40rem flex align-items-center justify-content-center text-white"
                style={{
                    background:
                        "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url('https://lh3.googleusercontent.com/gps-cs-s/AG0ilSyRqAxiJqxJ7_naf3cbRvcXyBJ75jSMjgOXK1WflU7YiCIb00QQJGm0-5BuKjOr7jcp-9nezogl3pc2CRX11huBqlaTMiXsN6m7EOQFJHF85Noqm--ozw-mv4RQD4TycYejKSqv=s680-w680-h510-rw')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                <div className="text-center p-4">
                    <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzJVKsXgOQMSsC2HaVNYw9XeATeJZ7lo4TWw&s"
                        alt="Logo"
                        className="w-6rem mb-4"
                    />
                    <h1 className="text-4xl md:text-7xl font-bold mb-2">
                        AD BELA VISTA
                    </h1>
                    <p className="text-xl md:text-2xl mb-5 font-light">
                        Setor 9 - Palhoça/SC
                    </p>
                    <div className="flex justify-content-center">
                        <Button
                            label="CADASTRAR-SE"
                            icon="pi pi-user-plus"
                            className="p-button-warning p-button-raised p-button-lg px-6"
                            onClick={() => navigate('/cadastrar')}
                        />
                    </div>
                </div>
            </div>

            {/* 2. CARDS */}
            <div className="relative px-4 md:px-8 mt-6 z-1">
                <div className="grid justify-content-center">
                    <div className="col-12 md:col-4 lg:col-3">
                        <Card
                            className="text-center shadow-8 border-none bg-white-alpha-20 backdrop-blur-md hover:bg-black-alpha-10 transition-duration-300"
                            style={{ borderRadius: '15px' }}
                        >
                            <div className="p-3 border-circle bg-blue-600 inline-flex align-items-center justify-content-center mb-3">
                                <i className="pi pi-users text-2xl text-black"></i>
                            </div>
                            <h3 className="m-0 mb-2 text-900 font-bold">
                                Membros
                            </h3>
                            <p className="text-700 text-sm mb-4">
                                Acesse seu portal, dízimos e cursos.
                            </p>
                            <Button
                                label="ACESSAR"
                                className="p-button-sm w-full p-button-rounded"
                                onClick={() => navigate('/login')}
                            />
                        </Card>
                    </div>

                    <div className="col-12 md:col-4 lg:col-3">
                        <Card
                            className="text-center shadow-8 border-none bg-white-alpha-20 backdrop-blur-md hover:bg-black-alpha-10 transition-duration-300"
                            style={{ borderRadius: '15px' }}
                        >
                            <div className="p-3 border-circle bg-orange-600 inline-flex align-items-center justify-content-center mb-3">
                                <i className="pi pi-lock text-2xl text-black"></i>
                            </div>
                            <h3 className="m-0 mb-2 text-900 font-bold">
                                Gestão
                            </h3>
                            <p className="text-700 text-sm mb-4">
                                Secretaria, Mídia e Painel Pastoral.
                            </p>
                            <Button
                                label="GERENCIAR"
                                severity="warning"
                                className="p-button-sm w-full p-button-rounded"
                                onClick={() => navigate('/admin-login')}
                            />
                        </Card>
                    </div>
                </div>
            </div>

            {/* 3. MURAL DO INSTAGRAM (BEHOLD) */}
            <div className="p-4 md:p-8 bg-white mt-8">
                <div className="text-center mb-6">
                    <h2 className="text-900 font-bold text-4xl mb-2">
                        Acompanhe nosso Instagram
                    </h2>
                    <p className="text-600">
                        Fique por dentro de tudo o que acontece na nossa igreja
                    </p>
                </div>

                <div className="container mx-auto" style={{ maxWidth: '1200px' }}>
                    <BeholdFeed />
                </div>
            </div>

            {/* 4. EVENTOS (reservado) */}
            <div className="p-4 md:p-8 container mx-auto">
                <div className="flex justify-content-between align-items-end mb-5">
                    <div>
                        <span className="text-blue-600 font-bold uppercase tracking-wider text-sm">
                            Agenda 2026
                        </span>
                        <h2 className="text-900 font-bold m-0 text-4xl">
                            Próximos Eventos
                        </h2>
                    </div>
                    <Button
                        label="Ver Todos"
                        icon="pi pi-calendar"
                        className="p-button-text font-bold"
                    />
                </div>
            </div>

            {/* 5. FOOTER */}
            <footer className="bg-gray-900 text-white p-8 mt-8">
                <div className="grid container mx-auto">
                    <div className="col-12 md:col-6">
                        <h3 className="text-blue-400 font-bold mb-3 uppercase">
                            AD Bela Vista - Setor 9
                        </h3>
                        <p className="text-gray-400 line-height-3 text-sm">
                            R. Blumenau - Bela Vista
                            <br />
                            Palhoça - SC | CEP: 88132-745
                            <br />
                            <strong>Telefone:</strong> (92) 99441-0542
                        </p>
                    </div>

                    <div className="col-12 md:col-6 md:text-right">
                        <h3 className="text-white mb-4 font-bold">
                            REDES SOCIAIS
                        </h3>
                        <div className="flex justify-content-start md:justify-content-end gap-3">
                            <Button
                                icon="pi pi-facebook"
                                className="p-button-rounded p-button-outlined p-button-secondary"
                                onClick={() =>
                                    window.open('https://www.facebook.com', '_blank')
                                }
                            />
                            <Button
                                icon="pi pi-instagram"
                                className="p-button-rounded p-button-outlined p-button-secondary"
                                onClick={() =>
                                    window.open('https://www.instagram.com', '_blank')
                                }
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
