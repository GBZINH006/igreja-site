// src/pages/Public/Home.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import Fundo from './familiaPastor.jpg';
import { CalendarYear } from '../components/CalendarYear';
import { useCountdown } from './hooks/useCountdown';

export const Home = () => {
  const navigate = useNavigate();
  const overlayRef = useRef(null);
  const [eventos, setEventos] = useState([]);
  const [nextEvent, setNextEvent] = useState(null);

  // Fundo com parallax + reveal
  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;
    let raf = 0;
    let last = 1;
    let lastY = 0;
    const clamp = (v, mi, ma) => Math.max(mi, Math.min(ma, v));
    const lerp = (a, b, t) => a + (b - a) * t;

    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        const p = clamp(y / 450, 0, 1);
        const ov = 1 - p * 0.9;
        const py = p * 40;
        last = lerp(last, ov, 0.15);
        lastY = lerp(lastY, py, 0.15);
        el.style.setProperty('--op', String(last));
        el.style.setProperty('--y', `${lastY}px`);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Carrega eventos (até 12 meses)
  const carregarEventos = async () => {
    const hoje = new Date();
    const noAno = new Date(hoje);
    noAno.setFullYear(hoje.getFullYear() + 1);

    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .gte('starts_at', hoje.toISOString())
      .lte('starts_at', noAno.toISOString())
      .eq('ativo', true)
      .order('starts_at', { ascending: true });

    if (!error) setEventos(data || []);

    // Define próximo culto (destaque ou primeiro futuro)
    const destaque = (data || []).find(e => e.destaque);
    setNextEvent(destaque || (data || [])[0] || null);
  };

  useEffect(() => {
    carregarEventos();

    // opcional: realtime
    const ch = supabase
      .channel('public:eventos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'eventos' }, () => carregarEventos())
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, []);

  const { timeLeft, started, notifyIfStart } = useCountdown(nextEvent?.starts_at);

  useEffect(() => {
    if (started) notifyIfStart('O culto começou! Deus abençoe 🙌');
  }, [started, notifyIfStart]);

  return (
    <div className="min-h-screen relative">
      {/* Fundo total */}
      <div
        ref={overlayRef}
        style={{
          position: 'fixed', inset: 0, zIndex: -5,
          backgroundImage: `url(${Fundo})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center calc(50% + var(--y))',
          filter: 'brightness(var(--op))',
          transition: 'filter .2s',
          '--op': 1, '--y': '0px'
        }}
      />

      {/* Top bar */}
      <div className="w-full flex justify-content-center mt-3">
        <div className="flex gap-3 p-2 px-4 bg-white border-round shadow-2" style={{ backdropFilter: 'blur(4px)' }}>
          <Button label="Contribua" icon="pi pi-wallet" className="p-button-text" onClick={() => navigate('/contribua')} />
          <Button label="Pedido de Oração" icon="pi pi-heart-fill" className="p-button-text text-red-500" onClick={() => navigate('/pedido-oracao')} />
          <Button label="Agenda" icon="pi pi-calendar" className="p-button-text" onClick={() => navigate('/agenda')} />
          <Button label="Entrar" icon="pi pi-sign-in" className="p-button-text" onClick={() => navigate('/login')} />
        </div>
      </div>

      {/* Hero simples */}
      <div className="text-center mt-6 text-white">
        https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzJVKsXgOQMSsC2HaVNYw9XeATeJZ7lo4TWw&s

        <h1 className="text-4xl md:text-6xl font-bold">AD BELA VISTA</h1>
        <p className="text-xl md:text-2xl">Setor 9 • Palhoça/SC</p>

        {/* Contagem regressiva */}
        {nextEvent ? (
          <div className="mt-3">
            <div className="text-lg">Próximo culto: <strong>{new Date(nextEvent.starts_at).toLocaleString()}</strong></div>
            <div className="text-3xl font-bold mt-1">{timeLeft}</div>
          </div>
        ) : (
          <div className="mt-3 text-lg">Em breve os próximos cultos serão publicados aqui.</div>
        )}

        <div className="mt-4">
          <Button label="Acompanhar Agenda" icon="pi pi-calendar" className="p-button-warning p-button-raised px-5" onClick={() => navigate('/agenda')} />
        </div>
      </div>

      {/* Últimos eventos (cards) */}
      <div className="px-4 mt-6">
        <h2 className="text-2xl font-bold text-white mb-3">Últimos Eventos</h2>
        <div className="grid">
          {eventos.slice(0, 3).map(ev => (
            <div key={ev.id} className="col-12 md:col-4">
              <Card className="shadow-3">
                {!!ev.banner_url && (
                  <img src={ev.banner_url} alt={ev.titulo} style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8 }} loading="lazy" />
                )}
                <h3 className="mt-3 mb-1">{ev.titulo}</h3>
                <div className="text-600 mb-2">
                  {new Date(ev.starts_at).toLocaleString()} {ev.local ? `• ${ev.local}` : ''}
                </div>
                <p className="m-0">{ev.descricao || ''}</p>
              </Card>
            </div>
          ))}
          {eventos.length === 0 && (
            <div className="col-12">
              <Card className="shadow-3">
                <p className="m-0">Sem eventos publicados ainda.</p>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Agenda (ano) */}
      <div className="px-4 mt-6 mb-8">
        <h2 className="text-2xl font-bold text-white mb-3">Agenda Anual</h2>
        <Card className="shadow-3">
          <CalendarYear events={eventos} />
        </Card>
      </div>
    </div>
  );
};
``