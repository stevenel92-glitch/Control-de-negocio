import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Card, inputCls } from './ui.jsx';
import { fmtDate, fmtDateLong, todayISO, shiftDate } from '../lib/utils';

export default function Actividad({ bitacora }) {
  const [selectedDate, setSelectedDate] = useState(todayISO());

  const datesWithData = useMemo(() => {
    const map = {};
    bitacora.forEach((b) => {
      map[b.date] = (map[b.date] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [bitacora]);

  const dayLog = bitacora.filter((b) => b.date === selectedDate);
  const isToday = selectedDate === todayISO();

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-stone-800">Registro de actividad</h2>

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
            <button onClick={() => setSelectedDate(todayISO())} className="text-xs font-semibold bg-stone-100 hover:bg-stone-200 px-2.5 py-1.5 rounded-lg text-stone-600">
              Ir a hoy
            </button>
          )}
          <input type="date" className={`${inputCls} py-1.5`} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
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

      <Card className="divide-y divide-stone-100">
        {dayLog.length === 0 ? (
          <p className="text-sm text-stone-400 text-center py-8">Sin actividad registrada este día.</p>
        ) : (
          dayLog.map((b) => (
            <div key={b.id} className="flex items-start gap-3 px-4 py-3">
              <span className="text-xs text-stone-400 w-12 shrink-0 pt-0.5">{b.time}</span>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-semibold text-stone-800">{b.user_name}</span> <span className="text-stone-500">— {b.action}</span>
                </p>
                {b.detail && <p className="text-xs text-stone-500 mt-0.5">{b.detail}</p>}
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
