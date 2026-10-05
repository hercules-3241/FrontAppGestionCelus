<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ordenReparacionService } from '@/services/ordenReparacionService.ts';
import { proveedorService } from '@/services/proveedorService.ts';
import { celularService } from '@/services/celularService.ts';
import { excelService } from '@/services/excelService.ts';
import Pagination from '@/components/Pagination.vue';
import SkeletonLoader from '@/components/SkeletonLoader.vue';

// Estado principal
const ordenes = ref([]);
// Arranca en true: la carga se dispara en onMounted, así el primer frame ya
// muestra el skeleton en vez del estado vacío.
const loading = ref(true);
const loadingItems = ref(false);
const creando = ref(false);
const agregandoItem = ref(false);
const notification = reactive({ show: false, type: 'success', message: '' });

// Proveedores y celulares para selects
const proveedores = ref([]);
const celulares = ref([]);

// Filtros
const filtroBuscar = ref('');
const filtroEstado = ref('todos'); // todos | ENVIADA | ENTREGADA | EN_REPARACION etc.
const filtroProveedor = ref('');

// Paginación
const currentPage = ref(1);
const itemsPerPage = ref(25);

// Form crear orden
const mostrandoFormulario = ref(false);
const formOrden = reactive({
  proveedorId: '',
  diagnostico: '',
  costoEstimado: '',
  fechaEstimadaEntrega: '',
  observaciones: ''
});

// Detalle de items
const ordenSeleccionada = ref(null);
const itemsOrden = ref([]);
const mostrandoItems = ref(false);

// Form item
const mostrandoModalItem = ref(false);
const formItem = reactive({
  codigoInterno: '',
  motivoReparacion: '',
  observaciones: '',
  costoReparacion: '',
  modelo: '',
  marca: ''
});

// Variables para autocompletado de celulares
const celularesSugeridos = ref([]);
const mostrandoSugerencias = ref(false);
const buscandoCelulares = ref(false);

const showNotification = (message, type = 'success') => {
  notification.message = message;
  notification.type = type;
  notification.show = true;
  setTimeout(() => notification.show = false, 3500);
};

// Cargar datos base
const cargarDatos = async () => {
  try {
    loading.value = true;
    const [ord, provs, cels] = await Promise.all([
      ordenReparacionService.obtenerTodas(),
      proveedorService.obtenerTodos(),
      celularService.obtenerTodos()
    ]);
    ordenes.value = ord;
    proveedores.value = provs;
    celulares.value = (cels?.data) ? cels.data : cels; // fallback si servicio devuelve .data
  } catch (e) {
    showNotification(e.message || 'Error al cargar datos', 'error');
  } finally {
    loading.value = false;
  }
};

// Crear orden
const crearOrden = async () => {
  try {
    if (!formOrden.proveedorId) {
      showNotification('Seleccione un proveedor', 'error');
      return;
    }
    creando.value = true;
    const payload = {
      proveedorId: Number(formOrden.proveedorId),
      diagnostico: formOrden.diagnostico?.trim() || undefined,
      costoEstimado: formOrden.costoEstimado ? Number(formOrden.costoEstimado) : undefined,
      fechaEstimadaEntrega: formOrden.fechaEstimadaEntrega ? new Date(formOrden.fechaEstimadaEntrega).toISOString() : undefined,
      observaciones: formOrden.observaciones?.trim() || undefined
    };
    console.log('Enviando orden:', payload);
    await ordenReparacionService.crear(payload);
    showNotification('Orden creada');
    resetFormOrden();
    mostrandoFormulario.value = false;
    await cargarDatos();
  } catch (e) {
    console.error('Error completo crear orden:', e);
    showNotification(e.message || 'Error al crear orden', 'error');
  } finally {
    creando.value = false;
  }
};

const resetFormOrden = () => {
  formOrden.proveedorId = '';
  formOrden.diagnostico = '';
  formOrden.costoEstimado = '';
  formOrden.fechaEstimadaEntrega = '';
  formOrden.observaciones = '';
};

