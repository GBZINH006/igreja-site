// src/pages/Public/Login.jsx
import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';

const perfis = [
  { label: 'Membro', value: 'membro' },
  { label: 'Congregado', value: 'congregado' },
];

export const Login = () => {
  const navigate = useNavigate();

  const [emailIn, setEmailIn] = useState('');
  const [passIn, setPassIn] = useState('');

  const [emailUp, setEmailUp] = useState('');
  const [passUp, setPassUp] = useState('');
  const [perfilUp, setPerfilUp] = useState('membro');
  const [loading, setLoading] = useState(false);

  const entrar = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailIn.trim(),
        password: passIn,
      });
      if (error) throw error;

      // Redireciona conforme perfil (se quiser tratar aqui)
      navigate('/');
    } catch (err) {
      alert(err.message || 'Erro ao entrar');
    } finally {
      setLoading(false);
    }
  };

  const cadastrar = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: emailUp.trim(),
        password: passUp,
        options: {
          data: { perfil: perfilUp }, // salva o perfil no metadata
        },
      });
      if (error) throw error;

      alert('Cadastro realizado! Faça login para entrar.');
      setEmailIn(emailUp);
      navigate('/login');
    } catch (err) {
      alert(err.message || 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex align-items-center justify-content-center p-3">
      <Card className="w-full md:w-30rem">
        <h2 className="m-0 mb-3 text-center">Acessar</h2>

        <TabView>
          <TabPanel header="Entrar">
            <div className="p-fluid">
              <label>Email</label>
              <InputText value={emailIn} onChange={(e) => setEmailIn(e.target.value)} />
              <label className="mt-3">Senha</label>
              <Password value={passIn} onChange={(e) => setPassIn(e.target.value)} feedback={false} toggleMask />
              <div className="mt-3 flex gap-2 justify-content-between">
                <Dropdown value={null} options={perfis} placeholder="Entrar como..." disabled />
                <Button label="Entrar" onClick={entrar} loading={loading} />
              </div>
            </div>
          </TabPanel>

          <TabPanel header="Cadastrar-se">
            <div className="p-fluid">
              <label>Perfil</label>
              <Dropdown value={perfilUp} options={perfis} onChange={(e) => setPerfilUp(e.value)} />
              <label className="mt-3">Email</label>
              <InputText value={emailUp} onChange={(e) => setEmailUp(e.target.value)} />
              <label className="mt-3">Senha</label>
              <Password value={passUp} onChange={(e) => setPassUp(e.target.value)} feedback toggleMask />
              <div className="mt-3 flex justify-content-end">
                <Button label="Cadastrar" onClick={cadastrar} loading={loading} />
              </div>
            </div>
          </TabPanel>
        </TabView>
      </Card>
    </div>
  );
};
``