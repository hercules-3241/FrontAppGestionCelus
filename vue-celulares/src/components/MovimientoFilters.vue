<template>
  <div class="card overflow-visible">
    <!-- Cabecera compacta (toggle) -->
    <div class="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer select-none" @click="expanded = !expanded">
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"></path>
        </svg>
        <span class="text-sm font-semibold text-slate-800">Filtros</span>
        <span v-if="activeCount > 0" class="badge-indigo">{{ activeCount }}</span>
        <span v-else class="text-xs text-slate-400">Ninguno aplicado</span>
      </div>
      <div class="flex items-center gap-3">
        <button v-if="activeCount > 0" type="button" @click.stop="limpiarFiltros"
                class="text-xs font-medium text-slate-400 hover:text-rose-600 transition-colors">
          Limpiar
        </button>
        <svg class="w-5 h-5 text-slate-400 transition-transform" :class="{ 'rotate-180': expanded }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
    </div>

    <!-- Chips de filtros activos (siempre visibles si hay) -->
    <div v-if="activeCount > 0" class="px-4 pb-3 flex flex-wrap items-center gap-2">
      <span v-if="filtros.fechaDesde" class="badge-indigo">
        Desde: {{ filtros.fechaDesde }}
        <button @click="filtros.fechaDesde = ''; aplicarFiltros()" class="ml-1.5 text-indigo-500 hover:text-indigo-700">×</button>
      </span>
      <span v-if="filtros.fechaHasta" class="badge-indigo">
        Hasta: {{ filtros.fechaHasta }}
        <button @click="filtros.fechaHasta = ''; aplicarFiltros()" class="ml-1.5 text-indigo-500 hover:text-indigo-700">×</button>
      </span>
      <span v-if="filtros.usuario" class="badge-indigo">
        Usuario: {{ filtros.usuario }}
        <button @click="clearUsuarioFilter()" class="ml-1.5 text-indigo-500 hover:text-indigo-700">×</button>
      </span>
      <span v-if="filtros.celular" class="badge-indigo">
        Serie: {{ filtros.celular }}
        <button @click="clearCelularFilter()" class="ml-1.5 text-indigo-500 hover:text-indigo-700">×</button>
      </span>
      <span v-if="filtros.descripcion" class="badge-indigo">
        Descripción: {{ filtros.descripcion }}
        <button @click="filtros.descripcion = ''; aplicarFiltros()" class="ml-1.5 text-indigo-500 hover:text-indigo-700">×</button>
      </span>
      <span v-if="filtros.region" class="badge-indigo">
        Región: {{ filtros.region }}
        <button @click="filtros.region = ''; aplicarFiltros()" class="ml-1.5 text-indigo-500 hover:text-indigo-700">×</button>
      </span>
    </div>

    <!-- Cuerpo desplegable -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
      <div v-show="expanded" class="px-4 pb-4 pt-4 border-t border-slate-100">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          <!-- Fecha desde -->
          <div>
            <label class="field-label">Fecha desde</label>
            <DatePicker :model-value="filtros.fechaDesde" @update:model-value="v => { filtros.fechaDesde = v; aplicarFiltros(); }" placeholder="Cualquiera" />
          </div>

          <!-- Fecha hasta -->
          <div>
            <label class="field-label">Fecha hasta</label>
            <DatePicker :model-value="filtros.fechaHasta" @update:model-value="v => { filtros.fechaHasta = v; aplicarFiltros(); }" placeholder="Cualquiera" />
          </div>

          <!-- Usuario (predictivo) -->
          <div class="relative">
            <label class="field-label">Usuario</label>
            <input
              v-model="usuarioSearch"
              @input="onUsuarioFilterSearch"
              @focus="showUsuarioFilterSuggestions = true"
              @blur="hideUsuarioFilterSuggestions"
              type="text"
              placeholder="Buscar usuario..."
              class="input"
              autocomplete="off"
            />
            <div v-if="showUsuarioFilterSuggestions && filteredUsuariosFilter.length > 0"
                 class="absolute z-40 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              <div
                v-for="usuario in filteredUsuariosFilter"
                :key="usuario.numReparto"
                @mousedown="selectUsuarioFilter(usuario)"
                class="px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-b-0 transition-colors"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium text-slate-900 text-sm">{{ usuario.numReparto }}</p>
                    <p class="text-xs text-slate-500">{{ usuario.region }}</p>
                  </div>
                  <span class="badge-slate">{{ usuario.region }}</span>
                </div>
              </div>
              <div @mousedown="clearUsuarioFilter"
                   class="px-3 py-2 hover:bg-rose-50 cursor-pointer border-t border-slate-100 text-center text-sm text-rose-600 font-medium">
                Limpiar filtro de usuario
              </div>
            </div>
          </div>

          <!-- Celular (predictivo) -->
          <div class="relative">
            <label class="field-label">Celular</label>
            <input
              v-model="celularSearch"
              @input="onCelularFilterSearch"
              @focus="showCelularFilterSuggestions = true"
              @blur="hideCelularFilterSuggestions"
              type="text"
              placeholder="Código o serie..."
              class="input"
              autocomplete="off"
            />
            <div v-if="showCelularFilterSuggestions && filteredCelularesFilter.length > 0"
                 class="absolute z-40 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              <div
                v-for="celular in filteredCelularesFilter"
                :key="celular.numeroSerie"
                @mousedown="selectCelularFilter(celular)"
                class="px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-b-0 transition-colors"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium text-slate-900 text-sm">{{ celular.codigoInterno }}</p>
                    <p class="text-xs text-slate-500">{{ celular.marca }} {{ celular.modelo }} · Serie {{ celular.numeroSerie }}</p>
                  </div>
                  <span :class="{
                    'badge-emerald': celular.estado === 'DISPONIBLE',
                    'badge-indigo': celular.estado === 'ENTREGADO',
                    'badge-rose': celular.estado === 'ROTO',
                    'badge-slate': !['DISPONIBLE','ENTREGADO','ROTO'].includes(celular.estado)
                  }">{{ celular.estado }}</span>
                </div>
              </div>
              <div @mousedown="clearCelularFilter"
                   class="px-3 py-2 hover:bg-rose-50 cursor-pointer border-t border-slate-100 text-center text-sm text-rose-600 font-medium">
                Limpiar filtro de celular
              </div>
            </div>
          </div>

          <!-- Descripción -->
          <div>
            <label class="field-label">Descripción</label>
            <div class="relative">
              <input v-model="filtros.descripcion" @input="aplicarFiltros" type="text" placeholder="Buscar..." class="input pl-10" />
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>

          <!-- Región -->
          <div>
            <label class="field-label">Región</label>
            <CustomSelect :model-value="filtros.region" @update:model-value="v => { filtros.region = v; aplicarFiltros(); }" :options="regionOptions" placeholder="Todas las regiones" />
          </div>

          <!-- Ordenar -->
          <div>
            <label class="field-label">Ordenar por</label>
            <CustomSelect :model-value="filtros.ordenar" @update:model-value="v => { filtros.ordenar = v; aplicarFiltros(); }" :options="ordenarOptions" />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import DatePicker from '@/components/DatePicker.vue';