// Ver items de orden
const verItems = async (orden) => {
  try {
    mostrandoItems.value = true;
    ordenSeleccionada.value = orden;
    loadingItems.value = true;
    itemsOrden.value = await ordenReparacionService.obtenerItems(orden.id);
  } catch (e) {
    showNotification(e.message || 'Error al cargar items', 'error');
  } finally {
    loadingItems.value = false;
  }
};

// Agregar item
const abrirModalItem = () => {
  formItem.codigoInterno = '';
  formItem.motivoReparacion = '';
  formItem.observaciones = '';
  formItem.costoReparacion = '';
  formItem.modelo = '';
  formItem.marca = '';
  mostrandoModalItem.value = true;
};

const guardarItem = async () => {
  try {
    console.log('=== INICIANDO GUARDAR ITEM ===');
    console.log('FormItem valores:', formItem);
    
    if (!formItem.codigoInterno || !formItem.motivoReparacion.trim() || !formItem.modelo.trim() || !formItem.marca.trim()) {
      console.log('Validación falló - campos faltantes');
      showNotification('Complete los campos obligatorios', 'error');
      return;
    }
    
    console.log('Validación pasó, creando payload...');
    agregandoItem.value = true;
    
    const payload = {
      codigoInterno: formItem.codigoInterno.trim(),
      motivoReparacion: formItem.motivoReparacion.trim(),
      observaciones: formItem.observaciones?.trim() || "",
      costoReparacion: Number(formItem.costoReparacion) || 0,
      modelo: formItem.modelo.trim(),
      marca: formItem.marca.trim()
    };
    
    console.log('Payload creado:', payload);
    console.log('Orden seleccionada:', ordenSeleccionada.value);
    console.log('Orden ID:', ordenSeleccionada.value?.id);
    
    await ordenReparacionService.agregarItem(ordenSeleccionada.value.id, payload);
    showNotification('Item agregado');
    mostrandoModalItem.value = false;
    itemsOrden.value = await ordenReparacionService.obtenerItems(ordenSeleccionada.value.id);
  } catch (e) {
    console.error('Error completo:', e);
    showNotification(e.message || 'Error al agregar item', 'error');
  } finally {
    agregandoItem.value = false;
  }
};

// Eliminar item
const eliminarItem = async (item) => {
  if (!confirm('¿Eliminar item?')) return;
  try {
    await ordenReparacionService.eliminarItem(item.id);
    showNotification('Item eliminado');
    itemsOrden.value = await ordenReparacionService.obtenerItems(ordenSeleccionada.value.id);
  } catch (e) {
    showNotification(e.message || 'Error al eliminar item', 'error');
  }
};

// Filtrado
const ordenesFiltradas = computed(() => {
  return ordenes.value.filter(o => {
    if (filtroBuscar.value) {
      const b = filtroBuscar.value.toLowerCase();
      const texto = `${o.numeroOrden||''} ${o.diagnostico||''} ${o.proveedor?.nombre||''}`.toLowerCase();
      if (!texto.includes(b)) return false;
    }
    if (filtroEstado.value !== 'todos' && o.estado !== filtroEstado.value) return false;
    if (filtroProveedor.value && String(o.proveedor?.id) !== filtroProveedor.value) return false;
    return true;
  });
});

// Paginación
const ordenesPaginadas = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return ordenesFiltradas.value.slice(start, start + itemsPerPage.value);
});
const onPageChanged = (p)=> currentPage.value = p;
const onItemsPerPageChanged = (ipp)=> { itemsPerPage.value = ipp; currentPage.value = 1; };

// Utilidades
const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '-';
const formatDateTime = (d) => d ? new Date(d).toLocaleString() : '-';
const formatMoney = (n) => (n === null || n === undefined) ? '-' : new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS'}).format(n);
const calcularTotalItems = (items) => {
  if (!Array.isArray(items)) return 0;
  return items.reduce((acc,it)=> acc + (it.costoReparacion || 0),0);
};

const calcularTotalOrden = (orden) => {
  if (!orden) return 0;
  return calcularTotalItems(orden.reparacionItems || []);
};

