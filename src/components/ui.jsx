import React from 'react';
import { X } from 'lucide-react';

export const Card = ({ children, className = '' }) => (
  <div className={`bg-white border border-stone-200 rounded-xl shadow-sm ${className}`}>{children}</div>
);

export const Badge = ({ children, tone = 'neutral' }) => {
  const tones = {
    neutral: 'bg-stone-100 text-stone-700',
    green: 'bg-emerald-100 text-emerald-800',
    amber: 'bg-amber-100 text-amber-800',
    red: 'bg-rose-100 text-rose-800',
    blue: 'bg-sky-100 text-sky-800',
    ink: 'bg-slate-800 text-white',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
};

export const Btn = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled }) => {
  const variants = {
    primary: 'bg-teal-800 text-white hover:bg-teal-900',
    secondary: 'bg-stone-100 text-stone-700 hover:bg-stone-200',
    danger: 'bg-rose-50 text-rose-700 hover:bg-rose-100',
    ghost: 'text-stone-500 hover:bg-stone-100',
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export const Field = ({ label, children }) => (
  <label className="flex flex-col gap-1 text-sm">
    <span className="text-stone-500 font-medium">{label}</span>
    {children}
  </label>
);

export const inputCls =
  'border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-teal-700';

export function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-bold text-stone-800">{title}</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700">
            <X size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
