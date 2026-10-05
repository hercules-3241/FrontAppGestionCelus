<template>
  <!-- Placeholder que imita el layout final para que el contenido no "salte" al llegar -->
  <div :aria-label="label" role="status" aria-live="polite" aria-busy="true">
    <span class="sr-only">{{ label }}</span>

    <!-- ===== Tabla (escritorio) ===== -->
    <template v-if="variant === 'table'">
      <div class="hidden lg:block">
        <!-- Encabezado -->
        <div class="grid gap-4 px-4 py-3 border-b border-slate-200 bg-slate-50" :style="gridStyle">
          <div v-for="c in cols" :key="`h${c}`" class="skeleton h-3" :class="headWidth(c)"></div>
        </div>
        <!-- Filas -->
        <div class="divide-y divide-slate-100">
          <div v-for="r in rows" :key="`r${r}`" class="grid gap-4 px-4 py-4 items-center" :style="gridStyle">
            <div v-for="c in cols" :key="`r${r}c${c}`" class="skeleton h-4" :class="cellWidth(r, c)"></div>
          </div>
        </div>
      </div>
      <!-- En móvil la tabla no se muestra: caemos a tarjetas -->
      <div class="lg:hidden divide-y divide-slate-100">
        <SkeletonCard v-for="r in Math.min(rows, 4)" :key="`m${r}`" />
      </div>
    </template>

    <!-- ===== Tarjetas ===== -->
    <div v-else-if="variant === 'cards'" class="divide-y divide-slate-100">
      <SkeletonCard v-for="r in rows" :key="`c${r}`" />
    </div>

    <!-- ===== Tiles de estadísticas ===== -->
    <div v-else-if="variant === 'stats'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="r in rows" :key="`s${r}`" class="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5">
        <div class="flex items-center gap-4">
          <div class="skeleton h-11 w-11 rounded-xl flex-shrink-0"></div>
          <div class="flex-1 min-w-0 space-y-2">
            <div class="skeleton h-3 w-20"></div>
            <div class="skeleton h-6 w-14"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== Gráfico ===== -->
    <div v-else-if="variant === 'chart'" class="p-5">
      <div class="skeleton h-4 w-40 mb-6"></div>
      <div class="flex items-end gap-3" :style="{ height: chartHeight }">
        <div v-for="b in 12" :key="`b${b}`" class="skeleton flex-1 rounded-t-md" :style="{ height: barHeight(b) }"></div>
      </div>
      <div class="mt-4 flex justify-between">
        <div v-for="l in 4" :key="`l${l}`" class="skeleton h-3 w-12"></div>
      </div>
    </div>

    <!-- ===== Lista simple ===== -->
    <div v-else class="space-y-3 p-5">
      <div v-for="r in rows" :key="`li${r}`" class="flex items-center gap-3">
        <div class="skeleton h-9 w-9 rounded-lg flex-shrink-0"></div>
        <div class="flex-1 space-y-2">
          <div class="skeleton h-3.5" :class="cellWidth(r, 1)"></div>
          <div class="skeleton h-3 w-1/3"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import SkeletonCard from './SkeletonCard.vue';

const props = defineProps({
  // 'table' | 'cards' | 'stats' | 'chart' | 'list'
  variant: { type: String, default: 'table' },
  rows: { type: Number, default: 6 },
  cols: { type: Number, default: 6 },
  // Proporciones de ancho por columna, ej. [2,1,1,2,1,1]. Si no se pasa, todas iguales.
  ratios: { type: Array, default: null },
  chartHeight: { type: String, default: '220px' },
  label: { type: String, default: 'Cargando…' }
});

const gridStyle = computed(() => {
  const r = props.ratios && props.ratios.length === props.cols
    ? props.ratios
    : Array.from({ length: props.cols }, () => 1);
  return { gridTemplateColumns: r.map(n => `${n}fr`).join(' ') };
});

// Anchos variados pero deterministas: evita que el skeleton "titile" entre renders
// y da un aspecto más orgánico que barras todas iguales.
const CELL_WIDTHS = ['w-full', 'w-4/5', 'w-2/3', 'w-3/4', 'w-1/2', 'w-5/6'];
const HEAD_WIDTHS = ['w-16', 'w-20', 'w-14', 'w-24', 'w-12', 'w-20'];

const cellWidth = (row, col) => CELL_WIDTHS[(row * 3 + col * 5) % CELL_WIDTHS.length];
const headWidth = (col) => HEAD_WIDTHS[col % HEAD_WIDTHS.length];

const BAR_HEIGHTS = [45, 70, 55, 85, 40, 95, 60, 75, 50, 90, 65, 80];
const barHeight = (i) => `${BAR_HEIGHTS[(i - 1) % BAR_HEIGHTS.length]}%`;
</script>
