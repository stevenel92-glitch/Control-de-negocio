export const fmtMoney = (n) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(
    Math.round(Number(n) || 0)
  );

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const nowTime = () =>
  new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

export const fmtDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const fmtDateLong = (iso) => {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('es-CL', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
};

export const shiftDate = (iso, delta) => {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + delta);
  return d.toISOString().slice(0, 10);
};

export function currentQuincena(dateISO) {
  const d = new Date(dateISO + 'T00:00:00');
  const half = d.getDate() <= 15 ? 1 : 2;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-Q${half}`;
}
