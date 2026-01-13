import React from 'react';
// 1. Importação do Provedor de Temas
import { PrimeReactProvider } from 'primereact/api';

// 2. Importação dos estilos essenciais do PrimeReact
import "primereact/resources/themes/lara-light-blue/theme.css";  // Tema moderno
import "primereact/resources/primereact.min.css";                // Core CSS
import "primeicons/primeicons.css";                              // Ícones
import "primeflex/primeflex.css";                                // Layout (Grid/Flex)

// 3. Importação do Sistema de Rotas (Navegação)
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 4. Importação das suas páginas que criamos
import { Cadastro } from './pages/Public/Cadastro';
import { Secretaria } from './pages/Admin/Secretaria';

function App() {
  return (
    // O PrimeReactProvider deve envolver toda a aplicação para os componentes funcionarem
    <PrimeReactProvider value={{ ripple: true }}>
      <BrowserRouter>
        <Routes>
          {/* Rota onde o MEMBRO se cadastra */}
          <Route path="/" element={<Cadastro />} />
          <Route path="/cadastrar" element={<Cadastro />} />

          {/* Rota onde a MÍDIA, SECRETARIA e PASTOR veem os nomes em tempo real */}
          {/* Futuramente, você pode colocar uma senha aqui para proteger */}
         <Route path="/secretaria" element={<Secretaria />} />
          
          {/* Página de erro 404 caso digitem o link errado */}
          <Route path="*" element={<div className="p-4 text-center"><h1>Página não encontrada!</h1></div>} />
        </Routes>
      </BrowserRouter>
    </PrimeReactProvider>
  );
}

export default App;
