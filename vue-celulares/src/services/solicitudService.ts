import http from './http';
import type { Cargo } from './usuarioService';


const api = http;

export const Region = {
  NORTE: 'NORTE',
  SUR: 'SUR',
  ESTE: 'ESTE',
  OESTE: 'OESTE',
  LA_PLATA: 'LA_PLATA',
  NAFA: 'NAFA',
  SISTEMAS: 'SISTEMAS',
  LAVAZZA: 'LAVAZZA',
  TALLER: 'TALLER',
  IMPACTO: 'IMPACTO',
  COMERCIAL: 'COMERCIAL',
  GERENCIA: 'GERENCIA',
  PLANTA: 'PLANTA'
} as const;
export type RegionType = typeof Region[keyof typeof Region];

export const TIPOS_MOTIVO = ['MODULO ROTO', 'BATERIA', 'LENTITUD', 'NO PRENDE', 'OTRO'] as const;

export type TipoSolicitud = 'CAMBIO_POR_ROTURA' | 'NUEVO_EQUIPO' | 'ROBO' | 'PERDIDA';
export const EstadoSolicitud = {
  PENDIENTE: 'PENDIENTE',
  EN_PROCESO: 'EN_PROCESO',
  RESUELTA: 'RESUELTA'
} as const;
export type EstadoSolicitudType = typeof EstadoSolicitud[keyof typeof EstadoSolicitud];

export interface Solicitud {
  id: string;
  nomSolicitante: string;
  fecha: string;
  usuario: string;
  region: RegionType;
  tipoSolicitud: TipoSolicitud;
  motivo: string;
  observacion?: string | null;
  fechaIncidencia?: string | null;
  cargoSolicitante?: Cargo | null;
  legajo?: string | null;
  necesitaLinea: boolean;
  estado?: EstadoSolicitudType;
  tieneDenunciaAdjunta?: boolean;
  nombreArchivoDenuncia?: string;
}

const API_URL = '/api/solicitudes';

export const solicitudService = {
  obtenerTodas() {
  return api.get<Solicitud[]>(API_URL);
  },

  crear(solicitud: Solicitud) {
  return api.post<Solicitud>(API_URL, solicitud);
  },

  cambiarEstado(id: string, estado: EstadoSolicitudType) {
  return api.put(`${API_URL}/${id}/estado`, { estado });
  },

  obtenerPorUsuario(usuario: string) {
  return api.get<Solicitud[]>(`${API_URL}/usuario/${usuario}`);
  },

  adjuntarDenuncia(id: string, archivo: File) {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return api.post(`${API_URL}/${id}/denuncia`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  descargarDenuncia(id: string) {
    return api.get(`${API_URL}/${id}/denuncia`, {
      responseType: 'blob',
    });
  }
};

