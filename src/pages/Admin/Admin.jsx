// src/pages/Admin/Admin.jsx
import React, { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Checkbox } from 'primereact/checkbox';
import { Toast } from 'primereact/toast';
import { supabase } from '../../services/supabase';

export const Admin = () => {
  const [membros, setMembros] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [form, setForm] = useState({ titulo: '', descricao: '', local: '', starts_at: null, destaque: false, banner_file: null });
  const [loading, setLoading] = useState(false);

  const loadMembros = async () => {
    const { data } = await supabase
      .from('membros')
      .select('id, nome, cpf, aprovacao, criado_em')
      .order('criado_em', { ascending: false })
      .limit(50);
    setMembros(data || []);
  };

  const loadEventos = async () => {
    const { data } = await supabase
      .from('eventos')
      .select('*')
      .order('starts_at', { ascending: true });
    setEventos(data || []);
  };

  useEffect(() => {
    loadMembros();
    loadEventos();
  }, []);

  const aprovar = async (id) => {
    const { error } = await supabase.from('membros').update({ aprovacao: 'Sim' }).eq('id', id);
    if (!error) loadMembros();
  };

  const excluirMembro = async (id) => {
    if (!confirm('Deseja excluir este registro?')) return;
    const { error } = await supabase.from('membros').delete().eq('id', id);
    if (!error) loadMembros();
  };

  const uploadBanner = async (file) => {
    if (!file) return null;
    const path = `banners/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('banners').upload(path, file, { contentType: file.type });
    if (error) throw error;
    const { data: pub } = supabase.storage.from('banners').getPublicUrl(path);
    return pub?.publicUrl || null;
  };

  const salvarEvento = async () => {
    try {
      setLoading(true);
      // limita 3 eventos futuros ativos
      const nowIso = new Date().toISOString();
      const { data: futuros } = await supabase
        .from('eventos').select('*')
        .gte('starts_at', nowIso)
        .eq('ativo', true);
      if ((futuros || []).length >= 3) {
        alert('Limite de 3 eventos futuros ativos atingido.');
        setLoading(false);
        return;
      }

      let banner_url = null;
      if (form.banner_file) banner_url = await uploadBanner(form.banner_file);

      const payload = {
        titulo: form.titulo,
        descricao: form.descricao,
        local: form.local,
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
        banner_url,
        destaque: !!form.destaque,
        ativo: true
      };

      const { error } = await supabase.from('eventos').insert([payload]);
      if (error) throw error;

      setForm({ titulo: '', descricao: '', local: '', starts_at: null, destaque: false, banner_file: null });
      await loadEventos();
      alert('Evento salvo!');
    } catch (err) {
      alert(err.message || 'Erro ao salvar evento');
    } finally {
      setLoading(false);
    }
  };

  const excluirEvento = async (id) => {
    if (!confirm('Excluir evento?')) return;
    const { error } = await supabase.from('eventos').delete().eq('id', id);
    if (!error) loadEventos();
  };

  const desmarcarDestaques = async () => {
    await supabase.from('eventos').update({ destaque: false }).neq('id', '00000000-0000-0000-0000-000000000000');
  };

  const setDestaque = async (id) => {
    await desmarcarDestaques();
    await supabase.from('eventos').update({ destaque: true }).eq('id', id);
    await loadEventos();
  };

  return (
    <div className="p-3 max-w-7xl mx-auto">
      <h2 className="m-0 mb-3">Painel Administrativo</h2>

      {/* Membros */}
      <Card className="mb-4">
        <h3>Membros</h3>
        <div className="grid">
          {membros.map(m => (
            <div key={m.id} className="col-12 md:col-6 lg:col-4">
              <Card>
                <div className="font-bold">{m.nome}</div>
                <div className="text-600">CPF: {m.cpf || '-'}</div>
                <div className="text-600">Aprovado: {m.aprovacao || 'Não'}</div>
                <div className="mt-2 flex gap-2">
                  <Button label="Aprovar" icon="pi pi-check" onClick={() => aprovar(m.id)} />
                  <Button label="PDF" icon="pi pi-file-pdf" className="p-button-secondary" onClick={() => alert('TODO: gerar PDF deste membro')} />
                  <Button label="Excluir" icon="pi pi-trash" className="p-button-danger" onClick={() => excluirMembro(m.id)} />
                </div>
              </Card>
            </div>
          ))}
          {membros.length === 0 && <div className="p-3">Nenhum cadastro encontrado.</div>}
        </div>
      </Card>

      {/* Eventos */}
      <Card>
        <h3>Próximos Eventos (máx. 3)</h3>

        <div className="grid">
          <div className="col-12 md:col-5">
            <div className="p-fluid">
              <label>Título</label>
              <InputText value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
              <label className="mt-3">Descrição</label>
              <InputText value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
              <label className="mt-3">Local</label>
              <InputText value={form.local} onChange={(e) => setForm({ ...form, local: e.target.value })} />
              <label className="mt-3">Data/Hora</label>
              <Calendar value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.value })} showIcon showTime hourFormat="24" dateFormat="dd/mm/yy" />
              <div className="mt-3 flex align-items-center gap-2">
                <Checkbox inputId="destaque" checked={form.destaque} onChange={(e) => setForm({ ...form, destaque: e.checked })} />
                <label htmlFor="destaque">Definir como próximo culto (contagem regressiva)</label>
              </div>
              <label className="mt-3">Banner</label>
              <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, banner_file: e.target.files?.[0] || null })} />
              <div className="mt-3">
                <Button label="Salvar Evento" onClick={salvarEvento} loading={loading} />
              </div>
            </div>
          </div>

          <div className="col-12 md:col-7">
            <div className="grid">
              {eventos.map(ev => (
                <div key={ev.id} className="col-12">
                  <Card className="flex align-items-center justify-content-between">
                    <div>
                      <div className="font-bold">{ev.titulo}</div>
                      <div className="text-600">{new Date(ev.starts_at).toLocaleString()} {ev.local ? `• ${ev.local}` : ''}</div>
                      {ev.destaque && <div className="mt-1"><i className="pi pi-bolt text-yellow-500" /> Destaque</div>}
                    </div>
                    <div className="flex gap-2">
                      {!ev.destaque && <Button label="Destacar" icon="pi pi-bolt" className="p-button-warning" onClick={() => setDestaque(ev.id)} />}
                      <Button label="Excluir" icon="pi pi-trash" className="p-button-danger" onClick={() => excluirEvento(ev.id)} />
                    </div>
                  </Card>
                </div>
              ))}
              {eventos.length === 0 && <div className="p-3">Sem eventos. Cadastre um ao lado.</div>}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
``