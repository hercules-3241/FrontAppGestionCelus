
<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, nextTick } from 'vue';
import { celularService } from '@/services/celularService.ts';
import { movimientoService } from '@/services/movimientoService.ts';
import { usuarioService } from '@/services/usuarioService.ts';
import { excelService } from '@/services/excelService.ts';
import http from '@/services/http.ts';
import DataTable from '@/components/DataTable.vue';
import SkeletonLoader from '@/components/SkeletonLoader.vue';
import Modal from '@/components/Modal.vue';
import CelularForm from '@/components/CelularForm.vue';
import MovimientoForm from '@/components/MovimientoForm.vue';
import MovimientoEditModal from '@/components/MovimientoEditModal.vue';
import CelularFilters from '@/components/CelularFilters.vue';
import MovimientoFilters from '@/components/MovimientoFilters.vue';
import Pagination from '@/components/Pagination.vue';
import CustomSelect from '@/components/CustomSelect.vue';
import DatePicker from '@/components/DatePicker.vue';

// Estados reactivos
const celulares = ref([]);
const movimientos = ref([]);
const totalMovimientos = ref(0); // Total de movimientos del backend
const usuarios = ref([]);
// Arranca en true: la carga se dispara en onMounted, así el primer frame ya
// muestra el skeleton en vez del estado vacío.
const loading = ref(true);
const loadingCelular = ref(false);
const loadingMovimiento = ref(false);
const loadingReporte = ref(false);
const loadingExportarExcel = ref(false);

// Paginación
const currentPageCelulares = ref(1);
const currentPageMovimientos = ref(1);

// Referencias para scroll
const movimientosContainerRef = ref(null);
const itemsPerPageCelulares = ref(25);
const itemsPerPageMovimientos = ref(25);

// Modales
const showDeleteModal = ref(false);
const showMovimientoModal = ref(false);
const showCelularModal = ref(false);
const selectedCelular = ref(null);
const editingCelular = ref(null);
const celularFormRef = ref(null);

// Notificación específica para movimientos
const movimientoNotification = reactive({
  show: false,
  type: 'success',
  message: ''
});

// Estados para edición de movimientos
const showEditMovimientoModal = ref(false);
const showDeleteMovimientoModal = ref(false);
const selectedMovimiento = ref(null);
const loadingEditMovimiento = ref(false);

// Pestañas
const activeTab = ref('celulares');

// Filtros
const filters = ref({});
const movimientoFilters = ref({});

// Filtros para exportación Excel
const exportarMes = ref(new Date().getMonth() + 1); // Mes actual (1-12)
const exportarAnio = ref(new Date().getFullYear()); // Año actual

// Formulario de reporte de celular roto
const reporteForm = reactive({
  codigoInterno: '',
  numReparto: '',
  motivoRotura: '',
  fechaReporte: new Date().toISOString().split('T')[0] // Fecha actual por defecto en formato YYYY-MM-DD
});

const resultadoReporte = ref(null);

// Estados para autocompletado de reportes
const showCodigosDropdown = ref(false);
const showUsuariosDropdown = ref(false);
const codigosDropdownRef = ref(null);
const usuariosDropdownRef = ref(null);

const codigosFiltrados = computed(() => {

  if (!reporteForm.codigoInterno || reporteForm.codigoInterno.trim().length === 0) {
    const result = celulares.value
      .slice()
      .sort((a, b) => {
        const numA = parseInt(a.codigoInterno) || 0;
        const numB = parseInt(b.codigoInterno) || 0;
        return numA - numB;
      })
      .slice(0, 20);
    return result;
  }

  const searchTerm = reporteForm.codigoInterno.trim().toLowerCase();

  const filtered = celulares.value.filter(c => {
    const codigoInterno = c.codigoInterno?.toString().toLowerCase() || '';
    const marca = c.marca?.toLowerCase() || '';
    const modelo = c.modelo?.toLowerCase() || '';

    const matches = (
      codigoInterno.startsWith(searchTerm) ||
      marca.startsWith(searchTerm) ||
      modelo.startsWith(searchTerm)
    );

    return matches;
  });

  return filtered.sort((a, b) => {
    const aExact = a.codigoInterno?.toString().toLowerCase() === searchTerm;
    const bExact = b.codigoInterno?.toString().toLowerCase() === searchTerm;

    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;

    const numA = parseInt(a.codigoInterno) || 0;
    const numB = parseInt(b.codigoInterno) || 0;
    return numA - numB;
  }).slice(0, 20);
});
const usuariosFiltrados = computed(() => {

  if (!reporteForm.numReparto || reporteForm.numReparto.trim().length === 0) {
    return usuarios.value.slice(0, 10);
  }

  const searchTerm = reporteForm.numReparto.trim().toLowerCase();

  const filtered = usuarios.value.filter(u => {
    const numReparto = u.numReparto?.toString().toLowerCase() || '';
    const nombre = u.nombre?.toLowerCase() || '';
    const apellido = u.apellido?.toLowerCase() || '';
    const region = u.region?.toLowerCase() || '';

    const matches = (
      numReparto.startsWith(searchTerm) ||
      nombre.startsWith(searchTerm) ||
      apellido.startsWith(searchTerm) ||
      region.startsWith(searchTerm)
    );

    return matches;
  });

  return filtered.sort((a, b) => {
    const aNumReparto = a.numReparto?.toString().toLowerCase() || '';
    const bNumReparto = b.numReparto?.toString().toLowerCase() || '';

    if (aNumReparto === searchTerm && bNumReparto !== searchTerm) return -1;
    if (bNumReparto === searchTerm && aNumReparto !== searchTerm) return 1;
    if (aNumReparto.startsWith(searchTerm) && !bNumReparto.startsWith(searchTerm)) return -1;
    if (bNumReparto.startsWith(searchTerm) && !aNumReparto.startsWith(searchTerm)) return 1;

    return 0;
  }).slice(0, 15);
});

// Función para cerrar dropdowns al hacer clic fuera
const handleClickOutside = (event) => {
  if (codigosDropdownRef.value && !codigosDropdownRef.value.contains(event.target)) {
    showCodigosDropdown.value = false;
  }
  if (usuariosDropdownRef.value && !usuariosDropdownRef.value.contains(event.target)) {
    showUsuariosDropdown.value = false;
  }
};

// Notificaciones
const notification = reactive({
  show: false,
  type: 'success',
  message: ''
});

// Configuración de tablas
const celularColumns = [
  { key: 'codigoInterno', title: 'Código' },
  { key: 'marca', title: 'Marca' },
  { key: 'modelo', title: 'Modelo' },
  { key: 'tieneTemplado', title: 'Templado' },
  { key: 'tieneFunda', title: 'Funda' },
  { key: 'cantRoturas', title: 'Roturas' },
  { key: 'estado', title: 'Estado' },
  { key: 'usuario.numReparto', title: 'Usuario' }
];

const movimientoColumns = [
  { key: 'fecha', title: 'Fecha' },
  { key: 'celular.codigoInterno', title: 'Código' },
  { key: 'usuario.numReparto', title: 'Usuario' },
  { key: 'descripcion', title: 'Descripción' }
];

