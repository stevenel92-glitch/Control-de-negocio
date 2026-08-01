import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Truck, DollarSign, Users, AlertTriangle, Download, Upload, History, LogOut, UserRound,
} from 'lucide-react';
import LoginScreen from './components/LoginScreen.jsx';
import Pedidos from './components/Pedidos.jsx';
import Pagos from './components/Pagos.jsx';
import Empleados from './components/Empleados.jsx';
import Actividad from './components/Actividad.jsx';
import { todayISO } from './lib/utils';
import * as db from './lib/db';

const TABS = [
  { id: 'pedidos', label: 'Pedidos y ruta', icon: Truck },
  { id: 'pagos', label: 'Pagos y alertas', icon: DollarSign },
  { id: 'empleados', label: 'Vales de empleados', icon: Users },
  { id: 'actividad', label: 'Actividad', icon: History },
];

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('pedidos');
  const [currentUser, setCurrentUser] = useState(null);

  const [orders, setOrders] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [bitacora, setBitacora] = useState([]);

  const loadAll = useCallback(async () => {
    try {
      const [o, e, v, u, b] = await Promise.all([
        db.fetchPedidos(),
        db.fetchEmpleados(),
        db.fetchVales(),
        db.fetchUsuarios(),
        db.fetchBitacora(),
      ]);
      setOrders(o);
      setEmployees(e);
      setVouchers(v);
      setUsuarios(u);
      setBitacora(b);
      setReady(true);
    } catch (e) {
      setError('No se pudo conectar con la base de datos. Revisa tu configuración de Supabase (.env).');
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const logAction = useCallback(
    async (action, detail) => {
      const entry = await db.insertBitacoraEntry({ user: currentUser || 'Sin usuario', action, detail });
      setBitacora((prev) => [entry, ...prev]);
    },
    [currentUser]
  );

  const pendingOrders = useMemo(() => orders.filter((o) => o.payment_status === 'pendiente'), [orders]);

  const handleCreateOrder = async (order) => {
    const created = await db.insertPedido(order);
    setOrders((prev) => [created, ...prev]);
    logAction('Pedido registrado', `${order.client} · ${order.total} · ${order.payment_status}`);
  };
  const handleDeleteOrder = async (o) => {
    await db.deletePedido(o.id);
    setOrders((prev) => prev.filter((x) => x.id !== o.id));
    logAction('Pedido eliminado', `${o.client} · ${o.total}`);
  };
  const handleMarkPaid = async (o, method) => {
    const updated = await db.updatePedido(o.id, { payment_status: method, due_date: null });
    setOrders((prev) => prev.map((x) => (x.id === o.id ? updated : x)));
    logAction('Cobro registrado', `${o.client} · ${o.total} · ${method}`);
  };

  const handleAddEmployee = async (name) => {
    const created = await db.insertEmpleado(name);
    setEmployees((prev) => [...prev, created]);
    logAction('Empleado agregado', name);
  };
  const handleDeleteEmployee = async (emp) => {
    await db.deleteEmpleado(emp.id);
    setEmployees((prev) => prev.filter((e) => e.id !== emp.id));
    setVouchers((prev) => prev.filter((v) => v.employee_id !== emp.id));
    logAction('Empleado eliminado', emp.name);
  };
  const handleAddVoucher = async (v) => {
    const created = await db.insertVale(v);
    setVouchers((prev) => [created, ...prev]);
    const emp = employees.find((e) => e.id === v.employee_id);
    logAction('Vale registrado', `${emp?.name || ''} · ${v.amount}`);
  };
  const handleToggleVoucher = async (v) => {
    const updated = await db.updateVale(v.id, { deducted: !v.deducted });
    setVouchers((prev) => prev.map((x) => (x.id === v.id ? updated : x)));
    const emp = employees.find((e) => e.id === v.employee_id);
    logAction(v.deducted ? 'Vale desmarcado como descontado' : 'Vale marcado como descontado', `${emp?.name || ''} · ${v.amount}`);
  };
  const handleDeleteVoucher = async (v) => {
    await db.deleteVale(v.id);
    setVouchers((prev) => prev.filter((x) => x.id !== v.id));
    const emp = employees.find((e) => e.id === v.employee_id);
    logAction('Vale eliminado', `${emp?.name || ''} · ${v.amount}`);
  };

  const handleCreateUser = async (name) => {
    const created = await db.insertUsuario(name);
    setUsuarios((prev) => [...prev, created]);
  };

  const fileInputRef = useRef(null);

  const downloadBackup = () => {
    const payload = { exportadoEl: new Date().toISOString(), pedidos: orders, empleados: employees, vales: vouchers, usuarios, bitacora };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `respaldo-negocio-${todayISO()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    logAction('Respaldo descargado', '');
  };

  const restoreBackup = async (file) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data.pedidos) || !Array.isArray(data.empleados) || !Array.isArray(data.vales)) {
        alert('El archivo no tiene el formato esperado de respaldo.');
        return;
      }
      alert(
        'Por seguridad, la restauración masiva desde un archivo no sobreescribe la base de datos automáticamente. ' +
          'Contacta a quien administre la base de datos (Supabase) para restaurar este respaldo.'
      );
    } catch (e) {
      alert('No se pudo leer el archivo de respaldo.');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 text-rose-700 text-sm p-6 text-center">
        {error}
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 text-stone-500 text-sm">
        Cargando información del negocio…
      </div>
    );
  }

  if (!currentUser) {
    return (
      <LoginScreen
        usuarios={usuarios}
        onCreateUser={handleCreateUser}
        onEnter={(name) => {
          setCurrentUser(name);
          setTimeout(() => logAction('Inicio de sesión', name), 0);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans">
      <header className="bg-teal-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-teal-700 flex items-center justify-center font-black text-lg">N</div>
            <div>
              <h1 className="font-bold leading-tight">Control del Negocio</h1>
              <p className="text-teal-200 text-xs leading-tight">Rutas · Pagos · Equipo</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {pendingOrders.length > 0 && (
              <div className="hidden sm:flex items-center gap-2 bg-amber-500/20 border border-amber-400/40 text-amber-100 px-3 py-1.5 rounded-lg text-xs font-semibold">
                <AlertTriangle size={14} />
                {pendingOrders.length} cobro{pendingOrders.length !== 1 ? 's' : ''} pendiente{pendingOrders.length !== 1 ? 's' : ''}
              </div>
            )}
            <div className="flex items-center gap-1">
              <button onClick={downloadBackup} title="Descargar respaldo" className="flex items-center gap-1 text-xs font-semibold bg-teal-800 hover:bg-teal-700 px-2.5 py-1.5 rounded-lg">
                <Download size={13} /> <span className="hidden sm:inline">Respaldo</span>
              </button>
              <button onClick={() => fileInputRef.current?.click()} title="Leer un respaldo" className="flex items-center gap-1 text-xs font-semibold bg-teal-800 hover:bg-teal-700 px-2.5 py-1.5 rounded-lg">
                <Upload size={13} /> <span className="hidden sm:inline">Restaurar</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) restoreBackup(e.target.files[0]);
                  e.target.value = '';
                }}
              />
            </div>
            <div className="flex items-center gap-1.5 bg-teal-800/60 pl-2.5 pr-1 py-1 rounded-lg">
              <UserRound size={14} />
              <span className="text-xs font-semibold">{currentUser}</span>
              <button
                onClick={() => {
                  logAction('Cierre de sesión', currentUser);
                  setCurrentUser(null);
                }}
                title="Cambiar de usuario"
                className="p-1 hover:bg-teal-700 rounded-md"
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>
        </div>
        <nav className="max-w-6xl mx-auto px-2 flex gap-1 overflow-x-auto pb-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                  active ? 'bg-stone-50 text-teal-900' : 'text-teal-100 hover:bg-teal-800'
                }`}
              >
                <Icon size={16} />
                {t.label}
                {t.id === 'pagos' && pendingOrders.length > 0 && (
                  <span className="ml-1 bg-amber-400 text-amber-950 rounded-full text-[10px] px-1.5 py-0.5">{pendingOrders.length}</span>
                )}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {tab === 'pedidos' && <Pedidos orders={orders} onCreate={handleCreateOrder} onDelete={handleDeleteOrder} />}
        {tab === 'pagos' && <Pagos orders={orders} onMarkPaid={handleMarkPaid} />}
        {tab === 'empleados' && (
          <Empleados
            employees={employees}
            vouchers={vouchers}
            onAddEmployee={handleAddEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            onAddVoucher={handleAddVoucher}
            onToggleVoucher={handleToggleVoucher}
            onDeleteVoucher={handleDeleteVoucher}
          />
        )}
        {tab === 'actividad' && <Actividad bitacora={bitacora} />}
      </main>
    </div>
  );
}
