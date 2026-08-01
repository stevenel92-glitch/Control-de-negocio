import React, { useState } from 'react';
import { UserRound, UserPlus } from 'lucide-react';
import { Btn, inputCls } from './ui.jsx';

export default function LoginScreen({ usuarios, onCreateUser, onEnter }) {
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  const addAndEnter = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setSaving(true);
    const exists = usuarios.some((u) => u.name.toLowerCase() === name.toLowerCase());
    if (!exists) await onCreateUser(name);
    setSaving(false);
    onEnter(name);
  };

  return (
    <div className="min-h-screen bg-teal-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="w-11 h-11 rounded-lg bg-teal-800 text-white flex items-center justify-center font-black text-xl mb-4">
          N
        </div>
        <h1 className="font-bold text-stone-800 text-lg">Control del Negocio</h1>
        <p className="text-stone-500 text-sm mt-1 mb-5">¿Quién va a usar la app ahora?</p>

        {usuarios.length > 0 && (
          <div className="space-y-1.5 mb-5">
            {usuarios.map((u) => (
              <button
                key={u.id}
                onClick={() => onEnter(u.name)}
                className="w-full flex items-center gap-2 text-left px-3 py-2.5 rounded-lg border border-stone-200 hover:border-teal-700 hover:bg-teal-50 font-semibold text-stone-700 text-sm"
              >
                <UserRound size={16} className="text-teal-700" /> Entrar como {u.name}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={addAndEnter} className="flex gap-2 pt-3 border-t border-stone-100">
          <input
            className={`${inputCls} flex-1`}
            placeholder="Nombre de usuario nuevo"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Btn type="submit" disabled={saving}>
            <UserPlus size={15} /> Entrar
          </Btn>
        </form>
      </div>
    </div>
  );
}
