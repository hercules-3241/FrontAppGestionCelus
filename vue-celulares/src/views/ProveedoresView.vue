<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { proveedorService } from '@/services/proveedorService.ts';
import Pagination from '@/components/Pagination.vue';
import SkeletonLoader from '@/components/SkeletonLoader.vue';

// Estado principal
const proveedores = ref([]);
// Arranca en true: la carga se dispara en onMounted, así el primer frame ya
// muestra el skeleton en vez del estado vacío.
const loading = ref(true);
const notification = reactive({ show: false, type: 'success', message: '' });

// Formulario
const mostrandoFormulario = ref(false);
const isEditing = ref(false);
const proveedorEditando = ref(null);
const form = reactive({
  nombre: '',
  telefono: '',
  email: '',
  direccion: '',
  tiempoEstimadoDias: 0,
  observaciones: '',
  activo: true
});

// Filtros
const filtroBuscar = ref('');
const filtroActivo = ref('todos'); // todos | activos | inactivos

// Paginación
const currentPage = ref(1);
const itemsPerPage = ref(25);

// Métodos UI
const showNotification = (message, type = 'success') => {
  notification.message = message;
  notification.type = type;
  notification.show = true;
  setTimeout(() => notification.show = false, 3000);
};

const resetForm = () => {
  form.nombre = '';
  form.telefono = '';
  form.email = '';
  form.direccion = '';
  form.tiempoEstimadoDias = 0;
  form.observaciones = '';
  form.activo = true;
  isEditing.value = false;
  proveedorEditando.value = null;
};

const toggleFormulario = () => {
  if (mostrandoFormulario.value && isEditing.value) {
    // Si se cierra mientras edita, resetear
    resetForm();
  }
  mostrandoFormulario.value = !mostrandoFormulario.value;
};

// Carga de datos
const cargarProveedores = async () => {
  try {
    loading.value = true;
    proveedores.value = await proveedorService.obtenerTodos();
  } catch (error) {
    console.error('Error cargarProveedores:', error);
    proveedores.value = []; // Asegurar que siempre sea array
    showNotification(error.message || 'Error al cargar proveedores', 'error');
  } finally {
    loading.value = false;
  }
};

// Guardar (crear/editar)
const guardarProveedor = async () => {
  try {
    // Validaciones simples
    if (!form.nombre.trim()) {
      showNotification('El nombre es obligatorio', 'error');
      return;
    }
    if (!form.telefono.trim()) {
      showNotification('El teléfono es obligatorio', 'error');
      return;
    }
    if (!form.email.trim()) {
      showNotification('El email es obligatorio', 'error');
      return;
    }
    const payload = {
      nombre: form.nombre.trim(),
      telefono: form.telefono.trim(),
      email: form.email.trim(),
      direccion: form.direccion.trim(),
      tiempoEstimadoDias: Number(form.tiempoEstimadoDias) || 0,
      observaciones: form.observaciones?.trim() || ''
    };

    if (isEditing.value && proveedorEditando.value) {
      await proveedorService.actualizar(proveedorEditando.value.id, payload);
      showNotification('Proveedor actualizado');
    } else {
      await proveedorService.crear(payload);
      showNotification('Proveedor creado');
    }
    await cargarProveedores();
    resetForm();
    mostrandoFormulario.value = false;
  } catch (error) {
    showNotification(error.message || 'Error al guardar proveedor', 'error');
  }
};

// Editar
const editarProveedor = (prov) => {
  mostrandoFormulario.value = true;
  isEditing.value = true;
  proveedorEditando.value = prov;
  form.nombre = prov.nombre;
  form.telefono = prov.telefono;
  form.email = prov.email;
  form.direccion = prov.direccion;
  form.tiempoEstimadoDias = prov.tiempoEstimadoDias;
  form.observaciones = prov.observaciones || '';
  form.activo = prov.activo !== false;
};

