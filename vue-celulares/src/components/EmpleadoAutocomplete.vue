<template>
  <div class="relative">
    <input
      :id="id"
      v-model="texto"
      type="text"
      role="combobox"
      autocomplete="off"
      :aria-expanded="abierto"
      :aria-controls="`${id}-lista`"
      :aria-activedescendant="indiceActivo >= 0 ? `${id}-opcion-${indiceActivo}` : undefined"
      :class="inputClass"
      :placeholder="placeholder"
      :disabled="disabled"
      @focus="abierto = true"
      @blur="abierto = false"
      @input="onInput"
      @keydown.down.prevent="mover(1)"
      @keydown.up.prevent="mover(-1)"
      @keydown.enter="onEnter"
      @keydown.esc="abierto = false"
    />

    <ul
      v-if="abierto && !disabled"
      :id="`${id}-lista`"
      role="listbox"
      class="absolute z-40 mt-1 w-full max-h-60 overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
    >
      <li v-if="loading" class="px-4 py-2 text-sm text-gray-500">Cargando...</li>
      <li v-else-if="sugerencias.length === 0" class="px-4 py-2 text-sm text-gray-500">
        {{ empleados.length === 0 ? emptyText : 'Sin resultados' }}
      </li>
      <template v-else>
        <li
          v-for="(empleado, i) in sugerencias"
          :id="`${id}-opcion-${i}`"
          :key="empleado.numReparto"
          role="option"
          :aria-selected="empleado.numReparto === modelValue"
          :class="[
            'flex cursor-pointer items-center justify-between gap-2 px-4 py-2 text-sm',
            i === indiceActivo ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
          ]"
          @mousedown.prevent="seleccionar(empleado)"
        >
          <span class="font-medium">{{ empleado.numReparto }}</span>
          <span class="text-xs text-gray-500">{{ formatearCargo(empleado.cargo) }}</span>
        </li>
      </template>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { Usuario } from '@/services/usuarioService';
import { buscarEmpleados, formatearCargo } from '@/utils/empleadosSolicitud';

const props = withDefaults(defineProps<{
  id: string;
  modelValue: string;
  empleados: Usuario[];
  placeholder?: string;
  inputClass?: string;
  disabled?: boolean;
  loading?: boolean;
  emptyText?: string;
}>(), {
  placeholder: 'Buscar por número de reparto',
  inputClass: '',
  disabled: false,
  loading: false,
  emptyText: 'No hay empleados disponibles'
});

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const texto = ref(props.modelValue);
const abierto = ref(false);
const indiceActivo = ref(-1);

const sugerencias = computed(() => buscarEmpleados(props.empleados, texto.value));

// Keeps the visible text in sync when the parent resets or changes the selection.
watch(() => props.modelValue, valor => {
  if (valor !== texto.value) texto.value = valor;
});

const onInput = () => {
  abierto.value = true;
  indiceActivo.value = -1;
  // Free text is not a valid selection: the value only counts once an employee is picked.
  if (props.modelValue !== '') emit('update:modelValue', '');
};

const seleccionar = (empleado: Usuario) => {
  texto.value = empleado.numReparto;
  emit('update:modelValue', empleado.numReparto);
  abierto.value = false;
  indiceActivo.value = -1;
};

const mover = (delta: number) => {
  abierto.value = true;
  const total = sugerencias.value.length;
  if (total === 0) return;
  indiceActivo.value = (indiceActivo.value + delta + total) % total;
};

const onEnter = (e: KeyboardEvent) => {
  const empleado = sugerencias.value[indiceActivo.value];
  if (abierto.value && empleado) {
    e.preventDefault();
    seleccionar(empleado);
  }
};
</script>
