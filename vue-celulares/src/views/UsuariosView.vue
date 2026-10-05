<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { usuarioService } from '@/services/usuarioService.ts';
import { celularService } from '@/services/celularService.ts';
import { movimientoService } from '@/services/movimientoService.ts';
import DataTable from '@/components/DataTable.vue';
import Modal from '@/components/Modal.vue';
import UsuarioFilters from '@/components/UsuarioFilters.vue';
import SkeletonLoader from '@/components/SkeletonLoader.vue';
import Pagination from '@/components/Pagination.vue';

// Estados reactivos
const usuarios = ref([]);
const usuariosFiltrados = ref([]);
// Arranca en true: la carga se dispara en onMounted, así el primer frame ya
// muestra el skeleton en vez del estado vacío.
const loading = ref(true);
const showModal = ref(false);
const showDeleteModal = ref(false);
const loadingDelete = ref(false);
const isEditing = ref(false);
const selectedUser = ref(null);

// Filtros
const filters = ref({});

// Paginación
const currentPage = ref(1);
const itemsPerPage = ref(25);


// Opciones para enums
const regiones = [
  'NORTE', 'SUR', 'ESTE', 'OESTE', 'NAFA', 'LA_PLATA', 'LAVAZZA', 'IMPACTO', 'PLANTA', 'SISTEMAS', 'TALLER', 'GERENCIA', 'COMERCIAL', 'RRHH', 'ADMINISTRACION', 'COMPRAS',
  'PROMOCION', 'GASTRONOMIA'
];
const zonas = [
  'CIUDADELA', 'LOMAS_DE_ZAMORA', 'LA_PLATA'
];
const cargos = [
  'REPARTIDOR', 'SUPERVISOR', 'REGIONAL', 'AYUDANTE', 'AYUDANTE_ROTATIVO', 'SUPLENTE', 'ANALISTA', 'JEFE', 'GERENTE'
];

// Formulario
const form = reactive({
  numReparto: '',
  region: '',
  zona: '',
  numeroLinea: '',
  cargo: ''
});

// Configuración de la tabla
const columns = [
  { key: 'numReparto', title: 'Num. Reparto' },
  { key: 'region', title: 'Región' },
  { key: 'zona', title: 'Zona' },
  { key: 'numeroLinea', title: 'Línea' },
  { key: 'cargo', title: 'Cargo' }
];

// Notificaciones
const notification = reactive({
  show: false,
  type: 'success', // success, error
  message: ''
});

// Computed
const modalTitle = computed(() => 
  isEditing.value ? 'Editar Usuario' : 'Crear Usuario'
);

// Métodos
const showNotification = (message, type = 'success') => {
  notification.message = message;
  notification.type = type;
  notification.show = true;
  setTimeout(() => {
    notification.show = false;
  }, 3000);
};

const resetForm = () => {
  form.numReparto = '';
  form.region = '';
  form.zona = '';
  form.numeroLinea = '';
  form.cargo = '';
};

const openCreateModal = () => {
  isEditing.value = false;
  resetForm();
  showModal.value = true;
};

const openEditModal = (usuario) => {
  console.log('✏️ Abriendo modal de edición para usuario:', usuario);
  isEditing.value = true;
  selectedUser.value = usuario;
  form.numReparto = usuario.numReparto;
  form.region = usuario.region;
  form.zona = usuario.zona;
  form.numeroLinea = usuario.numeroLinea || '';
  form.cargo = usuario.cargo || '';
  
  console.log('📝 Form después de cargar:', form);
  showModal.value = true;
};

const openDeleteModal = (usuario) => {
  selectedUser.value = usuario;
  showDeleteModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  showDeleteModal.value = false;
  selectedUser.value = null;
  resetForm();
};