// Computed
const celularesFiltrados = computed(() => {
  // Verificar si hay algún filtro con valor (no vacío)
  const hayFiltrosActivos = filters.value && Object.values(filters.value).some(v => v !== '' && v !== null && v !== undefined);

  if (!hayFiltrosActivos) {
    return celulares.value;
  }

  return celulares.value.filter(celular => {
    const { codigoInterno, codigoApp, marca, estado, usuario, asignado } = filters.value;

    if (codigoInterno && !celular.codigoInterno?.toString().toLowerCase().includes(codigoInterno.toLowerCase())) {
      return false;
    }

    if (codigoApp && !celular.codigoDeAplicacion?.toString().toLowerCase().includes(codigoApp.toLowerCase())) {
      return false;
    }

    if (marca && !celular.marca.toLowerCase().includes(marca.toLowerCase())) {
      return false;
    }

    if (estado && celular.estado !== estado) {
      return false;
    }

    if (usuario) {
      const searchTerm = usuario.toLowerCase().trim();

      // El backend devuelve numRepartoUsuario como string con el nombre del usuario
      const numRepartoUsuario = (celular.numRepartoUsuario?.toString() || '').toLowerCase();

      // También revisar si existe el objeto usuario (por compatibilidad)
      const numRepartoObj = (celular.usuario?.numReparto?.toString() || '').toLowerCase();
      const nombre = (celular.usuario?.nombre?.toString() || '').toLowerCase();
      const apellido = (celular.usuario?.apellido?.toString() || '').toLowerCase();

      const matches = numRepartoUsuario.includes(searchTerm) ||
                      numRepartoObj.includes(searchTerm) ||
                      nombre.includes(searchTerm) ||
                      apellido.includes(searchTerm);

      if (!matches) {
        return false;
      }
    }

    if (asignado === 'true' && !celular.usuario) {
      return false;
    }

    if (asignado === 'false' && celular.usuario) {
      return false;
    }

    return true;
  });
});

const movimientosFiltrados = computed(() => {
  console.log('Total movimientos sin filtrar:', movimientos.value.length);
  if (!movimientoFilters.value || Object.keys(movimientoFilters.value).length === 0) {
    console.log('Sin filtros, retornando todos los movimientos');
    return movimientos.value;
  }

  return movimientos.value.filter(movimiento => {
    const { fechaDesde, fechaHasta, usuario, celular, descripcion, region } = movimientoFilters.value;


    if (fechaDesde) {
      const fechaMovimiento = new Date(movimiento.fecha);
      const fechaDesdeDate = new Date(fechaDesde);
      if (fechaMovimiento < fechaDesdeDate) {
        return false;
      }
    }


    if (fechaHasta) {
      const fechaMovimiento = new Date(movimiento.fecha);
      const fechaHastaDate = new Date(fechaHasta);
      if (fechaMovimiento > fechaHastaDate) {
        return false;
      }
    }


    if (usuario && movimiento.usuario?.numReparto !== usuario) {
      return false;
    }


    if (celular && movimiento.celular?.numeroSerie !== parseInt(celular)) {
      return false;
    }


    if (descripcion && !movimiento.descripcion?.toLowerCase().includes(descripcion.toLowerCase())) {
      return false;
    }


    if (region && movimiento.usuario?.region !== region) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    const { ordenar } = movimientoFilters.value;

    switch (ordenar) {
      case 'fecha_asc':
        return new Date(a.fecha) - new Date(b.fecha);
      case 'fecha_desc':
      default:
        return new Date(b.fecha) - new Date(a.fecha);
      case 'usuario':
        return (a.usuario?.numReparto || '').localeCompare(b.usuario?.numReparto || '');
      case 'celular':
        return (a.celular?.numeroSerie || 0) - (b.celular?.numeroSerie || 0);
    }
  });
});

// Computed para paginación
const celularesPaginados = computed(() => {
  const start = (currentPageCelulares.value - 1) * itemsPerPageCelulares.value;
  const end = start + itemsPerPageCelulares.value;
  return celularesFiltrados.value.slice(start, end);
});

const movimientosPaginados = computed(() => {
  const start = (currentPageMovimientos.value - 1) * itemsPerPageMovimientos.value;
  const end = start + itemsPerPageMovimientos.value;
  const result = movimientosFiltrados.value.slice(start, end);

  // Logs de depuración
  console.log('=== Paginación de Movimientos ===');
  console.log('Total movimientos filtrados:', movimientosFiltrados.value.length);
  console.log('Página actual:', currentPageMovimientos.value);
  console.log('Items por página:', itemsPerPageMovimientos.value);
  console.log('Rango:', start, '-', end);
  console.log('Movimientos en esta página:', result.length);
  console.log('================================');

  return result;
});

// Resumen del inventario (derivado de los celulares cargados)
const resumenCelulares = computed(() => {
  const list = celulares.value || [];
  const asignados = list.filter(c => c.usuario?.numReparto || c.numRepartoUsuario).length;
  const rotos = list.filter(c => c.estado === 'ROTO').length;
  return {
    total: list.length,
    asignados,
    sinAsignar: list.length - asignados,
    rotos,
    pct: list.length ? Math.round((asignados / list.length) * 100) : 0
  };
});

// Opciones para exportar a Excel
const mesesOptions = [
  { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' }, { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' }, { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' }, { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' }
];

const aniosOptions = (() => {
  const actual = new Date().getFullYear();
  const arr = [];
  for (let a = actual - 2; a <= actual + 1; a++) arr.push({ value: a, label: String(a) });
  return arr;
})();

// Cantidad de movimientos en el período seleccionado (para exportar)
const movimientosDelPeriodo = computed(() => {
  return movimientos.value.filter(m => {
    const f = new Date(m.fecha);
    return (f.getMonth() + 1) === exportarMes.value && f.getFullYear() === exportarAnio.value;
  }).length;
});

