import React from 'react';
import { Card, Badge } from './ui.jsx';
import { fmtMoney, fmtDate, todayISO } from '../lib/utils';

export default function Pagos({ orders, onMarkPaid }) {
  const pending = orders.filter((o) => o.payment_status === 'pendiente');
  const byClient = {};
  pending.forEach((o) => {
    if (!byClient[o.client]) byClient[o.client] = [];
    byClient[o.client].push(o);
  });

  const today = todayISO();

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-stone-800">Cobros pendientes por cliente</h2>

      {Object.keys(byClient).length === 0 ? (
        <p className="text-sm text-stone-400 text-center py-8">No hay cobros pendientes. Todo al día. 🎉</p>
      ) : (
        <div className="space-y-3">
          {Object.entries(byClient).map(([client, list]) => {
            const total = list.reduce((s, o) => s + Number(o.total), 0);
            const overdue = list.some((o) => o.due_date && o.due_date < today);
            return (
              <Card key={client} className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-800">{client}</span>
                    {overdue && <Badge tone="red">Vencido</Badge>}
                  </div>
                  <span className="font-bold text-amber-700">{fmtMoney(total)}</span>
                </div>
                <div className="space-y-1.5">
                  {list.map((o) => (
                    <div key={o.id} className="flex items-center justify-between text-sm bg-stone-50 rounded-lg px-3 py-2">
                      <div>
                        <span className="text-stone-600">{fmtDate(o.date)}</span>
                        {o.due_date && (
                          <span className={`ml-2 text-xs ${o.due_date < today ? 'text-rose-600 font-semibold' : 'text-stone-400'}`}>
                            vence {fmtDate(o.due_date)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{fmtMoney(o.total)}</span>
                        <button
                          onClick={() => onMarkPaid(o, 'efectivo')}
                          className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md font-semibold hover:bg-emerald-200"
                        >
                          Cobrado efectivo
                        </button>
                        <button
                          onClick={() => onMarkPaid(o, 'transferencia')}
                          className="text-xs bg-sky-100 text-sky-800 px-2 py-1 rounded-md font-semibold hover:bg-sky-200"
                        >
                          Cobrado transf.
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
