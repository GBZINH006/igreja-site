import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';

const perfisCadastro = [
  { label: 'Membro', value: 'membro' },
  { label: 'Congregado', value: 'congregado' },
];

const perfisLogin = [
  { label: 'Membro', value: 'membro' },
  { label: 'Congregado', value: 'congregado' },
  { label: 'Administrador', value: 'admin' },
];

// Admin por chave (sem e-mail/senha)
const ADMIN_USERNAME = 'adminbv';
const ADMIN_KEY = 'paodavida';

const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());

const traduzErroAuth = (err) => {
  if (!err) return 'Ocorreu um erro.';
  const raw = String(err.message || err);
  const msg = raw.toLowerCase();

  if (msg.includes('invalid login credentials')) return 'Credenciais inválidas. Verifique e-mail e senha.';
  if (msg.includes('email not confirmed')) return 'E-mail não confirmado. Confirme seu e-mail ou desative a confirmação (apenas em desenvolvimento).';
  if (msg.includes('unable to validate email')) return 'E-mail inválido. Formato esperado: nome@dominio.com.';
  if (msg.includes('user not found')) return 'Usuário não encontrado.';
  return `Erro de autenticação: ${raw}`;
};

export const Login = () => {
  const navigate = useNavigate();

  // Entrar
  const [perfilIn, setPerfilIn] = useState('membro'); // 'membro' | 'congregado' | 'admin'
  const [emailIn, setEmailIn] = useState('');
  const [passIn, setPassIn] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [loading, setLoading] = useState(false);

  // Cadastrar
  const [perfilUp, setPerfilUp] = useState('membro');
  const [emailUp, setEmailUp] = useState('');
  const [passUp, setPassUp] = useState('');

  // Recuperação
  const [recCpf, setRecCpf] = useState('');
  const [recId, setRecId] = useState('');
  const [recNome, setRecNome] = useState('');
  const [recEmail, setRecEmail] = useState('');

  // ========== Entrar ==========
  const entrar = async () => {
    setLoading(true);
    try {
      // ADMIN: chave direta
      if (perfilIn === 'admin') {
        if (!adminKey) { alert('Informe a Chave do Administrador.'); return; }
        if (adminKey !== ADMIN_KEY) { alert('Chave do Administrador inválida.'); return; }

        // marca sessão local e segue
        sessionStorage.setItem('auth_role', 'admin');
        sessionStorage.setItem('auth_user', ADMIN_USERNAME);
        navigate('/admin');
        return;
      }

      // MEMBRO/CONGREGADO: Supabase Auth
      const email = emailIn.trim().toLowerCase();
      if (!validarEmail(email)) {
        alert('E-mail inválido. Verifique e tente novamente.');
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password: passIn });
      if (error) throw error;

      sessionStorage.setItem('auth_role', perfilIn); // 'membro' | 'congregado'
      navigate('/');
    } catch (err) {
      alert(traduzErroAuth(err));
      console.error('[LOGIN] erro:', err);
    } finally {
      setLoading(false);
    }
  };

  // ========== Cadastrar ==========
  const cadastrar = async () => {
    setLoading(true);
    try {
      const email = emailUp.trim().toLowerCase();
      if (!validarEmail(email)) {
        alert('E-mail inválido. Verifique e tente novamente.');
        return;
      }
      if (perfilUp === 'admin') {
        alert('Cadastro como administrador não é permitido.');
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password: passUp,
        options: { data: { perfil: perfilUp } },
      });
      if (error) throw error;

      alert('Cadastro realizado! Se necessário, confirme seu e-mail para concluir o acesso.');
      // preenche a aba Entrar
      setEmailIn(emailUp);
      setPassIn('');
      setPerfilIn(perfilUp);
      navigate('/login');
    } catch (err) {
      alert(traduzErroAuth(err));
      console.error('[SIGNUP] erro:', err);
    } finally {
      setLoading(false);
    }
  };

  // ========== Recuperar senha (por CPF ou ID do membro) ==========
  const recuperarSenha = async () => {
    setLoading(true);
    try {
      // Estratégia: localiza e-mail na tabela 'membros' por CPF ou ID; fallback por Nome+Email
      let email = null;

      // Por ID do membro
      if (recId) {
        const { data, error } = await supabase
          .from('membros')
          .select('email')
          .eq('id', recId.trim())
          .limit(1)
          .maybeSingle();
        if (!error && data?.email) email = data.email;
      }

      // Por CPF
      if (!email && recCpf) {
        const cpf = recCpf.replace(/\D/g, '');
        const { data, error } = await supabase
          .from('membros')
          .select('email')
          .eq('cpf', cpf)
          .limit(1)
          .maybeSingle();
        if (!error && data?.email) email = data.email;
      }

      // Fallback: Nome + Email digitado (confirma formato)
      if (!email && recNome && recEmail && validarEmail(recEmail)) {
        // Opcional: você pode validar se nome+email existem na tabela:
        const { data } = await supabase
          .from('membros')
          .select('id')
          .ilike('nome', recNome.trim())
          .eq('email', recEmail.trim().toLowerCase())
          .limit(1)
          .maybeSingle();
        if (data) email = recEmail.trim().toLowerCase();
      }

      if (!email) {
        alert('Não foi possível localizar seu e-mail. Informe CPF ou ID do membro, ou Nome + Email válido.');
        return;
      }

      // Dispara o fluxo de reset do Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`, // para onde o usuario volta após reset
      });
      if (error) throw error;

      alert(`Enviamos um e-mail de recuperação para: ${email}`);
    } catch (err) {
      alert(`Erro ao recuperar senha: ${err?.message || err}`);
      console.error('[RESET] erro:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex align-items-center justify-content-center p-3">
      <Card className="w-full md:w-32rem">
        <h2 className="m-0 mb-3 text-center">Acesso</h2>

        <TabView>
          {/* ENTRAR */}
          <TabPanel header="Entrar">
            <div className="p-fluid">
              <label>Entrar como</label>
              <Dropdown value={perfilIn} options={perfisLogin} onChange={(e) => setPerfilIn(e.value)} className="w-full" />

              {perfilIn === 'admin' ? (
                <>
                  <div className="mt-3 p-2 border-1 surface-border border-round surface-50">
                    <div className="text-600" style={{ fontSize: 12 }}>
                      Usuário: <strong>{ADMIN_USERNAME}</strong> <span className="text-500">(fixo)</span>
                    </div>
                  </div>

                  <label className="mt-3">Chave do Administrador</label>
                  <InputText value={adminKey} onChange={(e) => setAdminKey(e.target.value)} placeholder="Digite a chave (paodavida)" autoFocus />
                </>
              ) : (
                <>
                  <label className="mt-3">Email</label>
                  <InputText value={emailIn} onChange={(e) => setEmailIn(e.target.value)} />

                  <label className="mt-3">Senha</label>
                  <Password value={passIn} onChange={(e) => setPassIn(e.target.value)} feedback={false} toggleMask />
                </>
              )}

              <div className="mt-3 flex justify-content-end">
                <Button label="Entrar" onClick={entrar} loading={loading} />
              </div>
            </div>
          </TabPanel>

          {/* CADASTRAR-SE */}
          <TabPanel header="Cadastrar-se">
            <div className="p-fluid">
              <label>Perfil</label>
              <Dropdown value={perfilUp} options={perfisCadastro} onChange={(e) => setPerfilUp(e.value)} className="w-full" />

              <label className="mt-3">Email</label>
              <InputText value={emailUp} onChange={(e) => setEmailUp(e.target.value)} />

              <label className="mt-3">Senha</label>
              <Password value={passUp} onChange={(e) => setPassUp(e.target.value)} feedback toggleMask />

              <div className="mt-3 flex justify-content-end">
                <Button label="Cadastrar" onClick={cadastrar} loading={loading} />
              </div>
            </div>
          </TabPanel>

          {/* ESQUECI A SENHA */}
          <TabPanel header="Esqueci a senha">
            <div className="p-fluid">
              <small className="text-600">Informe <strong>CPF</strong> ou <strong>ID do membro</strong> para localizar seu e-mail.</small>

              <label className="mt-3">CPF</label>
              <InputText
                value={recCpf}
                onChange={(e) => setRecCpf(e.target.value)}
                placeholder="Somente números"
              />

              <div className="text-center my-2">— ou —</div>

              <label>ID do membro</label>
              <InputText value={recId} onChange={(e) => setRecId(e.target.value)} placeholder="UUID ou ID interno" />

              <div className="text-center my-2">— ou —</div>

              <small className="text-600">Se preferir, informe <strong>Nome + E-mail</strong> para validar:</small>
              <label className="mt-2">Nome</label>
              <InputText value={recNome} onChange={(e) => setRecNome(e.target.value)} placeholder="Nome completo igual ao cadastro" />

              <label className="mt-2">E-mail</label>
              <InputText value={recEmail} onChange={(e) => setRecEmail(e.target.value)} placeholder="nome@dominio.com" />

              <div className="mt-3 flex justify-content-end">
                <Button label="Enviar link de recuperação" onClick={recuperarSenha} loading={loading} />
              </div>
            </div>
          </TabPanel>
        </TabView>

        <div className="mt-3 text-center">
          <Button label="Voltar à Home" className="p-button-text" icon="pi pi-home" onClick={() => (window.location.href = '/')} />
        </div>
      </Card>
    </div>
  );
};

export default Login;
``