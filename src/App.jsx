import React, { Suspense } from 'react';
import { PrimeReactProvider } from 'primereact/api';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { Home } from './pages/Public/Home';
import { Login } from './pages/Public/Login';
import { Agenda } from './pages/Public/Agenda';
import { Admin } from './pages/Admin/Admin';
import { NotFound } from './pages/Public/NotFound';
import { FichaCadastro } from './pages/Public/FichaCadastro';
import RequireAdmin from './guards/RequireAdmin';

export default function App() {
  return (
    <PrimeReactProvider value={{ ripple: true }}>
      <BrowserRouter>
        <Suspense fallback={<div className="p-4">Carregando...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />

            <Route path="/cadastro" element={<FichaCadastro />} />
            <Route path="/agenda" element={<Agenda />} />

            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <Admin />
                </RequireAdmin>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </PrimeReactProvider>
  );
}