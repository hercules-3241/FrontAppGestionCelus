<template>
  <div v-if="show" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </div>
          <h2 class="text-lg font-bold text-slate-900">Editar movimiento</h2>
        </div>
        <button @click="$emit('close')" class="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="guardar" class="p-6 space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="field-label">Fecha *</label>
            <input v-model="form.fecha" type="date" required class="input" />
          </div>
          <div>
            <label class="field-label">Tipo *</label>
            <select v-model="form.tipo" required class="input">
              <option value="">Seleccionar tipo</option>
              <option value="ASIGNACION">Asignación</option>
              <option value="CAMBIO">Cambio de usuario</option>
              <option value="DEVOLUCION">Devolución</option>
              <option value="REPARACION">Reparación</option>
              <option value="BAJA">Baja del equipo</option>
            </select>
          </div>
        </div>

        <div>
          <label class="field-label">Celular *</label>
          <select v-model="form.celularId" required class="input">
            <option value="">Seleccionar celular</option>
            <option v-for="celular in celulares" :key="celular.numeroSerie" :value="celular.numeroSerie">
              {{ celular.marca }} {{ celular.modelo }} - {{ celular.numeroSerie }}
            </option>
          </select>
        </div>

        <div>
          <label class="field-label">Usuario *</label>
          <select v-model="form.usuarioId" required class="input">
            <option value="">Seleccionar usuario</option>
            <option v-for="usuario in usuarios" :key="usuario.numReparto" :value="usuario.numReparto">
              {{ usuario.numReparto }} - {{ usuario.region }}
            </option>
          </select>
        </div>

        <div>
          <label class="field-label">Descripción / Motivo *</label>
          <textarea v-model="form.descripcion" required rows="4" class="input" placeholder="Describe el motivo del movimiento..."></textarea>
        </div>

        <div class="flex justify-end gap-3 pt-5 border-t border-slate-100">
          <button type="button" @click="$emit('close')" class="btn-secondary">Cancelar</button>
          <button type="submit" :disabled="loading" class="btn-primary">
            <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            {{ loading ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue';

const props = defineProps({
  show: { type: Boolean, default: false },
  movimiento: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  celulares: { type: Array, default: () => [] },
  usuarios: { type: Array, default: () => [] }
});

const emit = defineEmits(['close', 'save']);

const form = reactive({
  fecha: '',
  tipo: '',
  descripcion: '',
  celularId: '',
  usuarioId: ''
});

// Watch para cargar datos cuando cambie el movimiento
watch(() => props.movimiento, (newMovimiento) => {
  if (newMovimiento) {
    form.fecha = newMovimiento.fecha;
    form.tipo = newMovimiento.tipo || '';
    form.descripcion = newMovimiento.descripcion || '';
    form.celularId = newMovimiento.celular?.numeroSerie || '';
    form.usuarioId = newMovimiento.usuario?.numReparto || '';
  } else {
    // Reset form
    form.fecha = '';
    form.tipo = '';
    form.descripcion = '';
    form.celularId = '';
    form.usuarioId = '';
  }
}, { immediate: true });

const guardar = () => {
  const movimientoData = {
    fecha: form.fecha,
    tipo: form.tipo,
    descripcion: form.descripcion,
    celularId: form.celularId,
    usuarioId: form.usuarioId
  };
  
  emit('save', movimientoData);
};
</script>
