<template>
  <div class="min-h-screen bg-slate-50">
    <!-- ===== Hero con gradiente ===== -->
    <div class="px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4">
      <div class="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 shadow-xl shadow-purple-500/20 px-5 sm:px-8 pt-6 pb-20">
        <div class="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-white/10"></div>
        <div class="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-white/5"></div>

        <div class="relative mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">Estadísticas y Análisis</h1>
            <p class="mt-1 text-white/80 text-sm sm:text-base">Panel de control y análisis regional de solicitudes</p>
          </div>
          <button @click="cargarTodosDatos" :disabled="cargando"
                  class="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-violet-700 shadow-lg hover:bg-white/90 transition-colors self-start sm:self-auto disabled:opacity-60">
            <svg :class="['w-4 h-4', cargando && 'animate-spin']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            {{ cargando ? 'Actualizando...' : 'Actualizar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ===== Contenido (se solapa con el hero) ===== -->
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-12 relative z-10 pb-10 space-y-6">

      <!-- KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="k in kpis" :key="k.label" class="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5 flex items-center gap-4">
          <div :class="['flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-white shadow-md', k.chip]">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="k.icon" />
            </svg>
          </div>
          <div class="min-w-0">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">{{ k.label }}</p>
            <p class="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums leading-tight">{{ k.value }}</p>
          </div>
        </div>
      </div>

      <!-- Mensajes -->
      <div v-if="mensajeExito" class="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
        <svg class="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span class="text-sm font-medium">{{ mensajeExito }}</span>
      </div>

      <div v-if="error" class="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800">
        <svg class="w-5 h-5 text-rose-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span class="text-sm font-medium flex-1">{{ error }}</span>
        <button @click="cargarTodosDatos" class="text-xs font-semibold text-rose-700 hover:text-rose-900">Reintentar</button>
      </div>

      <!-- Tendencia mensual + Ranking de regiones -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
        <!-- Tendencia mensual (card oscura) -->
        <div class="lg:col-span-3 relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-[#1a1030] p-6 text-white shadow-lg">
          <div class="pointer-events-none absolute -top-16 -right-10 h-52 w-52 rounded-full bg-fuchsia-500/20 blur-3xl"></div>
          <div class="pointer-events-none absolute -bottom-20 -left-12 h-52 w-52 rounded-full bg-violet-600/15 blur-3xl"></div>

          <div class="relative flex items-start justify-between mb-5">
            <div>
              <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-400">Tendencia mensual</h3>
              <p class="text-sm text-slate-400 mt-1">Últimos 12 meses · movimientos vs. solicitudes</p>
            </div>
            <div class="flex items-center gap-4 flex-shrink-0">
              <span class="flex items-center gap-2 text-xs text-slate-300">
                <span class="h-0.5 w-4 rounded bg-violet-400"></span> Movimientos
              </span>
              <span class="flex items-center gap-2 text-xs text-slate-300">
                <span class="h-0.5 w-4 rounded bg-emerald-400"></span> Solicitudes
              </span>
            </div>
          </div>

          <div class="relative h-72">
            <SkeletonLoader v-if="cargando" variant="chart" chart-height="150px" label="Cargando gráfico…" />
            <Line v-else-if="chartData.labels.length > 0" :data="chartData" :options="chartOptions" />
            <div v-else class="flex items-center justify-center h-full text-slate-500 text-sm">
              Sin datos para mostrar
            </div>
          </div>
        </div>

        <!-- Ranking de regiones -->
        <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6">
          <div class="flex items-center gap-3 mb-1">
            <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 class="text-base font-bold text-slate-900">Ranking de regiones</h3>
          </div>
          <p class="text-sm text-slate-500 mb-4 ml-12">Celulares rotos · promedio por usuario</p>

          <SkeletonLoader v-if="cargando" variant="list" :rows="5" label="Cargando ranking…" />
          <div v-else-if="rankingCelularesRotos.length === 0" class="py-10 text-center text-sm text-slate-400">
            Sin datos de regiones
          </div>
          <div v-else class="divide-y divide-slate-100">
            <div v-for="(region, index) in rankingCelularesRotos" :key="region.region" class="flex items-center gap-3 py-3">
              <span :class="['flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold', rankClass(index)]">
                {{ index + 1 }}
              </span>
              <div class="min-w-0 flex-1">
                <div class="font-semibold text-slate-900 text-sm truncate">{{ region.region.replace(/_/g, ' ') }}</div>
                <div class="text-xs text-slate-500">{{ region.totalUsuarios }} usuarios · {{ region.totalCelularesRotos }} rotos</div>
              </div>
              <div class="text-right flex-shrink-0">
                <div class="text-base font-bold text-slate-900 tabular-nums leading-none">{{ region.promedioCelularesRotos.toFixed(2) }}</div>
                <div class="text-[10px] text-slate-400 mt-0.5">prom/usr</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Solicitudes por región -->
      <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
          <div class="flex items-baseline gap-3">
            <h3 class="text-lg font-bold text-slate-900">Solicitudes por región</h3>
            <span class="text-sm text-slate-400">composición por estado</span>
          </div>
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex items-center gap-3 text-xs">
              <span class="flex items-center gap-1.5 text-slate-600"><span class="h-2.5 w-2.5 rounded-sm bg-amber-500"></span>Pendientes</span>
              <span class="flex items-center gap-1.5 text-slate-600"><span class="h-2.5 w-2.5 rounded-sm bg-indigo-500"></span>En proceso</span>
              <span class="flex items-center gap-1.5 text-slate-600"><span class="h-2.5 w-2.5 rounded-sm bg-emerald-500"></span>Resueltas</span>
              <span class="flex items-center gap-1.5 text-slate-600"><span class="h-2.5 w-2.5 rounded-sm bg-rose-500"></span>Por rotura</span>
            </div>
            <div class="w-52">
              <CustomSelect
                :model-value="regionSeleccionada"
                @update:model-value="(v: any) => { regionSeleccionada = v; cargarDatosPorRegion(); }"
                :options="regionOptions"
                placeholder="Todas las regiones" />
            </div>
          </div>
        </div>

        <SkeletonLoader v-if="cargando" variant="list" :rows="6" label="Cargando regiones…" />
        <div v-else-if="solicitudesPorRegion.length === 0" class="py-10 text-center text-sm text-slate-400">
          Sin datos de regiones
        </div>
        <div v-else class="divide-y divide-slate-100">
          <div v-for="r in solicitudesPorRegion" :key="r.region" class="py-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <!-- Región + total -->
            <div class="sm:w-44 flex-shrink-0">
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-900 text-sm uppercase">{{ r.region.replace(/_/g, ' ') }}</span>
                <span v-if="r.urgente" class="badge-rose">urgente</span>
              </div>
              <div class="text-xs text-slate-400">total de solicitudes</div>
            </div>

            <div class="text-2xl font-bold text-slate-900 tabular-nums sm:w-16 flex-shrink-0">{{ r.total }}</div>

            <!-- Barra apilada -->
            <div class="flex-1 min-w-0">
              <div class="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div v-for="s in r.segs" :key="s.key" :class="s.color" :style="{ width: pctOf(s.value, r.total) }"
                     :title="`${s.label}: ${s.value}`"></div>
              </div>
            </div>

            <!-- Números por estado -->
            <div class="flex items-center gap-3 flex-shrink-0 tabular-nums text-sm font-semibold">
              <span class="w-6 text-right text-amber-600">{{ r.segs[0].value }}</span>
              <span class="w-6 text-right text-indigo-600">{{ r.segs[1].value }}</span>
              <span class="w-6 text-right text-emerald-600">{{ r.segs[2].value }}</span>
              <span class="w-6 text-right text-rose-600">{{ r.segs[3].value }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Exportar datos -->
      <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6">
        <div class="flex items-center gap-3 mb-5">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900">Exportar datos</h3>
            <p class="text-sm text-slate-500">Filtrá el período y elegí qué exportar</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div>
            <label class="field-label">Fecha desde</label>
            <DatePicker :model-value="filtrosExportacion.fechaDesde" @update:model-value="(v: any) => filtrosExportacion.fechaDesde = v" placeholder="Cualquiera" />
          </div>
          <div>
            <label class="field-label">Fecha hasta</label>
            <DatePicker :model-value="filtrosExportacion.fechaHasta" @update:model-value="(v: any) => filtrosExportacion.fechaHasta = v" placeholder="Cualquiera" />
          </div>
          <div>
            <label class="field-label">Región</label>
            <CustomSelect :model-value="filtrosExportacion.region" @update:model-value="(v: any) => filtrosExportacion.region = v" :options="regionOptions" placeholder="Todas las regiones" />
          </div>
        </div>

        <div class="flex flex-wrap gap-3">
          <button @click="exportarEstadisticas" class="btn-primary">Estadísticas</button>
          <button @click="exportarMovimientos" class="btn-success">Movimientos</button>
          <button @click="exportarSolicitudes"
                  class="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 transition-colors">Solicitudes</button>
          <button @click="exportarRepartosRoturas"
                  class="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 transition-colors">Repartos</button>
          <button @click="exportarCompleto"
                  class="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 transition-colors">Todo</button>
        </div>
      </div>

      <!-- Detalle por mes -->
      <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div class="flex items-center gap-4">
            <h3 class="text-base font-bold text-slate-900">Detalle por mes</h3>
            <div v-if="!mostrarDetalleMensual" class="hidden sm:flex items-center gap-2 text-xs">
              <span class="badge-slate">{{ (estadisticas?.estadisticasMensuales || []).length }} meses</span>
              <span class="badge-indigo">{{ (estadisticas?.estadisticasMensuales || []).reduce((sum, item) => sum + item.movimientos, 0) }} mov.</span>
              <span class="badge-emerald">{{ (estadisticas?.estadisticasMensuales || []).reduce((sum, item) => sum + item.solicitudes, 0) }} sol.</span>
            </div>
          </div>
          <button @click="mostrarDetalleMensual = !mostrarDetalleMensual" class="btn-secondary !py-1.5">
            <svg :class="['w-4 h-4 transition-transform', mostrarDetalleMensual ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
            {{ mostrarDetalleMensual ? 'Ocultar' : 'Mostrar' }}
          </button>
        </div>

        <div v-show="mostrarDetalleMensual" class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50">
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Mes</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Año</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Movimientos</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Solicitudes</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="item in estadisticas?.estadisticasMensuales || []" :key="`${item.mes}-${item.year}`" class="hover:bg-slate-50 transition-colors">
                <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold text-slate-900">{{ item.mes }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{{ item.year }}</td>
                <td class="px-4 py-3 whitespace-nowrap"><span class="badge-indigo">{{ item.movimientos }}</span></td>
                <td class="px-4 py-3 whitespace-nowrap"><span class="badge-emerald">{{ item.solicitudes }}</span></td>
                <td class="px-4 py-3 whitespace-nowrap"><span class="badge-slate">{{ item.movimientos + item.solicitudes }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'vue-chartjs';
import {
  estadisticasService,
  type EstadisticasResumen,
  type EstadisticasRegion,
  type RepartoRotura
} from '@/services/estadisticasService';
import { excelService } from '@/services/excelService';
import CustomSelect from '@/components/CustomSelect.vue';
import DatePicker from '@/components/DatePicker.vue';
import SkeletonLoader from '@/components/SkeletonLoader.vue';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

// Estados reactivos
const estadisticas = ref<EstadisticasResumen | null>(null);
const estadisticasRegiones = ref<EstadisticasRegion[]>([]);
const repartosRoturas = ref<RepartoRotura[]>([]);
const regionSeleccionada = ref<string>('');
// Arranca en true: la carga se dispara en onMounted, así el primer frame ya
// muestra el skeleton en vez de "Sin datos".
const cargando = ref(true);
const cargandoRepartos = ref(false);
const error = ref<string>('');
const mensajeExito = ref<string>('');
const mostrarDetalleMensual = ref(false); // Collapsed por defecto

// Filtros de exportación
const filtrosExportacion = ref({
  fechaDesde: '',
  fechaHasta: '',
  region: ''
});

const regionOptions = [
  { value: '', label: 'Todas las regiones' },
  { value: 'COMERCIAL', label: 'Comercial (Agrupado)' },
  { value: 'NORTE', label: 'Norte' },
  { value: 'SUR', label: 'Sur' },
  { value: 'ESTE', label: 'Este' },
  { value: 'OESTE', label: 'Oeste' },
  { value: 'LA_PLATA', label: 'La Plata' },
  { value: 'NAFA', label: 'NAFA' }
];

// KPIs superiores
const kpis = computed(() => [
  {
    label: 'Total movimientos',
    value: estadisticas.value?.totalMovimientos ?? 0,
    chip: 'bg-gradient-to-br from-violet-500 to-indigo-600',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z'
  },
  {
    label: 'Total solicitudes',
    value: estadisticas.value?.totalSolicitudes ?? 0,
    chip: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  },
  {
    label: 'Mov. este mes',
    value: estadisticas.value?.movimientosMesActual ?? 0,
    chip: 'bg-gradient-to-br from-fuchsia-500 to-pink-600',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
  },
  {
    label: 'Sol. este mes',
    value: estadisticas.value?.solicitudesMesActual ?? 0,
    chip: 'bg-gradient-to-br from-amber-500 to-orange-600',
    icon: 'M5 10l7-7m0 0l7 7m-7-7v18'
  }
]);

// Computed properties
const rankingCelularesRotos = computed(() => {
  return estadisticasRegiones.value
    .filter(region => region.totalUsuarios > 0) // Solo regiones con usuarios
    .sort((a, b) => b.promedioCelularesRotos - a.promedioCelularesRotos) // Ordenar por promedio descendente
    .slice(0, 6); // Top 6 regiones
});

const rankClass = (index: number) => {
  if (index === 0) return 'bg-amber-500 text-white';
  if (index === 1) return 'bg-indigo-500 text-white';
  if (index === 2) return 'bg-rose-500 text-white';
  return 'bg-slate-200 text-slate-600';
};

// Composición de solicitudes por región (barras apiladas)
const solicitudesPorRegion = computed(() => {
  return estadisticasRegiones.value
    .map(r => ({
      region: r.region,
      total: r.totalSolicitudes || 0,
      urgente: r.urgente,
      segs: [
        { key: 'pend', label: 'Pendientes', value: r.solicitudesPendientes || 0, color: 'bg-amber-500' },
        { key: 'proc', label: 'En proceso', value: r.solicitudesEnProceso || 0, color: 'bg-indigo-500' },
        { key: 'res', label: 'Resueltas', value: r.solicitudesResueltas || 0, color: 'bg-emerald-500' },
        { key: 'rot', label: 'Por rotura', value: r.solicitudesPorRotura || 0, color: 'bg-rose-500' }
      ]
    }))
    .sort((a, b) => b.total - a.total);
});

const pctOf = (value: number, total: number) => (total > 0 ? `${(value / total) * 100}%` : '0%');

const chartData = computed(() => {
  if (!estadisticas.value?.estadisticasMensuales) {
    return { labels: [] as string[], datasets: [] as any[] };
  }

  return {
    labels: estadisticas.value.estadisticasMensuales.map(item => item.mes),
    datasets: [
      {
        label: 'Movimientos',
        borderColor: '#a78bfa',
        backgroundColor: 'rgba(167, 139, 250, 0.15)',
        data: estadisticas.value.estadisticasMensuales.map(item => item.movimientos),
        tension: 0.4,
        borderWidth: 2,
        fill: true
      },
      {
        label: 'Solicitudes',
        borderColor: '#34d399',
        backgroundColor: 'rgba(52, 211, 153, 0.15)',
        data: estadisticas.value.estadisticasMensuales.map(item => item.solicitudes),
        tension: 0.4,
        borderWidth: 2,
        fill: true
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { intersect: false, mode: 'index' as const },
  plugins: {
    legend: { display: false },
    title: { display: false },
    tooltip: {
      backgroundColor: '#0f172a',
      borderColor: 'rgba(255,255,255,0.12)',
      borderWidth: 1,
      padding: 10,
      cornerRadius: 8
    }
  },
  elements: { point: { radius: 0, hoverRadius: 4 } },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: { color: '#94a3b8', font: { size: 11 } }
    },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(255,255,255,0.06)' },
      border: { display: false },
      ticks: { color: '#64748b', font: { size: 11 }, maxTicksLimit: 5 }
    }
  }
};

// Métodos
const cargarEstadisticas = async () => {
  cargando.value = true;
  error.value = '';

  try {
    estadisticas.value = await estadisticasService.obtenerEstadisticas();
  } catch (err: any) {
    console.error('Error al cargar estadísticas:', err);
    error.value = err.message || 'Error al cargar las estadísticas. Verifique la conexión con el servidor.';
    estadisticas.value = null;
  } finally {
    cargando.value = false;
  }
};

const cargarEstadisticasRegiones = async () => {
  cargando.value = true;
  error.value = '';

  try {
    console.log('Cargando estadísticas de regiones...');
    let regionesData = await estadisticasService.obtenerTodasLasRegiones();

    // Filtrar SISTEMAS si existe
    regionesData = regionesData.filter(region => region.region !== 'SISTEMAS');

    estadisticasRegiones.value = regionesData;
  } catch (err: any) {
    console.error('Error al cargar estadísticas por región:', err);
    error.value = err.message || 'Error al cargar las estadísticas por región. Verifique la conexión con el servidor.';
    estadisticasRegiones.value = [];
  } finally {
    cargando.value = false;
  }
};

const cargarDatosPorRegion = async () => {
  if (!regionSeleccionada.value) {
    await cargarEstadisticasRegiones();
    return;
  }

  cargando.value = true;
  error.value = '';
  try {
    const fechaActual = new Date();
    const fechaHasta = fechaActual.toISOString().split('T')[0];
    const fechaDesde = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1).toISOString().split('T')[0];

    const estadisticaRegion = await estadisticasService.obtenerEstadisticasPorRegion(
      regionSeleccionada.value,
      fechaDesde,
      fechaHasta
    );

    estadisticasRegiones.value = [estadisticaRegion];
  } catch (err) {
    console.error('Error al cargar datos por región:', err);
    error.value = `Error al cargar datos de la región ${regionSeleccionada.value}. Verifique la conexión con el servidor.`;
    estadisticasRegiones.value = [];
  } finally {
    cargando.value = false;
  }
};

const cargarTodosDatos = async () => {
  await Promise.all([
    cargarEstadisticas(),
    cargarEstadisticasRegiones(),
    cargarRepartosRoturas()
  ]);
};

const cargarRepartosRoturas = async () => {
  cargandoRepartos.value = true;
  try {
    repartosRoturas.value = await estadisticasService.obtenerRepartosConMasRoturas();
  } catch (err: any) {
    console.error('Error al cargar repartos con roturas:', err);
    error.value = err.message || 'Error al cargar repartos con roturas';
    repartosRoturas.value = [];
  } finally {
    cargandoRepartos.value = false;
  }
};

const exportarEstadisticas = async () => {
  try {
    await excelService.exportarEstadisticasCompletas();
    mostrarExito('Estadísticas completas exportadas correctamente');
  } catch (error: any) {
    console.error('Error al exportar estadísticas completas:', error);
    mostrarError(error.message || 'Error al exportar las estadísticas');
  }
};

const exportarMovimientos = async () => {
  try {
    let movimientos;
    const hayFiltros = Object.values(filtrosExportacion.value).some(v => v);

    if (hayFiltros) {
      try {
        movimientos = await estadisticasService.exportarMovimientosConFiltros(
          filtrosExportacion.value.fechaDesde || undefined,
          filtrosExportacion.value.fechaHasta || undefined,
          filtrosExportacion.value.region || undefined
        );
      } catch (err) {
        console.warn('Filtros no disponibles, usando exportación básica');
        movimientos = await estadisticasService.obtenerMovimientosDetalle();
      }
    } else {
      movimientos = await estadisticasService.obtenerMovimientosDetalle();
    }

    const fechaHoy = new Date().toISOString().split('T')[0];

    if (hayFiltros) {
      excelService.exportarMovimientosConFiltros(
        movimientos,
        filtrosExportacion.value,
        `movimientos_filtrados_${fechaHoy}.xlsx`
      );
    } else {
      excelService.exportarMovimientos(movimientos, `movimientos_${fechaHoy}.xlsx`);
    }

    mostrarExito(`${movimientos.length} movimientos exportados correctamente`);
  } catch (err) {
    console.error('Error al exportar movimientos:', err);
    mostrarError('Error al exportar movimientos');
  }
};

const exportarSolicitudes = async () => {
  try {
    let solicitudes;
    const hayFiltros = Object.values(filtrosExportacion.value).some(v => v);

    if (hayFiltros) {
      try {
        solicitudes = await estadisticasService.exportarSolicitudesConFiltros(
          filtrosExportacion.value.fechaDesde || undefined,
          filtrosExportacion.value.fechaHasta || undefined,
          filtrosExportacion.value.region || undefined,
          undefined // estado
        );
      } catch (err) {
        console.warn('Filtros no disponibles, usando exportación básica');
        solicitudes = await estadisticasService.obtenerSolicitudesDetalle();
      }
    } else {
      solicitudes = await estadisticasService.obtenerSolicitudesDetalle();
    }

    const fechaHoy = new Date().toISOString().split('T')[0];

    if (hayFiltros) {
      excelService.exportarSolicitudesConFiltros(
        solicitudes,
        filtrosExportacion.value,
        `solicitudes_filtradas_${fechaHoy}.xlsx`
      );
    } else {
      excelService.exportarSolicitudes(solicitudes, `solicitudes_${fechaHoy}.xlsx`);
    }

    mostrarExito(`${solicitudes.length} solicitudes exportadas correctamente`);
  } catch (err) {
    console.error('Error al exportar solicitudes:', err);
    mostrarError('Error al exportar solicitudes');
  }
};

const exportarCompleto = async () => {
  if (!estadisticas.value?.estadisticasMensuales) {
    error.value = 'No hay datos para exportar';
    return;
  }

  try {
    const hayFiltros = Object.values(filtrosExportacion.value).some(v => v);
    let movimientos, solicitudes;

    if (hayFiltros) {
      try {
        [movimientos, solicitudes] = await Promise.all([
          estadisticasService.exportarMovimientosConFiltros(
            filtrosExportacion.value.fechaDesde || undefined,
            filtrosExportacion.value.fechaHasta || undefined,
            filtrosExportacion.value.region || undefined
          ),
          estadisticasService.exportarSolicitudesConFiltros(
            filtrosExportacion.value.fechaDesde || undefined,
            filtrosExportacion.value.fechaHasta || undefined,
            filtrosExportacion.value.region || undefined,
            undefined
          )
        ]);
      } catch (err) {
        console.warn('Filtros no disponibles, usando exportación básica');
        [movimientos, solicitudes] = await Promise.all([
          estadisticasService.obtenerMovimientosDetalle(),
          estadisticasService.obtenerSolicitudesDetalle()
        ]);
      }
    } else {
      [movimientos, solicitudes] = await Promise.all([
        estadisticasService.obtenerMovimientosDetalle(),
        estadisticasService.obtenerSolicitudesDetalle()
      ]);
    }

    const fechaHoy = new Date().toISOString().split('T')[0];
    const nombreArchivo = hayFiltros
      ? `reporte_completo_filtrado_${fechaHoy}.xlsx`
      : `reporte_completo_${fechaHoy}.xlsx`;

    excelService.exportarCompleto(
      estadisticas.value.estadisticasMensuales,
      movimientos,
      solicitudes,
      nombreArchivo
    );

    mostrarExito('Reporte completo exportado correctamente');
  } catch (err) {
    console.error('Error al exportar reporte completo:', err);
    mostrarError('Error al exportar reporte completo');
  }
};

const exportarRepartosRoturas = async () => {
  try {
    await excelService.exportarEstadisticasCompletas();
    mostrarExito('Estadísticas completas con ranking de repartos exportadas correctamente');
  } catch (err: any) {
    console.error('Error al exportar repartos con roturas:', err);
    mostrarError(err.message || 'Error al exportar repartos con roturas');
  }
};

// Función auxiliar para limpiar mensajes
const limpiarMensajes = () => {
  setTimeout(() => {
    error.value = '';
    mensajeExito.value = '';
  }, 5000);
};

const mostrarExito = (mensaje: string) => {
  mensajeExito.value = mensaje;
  error.value = '';
  limpiarMensajes();
};

const mostrarError = (mensajeError: string) => {
  error.value = mensajeError;
  mensajeExito.value = '';
  limpiarMensajes();
};

// Lifecycle
onMounted(() => {
  cargarTodosDatos();
});
</script>