// Exportar
const exportando = ref(false);
const exportarOrdenes = async () => {
  try {
    exportando.value = true;
    // Forzar carga de items por cada orden si no vienen (simple, secuencial)
    const ordenesConItems = [];
    for (const o of ordenesFiltradas.value) {
      let items = o.reparacionItems;
      if (!items || items.length === 0) {
        try { items = await ordenReparacionService.obtenerItems(o.id); } catch { items = []; }
      }
      ordenesConItems.push({ ...o, reparacionItems: items });
    }
    excelService.exportarOrdenesReparacion(ordenesConItems);
    showNotification('Exportación lista');
  } catch (e) {
    showNotification('Error al exportar', 'error');
  } finally {
    exportando.value = false;
  }
};

// Cambiar estado de orden
const estados = ['PENDIENTE', 'ENVIADA', 'REPARANDO', 'REPARADA'];
const cambiarEstado = async (orden, nuevoEstado) => {
  try {
    if (!confirm(`¿Cambiar estado de la orden ${orden.numeroOrden} a ${nuevoEstado}?`)) {
      return;
    }
    await ordenReparacionService.cambiarEstado(orden.id, nuevoEstado);
    showNotification(`Estado cambiado a ${nuevoEstado}`);
    await cargarDatos(); // Recargar datos para ver el cambio
  } catch (e) {
    showNotification(e.message || 'Error al cambiar estado', 'error');
  }
};

