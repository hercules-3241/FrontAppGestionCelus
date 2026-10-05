import type { Cargo, Usuario } from '@/services/usuarioService';

export const CARGOS_SOLICITANTE: readonly Cargo[] = ['SUPERVISOR', 'REGIONAL'];

const MAX_SUGERENCIAS = 50;

export function filtrarPorRegion(empleados: Usuario[], region: string | null | undefined): Usuario[] {
  return region ? empleados.filter(e => e.region === region) : empleados;
}

export function filtrarSolicitantes(empleados: Usuario[]): Usuario[] {
  return empleados.filter(e => e.cargo != null && CARGOS_SOLICITANTE.includes(e.cargo));
}

export function buscarEmpleados(empleados: Usuario[], texto: string): Usuario[] {
  const q = texto.trim().toLowerCase();
  const coincidencias = q
    ? empleados.filter(e => e.numReparto.toLowerCase().includes(q) || (e.cargo ?? '').toLowerCase().includes(q))
    : empleados;
  return coincidencias.slice(0, MAX_SUGERENCIAS);
}

export function formatearCargo(cargo: Cargo | null | undefined): string {
  return cargo ? cargo.replace(/_/g, ' ') : 'Sin cargo';
}

// toISOString() is UTC: after 21:00 in Argentina it would already return tomorrow,
// which the backend rejects as a future incident date.
export function hoyLocal(ahora: Date = new Date()): string {
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${ahora.getFullYear()}-${mes}-${dia}`;
}
