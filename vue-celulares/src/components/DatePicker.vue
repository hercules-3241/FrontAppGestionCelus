<template>
  <div ref="root" class="relative">
    <button
      type="button"
      @click="open = !open"
      :class="[
        'w-full flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-lg border bg-white text-left transition-colors focus:outline-none',
        open ? 'border-indigo-500 ring-2 ring-indigo-500/40' : 'border-slate-300 hover:border-slate-400'
      ]">
      <span :class="display ? 'text-slate-900' : 'text-slate-400'">{{ display || placeholder }}</span>
      <svg class="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
      </svg>
    </button>

    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="open" class="absolute z-40 mt-1 w-64 rounded-xl border border-slate-200 bg-white shadow-xl p-3">
        <!-- Cabecera mes/año -->
        <div class="flex items-center justify-between mb-2">
          <button type="button" @click="prevMonth" class="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <div class="text-sm font-semibold text-slate-800">{{ monthNames[viewMonth] }} {{ viewYear }}</div>
          <button type="button" @click="nextMonth" class="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>

        <!-- Días de la semana -->
        <div class="grid grid-cols-7 gap-1 mb-1">
          <div v-for="d in weekdays" :key="d" class="h-6 flex items-center justify-center text-[10px] font-semibold text-slate-400 uppercase">{{ d }}</div>
        </div>

        <!-- Grilla de días -->
        <div class="grid grid-cols-7 gap-1">
          <template v-for="(cell, i) in cells" :key="i">
            <div v-if="!cell"></div>
            <button
              v-else
              type="button"
              @click="selectDay(cell)"
              :class="dayClass(cell)">
              {{ cell.day }}
            </button>
          </template>
        </div>

        <!-- Acciones -->
        <div class="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
          <button type="button" @click="selectToday" class="text-xs font-medium text-indigo-600 hover:text-indigo-700">Hoy</button>
          <button v-if="modelValue" type="button" @click="clear" class="text-xs font-medium text-slate-400 hover:text-rose-600">Limpiar</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  modelValue: { type: String, default: '' }, // formato YYYY-MM-DD
  placeholder: { type: String, default: 'Seleccionar fecha' }
});

const emit = defineEmits(['update:modelValue']);

const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const weekdays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

const root = ref(null);
const open = ref(false);

const now = new Date();
const viewYear = ref(now.getFullYear());
const viewMonth = ref(now.getMonth());

const pad = (n) => String(n).padStart(2, '0');
const isoOf = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const todayIso = isoOf(now.getFullYear(), now.getMonth(), now.getDate());

const parse = (v) => {
  if (!v) return null;
  const [y, m, d] = v.split('-').map(Number);
  if (!y || !m || !d) return null;
  return { y, m: m - 1, d };
};

// Sincronizar la vista con el valor seleccionado
watch(() => props.modelValue, (v) => {
  const p = parse(v);
  if (p) {
    viewYear.value = p.y;
    viewMonth.value = p.m;
  }
}, { immediate: true });

const display = computed(() => {
  const p = parse(props.modelValue);
  return p ? `${pad(p.d)}/${pad(p.m + 1)}/${p.y}` : '';
});

const cells = computed(() => {
  const first = new Date(viewYear.value, viewMonth.value, 1);
  const offset = (first.getDay() + 6) % 7; // semana empieza lunes
  const daysInMonth = new Date(viewYear.value, viewMonth.value + 1, 0).getDate();
  const arr = [];
  for (let i = 0; i < offset; i++) arr.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    arr.push({ day: d, iso: isoOf(viewYear.value, viewMonth.value, d) });
  }
  return arr;
});

const dayClass = (cell) => {
  const base = 'h-8 w-8 flex items-center justify-center rounded-lg text-sm transition-colors';
  if (cell.iso === props.modelValue) return `${base} bg-violet-600 text-white font-semibold`;
  if (cell.iso === todayIso) return `${base} text-violet-700 font-semibold ring-1 ring-violet-200 hover:bg-violet-50`;
  return `${base} text-slate-700 hover:bg-slate-100`;
};

const prevMonth = () => {
  if (viewMonth.value === 0) { viewMonth.value = 11; viewYear.value--; }
  else viewMonth.value--;
};
const nextMonth = () => {
  if (viewMonth.value === 11) { viewMonth.value = 0; viewYear.value++; }
  else viewMonth.value++;
};

const selectDay = (cell) => {
  emit('update:modelValue', cell.iso);
  open.value = false;
};
const selectToday = () => {
  viewYear.value = now.getFullYear();
  viewMonth.value = now.getMonth();
  emit('update:modelValue', todayIso);
  open.value = false;
};
const clear = () => {
  emit('update:modelValue', '');
  open.value = false;
};

const onDocClick = (e) => {
  if (root.value && !root.value.contains(e.target)) open.value = false;
};
onMounted(() => document.addEventListener('click', onDocClick));
onUnmounted(() => document.removeEventListener('click', onDocClick));
</script>
