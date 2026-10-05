import http from './http';
import { mapearTipoMovimiento } from '@/types/tipoMovimiento';

const api = http;

export interface Movimiento {
  id?: number;
  tipo: string;
  fecha: string;
  motivo: string;
  celularId: number;
  usuarioId?: string;
}

export interface MovimientoDetalle {
  id: number;
  fecha: string;
  tipo: string;
  celular: {
    marca: string;
    modelo: string;
    numeroSerie: string;
  };
  usuario: {
    nombre: string;
    apellido: string;
    numReparto: string;
  };
  descripcion: string;
}

// Servicio completo de movimientos
export const movimientoService = {
  // Crear movimiento
  crear: (movimiento: Movimiento) => {
    // Mapear el tipo al formato del backend
    const movimientoParaBackend = {
      ...movimiento,
      tipo: mapearTipoMovimiento(movimiento.tipo)
    };
    return api.post<Movimiento>('/api/movimientos', movimientoParaBackend);
  },
  
  // Obtener todos los movimientos
  obtenerTodos: () => api.get<MovimientoDetalle[]>('/api/movimientos', {
    params: {
      page: 0,
      size: 10000 // Solicitar un número muy grande para obtener todos los registros
    }
  }),
  
  // Obtener movimiento por ID
  obtenerPorId: (id: number) => api.get<MovimientoDetalle>(`/api/movimientos/${id}`),
  
  // Actualizar movimiento
  actualizar: (id: number, movimiento: Partial<Movimiento>) => {
    // Mapear el tipo si está presente
    const movimientoParaBackend = movimiento.tipo ? {
      ...movimiento,
      tipo: mapearTipoMovimiento(movimiento.tipo)
    } : movimiento;
    
    return api.put<MovimientoDetalle>(`/api/movimientos/${id}`, movimientoParaBackend);
  },
  
  // Eliminar movimiento
  eliminar: (id: number) => api.delete<void>(`/api/movimientos/${id}`),
  
  // Función de debug para probar tipos válidos
  probarTiposMovimiento: async () => {
    const tiposParaProbar = ['ASIGNACION', 'CAMBIO', 'DEVOLUCION', 'REPARACION', 'BAJA'];
    
    for (let i = 0; i < tiposParaProbar.length; i++) {
      try {
        // Solo logging de tipos válidos, sin crear variables innecesarias
      } catch (error: any) {
        if (error.response?.status === 500 && error.response.data?.message?.includes('No enum constant')) {
        } else {
        }
      }
    }
  }
};

// Mantener compatibilidad con imports anteriores
export const crearMovimiento = movimientoService.crear;
export const obtenerMovimientos = movimientoService.obtenerTodos;