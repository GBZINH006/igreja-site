import React, { Suspense } from "react";
import { PrimeReactProvider } from 'primereact/api';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Home } from "./pages/Public/Home";
import { FichaCadastro } from "./pages/Public/FichaCadastro";
import { Secretaria } from './pages/Admin/Secretaria';
import { LoginAdmin } from './pages/Login/LoginAdmin';
import { Cadastro } from './pages/Public/Cadastro';
import { Login } from "./pages/Public/Login";
import { NotFound } from './pages/Public/NotFound';
function App() {
  return (
    <PrimeReactProvider value={{ ripple: true }}>
      <BrowserRouter>
        <Suspense fallback={<div className="p-4">Carregando...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cadastro" element={<FichaCadastro />} />
            <Route path="/secretaria" element={<Secretaria />} />
            <Route path="/loginAdmin" element={<LoginAdmin />} />
            <Route path="/Cadastro" element={<Cadastro />} />
            <Route path="login" element={<Login />} />
            <Route path="notFound" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </PrimeReactProvider>
  )
}

export default App;