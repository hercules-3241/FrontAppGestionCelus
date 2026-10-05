<template>
  <div class="relative overflow-visible">
    <form @submit.prevent="guardar" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Campo predictivo para usuario -->
        <div class="relative">
          <label class="field-label">Usuario</label>
          <input
            ref="usuarioInput"
            v-model="usuarioSearch"
            @input="onUsuarioSearch"
            @focus="showUsuarioSuggestions = true"
            @blur="hideUsuarioSuggestions"
            type="text"
            required
            class="input"
            placeholder="Escribe el número de reparto o región..."
            autocomplete="off"
          />

          <!-- Lista de sugerencias para usuario -->
          <div v-if="showUsuarioSuggestions && filteredUsuarios.length > 0"
               style="z-index: 99999; max-height: 180px;"
               class="absolute w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-y-auto">
            <div
              v-for="usuario in filteredUsuarios"
              :key="usuario.numReparto"
              @mousedown="selectUsuario(usuario)"
              class="px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-b-0 transition-colors"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium text-slate-900 text-sm">{{ usuario.numReparto }}</p>
                  <p class="text-xs text-slate-500">{{ usuario.region }}</p>
                </div>
                <span class="badge-slate">{{ usuario.estado || 'ACTIVO' }}</span>
              </div>
            </div>
          </div>

          <!-- Usuario seleccionado -->
          <div v-if="selectedUsuario" class="mt-2 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-lg">
            <p class="text-sm font-medium text-indigo-700">
              {{ selectedUsuario.numReparto }} - {{ selectedUsuario.region }}
            </p>
          </div>
        </div>

        <!-- Campo predictivo para celular por código interno -->
        <div class="relative">
          <label class="field-label">Código interno del celular</label>
          <input
            ref="celularInput"
            v-model="celularSearch"
            @input="onCelularSearch"
            @focus="showCelularSuggestions = true"
            @blur="hideCelularSuggestions"
            type="text"
            required
            class="input"
            placeholder="Escribe el código interno..."
            autocomplete="off"
          />

          <!-- Lista de sugerencias para celular -->
          <div v-if="showCelularSuggestions && filteredCelulares.length > 0"
               style="z-index: 99999; max-height: 180px;"
               class="absolute w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-y-auto">
            <div
              v-for="celular in filteredCelulares"
              :key="celular.numeroSerie"
              @mousedown="selectCelular(celular)"
              class="px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-b-0 transition-colors"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium text-slate-900 text-sm">{{ celular.codigoInterno }}</p>
                  <p class="text-xs text-slate-500">{{ celular.marca }} {{ celular.modelo }}</p>
                </div>
                <span :class="{
                  'badge-emerald': celular.estado === 'DISPONIBLE',
                  'badge-indigo': celular.estado === 'ENTREGADO',
                  'badge-rose': celular.estado === 'ROTO',
                  'badge-slate': !['DISPONIBLE','ENTREGADO','ROTO'].includes(celular.estado)
                }">{{ celular.estado }}</span>
              </div>
            </div>
          </div>

          <!-- Celular seleccionado -->
          <div v-if="selectedCelular" class="mt-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg">
            <p class="text-sm font-medium text-emerald-700">
              {{ selectedCelular.codigoInterno }} - {{ selectedCelular.marca }} {{ selectedCelular.modelo }}
            </p>
            <p class="text-xs text-emerald-600">Serie: {{ selectedCelular.numeroSerie }}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="field-label">Fecha</label>
          <input v-model="form.fecha" type="date" required class="input" />
        </div>

        <div>
          <label class="field-label">Descripción</label>
          <input v-model="form.descripcion" type="text" required class="input" placeholder="Ej: Entrega inicial, Cambio de usuario" />
        </div>
      </div>

      <div class="flex justify-end pt-5 border-t border-slate-100">
        <button type="submit" :disabled="loading || !selectedCelular || !selectedUsuario" class="btn-success">
          <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
          </svg>
          {{ loading ? 'Creando...' : 'Crear Movimiento' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, computed, nextTick } from 'vue';

const props = defineProps({
  celulares: { type: Array, default: () => [] },
  usuarios: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
});

const emit = defineEmits(['save']);

const form = reactive({
  fecha: new Date().toISOString().split('T')[0],
  descripcion: ''
});

// Referencias para los elementos
const celularInput = ref(null);
const usuarioInput = ref(null);

// Estados para el campo predictivo de celular
const celularSearch = ref('');
const selectedCelular = ref(null);
const showCelularSuggestions = ref(false);

// Estados para el campo predictivo de usuario
const usuarioSearch = ref('');
const selectedUsuario = ref(null);
const showUsuarioSuggestions = ref(false);

// Computed para filtrar celulares
const filteredCelulares = computed(() => {
  console.log('🔍 Filtrando celulares - Búsqueda:', celularSearch.value);
  console.log('📱 Total celulares disponibles:', props.celulares.length);
  
  if (!celularSearch.value || celularSearch.value.trim().length === 0) {
    console.log('📋 Sin búsqueda, mostrando primeros 20 ordenados');
    // Mostrar primeros 20 ordenados por código interno numéricamente
    const result = props.celulares
      .slice()
      .sort((a, b) => {
        const numA = parseInt(a.codigoInterno) || 0;
        const numB = parseInt(b.codigoInterno) || 0;
        return numA - numB;
      })
      .slice(0, 20);
    console.log('📋 Primeros 5 celulares:', result.slice(0, 5).map(c => ({ codigoInterno: c.codigoInterno, marca: c.marca, modelo: c.modelo })));
    return result;
  }
  
  const searchTerm = celularSearch.value.trim().toLowerCase();
  console.log('🎯 Término de búsqueda procesado:', searchTerm);
  
  const filtered = props.celulares.filter(celular => {
    // Convertir a string y luego a minúsculas para comparación
    const codigoInterno = celular.codigoInterno?.toString().toLowerCase() || '';
    const numeroSerie = celular.numeroSerie?.toString().toLowerCase() || '';
    const marca = celular.marca?.toLowerCase() || '';
    const modelo = celular.modelo?.toLowerCase() || '';
    
    const matches = (
      codigoInterno.startsWith(searchTerm) ||
      numeroSerie.startsWith(searchTerm) ||
      marca.startsWith(searchTerm) ||
      modelo.startsWith(searchTerm)
    );
    
    if (matches) {
      console.log('✅ Coincidencia encontrada:', {
        codigoInterno: celular.codigoInterno,
        numeroSerie: celular.numeroSerie,
        marca: celular.marca,
        modelo: celular.modelo,
        estado: celular.estado
      });
    }
    
    return matches;
  });
  
  console.log('📊 Total resultados filtrados:', filtered.length);
  
  const sorted = filtered.sort((a, b) => {
    // Ordenar por coincidencia exacta primero, luego numéricamente
    const aExact = a.codigoInterno?.toString().toLowerCase() === searchTerm;
    const bExact = b.codigoInterno?.toString().toLowerCase() === searchTerm;
    
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    
    // Si ambos o ninguno es exacto, ordenar numéricamente
    const numA = parseInt(a.codigoInterno) || 0;
    const numB = parseInt(b.codigoInterno) || 0;
    return numA - numB;
  })
  .slice(0, 20);
  
  console.log('📋 Primeros 5 resultados ordenados:', sorted.slice(0, 5).map(c => ({ codigoInterno: c.codigoInterno, marca: c.marca, modelo: c.modelo })));
  return sorted;
});

// Computed para filtrar usuarios
const filteredUsuarios = computed(() => {
  console.log('🔍 Filtrando usuarios - Búsqueda:', usuarioSearch.value);
  console.log('👥 Total usuarios disponibles:', props.usuarios.length);
  
  if (!usuarioSearch.value || usuarioSearch.value.trim().length === 0) {
    console.log('📋 Sin búsqueda, mostrando primeros 10');
    return props.usuarios.slice(0, 10); // Mostrar los primeros 10 si no hay búsqueda
  }
  
  const searchTerm = usuarioSearch.value.trim().toLowerCase();
  console.log('🎯 Término de búsqueda procesado:', searchTerm);
  
  const filtered = props.usuarios.filter(usuario => {
    // Convertir a string y luego a minúsculas para comparación
    const numReparto = usuario.numReparto?.toString().toLowerCase() || '';
    const region = usuario.region?.toLowerCase() || '';
    const nombre = usuario.nombre?.toLowerCase() || '';
    const zona = usuario.zona?.toLowerCase() || '';
    
    const matches = (
      numReparto.startsWith(searchTerm) ||
      region.startsWith(searchTerm) ||
      nombre.startsWith(searchTerm) ||
      zona.startsWith(searchTerm)
    );
    
    if (matches) {
      console.log('✅ Coincidencia encontrada:', {
        numReparto: usuario.numReparto,
        region: usuario.region,
        zona: usuario.zona
      });
    }
    
    return matches;
  });
  
  console.log('📊 Resultados filtrados:', filtered.length);
  
  // Ordenar resultados: coincidencias exactas primero
  const sorted = filtered.sort((a, b) => {
    const aNumReparto = a.numReparto?.toString().toLowerCase() || '';
    const bNumReparto = b.numReparto?.toString().toLowerCase() || '';
    
    if (aNumReparto === searchTerm && bNumReparto !== searchTerm) return -1;
    if (bNumReparto === searchTerm && aNumReparto !== searchTerm) return 1;
    if (aNumReparto.startsWith(searchTerm) && !bNumReparto.startsWith(searchTerm)) return -1;
    if (bNumReparto.startsWith(searchTerm) && !aNumReparto.startsWith(searchTerm)) return 1;
    
    return 0;
  }).slice(0, 15); // Aumentar a 15 resultados
  
  console.log('📋 Primeros 5 resultados ordenados:', sorted.slice(0, 5));
  return sorted;
});

// Métodos para manejo de celular
const onCelularSearch = () => {
  selectedCelular.value = null;
  showCelularSuggestions.value = true;
  
  // Debug logs
  console.log('🔍 Búsqueda de celular:', celularSearch.value);
  console.log('📱 Total celulares disponibles:', props.celulares.length);
  console.log('🎯 Celulares filtrados:', filteredCelulares.value.length);
  console.log('📋 Primeros 5 resultados:', filteredCelulares.value.slice(0, 5));
};

const selectCelular = (celular) => {
  selectedCelular.value = celular;
  celularSearch.value = celular.codigoInterno;
  showCelularSuggestions.value = false;
};

const hideCelularSuggestions = () => {
  setTimeout(() => {
    showCelularSuggestions.value = false;
  }, 150); // Delay para permitir el click en las sugerencias
};

// Métodos para manejo de usuario
const onUsuarioSearch = () => {
  selectedUsuario.value = null;
  showUsuarioSuggestions.value = true;
  
  // Debug logs para usuarios
  console.log('🔍 Búsqueda de usuario:', usuarioSearch.value);
  console.log('👥 Total usuarios disponibles:', props.usuarios.length);
  console.log('🎯 Usuarios filtrados:', filteredUsuarios.value.length);
  console.log('📋 Primeros 5 resultados:', filteredUsuarios.value.slice(0, 5));
};

const selectUsuario = (usuario) => {
  selectedUsuario.value = usuario;
  usuarioSearch.value = usuario.numReparto?.toString() || '';
  showUsuarioSuggestions.value = false;
  
  console.log('👤 Usuario seleccionado:', usuario);
};

const hideUsuarioSuggestions = () => {
  setTimeout(() => {
    showUsuarioSuggestions.value = false;
  }, 150); // Delay para permitir el click en las sugerencias
};

const resetForm = () => {
  form.fecha = new Date().toISOString().split('T')[0];
  form.descripcion = '';
  
  // Reset campos predictivos
  celularSearch.value = '';
  selectedCelular.value = null;
  showCelularSuggestions.value = false;
  
  usuarioSearch.value = '';
  selectedUsuario.value = null;
  showUsuarioSuggestions.value = false;
};

const guardar = () => {
  if (!selectedCelular.value || !selectedUsuario.value) {
    alert('Por favor selecciona un celular y un usuario');
    return;
  }
  
  const movimiento = {
    fecha: form.fecha,
    celular: { numeroSerie: selectedCelular.value.numeroSerie },
    usuario: { numReparto: selectedUsuario.value.numReparto },
    descripcion: form.descripcion
  };
  
  emit('save', movimiento);
  resetForm();
};

// Exponer método para reset desde el componente padre
defineExpose({ resetForm });
</script>
