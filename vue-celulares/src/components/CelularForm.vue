<template>
  <div class="relative">
    <form @submit.prevent="guardar" class="space-y-6">
      <!-- Código Interno (siempre visible) -->
      <div>
        <label class="field-label">Código interno *</label>
        <input v-model="form.codigoInterno" type="text" required class="input" placeholder="Ej: SAM001" />
        <p class="text-xs text-slate-400 mt-1">Código interno único para el inventario</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="field-label">Marca</label>
          <input v-model="form.marca" type="text" required class="input" placeholder="Ej: Samsung, iPhone, Xiaomi" />
        </div>
        <div>
          <label class="field-label">Modelo</label>
          <input v-model="form.modelo" type="text" required class="input" placeholder="Ej: Galaxy S21, iPhone 13" />
        </div>
      </div>

      <div>
        <label class="field-label">Estado</label>
        <select v-model="form.estado" required class="input">
          <option value="NUEVO">Nuevo</option>
          <option value="REACONDICIONADO">Reacondicionado</option>
          <option value="ROTO">Roto</option>
        </select>
      </div>

      <!-- Nuevos campos agregados -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="field-label">Código de aplicación</label>
          <input v-model="form.codigoDeAplicacion" type="text" class="input" placeholder="Ej: APP001" />
        </div>
        <div>
          <label class="field-label">Cantidad de roturas</label>
          <input v-model.number="form.cantRoturas" type="number" min="0" class="input" placeholder="0" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label for="tieneTemplado" class="flex items-center gap-2.5 rounded-lg border border-slate-200 px-3 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors">
          <input id="tieneTemplado" v-model="form.tieneTemplado" type="checkbox"
                 class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded" />
          <span class="text-sm font-medium text-slate-700">Tiene templado</span>
        </label>
        <label for="tieneFunda" class="flex items-center gap-2.5 rounded-lg border border-slate-200 px-3 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors">
          <input id="tieneFunda" v-model="form.tieneFunda" type="checkbox"
                 class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded" />
          <span class="text-sm font-medium text-slate-700">Tiene funda</span>
        </label>
      </div>

      <div class="flex justify-end gap-3 pt-5 border-t border-slate-100">
        <button v-if="isEditing" @click="cancelEdit" type="button" class="btn-secondary">
          Cancelar
        </button>
        <button type="submit" :disabled="loading" class="btn-primary">
          <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          {{ loading ? (isEditing ? 'Actualizando...' : 'Creando...') : (isEditing ? 'Actualizar celular' : 'Crear celular') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, watch, computed } from 'vue';

const props = defineProps({
  celular: { type: Object, default: null },
  loading: { type: Boolean, default: false }
});

const emit = defineEmits(['save', 'cancel']);

const form = reactive({
  codigoInterno: '',
  marca: '',
  modelo: '',
  tieneTemplado: false,
  tieneFunda: false,
  codigoDeAplicacion: '',
  cantRoturas: 0,
  estado: 'NUEVO'
});

const isEditing = computed(() => !!props.celular);

const resetForm = () => {
  form.codigoInterno = '';
  form.marca = '';
  form.modelo = '';
  form.tieneTemplado = false;
  form.tieneFunda = false;
  form.codigoDeAplicacion = '';
  form.cantRoturas = 0;
  form.estado = 'NUEVO';
};

const cancelEdit = () => {
  resetForm();
  emit('cancel');
};

const guardar = () => {
  const celular = {
    codigoInterno: form.codigoInterno,
    marca: form.marca,
    modelo: form.modelo,
    tieneTemplado: form.tieneTemplado,
    tieneFunda: form.tieneFunda,
    codigoDeAplicacion: form.codigoDeAplicacion || null,
    cantRoturas: form.cantRoturas,
    estado: form.estado
  };
  
  console.log('💾 Guardando celular:', celular, 'Modo edición:', isEditing.value);
  emit('save', celular);
};

// Watch para cargar datos cuando se edita
watch(() => props.celular, (newCelular) => {
  console.log('🔧 Cargando celular para editar:', newCelular);
  if (newCelular) {
    form.codigoInterno = newCelular.codigoInterno || newCelular.numeroSerie || '';
    form.marca = newCelular.marca;
    form.modelo = newCelular.modelo;
    form.tieneTemplado = newCelular.tieneTemplado || false;
    form.tieneFunda = newCelular.tieneFunda || false;
    form.codigoDeAplicacion = newCelular.codigoDeAplicacion || '';
    form.cantRoturas = newCelular.cantRoturas || 0;
    form.estado = newCelular.estado;
    console.log('📝 Formulario actualizado:', form);
  } else {
    resetForm();
  }
}, { immediate: true });

// Exponer métodos para el componente padre
defineExpose({ resetForm });
</script>