onMounted(() => cargarDatos());
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-red-50 py-8">
    <div class="w-full px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="relative mb-8 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 rounded-3xl p-8 text-white shadow-2xl overflow-hidden">
        <div class="absolute inset-0 bg-black/10"></div>
        <div class="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-white/10 rounded-full"></div>
        <div class="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-white/5 rounded-full"></div>
        <div class="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="p-3 sm:p-4 bg-white/20 backdrop-blur-lg rounded-2xl flex-shrink-0">
              <svg class="w-8 h-8 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-6l3-3 3 3v6m5 4H4"/></svg>
            </div>
            <div class="flex-1">
              <h1 class="text-2xl sm:text-4xl lg:text-5xl font-bold mb-2">Órdenes de Reparación</h1>
              <p class="text-red-100 text-sm sm:text-lg">Gestiona y supervisa las reparaciones de equipos</p>
            </div>
          </div>
          <button @click="mostrandoFormulario = !mostrandoFormulario" class="group relative bg-white/20 backdrop-blur-lg text-white px-4 sm:px-6 py-2 sm:py-3 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3 border border-white/20 whitespace-nowrap">
            <svg class="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            <span class="hidden sm:inline">{{ mostrandoFormulario ? 'Ocultar Formulario' : 'Nueva Orden' }}</span>
            <span class="sm:hidden">{{ mostrandoFormulario ? 'Ocultar' : 'Nueva' }}</span>
          </button>
        </div>
      </div>

      <!-- Notificación -->
      <div v-if="notification.show" :class="['mb-8 p-4 rounded-2xl flex items-center justify-between shadow-xl', notification.type==='success' ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' : 'bg-gradient-to-r from-red-400 to-pink-500 text-white']">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-white/20 rounded-xl">
            <svg v-if="notification.type==='success'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <span class="font-medium">{{ notification.message }}</span>
        </div>
        <button @click="notification.show=false" class="p-2 hover:bg-white/20 rounded-xl transition-colors"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
      </div>

      <!-- Formulario nueva orden -->
      <div v-if="mostrandoFormulario" class="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 mb-8">
        <div class="flex items-center gap-4 mb-6">
          <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl"><svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v12m6-6H6"/></svg></div>
          <h2 class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Nueva Orden</h2>
        </div>
        <form @submit.prevent="crearOrden" class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">Proveedor</label>
            <select v-model="formOrden.proveedorId" class="w-full bg-white/70 border border-gray-200/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all" required>
              <option value="">Seleccionar</option>
              <option v-for="p in proveedores" :key="p.id" :value="p.id">{{ p.nombre }}</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">Costo Estimado (ARS)</label>
            <input v-model="formOrden.costoEstimado" type="number" min="0" step="0.01" class="w-full bg-white/70 border border-gray-200/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all" placeholder="0" />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">Fecha Estimada Entrega</label>
            <input v-model="formOrden.fechaEstimadaEntrega" type="datetime-local" class="w-full bg-white/70 border border-gray-200/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all" />
          </div>
          <div class="space-y-2 md:col-span-3">
            <label class="block text-sm font-semibold text-gray-700">Diagnóstico</label>
            <input v-model="formOrden.diagnostico" type="text" class="w-full bg-white/70 border border-gray-200/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all" placeholder="Descripción del problema" />
          </div>
          <div class="space-y-2 md:col-span-3">
            <label class="block text-sm font-semibold text-gray-700">Observaciones</label>
            <textarea v-model="formOrden.observaciones" rows="2" class="w-full bg-white/70 border border-gray-200/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none" placeholder="Notas adicionales..." />
          </div>
          <div class="md:col-span-3 flex justify-end mt-2">
            <button type="button" @click="resetFormOrden" class="mr-3 px-6 py-3 rounded-xl font-semibold text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all">Reset</button>
            <button type="submit" :disabled="creando" class="group bg-gradient-to-r from-red-600 to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3">
              <svg class="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
              {{ creando ? 'Creando...' : 'Crear Orden' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Filtros -->
      <div class="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
          <div class="md:col-span-2">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Buscar</label>
            <input v-model="filtroBuscar" type="text" placeholder="Orden, diagnóstico, modelo..." class="w-full bg-white/70 border border-gray-200/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder-gray-400" />
          </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
              <select v-model="filtroEstado" class="w-full bg-white/70 border border-gray-200/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all">
                <option value="todos">Todos</option>
                <option value="ENVIADA">ENVIADA</option>
                <option value="EN_REPARACION">EN_REPARACION</option>
                <option value="ENTREGADA">ENTREGADA</option>
              </select>
            </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Proveedor</label>
            <select v-model="filtroProveedor" class="w-full bg-white/70 border border-gray-200/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all">
              <option value="">Todos</option>
              <option v-for="p in proveedores" :key="p.id" :value="p.id">{{ p.nombre }}</option>
            </select>
          </div>
          <div class="md:ml-auto flex items-center text-sm font-medium text-gray-600 bg-gray-100/70 px-4 py-2 rounded-xl h-min mt-2 md:mt-0">
            Total: {{ ordenesFiltradas.length }}
          </div>
        </div>
      </div>

      <!-- Tabla -->
      <div class="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl"><svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-6l3-3 3 3v6m5 4H4"/></svg></div>
            <h2 class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Listado de Órdenes</h2>
          </div>
          <div class="flex items-center gap-3">
            <button @click="exportarOrdenes" :disabled="exportando || ordenesFiltradas.length===0" class="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
              <svg v-if="!exportando" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M8 12l4 4m0 0l4-4m-4 4V4"/></svg>
              <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke-width="4"></circle><path class="opacity-75" stroke-width="4" d="M4 12a8 8 0 018-8"/></svg>
              <span>{{ exportando ? 'Exportando...' : 'Exportar' }}</span>
            </button>
          </div>
        </div>
        <SkeletonLoader v-if="loading" variant="table" :rows="8" :cols="9"
                        :ratios="[1.3, 1.4, 1.2, 1.4, 2, 1.2, 1.2, 1.6, 1.4]" label="Cargando órdenes…" />
        <div v-else-if="ordenesFiltradas.length === 0" class="text-center py-12"><div class="flex flex-col items-center gap-4"><div class="p-4 bg-gray-100 rounded-2xl"><svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-6l3-3 3 3v6m5 4H4"/></svg></div><p class="text-gray-500 text-lg">No hay órdenes</p></div></div>
        <div v-else class="space-y-4">
          <div class="hidden xl:block overflow-x-auto rounded-2xl border border-gray-200/50 shadow-xl">
            <table class="w-full divide-y divide-gray-200/50" style="min-width:1400px;">
              <thead class="bg-gradient-to-r from-red-500 via-orange-500 to-amber-500">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[130px]">Orden</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[140px]">Creación</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[120px]">Items</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[140px]">Proveedor</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[200px]">Diagnóstico</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[120px]">Total</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[120px]">Estado</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[160px]">Entrega Est.</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[140px]">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white/90 divide-y divide-gray-200/50">
                <tr v-for="o in ordenesPaginadas" :key="o.id" class="hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-200">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-semibold text-gray-900">{{ o.numeroOrden || ('#'+o.id) }}</div>
                    <div class="text-xs text-gray-500" v-if="o.observaciones">{{ o.observaciones.substring(0,28) }}<span v-if="o.observaciones.length>28">…</span></div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ formatDate(o.fechaCreacion) }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ (o.reparacionItems?.length)||0 }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ o.proveedor?.nombre }}</div>
                    <div class="text-xs text-gray-500">{{ o.proveedor?.telefono }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-xs text-gray-700 max-w-[180px] line-clamp-2">{{ o.diagnostico }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ formatMoney(calcularTotalOrden(o)) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="['inline-flex px-3 py-1 text-xs font-medium rounded-full shadow-lg',
                      o.estado==='PENDIENTE' ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white' :
                      o.estado==='ENVIADA' ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white' :
                      o.estado==='REPARANDO' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
                      o.estado==='REPARADA' ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white']">{{ o.estado || 'SIN_ESTADO' }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ formatDate(o.fechaEstimadaEntrega) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <button @click="verItems(o)" class="p-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all" title="Ver items">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      </button>
                      <select @change="cambiarEstado(o, $event.target.value)" :value="o.estado" class="text-xs px-2 py-1 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                        <option v-for="estado in estados" :key="estado" :value="estado">{{ estado }}</option>
                      </select>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile cards -->
          <div class="xl:hidden space-y-4">
            <div v-for="o in ordenesPaginadas" :key="o.id" class="bg-white/90 rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="font-bold text-gray-900 text-lg">{{ o.numeroOrden || ('#'+o.id) }}</h3>
                  <p class="text-xs text-gray-500">Items: {{ (o.reparacionItems?.length)||0 }}</p>
                </div>
                <span :class="['inline-flex px-3 py-1 text-xs font-medium rounded-full',
                  o.estado==='PENDIENTE' ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white' :
                  o.estado==='ENVIADA' ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white' :
                  o.estado==='REPARANDO' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
                  o.estado==='REPARADA' ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white']">{{ o.estado || 'SIN_ESTADO' }}</span>
              </div>
              <div class="text-sm text-gray-700 mb-3 line-clamp-2">{{ o.diagnostico }}</div>
              <div class="text-xs text-gray-500 mb-4 flex flex-wrap gap-3">
                <span>Creada: {{ formatDate(o.fechaCreacion) }}</span>
                <span>Est. Entrega: {{ formatDate(o.fechaEstimadaEntrega) }}</span>
                <span>Total: {{ formatMoney(calcularTotalOrden(o)) }}</span>
              </div>
              <div class="flex items-center gap-3 pt-3 border-t border-gray-200">
                <button @click="verItems(o)" class="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-2 px-4 rounded-xl font-semibold text-sm shadow-lg">Items</button>
                <select @change="cambiarEstado(o, $event.target.value)" :value="o.estado" class="px-3 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm">
                  <option v-for="estado in estados" :key="estado" :value="estado">{{ estado }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Paginación -->
      <Pagination :current-page="currentPage" :total-records="ordenesFiltradas.length" :items-per-page="itemsPerPage" @page-changed="onPageChanged" @items-per-page-changed="onItemsPerPageChanged" />
    </div>

    <!-- Panel lateral de items -->
    <div v-if="mostrandoItems" class="fixed inset-0 z-50 flex">
      <div class="flex-1 bg-black/40 backdrop-blur-sm" @click="mostrandoItems=false; ordenSeleccionada=null; itemsOrden=[]"></div>
      <div class="w-full sm:w-[540px] max-w-full h-full bg-white shadow-2xl flex flex-col">
        <div class="px-6 py-5 border-b flex items-start justify-between bg-gradient-to-r from-orange-600 to-red-600 text-white">
          <div>
            <h3 class="text-xl font-bold flex items-center gap-2">Items de {{ ordenSeleccionada?.numeroOrden || ('#'+ordenSeleccionada?.id) }}</h3>
            <p class="text-xs text-orange-100">Diagnóstico: {{ ordenSeleccionada?.diagnostico }}</p>
          </div>
          <button @click="mostrandoItems=false; ordenSeleccionada=null; itemsOrden=[]" class="p-2 hover:bg-white/20 rounded-xl"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
        </div>
        <div class="p-6 flex-1 overflow-y-auto space-y-4">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-sm font-semibold text-gray-700">Listado ({{ itemsOrden.length }})</h4>
            <button @click="abrirModalItem" class="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow hover:shadow-lg">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v12m6-6H6"/></svg>
              Agregar
            </button>
          </div>
          <div v-if="loadingItems" class="py-8 text-center text-gray-500">Cargando items...</div>
          <div v-else-if="itemsOrden.length===0" class="py-8 text-center text-gray-400 text-sm">Sin items</div>
          <div v-else class="space-y-4">
    <div v-for="it in itemsOrden" :key="it.id" class="p-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow transition-all">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="font-semibold text-gray-800 text-sm">{{ it.motivoReparacion }}</p>
                  <p class="text-xs text-gray-500" v-if="it.celular">Serie: {{ it.celular.numeroSerie }} · {{ it.celular.marca }} {{ it.celular.modelo }}</p>
                  <p class="text-xs text-gray-500">Costo: {{ formatMoney(it.costoReparacion) }}</p>
                  <p v-if="it.observaciones" class="mt-1 text-xs text-gray-600">{{ it.observaciones }}</p>
                </div>
                <button @click="eliminarItem(it)" class="p-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:shadow-md" title="Eliminar"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
              </div>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 border-t bg-gray-50 flex items-center justify-between text-xs text-gray-600">
          <div>Creación: {{ formatDateTime(ordenSeleccionada?.fechaCreacion) }}</div>
          <div>Entrega Est.: {{ formatDate(ordenSeleccionada?.fechaEstimadaEntrega) }}</div>
        </div>
      </div>
    </div>

    <!-- Modal agregar item -->
    <div v-if="mostrandoModalItem" class="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="mostrandoModalItem=false"></div>
      <div class="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-white/30 p-8">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Nuevo Item</h3>
          <button @click="mostrandoModalItem=false" class="p-2 hover:bg-gray-100 rounded-xl"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
        </div>
        <form @submit.prevent="guardarItem" class="grid grid-cols-1 gap-6">
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">Código Interno del Celular</label>
            <input v-model="formItem.codigoInterno" type="text" required class="w-full bg-white/70 border border-gray-200/60 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder-gray-400" placeholder="Ejemplo: CEL-014, CEL-015..." />
            <p class="text-xs text-gray-500">Ingrese el código interno del celular</p>
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">Marca</label>
            <input v-model="formItem.marca" type="text" required class="w-full bg-white/70 border border-gray-200/60 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder-gray-400" placeholder="Apple, Samsung, Xiaomi..." />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">Modelo</label>
            <input v-model="formItem.modelo" type="text" required class="w-full bg-white/70 border border-gray-200/60 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder-gray-400" placeholder="iPhone 12, Galaxy S21..." />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">Motivo de Reparación</label>
            <input v-model="formItem.motivoReparacion" type="text" required class="w-full bg-white/70 border border-gray-200/60 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder-gray-400" placeholder="Pantalla rota, batería agotada, etc." />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">Observaciones</label>
            <textarea v-model="formItem.observaciones" class="w-full bg-white/70 border border-gray-200/60 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder-gray-400" placeholder="Observaciones adicionales..." rows="3"></textarea>
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">Costo de Reparación</label>
            <input v-model="formItem.costoReparacion" type="number" min="0" step="0.01" required class="w-full bg-white/70 border border-gray-200/60 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all" placeholder="0" />
          </div>
          <div class="flex justify-end">
            <button type="button" @click="mostrandoModalItem=false" class="mr-3 px-6 py-3 rounded-xl font-semibold text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all">Cancelar</button>
            <button type="submit" :disabled="agregandoItem" class="group bg-gradient-to-r from-orange-600 to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              {{ agregandoItem ? 'Guardando...' : 'Agregar Item' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* utilidades extra si fueran necesarias */
</style>