// Eliminar
const eliminando = ref(false);
const eliminarProveedor = async (prov) => {
  if (!confirm(`¿Eliminar proveedor "${prov.nombre}"?`)) return;
  try {
    eliminando.value = true;
    await proveedorService.eliminar(prov.id);
    showNotification('Proveedor eliminado');
    await cargarProveedores();
  } catch (error) {
    showNotification(error.message || 'Error al eliminar proveedor', 'error');
  } finally {
    eliminando.value = false;
  }
};

// Activar / Desactivar
const toggleActivo = async (prov) => {
  try {
    await proveedorService.toggleActivo(prov.id, !prov.activo);
    showNotification(`Proveedor ${prov.activo ? 'desactivado' : 'activado'}`);
    await cargarProveedores();
  } catch (error) {
    showNotification(error.message || 'Error al cambiar estado', 'error');
  }
};

// Computed filtrados
const proveedoresFiltrados = computed(() => {
  if (!Array.isArray(proveedores.value)) return [];
  return proveedores.value.filter(p => {
    if (filtroBuscar.value) {
      const busq = filtroBuscar.value.toLowerCase();
      const texto = `${p.nombre} ${p.telefono} ${p.email}`.toLowerCase();
      if (!texto.includes(busq)) return false;
    }
    if (filtroActivo.value === 'activos' && !p.activo) return false;
    if (filtroActivo.value === 'inactivos' && p.activo) return false;
    return true;
  });
});

// Paginación
const proveedoresPaginados = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return proveedoresFiltrados.value.slice(start, end);
});

const onPageChanged = (p) => currentPage.value = p;
const onItemsPerPageChanged = (ipp) => { itemsPerPage.value = ipp; currentPage.value = 1; };

