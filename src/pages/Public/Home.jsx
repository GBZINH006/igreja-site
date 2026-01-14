import React from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { useNavigate } from 'react-router-dom';

export const Home = () => {
    const navigate = useNavigate();

    const eventos = [
        {
            id: 1,
            titulo: "Congresso de Missões 2026",
            categoria: "MISSÕES",
            descricao: "Um despertar para as nações. Participe conosco em Fevereiro!",
            imagem: "images.unsplash.com",
            cor: "blue-600"
        },
        {
            id: 2,
            titulo: "EBF - Crianças de Cristo",
            categoria: "INFANTIL",
            descricao: "Escola Bíblica de Férias para todas as crianças da comunidade.",
            imagem: "images.unsplash.com",
            cor: "orange-600"
        },
        {
            id: 3,
            titulo: "Conferência de Louvor",
            categoria: "LOUVOR",
            descricao: "Workshop e noite de adoração com todo o ministério de música.",
            imagem: "images.unsplash.com",
            cor: "purple-600"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            
            {/* 1. BANNER PRINCIPAL */}
            <div className="relative w-full h-30rem md:h-40rem flex align-items-center justify-content-center text-white" 
                 style={{ 
                     background: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url('https://lh3.googleusercontent.com/gps-cs-s/AG0ilSyRqAxiJqxJ7_naf3cbRvcXyBJ75jSMjgOXK1WflU7YiCIb00QQJGm0-5BuKjOr7jcp-9nezogl3pc2CRX11huBqlaTMiXsN6m7EOQFJHF85Noqm--ozw-mv4RQD4TycYejKSqv=s680-w680-h510-rw')",
                     backgroundSize: 'cover',
                     backgroundPosition: 'center',
                     backgroundRepeat: 'no-repeat'
                 }}>
                <div className="text-center p-4">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzJVKsXgOQMSsC2HaVNYw9XeATeJZ7lo4TWw&s" alt="Logo" className="w-6rem mb-4" />
                    <h1 className="text-4xl md:text-7xl font-bold mb-2">AD BELA VISTA</h1>
                    <p className="text-xl md:text-2xl mb-5 font-light">Setor 9 - Palhoça/SC</p>
                    <div className="flex justify-content-center">
                        <Button label="CADASTRAR-SE" icon="pi pi-user-plus" className="p-button-warning p-button-raised p-button-lg px-6" onClick={() => navigate('/cadastrar')} />
                    </div>
                </div>
            </div>

            {/* 2. CARDS TRANSPARENTES (Ícones Pretos conforme pedido) */}
            <div className="relative px-4 md:px-8 mt-6 z-1"> 
                <div className="grid justify-content-center">
                    <div className="col-12 md:col-4 lg:col-3">
                        <Card className="text-center shadow-8 border-none bg-white-alpha-20 backdrop-blur-md hover:bg-black-alpha-10 transition-duration-300" style={{ borderRadius: '15px' }}>
                            <div className="p-3 border-circle bg-blue-600 inline-flex align-items-center justify-content-center mb-3">
                                <i className="pi pi-users text-2xl text-black"></i>
                            </div>
                            <h3 className="m-0 mb-2 text-900 font-bold">Membros</h3>
                            <p className="text-700 text-sm mb-4">Acesse seu portal, dízimos e cursos.</p>
                            <Button label="ACESSAR" className="p-button-sm w-full p-button-rounded" onClick={() => navigate('/login')} />
                        </Card>
                    </div>

                    <div className="col-12 md:col-4 lg:col-3">
                        <Card className="text-center shadow-8 border-none bg-white-alpha-20 backdrop-blur-md hover:bg-black-alpha-10 transition-duration-300" style={{ borderRadius: '15px' }}>
                            <div className="p-3 border-circle bg-orange-600 inline-flex align-items-center justify-content-center mb-3">
                                <i className="pi pi-lock text-2xl text-black"></i>
                            </div>
                            <h3 className="m-0 mb-2 text-900 font-bold">Gestão</h3>
                            <p className="text-700 text-sm mb-4">Secretaria, Mídia e Painel Pastoral.</p>
                            <Button label="GERENCIAR" severity="warning" className="p-button-sm w-full p-button-rounded" onClick={() => navigate('/admin-login')} />
                        </Card>
                    </div>
                </div>
            </div>

            {/* 3. HORÁRIOS DE CULTOS (Melhoria visual) */}
            <div className="py-8 bg-white text-center mt-6">
                <h2 className="text-900 font-bold text-3xl mb-5">NOSSOS CULTOS</h2>
                <div className="flex flex-wrap justify-content-center gap-4 px-4">
                    <div className="p-4 border-round-xl bg-gray-50 w-15rem shadow-1 border-1 border-100">
                        <span className="text-blue-600 font-bold">DOMINGO</span>
                        <h3 className="m-0 mt-2 text-900">18h30</h3>
                        <p className="text-600 text-sm">Culto da Família</p>
                    </div>
                    <div className="p-4 border-round-xl bg-gray-50 w-15rem shadow-1 border-1 border-100">
                        <span className="text-blue-600 font-bold">TERÇA-FEIRA</span>
                        <h3 className="m-0 mt-2 text-900">19h30</h3>
                        <p className="text-600 text-sm">Culto de Ensino</p>
                    </div>
                    <div className='p-4 border-round-x1 bg-gray-50 w-15rem shadow-1 border-1 border-100'>
                        <span className='text-blue-600 font-bold'>QUARTA-FEIRA</span>
                        <h3 className='m-0 mt-2 text-900'>19h30</h3>
                        <p className='text-600 text-sm'>Circulo de Oração  Masculino - Feminino - Jovens</p>
                    </div>
                </div>
            </div>

            {/* 4. SEÇÃO DE EVENTOS */}
            <div className="p-4 md:p-8 container mx-auto">
                <div className="flex justify-content-between align-items-end mb-5">
                    <div>
                        <span className="text-blue-600 font-bold uppercase tracking-wider text-sm">Agenda 2026</span>
                        <h2 className="text-900 font-bold m-0 text-4xl">Próximos Eventos</h2>
                    </div>
                    <Button label="Ver Todos" icon="pi pi-calendar" className="p-button-text font-bold" />
                </div>

                <div className="grid">
                    {eventos.map((evento) => (
                        <div key={evento.id} className="col-12 md:col-6 lg:col-4">
                            <div className="bg-white border-round-xl shadow-2 overflow-hidden hover:shadow-8 transition-all transition-duration-300 cursor-pointer transform hover:-translate-y-1 h-full">
                                <div className="relative">
                                    <img src={evento.imagem} alt={evento.titulo} className="w-full h-15rem object-cover" />
                                    <span className={`absolute top-0 right-0 m-3 px-3 py-1 border-round-lg text-white font-bold text-xs bg-${evento.cor}`}>
                                        {evento.categoria}
                                    </span>
                                </div>
                                <div className="p-4">
                                    <h4 className="mt-0 mb-2 text-xl text-900 font-bold">{evento.titulo}</h4>
                                    <p className="text-600 text-sm line-height-3 mb-0">{evento.descricao}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 5. FOOTER (Instagram e Facebook da Igreja) */}
            <footer className="bg-gray-900 text-white p-8 mt-8">
                <div className="grid container mx-auto">
                    <div className="col-12 md:col-6">
                        <h3 className="text-blue-400 font-bold mb-3 uppercase tracking-tight">AD Bela Vista - Setor 9</h3>
                        <p className="text-gray-400 line-height-3 text-sm">
                             R. Blumenau - Bela Vista<br/>
                            Palhoça - SC | CEP: 88132-745<br/>
                            <strong>Telefone:</strong> (92) 99441-0542
                        </p>
                    </div>
                    <div className="col-12 md:col-6 md:text-right">
                        <h3 className="text-white mb-4">REDES SOCIAIS</h3>
                        <div className="flex justify-content-start md:justify-content-end gap-3">
                            <Button 
                                icon="pi pi-facebook" 
                                className="p-button-rounded p-button-outlined p-button-secondary hover:text-blue-500" 
                                onClick={() => window.open('www.facebook.com', '_blank')}
                            />
                            <Button 
                                icon="pi pi-instagram" 
                                className="p-button-rounded p-button-outlined p-button-secondary hover:text-pink-400" 
                                onClick={() => window.open('www.instagram.com', '_blank')} 
                            />
                        </div>
                    </div>
                </div>
                <div className="border-top-1 border-gray-800 mt-6 pt-4 text-center text-xs text-gray-500">
                    © 2026 Assembleia de Deus Bela Vista. Desenvolvido para a glória de Deus.
                </div>
            </footer>
        </div>
    );
};
