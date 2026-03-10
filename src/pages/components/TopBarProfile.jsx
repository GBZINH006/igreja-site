import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Button } from 'primereact/button';

export const TopBarProfile = () => {
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(null);
  const [email, setEmail] = useState(null);

  useEffect(() => {
    const load = async () => {
      // papel do "portal" (sessionStorage)
      const portalRole = sessionStorage.getItem('auth_role');
      setRole(portalRole);

      // se for admin por chave:
      if (portalRole === 'admin') {
        setUserId('adminbv');
        setEmail(null);
        return;
      }

      // se for membro/congregado autenticado no Supabase:
      const { data } = await supabase.auth.getUser();
      const u = data?.user || null;
      setUserId(u?.id || null);
      setEmail(u?.email || null);
    };
    load();
  }, []);

  const sair = async () => {
    // limpa sessão do portal e do Supabase (caso tenha)
    sessionStorage.removeItem('auth_role');
    sessionStorage.removeItem('auth_user');
    await supabase.auth.signOut().catch(() => {});
    window.location.href = '/login';
  };

  return (
    <div className="flex align-items-center gap-3 p-2 px-3 bg-white border-round shadow-2" style={{ backdropFilter: 'blur(4px)' }}>
      <div className="text-600" style={{ fontSize: 12 }}>
        <div><strong>Papel:</strong> {role || 'visitante'}</div>
        {userId && <div><strong>ID:</strong> {userId}</div>}
        {email && <div><strong>Email:</strong> {email}</div>}
      </div>
      <div className="flex gap-2">
        <Button label="Perfil" icon="pi pi-user" className="p-button-text" onClick={() => (window.location.href = '/perfil')} />
        <Button label="Sair" icon="pi pi-sign-out" className="p-button-text" onClick={sair} />
      </div>
    </div>
  );
};

export default TopBarProfile;
``