import CustomSelect from '@/components/CustomSelect.vue';

const props = defineProps({
  usuarios: {
    type: Array,
    default: () => []
  },
  celulares: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['filter']);

const expanded = ref(false);

const filtros = ref({
  fechaDesde: '',
  fechaHasta: '',
  usuario: '',
  celular: '',
  descripcion: '',
  region: '',
  ordenar: 'fecha_desc'
});

const regionOptions = [
  { value: '', label: 'Todas las regiones' },
  { value: 'ADMINISTRACION', label: 'Administración' },
  { value: 'COMERCIAL', label: 'Comercial' },
  { value: 'ESTE', label: 'Este' },
  { value: 'GASTRONOMIA', label: 'Gastronomía' },
  { value: 'IMPACTO', label: 'Impacto' },
  { value: 'LAVAZZA', label: 'Lavazza' },
  { value: 'LA_PLATA', label: 'La Plata' },
  { value: 'NAFA', label: 'Nafa' },
  { value: 'NORTE', label: 'Norte' },
  { value: 'OESTE', label: 'Oeste' },
  { value: 'PLANTA', label: 'Planta' },
  { value: 'PROMOCION', label: 'Promoción' },
  { value: 'RRHH', label: 'RRHH' },
  { value: 'SISTEMAS', label: 'Sistemas' },
  { value: 'SUR', label: 'Sur' },
  { value: 'TALLER', label: 'Taller' }
];

const ordenarOptions = [
  { value: 'fecha_desc', label: 'Fecha (más reciente)' },
  { value: 'fecha_asc', label: 'Fecha (más antigua)' },
  { value: 'usuario', label: 'Usuario' },
  { value: 'celular', label: 'Número de serie' }
];

// Estados para campos predictivos de usuario
const usuarioSearch = ref('');
const selectedUsuarioFilter = ref(null);
const showUsuarioFilterSuggestions = ref(false);

// Estados para campos predictivos de celular
const celularSearch = ref('');
const selectedCelularFilter = ref(null);
const showCelularFilterSuggestions = ref(false);

// Computed para filtrar usuarios en el filtro
const filteredUsuariosFilter = computed(() => {
  if (!usuarioSearch.value || usuarioSearch.value.length < 1) {
    return props.usuarios.slice(0, 8);
  }

  const searchTerm = usuarioSearch.value.toLowerCase();
  return props.usuarios.filter(usuario => {
    return (
      usuario.numReparto?.toLowerCase().includes(searchTerm) ||
      usuario.region?.toLowerCase().includes(searchTerm) ||
      usuario.nombre?.toLowerCase().includes(searchTerm)
    );
  }).slice(0, 8);
});

// Computed para filtrar celulares en el filtro
const filteredCelularesFilter = computed(() => {
  if (!celularSearch.value || celularSearch.value.length < 1) {
    return props.celulares.slice(0, 8);
  }

  const searchTerm = celularSearch.value.toLowerCase();
  return props.celulares.filter(celular => {
    return (
      celular.codigoInterno?.toLowerCase().includes(searchTerm) ||
      celular.numeroSerie?.toString().includes(searchTerm) ||
      celular.marca?.toLowerCase().includes(searchTerm) ||
      celular.modelo?.toLowerCase().includes(searchTerm)
    );
  }).slice(0, 8);
});

// Métodos para manejo de usuario en filtros
const onUsuarioFilterSearch = () => {
  selectedUsuarioFilter.value = null;
  filtros.value.usuario = '';
  showUsuarioFilterSuggestions.value = true;
  aplicarFiltros();
};

const selectUsuarioFilter = (usuario) => {
  selectedUsuarioFilter.value = usuario;
  usuarioSearch.value = `${usuario.numReparto} - ${usuario.region}`;
  filtros.value.usuario = usuario.numReparto;
  showUsuarioFilterSuggestions.value = false;
  aplicarFiltros();
};

const clearUsuarioFilter = () => {
  selectedUsuarioFilter.value = null;
  usuarioSearch.value = '';
  filtros.value.usuario = '';
  showUsuarioFilterSuggestions.value = false;
  aplicarFiltros();
};

const hideUsuarioFilterSuggestions = () => {
  setTimeout(() => {
    showUsuarioFilterSuggestions.value = false;
  }, 150);
};

// Métodos para manejo de celular en filtros
const onCelularFilterSearch = () => {
  selectedCelularFilter.value = null;
  filtros.value.celular = '';
  showCelularFilterSuggestions.value = true;
  aplicarFiltros();
};

const selectCelularFilter = (celular) => {
  selectedCelularFilter.value = celular;
  celularSearch.value = celular.codigoInterno;
  filtros.value.celular = celular.numeroSerie;
  showCelularFilterSuggestions.value = false;
  aplicarFiltros();
};

const clearCelularFilter = () => {
  selectedCelularFilter.value = null;
  celularSearch.value = '';
  filtros.value.celular = '';
  showCelularFilterSuggestions.value = false;
  aplicarFiltros();
};

const hideCelularFilterSuggestions = () => {
  setTimeout(() => {
    showCelularFilterSuggestions.value = false;
  }, 150);
};

const activeCount = computed(() => {
  return ['fechaDesde', 'fechaHasta', 'usuario', 'celular', 'descripcion', 'region']
    .filter(k => filtros.value[k]).length;
});

const aplicarFiltros = () => {
  emit('filter', { ...filtros.value });
};

const limpiarFiltros = () => {
  filtros.value = {
    fechaDesde: '',
    fechaHasta: '',
    usuario: '',
    celular: '',
    descripcion: '',
    region: '',
    ordenar: 'fecha_desc'
  };

  usuarioSearch.value = '';
  selectedUsuarioFilter.value = null;
  showUsuarioFilterSuggestions.value = false;

  celularSearch.value = '';
  selectedCelularFilter.value = null;
  showCelularFilterSuggestions.value = false;

  aplicarFiltros();
};
</script>
