import { supabase } from '../supabaseClient';
import { todayISO, nowTime } from './utils';

function assertOk({ data, error }, context) {
  if (error) {
    console.error(`Error en ${context}:`, error);
    throw error;
  }
  return data;
}

export async function fetchPedidos() {
  const res = await supabase.from('pedidos').select('*').order('date', { ascending: false });
  return assertOk(res, 'fetchPedidos') || [];
}
export async function insertPedido(order) {
  const res = await supabase.from('pedidos').insert(order).select().single();
  return assertOk(res, 'insertPedido');
}
export async function updatePedido(id, patch) {
  const res = await supabase.from('pedidos').update(patch).eq('id', id).select().single();
  return assertOk(res, 'updatePedido');
}
export async function deletePedido(id) {
  const res = await supabase.from('pedidos').delete().eq('id', id);
  return assertOk(res, 'deletePedido');
}

export async function fetchEmpleados() {
  const res = await supabase.from('empleados').select('*').order('name', { ascending: true });
  return assertOk(res, 'fetchEmpleados') || [];
}
export async function insertEmpleado(name) {
  const res = await supabase.from('empleados').insert({ name }).select().single();
  return assertOk(res, 'insertEmpleado');
}
export async function deleteEmpleado(id) {
  const res = await supabase.from('empleados').delete().eq('id', id);
  return assertOk(res, 'deleteEmpleado');
}

export async function fetchVales() {
  const res = await supabase.from('vales').select('*').order('date', { ascending: false });
  return assertOk(res, 'fetchVales') || [];
}
export async function insertVale(vale) {
  const res = await supabase.from('vales').insert(vale).select().single();
  return assertOk(res, 'insertVale');
}
export async function updateVale(id, patch) {
  const res = await supabase.from('vales').update(patch).eq('id', id).select().single();
  return assertOk(res, 'updateVale');
}
export async function deleteVale(id) {
  const res = await supabase.from('vales').delete().eq('id', id);
  return assertOk(res, 'deleteVale');
}

export async function fetchUsuarios() {
  const res = await supabase.from('usuarios').select('*').order('name', { ascending: true });
  return assertOk(res, 'fetchUsuarios') || [];
}
export async function insertUsuario(name) {
  const res = await supabase.from('usuarios').insert({ name }).select().single();
  return assertOk(res, 'insertUsuario');
}

export async function fetchBitacora() {
  const res = await supabase
    .from('bitacora')
    .select('*')
    .order('date', { ascending: false })
    .order('time', { ascending: false });
  return assertOk(res, 'fetchBitacora') || [];
}
export async function insertBitacoraEntry({ user, action, detail }) {
  const entry = { date: todayISO(), time: nowTime(), user_name: user, action, detail: detail || '' };
  const res = await supabase.from('bitacora').insert(entry).select().single();
  return assertOk(res, 'insertBitacoraEntry');
}