// Lifecycle
onMounted(() => cargarProveedores());
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-fuchsia-50 via-purple-50 to-blue-50 py-8">
    <div class="w-full px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="relative mb-8 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl overflow-hidden">
        <div class="absolute inset-0 bg-black opacity-10"></div>
        <div class="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-white opacity-10 rounded-full"></div>
        <div class="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-white opacity-5 rounded-full"></div>
        <div class="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="p-3 sm:p-4 bg-white/20 backdrop-blur-lg rounded-2xl flex-shrink-0">
              <svg class="w-8 h-8 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h6l7 10h5M3 7l4 12h12" />
              </svg>
            </div>
            <div class="flex-1">
              <h1 class="text-2xl sm:text-4xl lg:text-5xl font-bold mb-2">Gestión de Proveedores</h1>
              <p class="text-fuchsia-100 text-sm sm:text-lg">Administra los proveedores y tiempos de reparación</p>
            </div>
          </div>
          <button @click="toggleFormulario" class="group relative bg-white/20 backdrop-blur-lg text-white px-4 sm:px-6 py-2 sm:py-3 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3 border border-white/20 whitespace-nowrap">
            <svg class="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span class="hidden sm:inline">{{ mostrandoFormulario ? (isEditing ? 'Cancelar Edición' : 'Ocultar Formulario') : 'Nuevo Proveedor' }}</span>
            <span class="sm:hidden">{{ mostrandoFormulario ? 'Cancelar' : 'Nuevo' }}</span>
          </button>
        </div>
      </div>

      <!-- Notificación -->
      <div v-if="notification.show" :class="['mb-8 p-4 rounded-2xl flex items-center justify-between shadow-xl transition-all', notification.type === 'success' ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' : 'bg-gradient-to-r from-red-400 to-pink-500 text-white']">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-white/20 rounded-xl">
            <svg v-if="notification.type==='success'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <span class="font-medium">{{ notification.message }}</span>
        </div>
        <button @click="notification.show=false" class="p-2 hover:bg-white/20 rounded-xl transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Formulario -->
      <div v-if="mostrandoFormulario" class="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 mb-8">
        <div class="flex items-center gap-4 mb-6">
          <div class="p-3 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-2xl">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
          </div>
          <h2 class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{{ isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor' }}</h2>
        </div>
        <form @submit.prevent="guardarProveedor" class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="space-y-2 md:col-span-1">
            <label class="block text-sm font-semibold text-gray-700">Nombre</label>
            <input v-model="form.nombre" type="text" class="w-full bg-white/70 border border-gray-200/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 transition-all" placeholder="Nombre del proveedor" required />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">Teléfono</label>
            <input v-model="form.telefono" type="text" class="w-full bg-white/70 border border-gray-200/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 transition-all" placeholder="Teléfono" required />
          </div>
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-gray-700">Email</label>
              <input v-model="form.email" type="email" class="w-full bg-white/70 border border-gray-200/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 transition-all" placeholder="Email" required />
            </div>
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">Dirección</label>
            <input v-model="form.direccion" type="text" class="w-full bg-white/70 border border-gray-200/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 transition-all" placeholder="Dirección" />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">Tiempo Estimado (días)</label>
            <input v-model="form.tiempoEstimadoDias" type="number" min="0" class="w-full bg-white/70 border border-gray-200/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 transition-all" placeholder="0" />
          </div>
          <div class="space-y-2 md:col-span-1">
            <label class="block text-sm font-semibold text-gray-700">Observaciones</label>
            <textarea v-model="form.observaciones" rows="1" class="w-full bg-white/70 border border-gray-200/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 transition-all resize-none" placeholder="Notas opcionales..."></textarea>
          </div>
          <div class="flex items-center gap-3 md:col-span-1">
            <input id="activo" type="checkbox" v-model="form.activo" class="h-5 w-5 text-fuchsia-600 border-gray-300 rounded focus:ring-fuchsia-500" disabled />
            <label for="activo" class="text-sm font-semibold text-gray-700 select-none">Activo al crear (siempre)</label>
          </div>
          <div class="md:col-span-3 flex justify-end items-center mt-2">
            <button type="button" @click="resetForm" v-if="isEditing" class="mr-3 px-6 py-3 rounded-xl font-semibold text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all">Reset</button>
            <button type="submit" class="group bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3">
              <svg class="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
              {{ isEditing ? 'Actualizar' : 'Crear Proveedor' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Filtros -->
      <div class="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 mb-8">
        <div class="flex flex-col md:flex-row md:items-end gap-6">
          <div class="flex-1">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Buscar</label>
            <input v-model="filtroBuscar" type="text" placeholder="Nombre, teléfono o email" class="w-full bg-white/70 border border-gray-200/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder-gray-400" />
          </div>
          <div class="w-full md:w-52">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
            <select v-model="filtroActivo" class="w-full bg-white/70 border border-gray-200/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all">
              <option value="todos">Todos</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
          </div>
          <div class="md:ml-auto flex items-center text-sm font-medium text-gray-600 bg-gray-100/70 px-4 py-2 rounded-xl h-min mt-2 md:mt-0">
            Total: {{ proveedoresFiltrados.length }}
          </div>
        </div>
      </div>

      <!-- Tabla -->
      <div class="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-2xl">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h6l7 10h5M3 7l4 12h12"/></svg>
            </div>
            <h2 class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Listado de Proveedores</h2>
          </div>
        </div>

        <SkeletonLoader v-if="loading" variant="table" :rows="8" :cols="7"
                        :ratios="[1.6, 1.4, 1, 0.8, 1.2, 2, 1.2]" label="Cargando proveedores…" />
        <div v-else-if="proveedoresFiltrados.length === 0" class="text-center py-12">
          <div class="flex flex-col items-center gap-4">
            <div class="p-4 bg-gray-100 rounded-2xl">
              <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h6l7 10h5M3 7l4 12h12"/></svg>
            </div>
            <p class="text-gray-500 text-lg">No hay proveedores</p>
          </div>
        </div>
        <div v-else class="space-y-4">
          <div class="hidden lg:block overflow-x-auto rounded-2xl border border-gray-200/50 shadow-xl">
            <table class="w-full divide-y divide-gray-200/50" style="min-width: 1200px;">
              <thead class="bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[160px]">Nombre</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[160px]">Contacto</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[120px]">Tiempo (días)</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[120px]">Activo</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[160px]">Creación</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[240px]">Observaciones</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[150px]">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white/90 divide-y divide-gray-200/50">
                <tr v-for="p in proveedoresPaginados" :key="p.id" class="hover:bg-gradient-to-r hover:from-fuchsia-50 hover:to-purple-50 transition-all duration-200">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-3">
                      <div class="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span class="text-sm font-bold text-white">{{ p.nombre.substring(0,2).toUpperCase() }}</span>
                      </div>
                      <div>
                        <div class="text-sm font-semibold text-gray-900">{{ p.nombre }}</div>
                        <div class="text-xs text-gray-500" v-if="p.direccion">{{ p.direccion }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ p.telefono }}</div>
                    <div class="text-xs text-gray-500">{{ p.email }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-sm font-medium text-gray-900">{{ p.tiempoEstimadoDias || 0 }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="['inline-flex px-3 py-1 text-xs font-medium rounded-full shadow-lg', p.activo ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white']">{{ p.activo ? 'Activo' : 'Inactivo' }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ p.fechaCreacion ? new Date(p.fechaCreacion).toLocaleDateString() : '-' }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-xs text-gray-600 max-w-[230px] line-clamp-2" v-if="p.observaciones">{{ p.observaciones }}</div>
                    <div v-else class="text-xs text-gray-400 italic">Sin observaciones</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <button @click="editarProveedor(p)" class="p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all" title="Editar">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button @click="toggleActivo(p)" class="p-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all" :title="p.activo ? 'Desactivar' : 'Activar'">
                        <svg v-if="p.activo" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6"/></svg>
                        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v12m6-6H6"/></svg>
                      </button>
                      <button @click="eliminarProveedor(p)" class="p-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all" title="Eliminar">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile cards -->
          <div class="lg:hidden space-y-4">
            <div v-for="p in proveedoresPaginados" :key="p.id" class="bg-white/90 rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all">
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span class="text-sm font-bold text-white">{{ p.nombre.substring(0,2).toUpperCase() }}</span>
                  </div>
                  <div>
                    <h3 class="font-bold text-gray-900 text-lg">{{ p.nombre }}</h3>
                    <p class="text-xs text-gray-500" v-if="p.direccion">{{ p.direccion }}</p>
                  </div>
                </div>
                <span :class="['inline-flex px-3 py-1 text-xs font-medium rounded-full', p.activo ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white']">{{ p.activo ? 'Activo' : 'Inactivo' }}</span>
              </div>
              <div class="mb-4 text-sm">
                <div class="flex items-center gap-2 text-gray-700"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m6 4H3m6 8H3m12-4H3m15 8l-4-4m0 0l4-4m-4 4H9"/></svg>{{ p.telefono }} · {{ p.email }}</div>
                <div class="mt-1 text-xs text-gray-500">Tiempo estimado: {{ p.tiempoEstimadoDias || 0 }} días</div>
              </div>
              <div class="text-xs text-gray-600 mb-4" v-if="p.observaciones">{{ p.observaciones }}</div>
              <div v-else class="text-xs text-gray-400 italic mb-4">Sin observaciones</div>
              <div class="flex items-center gap-3 pt-3 border-t border-gray-200">
                <button @click="editarProveedor(p)" class="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-xl font-semibold text-sm shadow-lg">Editar</button>
                <button @click="toggleActivo(p)" class="p-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl shadow-lg"> <svg v-if="p.activo" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6"/></svg><svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v12m6-6H6"/></svg></button>
                <button @click="eliminarProveedor(p)" class="p-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl shadow-lg"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Paginación -->
      <Pagination :current-page="currentPage" :total-records="proveedoresFiltrados.length" :items-per-page="itemsPerPage" @page-changed="onPageChanged" @items-per-page-changed="onItemsPerPageChanged" />
    </div>
  </div>
</template>

<style scoped>
/* Utilidades adicionales (opcional) */
</style>
