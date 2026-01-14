import React from 'react';
// 1. Provedor de Temas do PrimeReact
import { PrimeReactProvider } from 'primereact/api';

// 2. Estilos Oficiais (Importante para o visual de 2026)
import "primereact/resources/themes/lara-light-blue/theme.css"; 
import "primereact/resources/primereact.min.css"; 
import "primeicons/primeicons.css"; 
import "primeflex/primeflex.css"; 

// 3. Sistema de Rotas
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 4. Importação das suas Páginas
import { Home } from './pages/Public/Home';
import { Cadastro } from './pages/Public/Cadastro';
import { Secretaria } from './pages/Admin/Secretaria';
import { LoginAdmin } from './pages/Login/LoginAdmin';
import { LojaEBD } from './pages/Membro/LojaEBD'

function App() {
  return (
    <PrimeReactProvider value={{ ripple: true }}>
      <BrowserRouter>
        <Routes>
          {/* Página Principal estilo AD Blumenau */}
          <Route path="/" element={<Home />} />

          {/* Página da Ficha Cadastral Completa */}
          <Route path="/cadastrar" element={<Cadastro />} />

          {/* Página de Login do Pastor/Mídia */}
          <Route path="/admin-login" element={<LoginAdmin />} />

          {/* Página de Aprovação e Download de PDF */}
          <Route path="/secretaria" element={<Secretaria />} />


          {/* Rota de segurança caso digitem link errado */}
          <Route path="LojaEBD" element={<LojaEBD />} />
        </Routes>
      </BrowserRouter>
    </PrimeReactProvider>
  );
}

export default App;