const cargarUsuarios = async () => {
  try {
    loading.value = true;
    console.log('🔄 Cargando usuarios...');
    const response = await usuarioService.obtenerTodos();
    console.log('📥 Respuesta de usuarios:', response.data);
    usuarios.value = Array.isArray(response.data) ? response.data : [];
    console.log('📋 Usuarios cargados:', usuarios.value.length);
    
    // Log de algunos usuarios para ver sus datos
    if (usuarios.value.length > 0) {
      console.log('👤 Ejemplo de usuario:', usuarios.value[0]);
      // Buscar específicamente el usuario que acabamos de editar
      const usuarioEditado = usuarios.value.find(u => u.numReparto === 'Alejandro Lassalle');
      if (usuarioEditado) {
        console.log('🎯 Usuario específico (Alejandro Lassalle):', usuarioEditado);
        console.log('🏷️ Cargo del usuario editado:', usuarioEditado.cargo);
      }
    }
    
    aplicarFiltros();
  } catch (error) {
    usuarios.value = [];
    const status = error?.response?.status;
    const mensaje = status === 500 
      ? 'Error en el servidor. Verifica que el backend esté corriendo en el puerto 8080.'
      : 'Error al cargar usuarios. Verifica la conexión con el servidor.';
    showNotification(mensaje, 'error');
    console.error('❌ Error cargando usuarios:', { status, mensaje: error.message });
  } finally {
    loading.value = false;
  }
};

const aplicarFiltros = (filtrosActivos = null) => {
  console.log('🔍 Aplicando filtros:', filtrosActivos);
  console.log('👥 Usuarios disponibles:', usuarios.value?.length || 0);
  
  let resultado = [...usuarios.value];

  // Si no hay filtros activos, usar los filtros actuales del estado
  const filtros = filtrosActivos || filters.value;

  // Validar que todos los usuarios tengan las propiedades necesarias
  resultado = resultado.filter(usuario => usuario && usuario.numReparto);

  // Filtro por número de reparto
  if (filtros.numReparto) {
    resultado = resultado.filter(usuario => 
      usuario.numReparto && usuario.numReparto.toLowerCase().includes(filtros.numReparto.toLowerCase())
    );
  }

  // Filtro por línea
  if (filtros.linea) {
    resultado = resultado.filter(usuario => 
      usuario.numeroLinea && usuario.numeroLinea.toLowerCase().includes(filtros.linea.toLowerCase())
    );
  }

  // Filtro por región
  if (filtros.region) {
    resultado = resultado.filter(usuario => usuario.region === filtros.region);
  }

  // Filtro por cargo
  if (filtros.cargo) {
    if (filtros.cargo === 'SIN_CARGO') {
      resultado = resultado.filter(usuario => !usuario.cargo);
    } else {
      resultado = resultado.filter(usuario => usuario.cargo === filtros.cargo);
    }
  }

  // Ordenamiento
  switch (filtros.ordenar) {
    case 'numReparto_asc':
      resultado.sort((a, b) => {
        const numA = parseInt(a.numReparto?.match(/\d+/)?.[0] || '0') || 0;
        const numB = parseInt(b.numReparto?.match(/\d+/)?.[0] || '0') || 0;
        
        // Si ambos tienen números válidos, ordenar numéricamente
        if (numA > 0 && numB > 0) {
          return numA - numB;
        }
        
  // Si solo uno tiene número, el que tiene número va primero
  if (numA > 0 && numB === 0) return -1;
        if (numA === 0 && numB > 0) return 1;
        
        // Si ninguno tiene números, ordenar alfabéticamente
        return (a.numReparto || '').localeCompare(b.numReparto || '');
      });
      break;
    case 'numReparto_desc':
      resultado.sort((a, b) => {
        const numA = parseInt(a.numReparto?.match(/\d+/)?.[0] || '0') || 0;
        const numB = parseInt(b.numReparto?.match(/\d+/)?.[0] || '0') || 0;
        
        // Si ambos tienen números válidos, ordenar numéricamente descendente
        if (numA > 0 && numB > 0) {
          return numB - numA;
        }
        
        // Si solo uno tiene número, el que tiene número va primero
        if (numA > 0 && numB === 0) return -1;
        if (numA === 0 && numB > 0) return 1;
        
        // Si ninguno tiene números, ordenar alfabéticamente descendente
        return (b.numReparto || '').localeCompare(a.numReparto || '');
      });
      break;
    case 'region':
      resultado.sort((a, b) => (a.region || '').localeCompare(b.region || ''));
      break;
    case 'zona':
      resultado.sort((a, b) => (a.zona || '').localeCompare(b.zona || ''));
      break;
    case 'cargo':
      resultado.sort((a, b) => {
        const cargoA = a.cargo || 'ZZZ_SIN_CARGO'; // Los sin cargo van al final
        const cargoB = b.cargo || 'ZZZ_SIN_CARGO';
        return cargoA.localeCompare(cargoB);
      });
      break;
    default:
      // Ordenamiento por defecto: numReparto ascendente numéricamente, luego alfabéticamente
      resultado.sort((a, b) => {
        const numA = parseInt(a.numReparto?.match(/\d+/)?.[0] || '0') || 0;
        const numB = parseInt(b.numReparto?.match(/\d+/)?.[0] || '0') || 0;
        
        // Si ambos tienen números válidos, ordenar numéricamente
        if (numA > 0 && numB > 0) {
          return numA - numB;
        }
        
        // Si solo uno tiene número, el que tiene número va primero
        if (numA > 0 && numB === 0) return -1;
        if (numA === 0 && numB > 0) return 1;
        
        // Si ninguno tiene números (ambos son alfabéticos), ordenar alfabéticamente
        return (a.numReparto || '').localeCompare(b.numReparto || '');
      });
  }

  console.log('✅ Filtros aplicados. Resultados:', resultado.length);
  usuariosFiltrados.value = resultado;
};

