<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
    <!-- Header -->
    <div class="mb-6 lg:mb-8">
      <h1 class="text-2xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
        👤 Administración de Usuarios
      </h1>
      <p class="text-gray-600 mt-2 text-sm sm:text-base">Gestionar usuarios del sistema (Solo ADMIN)</p>
    </div>

    <!-- Botón Crear Usuario -->
    <div class="mb-6">
      <button 
        @click="abrirModalCrear"
        class="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
      >
        <span class="hidden sm:inline">✨ Crear Nuevo Usuario</span>
        <span class="sm:hidden">✨ Crear Usuario</span>
      </button>
    </div>

    <!-- Tabla de Usuarios -->
    <div class="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
      <div class="p-6 border-b border-gray-200/50">
        <h2 class="text-2xl font-bold text-gray-800">Lista de Usuarios</h2>
      </div>

      <!-- Loading -->
      <SkeletonLoader v-if="cargando" variant="table" :rows="8" :cols="5"
                      :ratios="[1.8, 1, 1.2, 1.4, 1.2]" label="Cargando usuarios…" />

      <!-- Error -->
      <div v-else-if="error" class="p-6 text-center">
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
          {{ error }}
        </div>
      </div>

      <!-- Tabla Desktop -->
      <div v-else class="space-y-4">
        <div class="hidden lg:block overflow-x-auto">
          <table class="w-full" style="min-width: 800px;">
            <thead class="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider min-w-[180px]">Usuario</th>
                <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider min-w-[100px]">Rol</th>
                <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider min-w-[120px]">Región</th>
                <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider min-w-[140px]">Fecha Creación</th>
                <th class="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider min-w-[160px]">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white/90 divide-y divide-gray-200/50">
              <tr 
                v-for="usuario in usuariosOrdenados" 
                :key="usuario.username"
                class="hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-200"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                      {{ usuario.username.charAt(0).toUpperCase() }}
                    </div>
                    <span class="font-medium text-gray-900">{{ usuario.username }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="inline-flex px-3 py-1 rounded-full text-xs font-semibold shadow-lg"
                    :class="{
                      'bg-gradient-to-r from-red-400 to-pink-500 text-white': usuario.rol === 'ADMIN',
                      'bg-gradient-to-r from-blue-400 to-indigo-500 text-white': usuario.rol === 'USUARIO'
                    }"
                  >
                    {{ usuario.rol }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-700">
                  {{ usuario.region.replace('_', ' ') }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-700">
                  {{ formatearFecha(usuario.fechaCreacion) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <div class="flex justify-center space-x-2">
                    <button 
                      @click="abrirModalEditar(usuario)"
                      class="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-2 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                      title="Editar usuario"
                    >
                      ✏️
                    </button>
                    <button 
                      @click="abrirModalPassword(usuario)"
                      class="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white p-2 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                      title="Cambiar contraseña"
                    >
                      🔑
                    </button>
                    <button 
                      @click="confirmarEliminar(usuario)"
                      class="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white p-2 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      title="Eliminar usuario"
                      :disabled="usuario.username === 'admin'"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Cards Mobile -->
        <div class="lg:hidden space-y-4">
          <div 
            v-for="usuario in usuariosOrdenados" 
            :key="usuario.username"
            class="bg-white/90 rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center">
                <div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  {{ usuario.username.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <h3 class="font-bold text-gray-900 text-lg">{{ usuario.username }}</h3>
                  <p class="text-xs text-gray-500">{{ usuario.region.replace('_', ' ') }}</p>
                </div>
              </div>
              <span 
                class="inline-flex px-3 py-1 rounded-full text-xs font-semibold"
                :class="{
                  'bg-gradient-to-r from-red-400 to-pink-500 text-white': usuario.rol === 'ADMIN',
                  'bg-gradient-to-r from-blue-400 to-indigo-500 text-white': usuario.rol === 'USUARIO'
                }"
              >
                {{ usuario.rol }}
              </span>
            </div>
            <div class="text-xs text-gray-500 mb-4">
              Creado: {{ formatearFecha(usuario.fechaCreacion) }}
            </div>
            <div class="flex items-center gap-3 pt-3 border-t border-gray-200">
              <button 
                @click="abrirModalEditar(usuario)"
                class="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-xl font-semibold text-sm shadow-lg"
              >
                ✏️ Editar
              </button>
              <button 
                @click="abrirModalPassword(usuario)"
                class="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl shadow-lg"
                title="Cambiar contraseña"
              >
                🔑
              </button>
              <button 
                @click="confirmarEliminar(usuario)"
                class="p-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                title="Eliminar usuario"
                :disabled="usuario.username === 'admin'"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Crear/Editar Usuario -->
    <div 
      v-if="mostrarModal"
      class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
      @click="cerrarModal"
    >
      <div 
        class="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl"
        @click.stop
      >
        <h3 class="text-2xl font-bold mb-6 text-gray-800">
          {{ modoEditar ? 'Editar Usuario' : 'Crear Nuevo Usuario' }}
        </h3>

        <form @submit.prevent="guardarUsuario">
          <div class="space-y-4">
            <!-- Username (solo para crear) -->
            <div v-if="!modoEditar">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nombre de Usuario *
              </label>
              <input
                v-model="formulario.username"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ingrese el nombre de usuario"
              />
            </div>

            <!-- Password (solo para crear) -->
            <div v-if="!modoEditar">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Contraseña *
              </label>
              <input
                v-model="formulario.password"
                type="password"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ingrese la contraseña"
              />
            </div>

            <!-- Rol -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Rol *
              </label>
              <select
                v-model="formulario.rol"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Seleccione un rol</option>
                <option value="USUARIO">USUARIO</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <!-- Región -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Región *
              </label>
              <select
                v-model="formulario.region"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Seleccione una región</option>
                <option value="NORTE">NORTE</option>
                <option value="SUR">SUR</option>
                <option value="ESTE">ESTE</option>
                <option value="OESTE">OESTE</option>
                <option value="LA_PLATA">LA PLATA</option>
                <option value="NAFA">NAFA</option>
                <option value="LAVAZZA">LAVAZZA</option>
                <option value="TALLER">TALLER</option>
                <option value="IMPACTO">IMPACTO</option>
                <option value="COMERCIAL">COMERCIAL</option>
                <option value="GERENCIA">GERENCIA</option>
                <option value="PLANTA">PLANTA</option>
                <option value="SISTEMAS">SISTEMAS</option>
                <option value="RRHH">RRHH</option>
                <option value="ADMINISTRACION">ADMINISTRACION</option>
                <option value="COMPRAS">COMPRAS</option>
                <option value="GASTRONOMIA">GASTRONOMIA</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              @click="cerrarModal"
              class="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="guardando"
              class="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50"
            >
              {{ guardando ? 'Guardando...' : (modoEditar ? 'Actualizar' : 'Crear') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Cambiar Contraseña -->
    <div 
      v-if="mostrarModalPassword"
      class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
      @click="cerrarModalPassword"
    >
      <div 
        class="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl"
        @click.stop
      >
        <h3 class="text-2xl font-bold mb-6 text-gray-800">
          Cambiar Contraseña - {{ usuarioSeleccionado?.username }}
        </h3>

        <form @submit.prevent="cambiarPassword">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nueva Contraseña *
              </label>
              <input
                v-model="nuevaPassword"
                type="password"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Ingrese la nueva contraseña"
              />
            </div>
          </div>

          <div class="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              @click="cerrarModalPassword"
              class="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="guardando"
              class="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 disabled:opacity-50"
            >
              {{ guardando ? 'Cambiando...' : 'Cambiar Contraseña' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { 
  usuariosService, 
  type UsuarioSistema, 
  type CrearUsuarioRequest,
  type ActualizarUsuarioRequest
} from '@/services/usuariosService';
import SkeletonLoader from '@/components/SkeletonLoader.vue';

// Estado reactivo
const usuarios = ref<UsuarioSistema[]>([]);

// Usuarios ordenados por número de usuario de menor a mayor, luego alfabéticamente
const usuariosOrdenados = computed(() => {
  return [...usuarios.value].sort((a, b) => {
    // Extraer números del username
    const matchA = a.username.match(/\d+/);
    const matchB = b.username.match(/\d+/);
    
    const numA = matchA ? parseInt(matchA[0]) : -1;
    const numB = matchB ? parseInt(matchB[0]) : -1;
    
    // Si ambos tienen números válidos, ordenar numéricamente
    if (numA >= 0 && numB >= 0) {
      return numA - numB;
    }
    
    // Si solo uno tiene número, el que tiene número va primero
    if (numA >= 0 && numB < 0) return -1;
    if (numA < 0 && numB >= 0) return 1;
    
    // Si ninguno tiene números, ordenar alfabéticamente
    return a.username.localeCompare(b.username);
  });
});

// Arranca en true: la carga se dispara en onMounted, así el primer frame ya
// muestra el skeleton en vez del estado vacío.
const cargando = ref(true);
const guardando = ref(false);
const error = ref<string | null>(null);

// Modales
const mostrarModal = ref(false);
const mostrarModalPassword = ref(false);
const modoEditar = ref(false);
const usuarioSeleccionado = ref<UsuarioSistema | null>(null);

// Formularios
const formulario = ref<CrearUsuarioRequest>({
  username: '',
  password: '',
  rol: 'USUARIO',
  region: ''
});

const nuevaPassword = ref('');

// Métodos
const cargarUsuarios = async () => {
  cargando.value = true;
  error.value = null;
  
  try {
    usuarios.value = await usuariosService.listarUsuarios();
  } catch (err: any) {
    console.error('Error al cargar usuarios:', err);
    error.value = 'Error al cargar la lista de usuarios. Verifique que tenga permisos de administrador.';
  } finally {
    cargando.value = false;
  }
};

const abrirModalCrear = () => {
  modoEditar.value = false;
  formulario.value = {
    username: '',
    password: '',
    rol: 'USUARIO',
    region: ''
  };
  mostrarModal.value = true;
};

const abrirModalEditar = (usuario: UsuarioSistema) => {
  modoEditar.value = true;
  usuarioSeleccionado.value = usuario;
  formulario.value = {
    username: usuario.username,
    password: '', // No se usa en edición
    rol: usuario.rol,
    region: usuario.region
  };
  mostrarModal.value = true;
};

const abrirModalPassword = (usuario: UsuarioSistema) => {
  usuarioSeleccionado.value = usuario;
  nuevaPassword.value = '';
  mostrarModalPassword.value = true;
};

const cerrarModal = () => {
  mostrarModal.value = false;
  modoEditar.value = false;
  usuarioSeleccionado.value = null;
};

const cerrarModalPassword = () => {
  mostrarModalPassword.value = false;
  usuarioSeleccionado.value = null;
  nuevaPassword.value = '';
};

const guardarUsuario = async () => {
  guardando.value = true;
  
  try {
    if (modoEditar.value && usuarioSeleccionado.value) {
      // Actualizar usuario
      const datosActualizar: ActualizarUsuarioRequest = {
        rol: formulario.value.rol,
        region: formulario.value.region
      };
      await usuariosService.actualizarUsuario(usuarioSeleccionado.value.username, datosActualizar);
    } else {
      // Crear usuario
      await usuariosService.crearUsuario(formulario.value);
    }
    
    await cargarUsuarios();
    cerrarModal();
  } catch (err: any) {
    console.error('Error al guardar usuario:', err);
    error.value = `Error al ${modoEditar.value ? 'actualizar' : 'crear'} usuario: ${err.response?.data?.message || err.message}`;
  } finally {
    guardando.value = false;
  }
};

const cambiarPassword = async () => {
  if (!usuarioSeleccionado.value) return;
  
  guardando.value = true;
  
  try {
    await usuariosService.cambiarPassword({
      username: usuarioSeleccionado.value.username,
      nuevaPassword: nuevaPassword.value
    });
    
    cerrarModalPassword();
    // Mostrar mensaje de éxito
    alert('Contraseña cambiada exitosamente');
  } catch (err: any) {
    console.error('Error al cambiar contraseña:', err);
    error.value = `Error al cambiar contraseña: ${err.response?.data?.message || err.message}`;
  } finally {
    guardando.value = false;
  }
};

const confirmarEliminar = async (usuario: UsuarioSistema) => {
  if (usuario.username === 'admin') {
    alert('No se puede eliminar el usuario administrador principal');
    return;
  }
  
  const confirmado = confirm(`¿Está seguro de que desea eliminar al usuario "${usuario.username}"?`);
  
  if (confirmado) {
    try {
      await usuariosService.eliminarUsuario(usuario.username);
      await cargarUsuarios();
    } catch (err: any) {
      console.error('Error al eliminar usuario:', err);
      error.value = `Error al eliminar usuario: ${err.response?.data?.message || err.message}`;
    }
  }
};

const formatearFecha = (fecha?: string) => {
  if (!fecha) return 'N/A';
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Lifecycle
onMounted(() => {
  cargarUsuarios();
});
</script>
