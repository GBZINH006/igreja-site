import React from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { useNavigate } from 'react-router-dom';

export const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-100">
            {/* HERÔ / BANNER PRINCIPAL (Estilo AD Blu) */}
            <div className="relative w-full h-30rem md:h-35rem bg-bluegray-900 flex align-items-center justify-content-center text-white overflow-hidden shadow-4">
                <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-cover bg-center" 
                     style={{ backgroundImage: "url('images.unsplash.com')" }}>
                </div>
                <div className="z-1 text-center p-4">
                    <h1 className="text-4xl md:text-6xl font-bold mb-3">Assembleia de Deus</h1>
                    <p className="text-xl md:text-2xl mb-5 opacity-80 italic">"Pregar a palavra é a nossa missão"</p>
                    <div className="flex flex-wrap justify-content-center gap-3">
                        <Button label="ASSISTIR AO VIVO" icon="pi pi-video" className="p-button-danger p-button-raised" />
                        <Button label="PEDIDO DE ORAÇÃO" icon="pi pi-heart" className="p-button-info p-button-raised" />
                    </div>
                </div>
            </div>

            {/* ACESSO RÁPIDO (GRID) */}
            <div className="p-4 md:p-6 grid mt-4">
                <div className="col-12 md:col-4">
                    <Card title="Portal do Membro" className="h-full text-center border-top-3 border-blue-500 shadow-2">
                        <i className="pi pi-user text-5xl text-blue-500 mb-3"></i>
                        <p className="mb-4">Acesse sua carteirinha, dízimos e loja da EBD.</p>
                        <Button label="ENTRAR" className="w-full" onClick={() => navigate('/login')} />
                    </Card>
                </div>
                <div className="col-12 md:col-4">
                    <Card title="Escola Bíblica" className="h-full text-center border-top-3 border-green-500 shadow-2">
                        <i className="pi pi-book text-5xl text-green-500 mb-3"></i>
                        <p className="mb-4">Acesse as lições, faça chamadas e veja relatórios.</p>
                        <Button label="VER EBD" severity="success" className="w-full" onClick={() => navigate('/login')} />
                    </Card>
                </div>
                <div className="col-12 md:col-4">
                    <Card title="Novos Membros" className="h-full text-center border-top-3 border-orange-500 shadow-2">
                        <i className="pi pi-user-plus text-5xl text-orange-500 mb-3"></i>
                        <p className="mb-4">Ainda não faz parte? Faça seu pré-cadastro aqui.</p>
                        <Button label="CADASTRAR" severity="warning" className="w-full" onClick={() => navigate('/cadastrar')} />
                    </Card>
                </div>
            </div>

            {/* SEÇÃO DE NOTÍCIAS (Estilo Grid AD Blu) */}
            <div className="p-4 md:p-6">
                <h2 className="text-900 font-bold mb-4 flex align-items-center">
                    <i className="pi pi-megaphone mr-2 text-blue-600"></i>ÚLTIMAS NOTÍCIAS
                </h2>
                <div className="grid">
                    <div className="col-12 md:col-6 lg:col-3">
                        <Card subTitle="13 de Jan, 2026" className="shadow-2 h-full">
                            <img src="via.placeholder.com" alt="News" className="w-full border-round mb-2" />
                            <h4 className="m-0">Congresso de Jovens: Inscrições Abertas</h4>
                        </Card>
                    </div>
                    {/* Repetir o Card acima para outras notícias */}
                </div>
            </div>

            {/* RODAPÉ (FOOTER) */}
            <div className="bg-bluegray-900 text-white p-6 mt-6">
                <div className="grid">
                    <div className="col-12 md:col-6">
                        <h3>Nossa Localização</h3>
                        <p className="opacity-70 text-sm">Av. Principal, 100 - Centro<br/>Florianópolis - SC</p>
                    </div>
                    <div className="col-12 md:col-6 text-right">
                        <Button icon="pi pi-facebook" className="p-button-rounded p-button-text text-white" />
                        <Button icon="pi pi-instagram" className="p-button-rounded p-button-text text-white" />
                        <Button icon="pi pi-youtube" className="p-button-rounded p-button-text text-white" />
                    </div>
                </div>
                <hr className="opacity-20 my-4" />
                <p className="text-center text-xs opacity-50">© 2026 Assembleia de Deus. Todos os direitos reservados.</p>
            </div>
        </div>
    );
};
