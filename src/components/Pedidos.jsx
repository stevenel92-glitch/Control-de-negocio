import React, { useState, useMemo } from 'react';
import {
  Plus, Trash2, ChevronRight, ChevronLeft, Banknote, CreditCard, Hourglass,
  CalendarDays, PackageCheck, Save,
} from 'lucide-react';
import { Card, Badge, Btn, Field, Modal, inputCls } from './ui.jsx';
import { fmtMoney, fmtDate, fmtDateLong, todayISO, shiftDate } from '../lib/utils';

export default function Pedidos({ orders, onCreate, onDelete }) {
  const [modal, setModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(todayISO());

  const statusTone = { efectivo: 'green', transferencia: 'blue', pendiente: 'amber' };
  const statusIcon = { efectivo: Banknote, transferencia: CreditCard, pendiente: Hourglass };
  const statusLabel = { efectivo: 'Efectivo', transferencia: 'Transferido', pendiente: 'Pendiente' };

  const datesWithData = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      map[o.date] = (map[o.date] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [orders]);

  const dayOrders = orders
    .filter((o) => o.date === selectedDate)
    .sort((a, b) => (a.client < b.client ? -1 : 1));

  const totalDia = dayOrders.reduce((s, o) => s + Number(o.total), 0);
  const efectivo = dayOrders.filter((o) => o.payment_status === 'efectivo').reduce((s, o) => s + Number(o.total), 0);
  const transferencia = dayOrders
    .filter((o) => o.payment_status === 'transferencia')
    .reduce((s, o) => s + Number(o.total), 0);
  const pendiente = dayOrders.filter((o) => o.payment_status === 'pendiente').reduce((s, o) => s + Number(o.total), 0);

  const isToday = selectedDate === todayISO();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="font-bold text-stone-800">Pedidos entregados en ruta</h2>
        <Btn onClick={() => setModal(true)}>
          <Plus size={16} /> Registrar pedido
        </Btn>
      </div>

      <Card className="p-3 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <button onClick={() => setSelectedDate(shiftDate(selectedDate, -1))} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500">
            <ChevronLeft size={18} />
          </button>
          <div className="text-center px-1">
            <p className="font-bold text-stone-800 text-sm capitalize">{fmtDateLong(selectedDate)}</p>
            {isToday && <p className="text-[11px] text-teal-700 font-semibold">Hoy</p>}
          </div>
          <button onClick={() => setSelectedDate(shiftDate(selectedDate, 1))} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500">
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          {!isToday && (
            <button
              onClick={() => setSelectedDate(todayISO())}
              className="text-xs font-semibold bg-stone-100 hover:bg-stone-200 px-2.5 py-1.5 rounded-lg text-stone-600"
            >
              Ir a hoy
            </button>
          )}
          <div className="relative flex items-center gap-1.5">
            <CalendarDays size={15} className="text-stone-400" />
            <input type="date" className={`${inputCls} py-1.5`} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          </div>
        </div>
      </Card>

      {datesWithData.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {datesWithData.slice(0, 30).map(([d, count]) => (
            <button
              key={d}
              onClick={() => setSelectedDate(d)}
              className={`shrink-0 text-xs font-semibold px-2.5 py-1.5 rounded-lg border ${
                d === selectedDate ? 'bg-teal-800 text-white border-teal-800' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
              }`}
            >
              {fmtDate(d)} · {count}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <p className="text-xs text-stone-500 font-medium">Entregas del día</p>
          <p className="text-lg font-bold text-stone-800 flex items-center gap-1.5 mt-0.5">
            <PackageCheck size={16} className="text-teal-700" /> {dayOrders.length}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-stone-500 font-medium">Total del día</p>
          <p className="text-lg font-bold text-stone-800 mt-0.5">{fmtMoney(totalDia)}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-stone-500 font-medium">Efectivo + Transferido</p>
          <p className="text-lg font-bold text-emerald-700 mt-0.5">{fmtMoney(efectivo + transferencia)}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-stone-500 font-medium">Pendiente por cobrar</p>
          <p className="text-lg font-bold text-amber-700 mt-0.5">{fmtMoney(pendiente)}</p>
        </Card>
      </div>

      <div className="space-y-2">
        {dayOrders.map((o) => {
          const Icon = statusIcon[o.payment_status];
          return (
            <Card key={o.id} className="p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-stone-800">{o.client}</span>
                  <Badge tone="neutral">{o.route || 'Sin ruta'}</Badge>
                  <Badge tone={statusTone[o.payment_status]}>
                    <Icon size={11} /> {statusLabel[o.payment_status]}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="font-bold text-stone-800">{fmtMoney(o.total)}</p>
                  <button onClick={() => confirm('¿Eliminar este pedido?') && onDelete(o)} className="text-stone-400 hover:text-rose-700 mt-2">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
        {dayOrders.length === 0 && <p className="text-sm text-stone-400 text-center py-8">Sin pedidos registrados este día.</p>}
      </div>

      {modal && (
        <OrderForm
          initialDate={selectedDate}
          onSave={async (order) => {
            await onCreate(order);
            setModal(false);
          }}
          onClose={() => setModal(false)}
        />
      )}
    </div>
  );
}

function OrderForm({ initialDate, onSave, onClose }) {
  const [client, setClient] = useState('');
  const [route, setRoute] = useState('');
  const [date, setDate] = useState(initialDate || todayISO());
  const [value, setValue] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('efectivo');
  const [dueDate, setDueDate] = useState(todayISO());
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!value) return;
    setSaving(true);
    await onSave({
      client,
      route,
      date,
      payment_status: paymentStatus,
      due_date: paymentStatus === 'pendiente' ? dueDate : null,
      total: Number(value),
    });
    setSaving(false);
  };

  return (
    <Modal title="Registrar pedido entregado" onClose={onClose}>
      <form className="grid grid-cols-2 gap-3" onSubmit={submit}>
        <Field label="Cliente">
          <input required className={inputCls} value={client} onChange={(e) => setClient(e.target.value)} />
        </Field>
        <Field label="Fecha">
          <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Ruta">
          <input className={inputCls} value={route} onChange={(e) => setRoute(e.target.value)} placeholder="Ej: Ruta Centro" />
        </Field>
        <Field label="Valor">
          <input required type="number" min="1" className={inputCls} value={value} onChange={(e) => setValue(e.target.value)} />
        </Field>
        <Field label="Método de pago">
          <select className={inputCls} value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferido</option>
            <option value="pendiente">Pendiente por pagar</option>
          </select>
        </Field>
        {paymentStatus === 'pendiente' && (
          <Field label="Fecha límite de pago">
            <input type="date" className={inputCls} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </Field>
        )}
        <div className="col-span-2 flex justify-end pt-2 border-t border-stone-200 mt-1">
          <Btn type="submit" disabled={saving}>
            <Save size={15} /> {saving ? 'Guardando…' : 'Guardar pedido'}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
