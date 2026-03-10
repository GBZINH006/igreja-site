import { useCallback, useEffect, useMemo, useState } from 'react';

export const useCountdown = (isoDate) => {
  const target = useMemo(() => (isoDate ? new Date(isoDate) : null), [isoDate]);
  const [now, setNow] = useState(new Date());
  const [permissionAsked, setPermissionAsked] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const diffMs = target ? target - now : null;
  const started = target ? diffMs <= 0 : false;

  const timeLeft = useMemo(() => {
    if (!target) return '--:--:--';
    const ms = Math.max(0, diffMs);
    const s = Math.floor(ms / 1000);
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${h}:${m}:${sec}`;
  }, [diffMs, target]);

  const notifyIfStart = useCallback((msg) => {
    if (!target) return;
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(msg);
      } else if (!permissionAsked && Notification.permission !== 'denied') {
        Notification.requestPermission();
        setPermissionAsked(true);
      }
    }
  }, [permissionAsked, target]);

  return { timeLeft, started, notifyIfStart };
};
``