import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { useNavigate } from 'react-router-dom';
import { Dialog } from 'primereact/dialog';
import { Password } from 'primereact/password';
import { Toast } from 'primereact/toast';

// Imagem de fundo do HERO (ajuste o caminho se necessário)
import Igreja1 from './familiaPastor.jpg';

export const Home = () => {
  const navigate = useNavigate();
  const toast = useRef(null);
  const passInputRef = useRef(null);
  const heroRef = useRef(null);

  const [displayLogin, setDisplayLogin] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [password, setPassword] = useState('');

  // Foca no input ao abrir o diálogo
  useEffect(() => {
    if (displayLogin) {
      const t = setTimeout(() => {
        passInputRef.current?.querySelector('input')?.focus();
      }, 60);
      return () => clearTimeout(t);
    }
  }, [displayLogin]);

  // Efeito de revelação + parallax no HERO ao rolar
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    let raf = 0;
    let lastOverlay = 1;
    let lastY = 0;

    const clamp = (v, min, max) => Math.max(min, Math.min(v, max));
    const lerp = (a, b, t) => a + (b - a) * t;

    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = 300; // distância de scroll (px) para revelar quase tudo
        const y = window.scrollY || 0;
        const p = clamp(y / max, 0, 1); // 0..1

        // Overlay: 1 (mais escuro) → 0.25 (quase sem overlay)
        const targetOverlay = 1 - p * 0.75;
        // Parallax: desloca levemente o background
        const targetY = p * 28; // px

        // Suavização (lerp) para sensação premium
        lastOverlay = lerp(lastOverlay, targetOverlay, 0.2);
        lastY = lerp(lastY, targetY, 0.2);

        el.style.setProperty('--overlay', String(lastOverlay));
        el.style.setProperty('--y', `${lastY}px`);
      });
    };

    // Estado inicial
    onScroll();

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const handleAdminAccess = () => {
    // TODO: ideal é migrar para Supabase Auth ou variável de ambiente (VITE_ADMIN_PASS)
    if (password === 'paodavida') {
      setDisplayLogin(false);
      setPassword('');
      navigate('/admin-login'); // rota padronizada
      return;
    }

    setIsShaking(true);
    toast.current.show({
      severity: 'error',
      summary: 'Acesso Negado',
      detail: 'Senha administrativa incorreta.',
      life: 2500,
    });
    setTimeout(() => setIsShaking(false), 400);
  };

  const onOpenAdmin = () => {
    setPassword('');
    setDisplayLogin(true);
  };

  return (
    <div className="min-h-screen font-sans page-fade-in">
      <Toast ref={toast} />

      {/* Estilos locais para animação, HERO e efeitos */}
      <style>{`
        /* Animação de "shake" no card de gestão */
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          50% { transform: translateX(10px); }
          75% { transform: translateX(-10px); }
          100% { transform: translateX(0); }
        }
        .home-shake-card {
          animation: shake 0.4s ease-in-out;
        }

        /* HERO com variáveis para overlay e parallax */
        .home-hero {
          position: relative;
          border-bottom-left-radius: 1.5rem;
          border-bottom-right-radius: 1.5rem;
          overflow: hidden;

          /* variáveis controladas pelo JS */
          --overlay: 1;   /* 1 = escuro, 0 = claro */
          --y: 0px;       /* deslocamento vertical do bg */

          background-position: center calc(50% + var(--y));
        }
        .home-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(to bottom, rgba(0,0,0,.55), rgba(0,0,0,.85));
          opacity: var(--overlay);
          transition: opacity .15s ease-out;
        }
        @media (prefers-reduced-motion: reduce) {
          .home-hero::before { transition: none; }
        }

        .home-badge {
          display: inline-flex;
          align-items: center;
          gap: .4rem;
          background: rgba(255,255,255,.15);
          border: 1px solid rgba(255,255,255,.2);
          padding: .35rem .75rem;
          border-radius: 999px;
          font-size: .9rem;
        }
      `}</style>

      {/* Diálogo de login administrativo */}
      <Dialog
        header="Acesso Restrito"
        visible={displayLogin}
        style={{ width: '350px' }}
        modal
        dismissableMask
        onHide={() => setDisplayLogin(false)}
        footer={
          <div className="flex justify-content-end gap-2">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              onClick={() => setDisplayLogin(false)}
              className="p-button-text"
            />
            <Button
              label="Entrar"
              icon="pi pi-check"
              onClick={handleAdminAccess}
              autoFocus
            />
          </div>
        }
      >
        <div className="flex flex-column gap-2 mt-2" ref={passInputRef}>
          <label htmlFor="admin-pass">Digite a senha de administrador:</label>
          <Password
            id="admin-pass"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            feedback={false}
            toggleMask
            className="w-full"
            inputClassName="w-full"
            onKeyDown={(e) => e.key === 'Enter' && handleAdminAccess()}
          />
        </div>
      </Dialog>

      {/* HERO com revelação ao rolar + parallax */}
      <div
        ref={heroRef}
        className="home-hero relative w-full h-18rem md:h-22rem flex align-items-center justify-content-center text-white"
        style={{
          backgroundImage: `url(${Igreja1})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="text-center p-4">
          https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzJVKsXgOQMSsC2HaVNYw9XeATeJZ7lo4TWw&s

          <span className="home-badge">
            <i className="pi pi-star-fill" /> Comunidade, Fé e Serviço
          </span>

          <h1 className="text-4xl md:text-7xl font-bold mb-2 mt-3">AD BELA VISTA</h1>

          <p className="text-xl md:text-2xl mb-4 font-light">Setor 9 - Palhoça/SC</p>

          <div className="flex justify-content-center">
            <Button
              label="CADASTRAR-SE"
              icon="pi pi-user-plus"
              className="p-button-warning p-button-raised p-button-lg px-6"
              onClick={() => navigate('/cadastro')}
            />
          </div>
        </div>
      </div>

      {/* CARDS */}
      <div className="relative px-4 md:px-8 mt-6 z-1">
        <div className="grid justify-content-center">
          {/* Card Membros */}
          <div className="col-12 md:col-4 lg:col-3">
            <Card className="text-center surface-card border-none shadow-3" style={{ borderRadius: '15px' }}>
              <div className="p-3 border-circle bg-blue-100 inline-flex align-items-center justify-content-center mb-3">
                <i className="pi pi-users text-2xl text-blue-700" />
              </div>

              <h3 className="m-0 mb-2 text-900 font-bold">Membros</h3>

              <p className="text-700 text-sm mb-4">
                Cadastre-se para ter acesso ao portal de membros
              </p>

              <Button
                label="ACESSAR"
                className="p-button-sm w-full p-button-rounded"
                onClick={() => navigate('/cadastro')}
              />
            </Card>
          </div>

          {/* Card Gestão */}
          <div className="col-12 md:col-4 lg:col-3">
            <Card
              className={`text-center surface-card border-none shadow-3 ${isShaking ? 'home-shake-card border-1 border-red-500' : ''}`}
              style={{ borderRadius: '15px' }}
            >
              <div className="p-3 border-circle bg-orange-100 inline-flex align-items-center justify-content-center mb-3">
                <i className="pi pi-lock text-2xl text-orange-700" />
              </div>

              <h3 className="m-0 mb-2 text-900 font-bold">Gestão</h3>

              <p className="text-700 text-sm mb-4">Secretaria, Mídia e Painel Pastoral.</p>

              <Button
                label="GERENCIAR"
                severity="warning"
                className="p-button-sm w-full p-button-rounded"
                onClick={onOpenAdmin}
              />
            </Card>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white p-8 mt-8">
        <div className="grid container mx-auto">
          <div className="col-12 md:col-6">
            <h3 className="text-blue-400 font-bold mb-3 uppercase">
              AD Bela Vista - Setor 9
            </h3>

            <p className="text-gray-400 line-height-3 text-sm">
              R. Blumenau - Bela Vista
              <br />
              Palhoça - SC | CEP: 88132-745
              <br />
              <strong>Telefone:</strong> (92) 99441-0542
            </p>
          </div>
        </div>

        <div className="border-top-1 border-gray-800 mt-6 pt-4 text-center text-xs text-gray-500 font-light">
          © {new Date().getFullYear()} Assembleia de Deus Bela Vista. Desenvolvido para a glória de Deus.
        </div>
      </footer>
    </div>
  );
};