// Computed para paginación
const usuariosPaginados = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return usuariosFiltrados.value.slice(start, end);
});

const guardarUsuario = async () => {
  try {
    // Debug logs
    console.log('🔄 Guardando usuario...');
    console.log('📝 Form data:', form);
    console.log('📝 Is editing:', isEditing.value);
    console.log('📝 Selected user:', selectedUser.value);
    
    // Validar que zona no esté vacía
    if (!form.zona) {
      showNotification('Debe seleccionar una zona', 'error');
      return;
    }
    
    const usuario = {
      numReparto: form.numReparto,
      region: form.region,
      zona: form.zona,
      numeroLinea: form.numeroLinea || null,
      cargo: form.cargo || null
    };

    console.log('📦 Usuario a enviar:', usuario);

    if (isEditing.value) {
      console.log('🔄 Actualizando usuario:', selectedUser.value.numReparto);
      const response = await usuarioService.actualizar(selectedUser.value.numReparto, usuario);
      console.log('✅ Respuesta de actualización:', response);
      showNotification('Usuario actualizado exitosamente');
    } else {
      console.log('➕ Creando nuevo usuario');
      console.log('🌐 URL completa:', `${window.location.origin}/api/usuarios`);
      console.log('📋 Headers que se enviarán:', {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
        'Content-Type': 'application/json'
      });
      const response = await usuarioService.crear(usuario);
      console.log('✅ Respuesta de creación:', response);
      showNotification('Usuario creado exitosamente');
    }
    
    closeModal();
    await cargarUsuarios();
  } catch (error) {
    console.error('❌ Error al guardar usuario:', error);
    console.error('❌ Error response:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Error headers:', error.response?.headers);
    console.error('❌ Request config:', error.config);
    
    let errorMessage = 'Error al guardar usuario: ';
    if (error.response?.status === 403) {
      errorMessage += 'No tienes permisos para realizar esta acción. ';
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else {
        errorMessage += 'Verifica que el backend esté corriendo y configurado correctamente para CORS.';
      }
    } else {
      errorMessage += (error.response?.data?.message || error.message);
    }
    
    showNotification(errorMessage, 'error');
  }
};

