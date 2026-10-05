<template>
  <div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <div>
        <label class="field-label">Código interno</label>
        <input v-model="filters.codigoInterno" type="text" placeholder="Buscar por código" class="input" />
      </div>

      <div>
        <label class="field-label">Código APP</label>
        <input v-model="filters.codigoApp" type="text" placeholder="Buscar por código APP" class="input" />
      </div>

      <div>
        <label class="field-label">Marca</label>
        <input v-model="filters.marca" type="text" placeholder="Buscar por marca" class="input" />
      </div>

      <div>
        <label class="field-label">Estado</label>
        <select v-model="filters.estado" class="input">
          <option value="">Todos los estados</option>
          <option value="NUEVO">Nuevo</option>
          <option value="REACONDICIONADO">Reacondicionado</option>
          <option value="ROTO">Roto</option>
        </select>
      </div>

      <div>
        <label class="field-label">Usuario</label>
        <input v-model="filters.usuario" type="text" placeholder="Buscar por usuario" class="input" />
      </div>

      <div>
        <label class="field-label">Asignación</label>
        <select v-model="filters.asignado" class="input">
          <option value="">Todos</option>
          <option value="true">Asignados</option>
          <option value="false">Sin asignar</option>
        </select>
      </div>
    </div>

    <div class="flex justify-end mt-4">
      <button @click="clearFilters" class="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
        Limpiar filtros
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue';

const emit = defineEmits(['filter']);

const filters = reactive({
  codigoInterno: '',
  codigoApp: '',
  marca: '',
  estado: '',
  usuario: '',
  asignado: ''
});

const clearFilters = () => {
  filters.codigoInterno = '';
  filters.codigoApp = '';
  filters.marca = '';
  filters.estado = '';
  filters.usuario = '';
  filters.asignado = '';
};

// Emitir cambios de filtros
watch(filters, (newFilters) => {
  emit('filter', { ...newFilters });
}, { deep: true });
</script>
