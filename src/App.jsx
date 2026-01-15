import React from 'react';
// 1. Provedor de Temas do PrimeReact
import { PrimeReactProvider } from 'primereact/api';

// 2. Estilos Oficiais (Essenciais para o visual de 2026)
import "primereact/resources/themes/lara-light-blue/theme.css"; 
import "primereact/resources/primereact.min.css"; 
import "primeicons/primeicons.css"; 
import "primeflex/primeflex.css"; 

// 3. Sistema de Rotas
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 4. Importação das suas Páginas (Verifique se as pastas estão certas)
import { Home } from './pages/Public/Home';
import { Cadastro } from './pages/Public/Cadastro';
import { Secretaria } from './pages/Admin/Secretaria';
import { LoginAdmin } from './pages/Login/LoginAdmin';

function App() {
  return (
    <PrimeReactProvider value={{ ripple: true }}>
      <BrowserRouter>
        <Routes>
          {/* Rota da Página Inicial (Home estilo AD Blumenau) */}
          <Route path="/" element={<Home />} />

          {/* Rota da Ficha Cadastral Completa (Onde o membro se cadastra) */}
          <Route path="/cadastrar" element={<Cadastro />} />

          {/* Rota do Login do Administrador/Pastor/Mídia */}
          <Route path="/admin-login" element={<LoginAdmin />} />

          {/* Rota da Secretaria (Onde aprova e baixa o PDF) */}
          {/* Nota: No futuro, protegeremos esta rota com PrivateRoute */}
          <Route path="/secretaria" element={<Secretaria />} />

          {/* Rota de segurança para links errados (Evita o erro 404 vazio) */}
          <Route path="*" element={
            <div className="flex flex-column align-items-center justify-content-center h-screen">
              <i className="pi pi-exclamation-triangle text-6xl text-yellow-500 mb-4"></i>
              <h1>404 - Página não encontrada</h1>
              <p>O link que você acessou não existe.</p>
              <a href="/" className="mt-4 text-blue-500 underline">Voltar para a Home</a>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </PrimeReactProvider>
  );
}

export default App;