// Métodos
// Helper para formatear fechas sin problemas de zona horaria
const formatearFecha = (fechaString) => {
  if (!fechaString) return '-';
  // Parsear la fecha en formato YYYY-MM-DD como fecha local
  const [year, month, day] = fechaString.split('T')[0].split('-');
  const fecha = new Date(year, month - 1, day);
  return fecha.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

const formatearHora = (fechaString) => {
  if (!fechaString) return '-';
  // Si la fecha incluye hora, mostrarla, sino mostrar '-'
  if (fechaString.includes('T')) {
    const fecha = new Date(fechaString);
    return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }
  return '-';
};

const showNotification = (message, type = 'success') => {
  notification.message = message;
  notification.type = type;
  notification.show = true;
  setTimeout(() => {
    notification.show = false;
  }, 3000);
};

const showMovimientoNotification = (message, type = 'success') => {
  movimientoNotification.message = message;
  movimientoNotification.type = type;
  movimientoNotification.show = true;
  setTimeout(() => {
    movimientoNotification.show = false;
  }, 4000);
};

const cargarDatos = async () => {
  await Promise.all([
    cargarCelulares(),
    cargarMovimientos(),
    cargarUsuarios()
  ]);
};

const cargarCelulares = async () => {
  try {
    loading.value = true;
    const response = await celularService.obtenerTodos();
    celulares.value = Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    celulares.value = [];
    const status = error?.response?.status;
    const mensaje = status === 500
      ? 'Error en el servidor. Verifica que el backend esté corriendo en el puerto 8080.'
      : 'Error al cargar celulares. Verifica la conexión con el servidor.';
    showNotification(mensaje, 'error');
  } finally {
    loading.value = false;
  }
};

const cargarMovimientos = async () => {
  try {
    const response = await movimientoService.obtenerTodos();

    console.log('Respuesta del backend:', response.data);

    // El backend puede devolver un array directo o una respuesta paginada con 'content'
    let movimientosData = [];
    if (Array.isArray(response.data)) {
      movimientosData = response.data;
      totalMovimientos.value = response.data.length;
      console.log('Movimientos cargados (array):', movimientosData.length);
    } else if (response.data?.content && Array.isArray(response.data.content)) {
      movimientosData = response.data.content;
      totalMovimientos.value = response.data.totalElements || response.data.content.length;
      console.log('Movimientos cargados (paginado):', movimientosData.length, 'Total en DB:', response.data.totalElements);
    } else {
      totalMovimientos.value = 0;
      console.log('No se encontraron movimientos');
    }

    // Mapear los movimientos al formato esperado por el frontend
    movimientos.value = movimientosData.map(mov => ({
      id: mov.id,
      fecha: mov.fecha,
      tipo: mov.tipo,
      descripcion: mov.descripcion,
      estadoCelular: mov.estadoCelular,
      celular: {
        numeroSerie: mov.numeroSerieCelular,
        codigoInterno: mov.codigoInterno || mov.numeroSerieCelular,
        marca: mov.marca || '',
        modelo: mov.modelo || ''
      },
      usuario: {
        numReparto: mov.numRepartoUsuario,
        nombre: mov.nombreUsuario || '',
        apellido: mov.apellidoUsuario || ''
      }
    })).sort((a, b) => {
      // Ordenar por fecha descendente (más reciente primero)
      const fechaA = new Date(a.fecha);
      const fechaB = new Date(b.fecha);
      return fechaB - fechaA;
    });

  } catch (error) {
    movimientos.value = [];
    totalMovimientos.value = 0;
    const status = error?.response?.status;
    const mensaje = status === 500
      ? 'Error en el servidor. Verifica que el backend esté corriendo en el puerto 8080.'
      : 'Error al cargar movimientos. Verifica la conexión con el servidor.';
    showNotification(mensaje, 'error');
  }
};

const cargarUsuarios = async () => {
  try {
    const response = await usuarioService.obtenerTodos();
    usuarios.value = Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    usuarios.value = [];
    const status = error?.response?.status;
    const mensaje = status === 500
      ? 'Error en el servidor. Verifica que el backend esté corriendo en el puerto 8080.'
      : 'Error al cargar usuarios. Verifica la conexión con el servidor.';
    showNotification(mensaje, 'error');
  }
};

const guardarCelular = async (celularData) => {
  try {
    loadingCelular.value = true;

    if (editingCelular.value) {
      // Actualizar celular existente
      await celularService.actualizar(editingCelular.value.numeroSerie, celularData);
      showNotification('Celular actualizado exitosamente');
    } else {
      // Crear nuevo celular
      await celularService.crearCelular(celularData);
      showNotification('Celular creado exitosamente');
      // Limpiar formulario después de crear exitosamente
      if (celularFormRef.value) {
        celularFormRef.value.resetForm();
      }
    }

    editingCelular.value = null;
    cargarCelulares();
  } catch (error) {
    const status = error?.response?.status;
    const errorData = error?.response?.data;

    let mensaje = 'Error al guardar celular';
    if (status === 500) {
      mensaje = 'Error en el servidor. Verifica que la base de datos tenga todas las columnas necesarias (incluyendo cantidad_roturas).';
    } else if (status === 400) {
      mensaje = 'Datos inválidos. Verifica que todos los campos estén correctos.';
    }

    showNotification(mensaje, 'error');
  } finally {
    loadingCelular.value = false;
  }
};

const guardarCelularYCerrar = async (celularData) => {
  await guardarCelular(celularData);
  showCelularModal.value = false;
};

const editarCelular = (celular) => {
  editingCelular.value = celular;
  showCelularModal.value = true;
};

const cancelarEdicion = () => {
  editingCelular.value = null;
};

const confirmarEliminar = (celular) => {
  selectedCelular.value = celular;
  showDeleteModal.value = true;
};

const eliminarCelular = async () => {
  try {
    await celularService.eliminar(selectedCelular.value.numeroSerie);
    showNotification('Celular eliminado exitosamente');
    showDeleteModal.value = false;
    selectedCelular.value = null;
    cargarCelulares();
  } catch (error) {
    showNotification('Error al eliminar celular', 'error');
  }
};

const guardarMovimiento = async (movimientoData) => {
  try {
    loadingMovimiento.value = true;
    await movimientoService.crear(movimientoData);
    showMovimientoNotification('✅ Movimiento creado exitosamente');
    cargarMovimientos();
  } catch (error) {
    showMovimientoNotification('❌ Error al crear movimiento', 'error');
  } finally {
    loadingMovimiento.value = false;
  }
};

const guardarMovimientoYCerrar = async (movimientoData) => {
  await guardarMovimiento(movimientoData);
  showMovimientoModal.value = false;
};

// Funciones para edición de movimientos
const editarMovimiento = (movimiento) => {
  selectedMovimiento.value = movimiento;
  showEditMovimientoModal.value = true;
};

const guardarEdicionMovimiento = async (movimientoData) => {
  try {
    loadingEditMovimiento.value = true;
    await movimientoService.actualizar(selectedMovimiento.value.id, movimientoData);
    showNotification('Movimiento actualizado exitosamente');
    showEditMovimientoModal.value = false;
    selectedMovimiento.value = null;
    cargarMovimientos();
  } catch (error) {
    showNotification('Error al actualizar movimiento', 'error');
  } finally {
    loadingEditMovimiento.value = false;
  }
};

const confirmarEliminarMovimiento = (movimiento) => {
  selectedMovimiento.value = movimiento;
  showDeleteMovimientoModal.value = true;
};

const eliminarMovimiento = async () => {
  try {
    if (!selectedMovimiento.value) {
      showNotification('No hay movimiento seleccionado', 'error');
      return;
    }
    const id = selectedMovimiento.value.id || selectedMovimiento.value.idMovimiento || selectedMovimiento.value?.movimientoId;
    if (!id) {
      showNotification('Movimiento sin ID (revisar backend)', 'error');
      return;
    }
    await movimientoService.eliminar(id);
    showNotification('Movimiento eliminado exitosamente');
    showDeleteMovimientoModal.value = false;
    selectedMovimiento.value = null;
    await cargarMovimientos();
  } catch (error) {
    const status = error?.response?.status;
    if (status === 404) {
      showNotification('Movimiento no encontrado (404)', 'error');
    } else if (status === 401) {
      showNotification('Sesión expirada (401)', 'error');
    } else {
      showNotification('Error al eliminar movimiento', 'error');
    }
  }
};

const cerrarModalesMovimiento = () => {
  showEditMovimientoModal.value = false;
  showDeleteMovimientoModal.value = false;
  selectedMovimiento.value = null;
};

const aplicarFiltros = (newFilters) => {
  filters.value = newFilters;
};

const aplicarFiltrosMovimientos = (newFilters) => {
  movimientoFilters.value = newFilters;
};

// Función para exportar movimientos a Excel
const exportarMovimientosExcel = async () => {
  loadingExportarExcel.value = true;
  try {
    // Filtrar movimientos por mes y año seleccionados
    const movimientosFiltradosPorFecha = movimientos.value.filter(movimiento => {
      const fechaMovimiento = new Date(movimiento.fecha);
      const mesMovimiento = fechaMovimiento.getMonth() + 1; // getMonth() retorna 0-11
      const anioMovimiento = fechaMovimiento.getFullYear();

      return mesMovimiento === exportarMes.value && anioMovimiento === exportarAnio.value;
    });

    if (movimientosFiltradosPorFecha.length === 0) {
      showNotification(`No hay movimientos para ${obtenerNombreMes(exportarMes.value)} ${exportarAnio.value}`, 'warning');
      return;
    }

    // Ordenar por fecha descendente
    movimientosFiltradosPorFecha.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    const nombreArchivo = `movimientos_${obtenerNombreMes(exportarMes.value)}_${exportarAnio.value}.xlsx`;
    excelService.exportarMovimientosActualizados(movimientosFiltradosPorFecha, nombreArchivo);

    showNotification(`Se exportaron ${movimientosFiltradosPorFecha.length} movimientos a Excel`, 'success');
  } catch (error) {
    console.error('Error al exportar:', error);
    showNotification('Error al exportar movimientos a Excel', 'error');
  } finally {
    loadingExportarExcel.value = false;
  }
};

// Helper para obtener nombre del mes
const obtenerNombreMes = (mes) => {
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return meses[mes - 1];
};

// Función para reportar celular roto
const reportarCelularRoto = async () => {
  loadingReporte.value = true;
  resultadoReporte.value = null;

  try {
    const reporte = {
      codigoInterno: reporteForm.codigoInterno.trim(),
      numReparto: reporteForm.numReparto.trim(),
      motivoRotura: reporteForm.motivoRotura.trim(),
      fechaReporte: reporteForm.fechaReporte // Formato YYYY-MM-DD
    };

    // Delay de 2 segundos para mejor experiencia visual
    await new Promise(resolve => setTimeout(resolve, 2000));

    const response = await http.post('/api/celulares/gestion/reportar-roto', reporte);

    const resultado = response.data;
    resultadoReporte.value = resultado;

    // Limpiar formulario si fue exitoso
    if (resultado) {
      reporteForm.codigoInterno = '';
      reporteForm.numReparto = '';
      reporteForm.motivoRotura = '';
      reporteForm.fechaReporte = new Date().toISOString().split('T')[0]; // Resetear a fecha actual

      showNotification(
        resultado.exitoReemplazo
          ? 'Celular reportado y reemplazado exitosamente'
          : 'Celular reportado como roto',
        resultado.exitoReemplazo ? 'success' : 'warning'
      );

      // Recargar datos para actualizar estados
      await cargarCelulares();
    }
  } catch (error) {
    showNotification(`Error al reportar celular roto: ${error.message}`, 'error');
  } finally {
    loadingReporte.value = false;
  }
};

// Métodos de paginación
const onPageChangedCelulares = (page) => {
  currentPageCelulares.value = page;
};

const onItemsPerPageChangedCelulares = (itemsPerPage) => {
  itemsPerPageCelulares.value = itemsPerPage;
  currentPageCelulares.value = 1; // Reset to first page
};

const onPageChangedMovimientos = async (page) => {
  currentPageMovimientos.value = page;
  // Hacer scroll hacia el contenedor de movimientos
  await nextTick();
  if (movimientosContainerRef.value) {
    movimientosContainerRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const onItemsPerPageChangedMovimientos = (itemsPerPage) => {
  itemsPerPageMovimientos.value = itemsPerPage;
  currentPageMovimientos.value = 1; // Reset to first page
};

// Lifecycle
onMounted(() => {
  cargarDatos();
  // Agregar listener para cerrar dropdowns al hacer clic fuera
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  // Remover listener al desmontar el componente
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- ===== Hero con gradiente ===== -->
    <div class="px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4">
      <div class="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 shadow-xl shadow-purple-500/20 px-4 sm:px-8 pt-5 pb-20">
        <!-- Decoración -->
        <div class="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-white/10"></div>
        <div class="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-white/5"></div>

        <div class="relative mx-auto max-w-7xl">
          <!-- Nav en pill flotante -->
          <div class="flex justify-center">
            <nav class="inline-flex items-center gap-1 rounded-full bg-white/95 p-1 shadow-lg shadow-purple-900/10 overflow-x-auto max-w-full">
              <button
                @click="activeTab = 'celulares'"
                :class="[
                  'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap',
                  activeTab === 'celulares' ? 'bg-violet-100 text-violet-700' : 'text-slate-500 hover:text-slate-800'
                ]">
                Celulares
                <span :class="['rounded-md px-1.5 py-0.5 text-xs font-bold', activeTab === 'celulares' ? 'bg-violet-200 text-violet-700' : 'bg-slate-100 text-slate-400']">{{ celulares.length }}</span>
              </button>
              <button
                @click="activeTab = 'movimientos'"
                :class="[
                  'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap',
                  activeTab === 'movimientos' ? 'bg-violet-100 text-violet-700' : 'text-slate-500 hover:text-slate-800'
                ]">
                Movimientos
                <span :class="['rounded-md px-1.5 py-0.5 text-xs font-bold', activeTab === 'movimientos' ? 'bg-violet-200 text-violet-700' : 'bg-slate-100 text-slate-400']">{{ totalMovimientos }}</span>
              </button>
              <button
                @click="activeTab = 'reportar-roto'"
                :class="[
                  'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap',
                  activeTab === 'reportar-roto' ? 'bg-rose-100 text-rose-700' : 'text-slate-500 hover:text-slate-800'
                ]">
                Reportar Roto
              </button>
            </nav>
          </div>

          <!-- Título + acción contextual -->
          <div class="mt-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                {{ activeTab === 'movimientos' ? 'Movimientos' : activeTab === 'reportar-roto' ? 'Reportar Roto' : 'Gestión de Celulares' }}
              </h1>
              <p class="mt-1 text-white/80 text-sm sm:text-base">
                {{ activeTab === 'movimientos' ? 'Historial y registro de movimientos del inventario' : activeTab === 'reportar-roto' ? 'Registra un celular dañado para gestionar su reemplazo' : 'Administra el inventario de celulares y sus movimientos' }}
              </p>
            </div>
            <button v-if="activeTab === 'celulares'" @click="showCelularModal = true"
                    class="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-violet-700 shadow-lg hover:bg-white/90 transition-colors self-start sm:self-auto">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Nuevo Celular
            </button>
            <button v-else-if="activeTab === 'movimientos'" @click="showMovimientoModal = true"
                    class="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 shadow-lg hover:bg-white/90 transition-colors self-start sm:self-auto">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Nuevo Movimiento
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== Contenido (se solapa con el hero) ===== -->
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-12 relative z-10 pb-10">

      <!-- Notificación -->
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="notification.show"
             :class="[
               'mb-6 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 shadow-sm',
               notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
             ]">
          <div class="flex items-center gap-3">
            <svg v-if="notification.type === 'success'" class="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <svg v-else class="w-5 h-5 text-rose-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="text-sm font-medium">{{ notification.message }}</span>
          </div>
          <button @click="notification.show = false" class="p-1 rounded-lg hover:bg-black/5 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </transition>

      <!-- ================= TAB: CELULARES ================= -->
      <div v-if="activeTab === 'celulares'" class="space-y-6">

        <!-- Resumen del inventario (KPIs con gradiente) -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div class="rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 p-4 sm:p-5 text-white shadow-lg shadow-blue-500/20">
            <div class="text-xs font-semibold uppercase tracking-wider text-white/80">Total</div>
            <div class="mt-1 text-3xl sm:text-4xl font-bold tabular-nums leading-none">{{ resumenCelulares.total }}</div>
            <div class="mt-2 text-sm text-white/80">Equipos registrados</div>
          </div>
          <div class="rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 p-4 sm:p-5 text-white shadow-lg shadow-emerald-500/20">
            <div class="text-xs font-semibold uppercase tracking-wider text-white/80">Asignados</div>
            <div class="mt-1 text-3xl sm:text-4xl font-bold tabular-nums leading-none">{{ resumenCelulares.asignados }}</div>
            <div class="mt-2 text-sm text-white/80">{{ resumenCelulares.pct }}% del total</div>
          </div>
          <div class="rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-4 sm:p-5 text-white shadow-lg shadow-amber-500/20">
            <div class="text-xs font-semibold uppercase tracking-wider text-white/80">Sin asignar</div>
            <div class="mt-1 text-3xl sm:text-4xl font-bold tabular-nums leading-none">{{ resumenCelulares.sinAsignar }}</div>
            <div class="mt-2 text-sm text-white/80">Disponibles</div>
          </div>
          <div class="rounded-2xl bg-gradient-to-br from-rose-400 to-rose-500 p-4 sm:p-5 text-white shadow-lg shadow-rose-500/20">
            <div class="text-xs font-semibold uppercase tracking-wider text-white/80">Rotos</div>
            <div class="mt-1 text-3xl sm:text-4xl font-bold tabular-nums leading-none">{{ resumenCelulares.rotos }}</div>
            <div class="mt-2 text-sm text-white/80">Requieren atención</div>
          </div>
        </div>

        <!-- Filtros -->
        <div class="card p-4 lg:p-5">
          <div class="mb-4">
            <h3 class="text-base font-semibold text-slate-900">Filtros de búsqueda</h3>
            <p class="text-sm text-slate-500">Filtra los celulares por diferentes criterios</p>
          </div>
          <CelularFilters @filter="aplicarFiltros" />
        </div>

        <!-- Tabla de celulares -->
        <div class="card overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 class="text-base font-semibold text-slate-900">Inventario de celulares</h2>
            <span class="badge-slate">{{ celularesFiltrados.length }} resultados</span>
          </div>

          <SkeletonLoader
            v-if="loading"
            variant="table"
            :rows="8"
            :cols="10"
            :ratios="[1.4, 0.8, 1, 1.4, 0.8, 0.8, 0.8, 1, 1.4, 1]"
            label="Cargando celulares…"
          />

          <div v-else-if="celularesFiltrados.length === 0" class="flex flex-col items-center gap-3 py-16">
            <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <svg class="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z"></path>
              </svg>
            </div>
            <p class="text-sm text-slate-500">No hay celulares que coincidan con los filtros</p>
          </div>

          <template v-else>
            <!-- Vista escritorio -->
            <div class="hidden lg:block overflow-x-auto">
              <table class="w-full" style="min-width: 900px;">
                <thead>
                  <tr class="border-b border-slate-200 bg-slate-50">
                    <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Código</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">App</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Marca</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Modelo</th>
                    <th class="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Templ.</th>
                    <th class="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Funda</th>
                    <th class="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Rot.</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Usuario</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="celular in celularesPaginados" :key="celular.codigoInterno" class="hover:bg-slate-50 transition-colors">
                    <td class="px-4 py-3 whitespace-nowrap">
                      <span class="text-sm font-semibold text-slate-900">{{ celular.codigoInterno }}</span>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-indigo-500">{{ celular.codigoDeAplicacion || '—' }}</td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-700">{{ celular.marca }}</td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-700">{{ celular.modelo }}</td>
                    <td class="px-4 py-3 whitespace-nowrap text-center">
                      <svg v-if="celular.tieneTemplado" class="w-5 h-5 mx-auto text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                      </svg>
                      <span v-else class="text-slate-300">—</span>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-center">
                      <svg v-if="celular.tieneFunda" class="w-5 h-5 mx-auto text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                      </svg>
                      <span v-else class="text-slate-300">—</span>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-center">
                      <span :class="celular.cantRoturas > 0 ? 'badge-rose' : 'badge-slate'">{{ celular.cantRoturas || 0 }}</span>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                      <span :class="{
                        'badge-emerald': celular.estado === 'NUEVO',
                        'badge-amber': celular.estado === 'REACONDICIONADO',
                        'badge-indigo': celular.estado === 'USADO',
                        'badge-rose': celular.estado === 'ROTO',
                        'badge-slate': !['NUEVO','REACONDICIONADO','USADO','ROTO'].includes(celular.estado)
                      }">
                        {{ celular.estado === 'REACONDICIONADO' ? 'Reacond.' : celular.estado }}
                      </span>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                      <span v-if="celular.usuario?.numReparto || celular.numRepartoUsuario" class="text-sm text-slate-900">
                        {{ celular.usuario?.numReparto || celular.numRepartoUsuario }}
                      </span>
                      <span v-else class="text-xs text-slate-400 italic">Sin asignar</span>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                      <div class="flex items-center justify-end gap-1">
                        <button @click="editarCelular(celular)" class="btn-icon-edit" title="Editar celular">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </button>
                        <button @click="confirmarEliminar(celular)" class="btn-icon-danger" title="Eliminar celular">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Vista móvil -->
            <div class="lg:hidden divide-y divide-slate-100">
              <div v-for="celular in celularesPaginados" :key="celular.codigoInterno" class="p-4">
                <div class="flex items-start justify-between gap-3 mb-3">
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="flex-shrink-0 h-10 w-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm">
                      {{ String(celular.codigoInterno).substring(0, 2).toUpperCase() }}
                    </div>
                    <div class="min-w-0">
                      <h3 class="font-semibold text-slate-900 truncate">{{ celular.codigoInterno }}</h3>
                      <p class="text-sm text-slate-500 truncate">{{ celular.marca }} {{ celular.modelo }}</p>
                      <p v-if="celular.codigoDeAplicacion" class="text-xs text-slate-400">App: {{ celular.codigoDeAplicacion }}</p>
                    </div>
                  </div>
                  <span :class="{
                    'badge-emerald': celular.estado === 'NUEVO',
                    'badge-amber': celular.estado === 'REACONDICIONADO',
                    'badge-indigo': celular.estado === 'USADO',
                    'badge-rose': celular.estado === 'ROTO',
                    'badge-slate': !['NUEVO','REACONDICIONADO','USADO','ROTO'].includes(celular.estado)
                  }">{{ celular.estado === 'REACONDICIONADO' ? 'Reacond.' : celular.estado }}</span>
                </div>

                <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
                  <div class="flex items-center justify-between">
                    <span class="text-slate-500">Usuario</span>
                    <span class="font-medium text-slate-900">{{ celular.usuario?.numReparto || celular.numRepartoUsuario || 'Sin asignar' }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-slate-500">Roturas</span>
                    <span :class="celular.cantRoturas > 0 ? 'badge-rose' : 'badge-slate'">{{ celular.cantRoturas || 0 }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-slate-500">Templado</span>
                    <span :class="celular.tieneTemplado ? 'text-emerald-600 font-medium' : 'text-slate-400'">{{ celular.tieneTemplado ? 'Sí' : 'No' }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-slate-500">Funda</span>
                    <span :class="celular.tieneFunda ? 'text-emerald-600 font-medium' : 'text-slate-400'">{{ celular.tieneFunda ? 'Sí' : 'No' }}</span>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button @click="editarCelular(celular)" class="btn-secondary flex-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    Editar
                  </button>
                  <button @click="confirmarEliminar(celular)" class="btn-icon-danger !w-10 !h-10 border border-slate-200">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Paginación de celulares -->
        <Pagination
          :current-page="currentPageCelulares"
          :total-records="celularesFiltrados.length"
          :items-per-page="itemsPerPageCelulares"
          @page-changed="onPageChangedCelulares"
          @items-per-page-changed="onItemsPerPageChangedCelulares"
        />
      </div>

      <!-- ================= TAB: MOVIMIENTOS ================= -->
      <div v-else-if="activeTab === 'movimientos'" class="space-y-6" ref="movimientosContainerRef">
        <!-- Filtros (panel colapsable) -->
        <MovimientoFilters
          :usuarios="usuarios"
          :celulares="celulares"
          @filter="aplicarFiltrosMovimientos"
        />

        <!-- Exportar a Excel -->
        <div class="card p-4 lg:p-5">
          <div class="flex flex-col lg:flex-row lg:items-end gap-4">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <div class="min-w-0">
                <h3 class="text-base font-semibold text-slate-900">Exportar a Excel</h3>
                <p class="text-sm text-slate-500">
                  <span class="font-semibold" :class="movimientosDelPeriodo > 0 ? 'text-emerald-600' : 'text-slate-400'">{{ movimientosDelPeriodo }}</span>
                  {{ movimientosDelPeriodo === 1 ? 'movimiento' : 'movimientos' }} en {{ obtenerNombreMes(exportarMes) }} {{ exportarAnio }}
                </p>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
              <div class="w-full sm:w-44">
                <label class="field-label">Mes</label>
                <CustomSelect v-model="exportarMes" :options="mesesOptions" />
              </div>
              <div class="w-full sm:w-28">
                <label class="field-label">Año</label>
                <CustomSelect v-model="exportarAnio" :options="aniosOptions" />
              </div>
              <button @click="exportarMovimientosExcel" :disabled="loadingExportarExcel || movimientosDelPeriodo === 0" class="btn-success whitespace-nowrap">
                <svg v-if="!loadingExportarExcel" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <div v-else class="animate-spin rounded-full h-4 w-4 border-2 border-white/40 border-t-white"></div>
                {{ loadingExportarExcel ? 'Exportando...' : 'Exportar' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Notificación de movimientos -->
        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
          <div v-if="movimientoNotification.show"
               :class="[
                 'flex items-center justify-between gap-3 rounded-xl border px-4 py-3 shadow-sm',
                 movimientoNotification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
               ]">
            <div class="flex items-center gap-3">
              <svg v-if="movimientoNotification.type === 'success'" class="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <svg v-else class="w-5 h-5 text-rose-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <p class="text-sm font-semibold">{{ movimientoNotification.message }}</p>
                <p class="text-xs opacity-80">El formulario se ha limpiado automáticamente</p>
              </div>
            </div>
            <button @click="movimientoNotification.show = false" class="p-1 rounded-lg hover:bg-black/5 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </transition>

        <!-- Tabla de movimientos -->
        <div class="card overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 class="text-base font-semibold text-slate-900">Historial de movimientos</h2>
            <span class="badge-slate">{{ movimientosFiltrados.length }} resultados</span>
          </div>

          <SkeletonLoader
            v-if="loading"
            variant="table"
            :rows="8"
            :cols="7"
            :ratios="[1, 1, 1.4, 1, 1.4, 2, 1]"
            label="Cargando movimientos…"
          />

          <div v-else-if="movimientosFiltrados.length === 0" class="flex flex-col items-center gap-3 py-16">
            <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <svg class="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
              </svg>
            </div>
            <p class="text-sm text-slate-500">No hay movimientos que coincidan con los filtros</p>
          </div>

          <template v-else>
            <!-- Vista escritorio -->
            <div class="hidden lg:block overflow-x-auto">
              <table class="w-full" style="min-width: 1100px;">
                <thead>
                  <tr class="border-b border-slate-200 bg-slate-50">
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Celular</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Usuario</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Descripción</th>
                    <th class="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="movimiento in movimientosPaginados" :key="movimiento.id" class="hover:bg-slate-50 transition-colors">
                    <td class="px-6 py-3 whitespace-nowrap">
                      <div class="text-sm font-medium text-slate-900">{{ formatearFecha(movimiento.fecha) }}</div>
                      <div class="text-xs text-slate-400">{{ formatearHora(movimiento.fecha) }}</div>
                    </td>
                    <td class="px-6 py-3 whitespace-nowrap">
                      <span :class="{
                        'badge-emerald': movimiento.tipo === 'ASIGNACION',
                        'badge-rose': movimiento.tipo === 'DEVOLUCION' || movimiento.tipo === 'BAJA',
                        'badge-indigo': movimiento.tipo === 'CAMBIO',
                        'badge-amber': movimiento.tipo === 'MANTENIMIENTO' || movimiento.tipo === 'REPARACION',
                        'badge-slate': !['ASIGNACION','DEVOLUCION','BAJA','CAMBIO','MANTENIMIENTO','REPARACION'].includes(movimiento.tipo)
                      }">{{ movimiento.tipo }}</span>
                    </td>
                    <td class="px-6 py-3 whitespace-nowrap">
                      <div class="flex items-center gap-3">
                        <div class="flex-shrink-0 h-9 w-9 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z"></path>
                          </svg>
                        </div>
                        <div>
                          <div class="text-sm font-semibold text-slate-900">{{ movimiento.celular?.codigoInterno }}</div>
                          <div class="text-xs text-slate-400">{{ movimiento.celular?.marca }} {{ movimiento.celular?.modelo }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-3 whitespace-nowrap">
                      <span :class="{
                        'badge-emerald': movimiento.estadoCelular === 'NUEVO',
                        'badge-amber': movimiento.estadoCelular === 'REACONDICIONADO',
                        'badge-rose': movimiento.estadoCelular === 'ROTO',
                        'badge-slate': !['NUEVO','REACONDICIONADO','ROTO'].includes(movimiento.estadoCelular)
                      }">{{ movimiento.estadoCelular === 'REACONDICIONADO' ? 'Reacond.' : (movimiento.estadoCelular || '—') }}</span>
                    </td>
                    <td class="px-6 py-3 whitespace-nowrap text-sm font-medium text-slate-900">
                      {{ movimiento.usuario?.numReparto || movimiento.numRepartoUsuario || '—' }}
                    </td>
                    <td class="px-6 py-3">
                      <div class="text-sm text-slate-600 max-w-xs truncate" :title="movimiento.descripcion">{{ movimiento.descripcion }}</div>
                    </td>
                    <td class="px-6 py-3 whitespace-nowrap">
                      <div class="flex items-center justify-end gap-1">
                        <button @click="editarMovimiento(movimiento)" class="btn-icon-edit" title="Editar movimiento">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </button>
                        <button @click="confirmarEliminarMovimiento(movimiento)" class="btn-icon-danger" title="Eliminar movimiento">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Vista móvil -->
            <div class="lg:hidden divide-y divide-slate-100">
              <div v-for="movimiento in movimientosPaginados" :key="movimiento.id" class="p-4">
                <div class="flex items-start justify-between gap-3 mb-3">
                  <div class="min-w-0">
                    <h3 class="font-semibold text-slate-900 truncate">{{ movimiento.celular?.codigoInterno }}</h3>
                    <p class="text-sm text-slate-500 truncate">{{ movimiento.celular?.marca }} {{ movimiento.celular?.modelo }}</p>
                  </div>
                  <span :class="{
                    'badge-emerald': movimiento.tipo === 'ASIGNACION',
                    'badge-rose': movimiento.tipo === 'DEVOLUCION' || movimiento.tipo === 'BAJA',
                    'badge-indigo': movimiento.tipo === 'CAMBIO',
                    'badge-amber': movimiento.tipo === 'MANTENIMIENTO' || movimiento.tipo === 'REPARACION',
                    'badge-slate': !['ASIGNACION','DEVOLUCION','BAJA','CAMBIO','MANTENIMIENTO','REPARACION'].includes(movimiento.tipo)
                  }">{{ movimiento.tipo }}</span>
                </div>
                <dl class="space-y-1.5 text-sm mb-4">
                  <div class="flex justify-between"><dt class="text-slate-500">Fecha</dt><dd class="font-medium text-slate-900">{{ formatearFecha(movimiento.fecha) }} {{ formatearHora(movimiento.fecha) }}</dd></div>
                  <div class="flex justify-between"><dt class="text-slate-500">Usuario</dt><dd class="font-medium text-slate-900">{{ movimiento.usuario?.numReparto || '—' }}</dd></div>
                  <div class="flex justify-between gap-4"><dt class="text-slate-500 flex-shrink-0">Descripción</dt><dd class="text-slate-600 text-right">{{ movimiento.descripcion }}</dd></div>
                </dl>
                <div class="flex items-center gap-2">
                  <button @click="editarMovimiento(movimiento)" class="btn-secondary flex-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    Editar
                  </button>
                  <button @click="confirmarEliminarMovimiento(movimiento)" class="btn-icon-danger !w-10 !h-10 border border-slate-200">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Paginación de movimientos -->
        <Pagination
          :current-page="currentPageMovimientos"
          :total-records="movimientosFiltrados.length"
          :items-per-page="itemsPerPageMovimientos"
          @page-changed="onPageChangedMovimientos"
          @items-per-page-changed="onItemsPerPageChangedMovimientos"
        />
      </div>

      <!-- ================= TAB: REPORTAR ROTO ================= -->
      <div v-else-if="activeTab === 'reportar-roto'" class="space-y-6">
        <div class="max-w-5xl mx-auto grid lg:grid-cols-5 gap-6 items-start">
          <!-- Panel lateral informativo -->
          <div class="lg:col-span-2 relative overflow-hidden rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 p-6 lg:p-8 text-white shadow-lg shadow-rose-500/20">
            <div class="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/10"></div>
            <div class="pointer-events-none absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-white/5"></div>
            <div class="relative">
              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 mb-5">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
              </div>
              <h2 class="text-xl font-bold leading-tight">Reportar celular roto</h2>
              <p class="mt-2 text-sm text-white/80">Registra un celular dañado y el sistema gestiona su reemplazo automáticamente.</p>

              <ul class="mt-6 space-y-4">
                <li class="flex items-start gap-3">
                  <span class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold">1</span>
                  <span class="text-sm text-white/90">Se marca el celular como <span class="font-semibold">ROTO</span> y suma una rotura.</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold">2</span>
                  <span class="text-sm text-white/90">El sistema busca un reemplazo disponible para el usuario.</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold">3</span>
                  <span class="text-sm text-white/90">Se registra el movimiento correspondiente de forma automática.</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Formulario -->
          <div class="lg:col-span-3 card p-6 lg:p-8">
            <form @submit.prevent="reportarCelularRoto" class="space-y-5">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <!-- Código Interno con autocompletado -->
              <div ref="codigosDropdownRef" class="relative">
                <label class="field-label">Código interno *</label>
                <input v-model="reporteForm.codigoInterno" type="text" required
                       @focus="showCodigosDropdown = true" class="input-danger" placeholder="Ej: SAM001" />
                <div v-if="showCodigosDropdown && codigosFiltrados.length > 0"
                     class="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  <div v-for="celular in codigosFiltrados.slice(0, 10)" :key="celular.numeroSerie"
                       @click="reporteForm.codigoInterno = celular.codigoInterno; showCodigosDropdown = false"
                       class="px-3 py-2.5 hover:bg-rose-50 cursor-pointer border-b border-slate-50 last:border-b-0 transition-colors">
                    <div class="font-semibold text-slate-900 text-sm">{{ celular.codigoInterno }}</div>
                    <div class="text-xs text-slate-500">{{ celular.marca }} {{ celular.modelo }} · {{ celular.estado }}</div>
                  </div>
                </div>
              </div>

              <!-- Número de Reparto con autocompletado -->
              <div ref="usuariosDropdownRef" class="relative">
                <label class="field-label">Número de reparto *</label>
                <input v-model="reporteForm.numReparto" type="text" required
                       @focus="showUsuariosDropdown = true" class="input-danger" placeholder="Ej: 123" />
                <div v-if="showUsuariosDropdown && usuariosFiltrados.length > 0"
                     class="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  <div v-for="usuario in usuariosFiltrados.slice(0, 10)" :key="usuario.id"
                       @click="reporteForm.numReparto = usuario.numReparto; showUsuariosDropdown = false"
                       class="px-3 py-2.5 hover:bg-rose-50 cursor-pointer border-b border-slate-50 last:border-b-0 transition-colors">
                    <div class="font-semibold text-slate-900 text-sm">{{ usuario.numReparto }}</div>
                    <div class="text-xs text-slate-500">{{ usuario.nombre }} {{ usuario.apellido }} · {{ usuario.region }}</div>
                  </div>
                </div>
              </div>
            </div>

              <div>
                <label class="field-label">Fecha del reporte *</label>
                <DatePicker :model-value="reporteForm.fechaReporte" @update:model-value="v => reporteForm.fechaReporte = v" placeholder="Seleccionar fecha" />
                <p class="mt-1 text-xs text-slate-400">Fecha en que se reportó la rotura del celular</p>
              </div>

            <div>
              <label class="field-label">Motivo de la rotura *</label>
              <textarea v-model="reporteForm.motivoRotura" required rows="4" class="input-danger"
                        placeholder="Describe detalladamente el motivo de la rotura (ej: Pantalla quebrada por caída, daño por agua, etc.)"></textarea>
            </div>

            <div class="flex justify-end pt-4 border-t border-slate-100">
              <button type="submit" :disabled="loadingReporte" class="btn-danger">
                <svg v-if="loadingReporte" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
                {{ loadingReporte ? 'Reportando...' : 'Reportar celular roto' }}
              </button>
            </div>
          </form>

          <!-- Resultado del reporte -->
          <div v-if="resultadoReporte" class="mt-6 p-4 rounded-xl border"
               :class="resultadoReporte.exitoReemplazo ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'">
            <div class="flex items-start gap-3">
              <svg v-if="resultadoReporte.exitoReemplazo" class="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <svg v-else class="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
              <div>
                <h3 class="text-sm font-semibold" :class="resultadoReporte.exitoReemplazo ? 'text-emerald-800' : 'text-amber-800'">
                  {{ resultadoReporte.exitoReemplazo ? 'Reemplazo exitoso' : 'Sin reemplazo automático' }}
                </h3>
                <div class="mt-1 text-sm" :class="resultadoReporte.exitoReemplazo ? 'text-emerald-700' : 'text-amber-700'">
                  <p>{{ resultadoReporte.mensaje }}</p>
                  <div v-if="resultadoReporte.celularReemplazo" class="mt-2 p-3 bg-white rounded-lg border border-slate-200">
                    <p class="font-medium text-slate-900">Celular de reemplazo asignado:</p>
                    <p class="text-slate-700">{{ resultadoReporte.celularReemplazo.marca }} {{ resultadoReporte.celularReemplazo.modelo }}</p>
                    <p class="text-xs text-slate-400">Serie: {{ resultadoReporte.celularReemplazo.numeroSerie }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      <!-- ================= MODALES ================= -->

      <!-- Modal de edición de movimiento -->
      <MovimientoEditModal
        :show="showEditMovimientoModal"
        :movimiento="selectedMovimiento"
        :loading="loadingEditMovimiento"
        :celulares="celulares"
        :usuarios="usuarios"
        @close="cerrarModalesMovimiento"
        @save="guardarEdicionMovimiento"
      />

      <!-- Confirmación: eliminar movimiento -->
      <div v-if="showDeleteMovimientoModal" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4" @click.self="cerrarModalesMovimiento">
        <div class="bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 w-full max-w-md p-6">
          <div class="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-rose-50 rounded-full">
            <svg class="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </div>
          <h3 class="text-lg font-bold text-center text-slate-900 mb-2">Eliminar movimiento</h3>
          <p class="text-sm text-slate-500 text-center mb-4">¿Estás seguro de que deseas eliminar este movimiento?</p>
          <div class="bg-slate-50 rounded-xl p-4 border border-slate-200 text-center mb-2">
            <p class="font-semibold text-slate-900 text-sm">{{ selectedMovimiento?.celular?.marca }} {{ selectedMovimiento?.celular?.modelo }}</p>
            <p class="text-xs text-slate-500 mt-0.5">Fecha: {{ selectedMovimiento?.fecha ? new Date(selectedMovimiento.fecha).toLocaleDateString() : '' }}</p>
            <p class="text-xs text-slate-500">Usuario: {{ selectedMovimiento?.usuario?.numReparto }}</p>
          </div>
          <p class="text-xs text-rose-600 text-center mb-5">Esta acción no se puede deshacer.</p>
          <div class="flex gap-3">
            <button @click="cerrarModalesMovimiento" class="btn-secondary flex-1">Cancelar</button>
            <button @click="eliminarMovimiento" class="btn-danger flex-1">Eliminar</button>
          </div>
        </div>
      </div>

      <!-- Confirmación: eliminar celular -->
      <div v-if="showDeleteModal" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4" @click.self="showDeleteModal = false; selectedCelular = null">
        <div class="bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 w-full max-w-md p-6">
          <div class="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-rose-50 rounded-full">
            <svg class="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </div>
          <h3 class="text-lg font-bold text-center text-slate-900 mb-2">Eliminar celular</h3>
          <p class="text-sm text-slate-500 text-center mb-4">¿Estás seguro de que deseas eliminar el celular?</p>
          <div class="bg-slate-50 rounded-xl p-4 border border-slate-200 text-center mb-2">
            <p class="font-semibold text-slate-900 text-sm">{{ selectedCelular?.marca }} {{ selectedCelular?.modelo }}</p>
            <p class="text-xs text-slate-500 mt-0.5">Serie: {{ selectedCelular?.numeroSerie }}</p>
          </div>
          <p class="text-xs text-rose-600 text-center mb-5">Esta acción no se puede deshacer.</p>
          <div class="flex gap-3">
            <button @click="showDeleteModal = false; selectedCelular = null" class="btn-secondary flex-1">Cancelar</button>
            <button @click="eliminarCelular" class="btn-danger flex-1">Eliminar</button>
          </div>
        </div>
      </div>

      <!-- Modal: nuevo movimiento -->
      <div v-if="showMovimientoModal" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4" @click.self="showMovimientoModal = false">
        <div class="bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
          <div class="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-bold text-slate-900">Nuevo movimiento</h2>
                <p class="text-sm text-slate-500">Registra un movimiento de celular</p>
              </div>
            </div>
            <button @click="showMovimientoModal = false" class="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="p-6">
            <MovimientoForm :celulares="celulares" :usuarios="usuarios" :loading="loadingMovimiento" @save="guardarMovimientoYCerrar" />
          </div>
        </div>
      </div>

      <!-- Modal: nuevo / editar celular -->
      <div v-if="showCelularModal" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4" @click.self="showCelularModal = false; editingCelular = null">
        <div class="bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
          <div class="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z"></path>
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-bold text-slate-900">{{ editingCelular ? 'Editar celular' : 'Nuevo celular' }}</h2>
                <p class="text-sm text-slate-500">{{ editingCelular ? 'Modifica los datos del celular' : 'Agrega un nuevo celular al inventario' }}</p>
              </div>
            </div>
            <button @click="showCelularModal = false; editingCelular = null" class="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="p-6">
            <CelularForm
              ref="celularFormRef"
              :celular="editingCelular"
              :loading="loadingCelular"
              @save="guardarCelularYCerrar"
              @cancel="showCelularModal = false; editingCelular = null"
            />
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