const eliminarUsuario = async () => {
  try {
    if (loadingDelete.value) return;
    loadingDelete.value = true;
    if (!selectedUser.value) {
      showNotification('No hay usuario seleccionado', 'error');
      return;
    }
    const clave = selectedUser.value.numReparto;
    if (!clave || typeof clave !== 'string') {
      console.error('[EliminarUsuario] numReparto inválido:', selectedUser.value);
      showNotification('Usuario sin número de reparto válido', 'error');
      return;
    }
    // Pre-chequeo de dependencias: celulares y movimientos
    const [celusResp, movsResp] = await Promise.allSettled([
      celularService.obtenerTodos(),
      movimientoService.obtenerTodos()
    ]);

    const celulares = celusResp.status === 'fulfilled' ? (Array.isArray(celusResp.value.data) ? celusResp.value.data : []) : [];
    const movimientos = movsResp.status === 'fulfilled' ? (Array.isArray(movsResp.value.data) ? movsResp.value.data : []) : [];
    const celularesAsociados = celulares.filter(c => c.usuario?.numReparto === clave);
    const movimientosAsociados = movimientos.filter(m => m.usuario?.numReparto === clave);

    if (celularesAsociados.length > 0 || movimientosAsociados.length > 0) {
      showNotification(
        `No se puede eliminar: tiene ${celularesAsociados.length} celular(es) y ${movimientosAsociados.length} movimiento(s) asociados`,
        'error'
      );
      loadingDelete.value = false;
      return;
    }

    console.log('[EliminarUsuario] Eliminando usuario numReparto=', clave);
    await usuarioService.eliminar(clave);
    showNotification('Usuario eliminado exitosamente');
    closeModal();
    await cargarUsuarios();
  } catch (error) {
    const status = error?.response?.status;
    const backendMsg = error?.response?.data?.message || error?.response?.data?.error;
    console.error('[EliminarUsuario] Error:', status, backendMsg || error);
    if (status === 404) {
      showNotification('Usuario no encontrado (404)', 'error');
    } else if (status === 409) {
      showNotification('No se puede eliminar: tiene dependencias (409)', 'error');
    } else if (status === 500) {
      showNotification(`Error del servidor al eliminar (500)${backendMsg ? ': ' + backendMsg : ''}`, 'error');
    } else {
      showNotification(`Error al eliminar usuario${backendMsg ? ': ' + backendMsg : ''}`, 'error');
    }
  }
  finally {
    loadingDelete.value = false;
  }
};

// Métodos de paginación
const onPageChanged = (page) => {
  currentPage.value = page;
};

const onItemsPerPageChanged = (itemsPerPageNew) => {
  itemsPerPage.value = itemsPerPageNew;
  currentPage.value = 1; // Reset to first page
};

