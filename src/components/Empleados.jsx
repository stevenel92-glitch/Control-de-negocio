import React, { useState } from 'react';
import { Plus, Trash2, ChevronRight, ChevronDown, CheckCircle2, Save } from 'lucide-react';
import { Card, Badge, Btn, Field, Modal, inputCls } from './ui.jsx';
import { fmtMoney, fmtDate, todayISO, currentQuincena } from '../lib/utils';

export default function Empleados({ employees, vouchers, onAddEmployee, onDeleteEmployee, onAddVoucher, onToggleVoucher, onDeleteVoucher }) {
  const [empModal, setEmpModal] = useState(false);
  const [voucherModal, setVoucherModal] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [saving, setSaving] = useState(false);

  const addEmployee = async (e) => {
    e.preventDefault();
    if (!newEmpName.trim()) return;
    setSaving(true);
    await onAddEmployee(newEmpName.trim());
    setSaving(false);
    setNewEmpName('');
    setEmpModal(false);
  };

  const currentQ = currentQuincena(todayISO());

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="font-bold text-stone-800">Vales de empleados</h2>
        <div className="flex gap-2">
          <Btn variant="secondary" onClick={() => setEmpModal(true)}>
            <Plus size={15} /> Empleado
          </Btn>
          <Btn onClick={() => setVoucherModal(true)} disabled={employees.length === 0}>
            <Plus size={15} /> Registrar vale
          </Btn>
        </div>
      </div>

      {employees.length === 0 && <p className="text-sm text-stone-400 text-center py-8">Agrega empleados para empezar a registrar vales.</p>}

      <div className="space-y-2">
        {employees.map((emp) => {
          const empVouchers = vouchers.filter((v) => v.employee_id === emp.id);
          const currentQVouchers = empVouchers.filter((v) => currentQuincena(v.date) === currentQ && !v.deducted);
          const totalCurrentQ = currentQVouchers.reduce((s, v) => s + Number(v.amount), 0);
          const isOpen = expanded === emp.id;
          return (
            <Card key={emp.id} className="p-4">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(isOpen ? null : emp.id)}>
                <div className="flex items-center gap-2">
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <span className="font-bold text-stone-800">{emp.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-stone-500">
                    Descontar quincena actual: <span className="font-bold text-amber-700">{fmtMoney(totalCurrentQ)}</span>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('¿Eliminar este empleado y sus vales?')) onDeleteEmployee(emp);
                    }}
                    className="text-stone-400 hover:text-rose-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {isOpen && (
                <div className="mt-3 pt-3 border-t border-stone-100 space-y-1.5">
                  {empVouchers.length === 0 && <p className="text-sm text-stone-400">Sin vales registrados.</p>}
                  {empVouchers.map((v) => (
                    <div key={v.id} className="flex items-center justify-between text-sm bg-stone-50 rounded-lg px-3 py-2">
                      <div>
                        <span className="font-medium">{fmtMoney(v.amount)}</span>
                        <span className="text-stone-400 mx-2">·</span>
                        <span className="text-stone-500">{fmtDate(v.date)}</span>
                        {v.reason && <span className="text-stone-400"> — {v.reason}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        {v.deducted ? (
                          <Badge tone="green">
                            <CheckCircle2 size={11} /> Descontado
                          </Badge>
                        ) : (
                          <button
                            onClick={() => onToggleVoucher(v)}
                            className="text-xs bg-stone-200 text-stone-700 px-2 py-1 rounded-md font-semibold hover:bg-stone-300"
                          >
                            Marcar descontado
                          </button>
                        )}
                        <button onClick={() => confirm('¿Eliminar este vale?') && onDeleteVoucher(v)} className="text-stone-400 hover:text-rose-700">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {empModal && (
        <Modal title="Nuevo empleado" onClose={() => setEmpModal(false)}>
          <form onSubmit={addEmployee} className="flex gap-2">
            <input autoFocus className={`${inputCls} flex-1`} placeholder="Nombre del empleado" value={newEmpName} onChange={(e) => setNewEmpName(e.target.value)} />
            <Btn type="submit" disabled={saving}>
              <Save size={15} /> Guardar
            </Btn>
          </form>
        </Modal>
      )}

      {voucherModal && (
        <VoucherForm
          employees={employees}
          onSave={async (v) => {
            await onAddVoucher(v);
            setVoucherModal(false);
          }}
          onClose={() => setVoucherModal(false)}
        />
      )}
    </div>
  );
}

function VoucherForm({ employees, onSave, onClose }) {
  const [employeeId, setEmployeeId] = useState(employees[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayISO());
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({ employee_id: employeeId, amount: Number(amount), date, reason });
    setSaving(false);
  };

  return (
    <Modal title="Registrar vale" onClose={onClose}>
      <form className="grid grid-cols-2 gap-3" onSubmit={submit}>
        <div className="col-span-2">
          <Field label="Empleado">
            <select required className={inputCls} value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Monto">
          <input required type="number" min="1" className={inputCls} value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label="Fecha">
          <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <div className="col-span-2">
          <Field label="Motivo (opcional)">
            <input className={inputCls} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Adelanto, préstamo…" />
          </Field>
        </div>
        <div className="col-span-2 flex justify-end pt-2">
          <Btn type="submit" disabled={saving}>
            <Save size={15} /> {saving ? 'Guardando…' : 'Guardar vale'}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
