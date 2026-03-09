import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Chip } from 'primereact/chip';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { Skeleton } from 'primereact/skeleton';
import { supabase } from '../../services/supabase';
import { CalendarYear } from '../components/CalendarYear';

const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

const fmtDateTime = (iso) => {
  if (!iso) return '';
  try { return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' }); }
  catch { return iso; }
};
const fmtShort = (iso) => {
  if (!iso) return '';
  try { return new Date(iso).toLocaleString('pt-BR', { day:'2-digit', month:'short', hour: '2-digit', minute: '2-digit' }); }
  catch { return iso; }
};
const addHours = (iso, h = 2) => {
  const d = new Date(iso);
  d.setHours(d.getHours() + h);
  return d.toISOString();
};
const toIcsDate = (iso) => {
  // YYYYMMDDTHHMMSSZ
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
};

const buildIcsAndDownload = (ev) => {
  const dtStart = toIcsDate(ev.starts_at);
  const dtEnd = toIcsDate(addHours(ev.starts_at, 2));
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AD Bela Vista//Agenda//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${ev.id || crypto.randomUUID()}@adbv`,
    `DTSTAMP:${toIcsDate(new Date().toISOString())}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${(ev.titulo || '').replace(/\n/g, ' ')}`,
    `DESCRIPTION:${(ev.descricao || '').replace(/\n/g, ' ')}`,
    `LOCATION:${(ev.local || '').replace(/\n/g, ' ')}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  const blob = new Blob([lines], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `evento-${(ev.titulo || 'culto')}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const googleCalendarUrl = (ev) => {
  const s = toIcsDate(ev.starts_at);
  const e = toIcsDate(addHours(ev.starts_at, 2));
  const qs = new URLSearchParams({
    action: 'TEMPLATE',
    text: ev.titulo || '',
    details: ev.descricao || '',
    location: ev.local || '',
    dates: `${s}/${e}`
  });
  return `https://www.google.com/calendar/render?${qs.toString()}`;
};

export const Agenda = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0..11
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [eventos, setEventos] = useState([]);
  const [detalhe, setDetalhe] = useState(null);

  // Carrega eventos do ano selecionado
  const carregar = async (y = year) => {
    setLoading(true);
    const start = new Date(y, 0, 1);
    const end = new Date(y + 1, 0, 0, 23, 59, 59);
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .gte('starts_at', start.toISOString())
      .lte('starts_at', end.toISOString())
      .eq('ativo', true)
      .order('starts_at', { ascending: true });
    if (!error) setEventos(data || []);
    setLoading(false);
  };

  useEffect(() => {
    carregar(year);

    // Realtime: atualiza quando a tabela muda
    const ch = supabase
      .channel('public:eventos:agenda')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'eventos' }, () => carregar(year))
      .subscribe();

    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  const anos = useMemo(() => {
    // 5 anos para trás e 5 pra frente
    const base = now.getFullYear();
    return Array.from({ length: 11 }, (_, i) => base - 5 + i);
  }, [now]);

  const meses = useMemo(() => monthNames.map((m, i) => ({ label: m, value: i })), []);

  // Filtro: por mês e texto
  const eventosFiltrados = useMemo(() => {
    return (eventos || []).filter(ev => {
      const d = new Date(ev.starts_at);
      const matchMonth = d.getMonth() === month;
      const matchSearch = !search?.trim() || (ev.titulo || '').toLowerCase().includes(search.toLowerCase());
      return matchMonth && matchSearch;
    });
  }, [eventos, month, search]);

  // Próximos 6 (a partir de hoje)
  const proximos = useMemo(() => {
    const hoje = new Date();
    return (eventos || [])
      .filter(ev => new Date(ev.starts_at) >= hoje)
      .slice(0, 6);
  }, [eventos]);

  // Agrupa por dia (para o calendário mensal)
  const byDay = useMemo(() => {
    const map = {};
    eventosFiltrados.forEach(ev => {
      const d = new Date(ev.starts_at);
      const key = d.getDate(); // dia do mês
      map[key] = map[key] || [];
      map[key].push(ev);
    });
    return map;
  }, [eventosFiltrados]);

  // Gera grade do mês
  const monthGrid = useMemo(() => {
    const first = new Date(year, month, 1);
    const lastDate = new Date(year, month + 1, 0).getDate();
    const startIdx = first.getDay(); // 0..6 (Dom..Sáb)
    const cells = [];
    for (let i = 0; i < startIdx; i++) cells.push(null);
    for (let d = 1; d <= lastDate; d++) cells.push(d);
    return cells;
  }, [year, month]);

  return (
    <div className="min-h-screen p-3 md:p-4">
      <style>{`
        .agenda-card { backdrop-filter: blur(6px); }
        .cal-day { min-height: 68px; border-radius: 10px; border: 1px solid var(--surface-border); }
        .cal-day.today { outline: 2px solid var(--primary-color); }
        .event-dot { width: 8px; height: 8px; border-radius: 999px; background: #16a34a; display: inline-block; margin: 2px 3px; }
        .banner { width: 100%; height: 140px; object-fit: cover; border-radius: 8px; }
      `}</style>

      {/* Cabeçalho */}
      <div className="flex flex-column md:flex-row align-items-center justify-content-between gap-3 mb-3">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-calendar text-2xl text-primary" />
          <h2 className="m-0">Agenda</h2>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Dropdown
            value={year}
            options={anos.map(a => ({ label: a, value: a }))}
            onChange={(e) => setYear(e.value)}
            placeholder="Ano"
          />
          <Dropdown
            value={month}
            options={meses}
            onChange={(e) => setMonth(e.value)}
            placeholder="Mês"
            className="min-w-12rem"
          />
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por título..." />
          </span>
          <Button
            label="Voltar para Home"
            icon="pi pi-home"
            onClick={() => window.location.href = '/'}
            className="p-button-text"
          />
        </div>
      </div>

      <div className="grid">
        {/* Coluna esquerda: Calendário do mês */}
        <div className="col-12 lg:col-7">
          <Card className="agenda-card shadow-2">
            <div className="flex align-items-center justify-content-between mb-2">
              <h3 className="m-0">{monthNames[month]} / {year}</h3>
              <div className="text-600">
                {loading ? <Skeleton width="8rem" height="1rem" /> : `${eventosFiltrados.length} evento(s) no mês`}
              </div>
            </div>

            {/* Cabeçalho dias da semana */}
            <div className="grid mb-2">
              {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(w => (
                <div key={w} className="col text-center text-600">{w}</div>
              ))}
            </div>

            {/* Grade do mês */}
            <div className="grid">
              {monthGrid.map((cell, idx) => {
                const isToday = (() => {
                  if (!cell) return false;
                  const d = new Date();
                  return d.getFullYear() === year && d.getMonth() === month && d.getDate() === cell;
                })();
                const eventsOfDay = cell ? (byDay[cell] || []) : [];
                return (
                  <div key={idx} className="col-12 sm:col-6 md:col-4 lg:col-3 xl:col-1">
                    <div className={`cal-day p-2 ${isToday ? 'today' : ''}`}>
                      <div className="flex align-items-center justify-content-between">
                        <div className="text-700">{cell || ''}</div>
                        <div>
                          {eventsOfDay.slice(0, 3).map((_, i) => <span key={i} className="event-dot" />)}
                          {eventsOfDay.length > 3 && <span className="text-600" style={{ fontSize: 10 }}>+{eventsOfDay.length - 3}</span>}
                        </div>
                      </div>
                      {/* Listinha clicável no dia */}
                      <div className="mt-2">
                        {eventsOfDay.slice(0, 2).map(ev => (
                          <Chip
                            key={ev.id}
                            label={(ev.titulo || '').slice(0, 22)}
                            className="mr-2 mb-2"
                            onClick={() => setDetalhe(ev)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Calendário do ano inteiro (colapsável opcional) */}
          <Card className="agenda-card shadow-2 mt-3">
            <div className="flex align-items-center justify-content-between">
              <h3 className="m-0">Ano {year}</h3>
              <Button label="Próximo ano" icon="pi pi-arrow-right" className="p-button-text" onClick={() => setYear(y => y + 1)} />
            </div>
            <Divider />
            <CalendarYear events={eventos} />
          </Card>
        </div>

        {/* Coluna direita: Próximos eventos */}
        <div className="col-12 lg:col-5">
          <Card className="agenda-card shadow-2">
            <div className="flex align-items-center justify-content-between mb-2">
              <h3 className="m-0">Próximos eventos</h3>
              {!loading && <Tag value={`${proximos.length}`} severity="info" />}
            </div>

            {loading && (
              <div className="flex flex-column gap-3">
                <Skeleton height="160px" borderRadius="8px" />
                <Skeleton height="2rem" />
                <Skeleton height="1.4rem" width="60%" />
              </div>
            )}

            {!loading && proximos.length === 0 && (
              <div className="text-600">Sem eventos futuros cadastrados.</div>
            )}

            {!loading && proximos.length > 0 && (
              <div className="flex flex-column gap-3">
                {proximos.map(ev => (
                  <Card key={ev.id} className="shadow-1">
                    {ev.banner_url && (
                      <img src={ev.banner_url} alt={ev.titulo} className="banner" loading="lazy" />
                    )}
                    <div className="mt-2">
                      <div className="font-bold text-900">{ev.titulo}</div>
                      <div className="text-600">
                        {fmtShort(ev.starts_at)} {ev.local ? `• ${ev.local}` : ''}
                      </div>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Button
                        label="Detalhes"
                        icon="pi pi-search"
                        className="p-button-text"
                        onClick={() => setDetalhe(ev)}
                      />
                      <Button
                        label="Google Calendar"
                        icon="pi pi-external-link"
                        className="p-button-text"
                        onClick={() => window.open(googleCalendarUrl(ev), '_blank')}
                      />
                      <Button
                        label=".ics"
                        icon="pi pi-download"
                        className="p-button-text"
                        onClick={() => buildIcsAndDownload(ev)}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Dialog de detalhes */}
      <Dialog
        header={detalhe?.titulo || 'Evento'}
        visible={!!detalhe}
        style={{ width: '520px' }}
        modal
        onHide={() => setDetalhe(null)}
        footer={
          <div className="flex justify-content-end gap-2">
            <Button label="Fechar" className="p-button-text" onClick={() => setDetalhe(null)} />
            <Button label="Google Calendar" icon="pi pi-external-link" onClick={() => window.open(googleCalendarUrl(detalhe), '_blank')} />
            <Button label="Baixar .ics" icon="pi pi-download" onClick={() => buildIcsAndDownload(detalhe)} />
          </div>
        }
      >
        {detalhe && (
          <div className="flex flex-column gap-2">
            {detalhe.banner_url && (
              <img src={detalhe.banner_url} alt={detalhe.titulo} style={{ width: '100%', borderRadius: 8 }} />
            )}
            <div><strong>Quando:</strong> {fmtDateTime(detalhe.starts_at)}</div>
            {detalhe.local && <div><strong>Local:</strong> {detalhe.local}</div>}
            {detalhe.descricao && <div className="mt-2">{detalhe.descricao}</div>}
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default Agenda;
``