// Lifecycle
onMounted(() => {
  cargarUsuarios();
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
    <div class="w-full px-4 sm:px-6 lg:px-8">
      <!-- Header con gradiente -->
      <div class="relative mb-8 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-8 text-white shadow-2xl overflow-hidden">
        <div class="absolute inset-0 bg-black opacity-10"></div>
        <div class="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-white opacity-10 rounded-full"></div>
        <div class="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-white opacity-5 rounded-full"></div>
        
        <div class="relative flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold mb-2">Gestión de Usuarios</h1>
            <p class="text-emerald-100 text-lg">Administra los usuarios del sistema</p>
          </div>
          <div class="flex items-center gap-4">
            <div class="p-4 bg-white/20 backdrop-blur-lg rounded-2xl">
              <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
            </div>
            <button @click="openCreateModal" 
                    class="group relative bg-white/20 backdrop-blur-lg text-white px-6 py-3 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3 border border-white/20">
              <svg class="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Nuevo Usuario
            </button>
          </div>
        </div>
      </div>

      <!-- Notificación moderna -->
      <div v-if="notification.show" 
           :class="[
             'mb-8 p-4 rounded-2xl flex items-center justify-between shadow-xl transform transition-all duration-300',
             notification.type === 'success' 
               ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' 
               : 'bg-gradient-to-r from-red-400 to-pink-500 text-white'
           ]">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-white/20 rounded-xl">
            <svg v-if="notification.type === 'success'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <span class="font-medium">{{ notification.message }}</span>
        </div>
        <button @click="notification.show = false" class="p-2 hover:bg-white/20 rounded-xl transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Componente de filtros -->
      <UsuarioFilters 
        :resultados-count="usuariosFiltrados.length"
        @filter="aplicarFiltros"
      />

      <!-- Tabla de usuarios moderna -->
      <div class="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h2 class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Lista de Usuarios</h2>
          </div>
          <div class="text-sm text-gray-600 bg-gray-100/70 px-4 py-2 rounded-xl">
            Total: {{ usuariosFiltrados.length }} / {{ usuarios.length }}
          </div>
        </div>
        
        <SkeletonLoader
          v-if="loading"
          variant="table"
          :rows="8"
          :cols="6"
          :ratios="[1.2, 1.2, 1.5, 1.5, 1.3, 1.2]"
          label="Cargando usuarios…"
        />

        <div v-else-if="usuariosFiltrados.length === 0" class="text-center py-12">
          <div class="flex flex-col items-center gap-4">
            <div class="p-4 bg-gray-100 rounded-2xl">
              <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
            </div>
            <p class="text-gray-500 text-lg">
              {{ usuarios.length === 0 ? 'No hay usuarios registrados' : 'No se encontraron usuarios con los filtros aplicados' }}
            </p>
          </div>
        </div>
        
        <div v-else class="space-y-4">
          <!-- Vista escritorio - Tabla -->
          <div class="hidden lg:block overflow-x-auto rounded-2xl border border-gray-200/50 shadow-xl">
            <table class="w-full divide-y divide-gray-200/50" style="min-width: 800px;">
              <thead class="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[120px]">Num. Reparto</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[120px]">Región</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[150px]">Zona</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[150px]">Línea</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[130px]">Cargo</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[120px]">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white/90 backdrop-blur-sm divide-y divide-gray-200/50">
                <tr v-for="usuario in usuariosPaginados" 
                    :key="usuario.numReparto" 
                    class="hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-200 group">
                  <td class="px-6 py-4 whitespace-nowrap min-w-[120px]">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                        <span class="text-sm font-bold text-white">{{ usuario.numReparto.substring(0, 2) }}</span>
                      </div>
                      <div class="ml-3">
                        <div class="text-sm font-semibold text-gray-900">{{ usuario.numReparto }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap min-w-[120px]">
                    <span class="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800">
                      {{ usuario.region.replace('_', ' ') }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap min-w-[150px]">
                    <span class="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800">
                      {{ usuario.zona.replace('_', ' ') }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap min-w-[150px]">
                    <div class="text-sm text-gray-700">
                      {{ usuario.numeroLinea || 'Sin línea asignada' }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap min-w-[130px]">
                    <span v-if="usuario.cargo" class="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800">
                      {{ usuario.cargo.replace('_', ' ') }}
                    </span>
                    <span v-else class="text-sm text-gray-400 italic">Sin cargo</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap min-w-[120px]">
                    <div class="flex items-center gap-2">
                      <button @click="openEditModal(usuario)" 
                              class="p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 group" 
                              title="Editar usuario">
                        <svg class="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </button>
                      <button @click="openDeleteModal(usuario)" 
                              class="p-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 group" 
                              title="Eliminar usuario">
                        <svg class="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Vista móvil - Cards -->
          <div class="lg:hidden space-y-4">
            <div v-for="usuario in usuariosPaginados" 
                 :key="usuario.numReparto" 
                 class="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                    <span class="text-sm font-bold text-white">{{ usuario.numReparto.substring(0, 2) }}</span>
                  </div>
                  <div>
                    <h3 class="font-bold text-gray-900 text-lg">{{ usuario.numReparto }}</h3>
                  </div>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span class="text-xs font-semibold text-gray-500 uppercase">Región</span>
                  <p class="text-sm font-medium text-gray-900 mt-1">{{ usuario.region.replace('_', ' ') }}</p>
                </div>
                <div>
                  <span class="text-xs font-semibold text-gray-500 uppercase">Zona</span>
                  <p class="text-sm font-medium text-gray-900 mt-1">{{ usuario.zona.replace('_', ' ') }}</p>
                </div>
                <div>
                  <span class="text-xs font-semibold text-gray-500 uppercase">Línea</span>
                  <p class="text-sm font-medium text-gray-900 mt-1">{{ usuario.numeroLinea || 'Sin línea asignada' }}</p>
                </div>
                <div>
                  <span class="text-xs font-semibold text-gray-500 uppercase">Cargo</span>
                  <p class="text-sm font-medium text-gray-900 mt-1">{{ usuario.cargo ? usuario.cargo.replace('_', ' ') : 'Sin cargo' }}</p>
                </div>
              </div>
              
              <div class="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button @click="openEditModal(usuario)" 
                        class="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  Editar
                </button>
                <button @click="openDeleteModal(usuario)" 
                        class="p-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Paginación -->
      <Pagination 
        :current-page="currentPage"
        :total-records="usuariosFiltrados.length"
        :items-per-page="itemsPerPage"
        @page-changed="onPageChanged"
        @items-per-page-changed="onItemsPerPageChanged"
      />

      <!-- Modal de crear/editar moderno -->
      <div v-if="showModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-w-md transform transition-all duration-300">
          <!-- Header del modal -->
          <div class="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-t-3xl p-6 text-white">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-white/20 rounded-xl">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <h3 class="text-xl font-bold">{{ modalTitle }}</h3>
              </div>
              <button @click="closeModal" class="p-2 hover:bg-white/20 rounded-xl transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Contenido del modal -->
          <div class="p-6">
            <form @submit.prevent="guardarUsuario" class="space-y-6">
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-gray-700">Número de Reparto</label>
                <input 
                  v-model="form.numReparto"
                  type="text" 
                  required
                  class="w-full bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 placeholder-gray-400"
                  placeholder="Ej: U001"
                />
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-semibold text-gray-700">Región</label>
                <select v-model="form.region" 
                        required
                        class="w-full bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200">
                  <option value="" disabled>Seleccione una región</option>
                  <option v-for="r in regiones" :key="r" :value="r">{{ r.replace('_', ' ') }}</option>
                </select>
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-semibold text-gray-700">Zona</label>
                <select v-model="form.zona" 
                        required
                        class="w-full bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200">
                  <option value="" disabled>Seleccione una zona</option>
                  <option v-for="z in zonas" :key="z" :value="z">{{ z.replace('_', ' ') }}</option>
                </select>
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-semibold text-gray-700">Línea</label>
                <input 
                  v-model="form.numeroLinea"
                  type="text" 
                  class="w-full bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 placeholder-gray-400"
                  placeholder="Ej: 15-1234-5678"
                />
                <p class="text-xs text-gray-500">Campo opcional. Número de línea telefónica asignada</p>
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-semibold text-gray-700">Cargo</label>
                <select v-model="form.cargo" 
                        class="w-full bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200">
                  <option value="">Seleccione un cargo (opcional)</option>
                  <option v-for="c in cargos" :key="c" :value="c">{{ c.replace('_', ' ') }}</option>
                </select>
              </div>

              <!-- Botones -->
              <div class="flex gap-3 pt-4">
                <button type="button" 
                        @click="closeModal" 
                        class="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200">
                  Cancelar
                </button>
                <button type="submit" 
                        class="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Modal de confirmación de eliminación moderno -->
      <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-w-md transform transition-all duration-300">
          <!-- Header del modal -->
          <div class="bg-gradient-to-r from-red-500 to-pink-600 rounded-t-3xl p-6 text-white">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-white/20 rounded-xl">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold">Confirmar Eliminación</h3>
            </div>
          </div>

          <!-- Contenido del modal -->
          <div class="p-6">
            <div class="mb-6">
              <p class="text-gray-700 text-center">
                ¿Estás seguro de que deseas eliminar al usuario 
                <strong class="text-gray-900">{{ selectedUser?.numReparto }}</strong>?
              </p>
              <p class="text-sm text-gray-500 text-center mt-2">
                Esta acción no se puede deshacer.
              </p>
            </div>

            <!-- Botones -->
            <div class="flex gap-3">
              <button type="button" 
                      @click="closeModal" 
                      class="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200">
                Cancelar
              </button>
        <button @click="eliminarUsuario" :disabled="loadingDelete"
          class="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
