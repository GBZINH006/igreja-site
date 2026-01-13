// src/routes.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LayoutGeral } from './components/Layout';
import { PrivateRoute } from './components/PrivateRoute';

// Importe todos os seus componentes de páginas aqui (crie os arquivos vazios primeiro)
import { Home } from './pages/Public/Home';
import { PreCadastro } from './pages/Public/PreCadastro';
import { LoginMembro } from './pages/Login/LoginMembro';
import { LoginAdmin } from './pages/Login/LoginAdmin';
import { DashboardMembro } from './pages/Membro/Dashboard';
import { Secretaria } from './pages/Admin/Secretaria';
import { Financeiro } from './pages/Admin/Financeiro';
import { Batismos } from './pages/Admin/Batismos';
import { ChamadaEBD } from './pages/EBD/Chamada';
import { SecretariaEBD } from './pages/EBD/SecretariaEBD';
import { LojaEBD } from './pages/Membro/LojaEBD';


export const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* ROTAS PÚBLICAS */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginMembro />} />
                <Route path="/admin-login" element={<LoginAdmin />} />
                <Route path="/cadastrar" element={<PreCadastro />} />

                {/* ROTAS PROTEGIDAS (Membro ou Admin) */}
                <Route element={<PrivateRoute />}>
                    <Route path="/meu-painel" element={<LayoutGeral><DashboardMembro /></LayoutGeral>} />
                    <Route path="/loja-ebd" element={<LayoutGeral><LojaEBD /></LayoutGeral>} />
                    <Route path="/chamada" element={<LayoutGeral><ChamadaEBD /></LayoutGeral>} />
                    <Route path="/secretaria-ebd" element={<LayoutGeral><SecretariaEBD /></LayoutGeral>} />
                </Route>
                
                {/* ROTAS APENAS ADMIN */}
                 <Route element={<PrivateRoute roleRequired="admin" />}>
                    <Route path="/secretaria" element={<LayoutGeral><Secretaria /></LayoutGeral>} />
                    <Route path="/financeiro" element={<LayoutGeral><Financeiro /></LayoutGeral>} />
                    <Route path="/batismos" element={<LayoutGeral><Batismos /></LayoutGeral>} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};
