
<template>
  <div class="relative overflow-hidden">
    <!-- Dashboard para usuarios normales -->
    <div v-if="!isAdmin" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DashboardUsuario />
    </div>

    <!-- ================= Dashboard ADMIN (Vivid) ================= -->
    <div v-else class="min-h-screen bg-slate-50">
      <!-- Hero con gradiente -->
      <div class="px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4">
        <div class="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 shadow-xl shadow-purple-500/20 px-5 sm:px-8 pt-6 pb-20">
          <div class="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-white/10"></div>
          <div class="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-white/5"></div>

          <div class="relative mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/80 mb-2">
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                Centro de Control
              </div>
              <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">Hola, {{ currentUser?.username || 'admin' }}</h1>
              <p class="mt-1 text-white/80 text-sm sm:text-base">Panel de administración · acceso rápido a funciones críticas</p>
            </div>

            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 ring-1 ring-white/20 text-white text-xs font-semibold">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                {{ currentUser?.role || 'ADMIN' }}
              </span>
              <span v-if="currentUser?.region" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 ring-1 ring-white/20 text-white text-xs font-semibold">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {{ formatRegion(currentUser.region) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido (se solapa con el hero) -->
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-12 relative z-10 pb-10 space-y-6">

        <!-- Fila 1: Utilización (donut) + Stat cards -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <!-- Utilización del inventario (card oscura) -->
          <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-[#1a1030] p-6 text-white shadow-lg">
            <!-- Glows difuminados -->
            <div class="pointer-events-none absolute -top-16 -right-10 h-52 w-52 rounded-full bg-fuchsia-500/25 blur-3xl"></div>
            <div class="pointer-events-none absolute top-8 right-24 h-32 w-32 rounded-full bg-violet-500/20 blur-3xl"></div>
            <div class="pointer-events-none absolute -bottom-20 -left-12 h-52 w-52 rounded-full bg-violet-600/15 blur-3xl"></div>
            <div class="relative flex items-center justify-between mb-4">
              <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-400">Utilización del inventario</h3>
            </div>

            <div class="relative flex items-center gap-5">
              <!-- Donut -->
              <div class="relative flex-shrink-0">
                <svg width="132" height="132" viewBox="0 0 180 180" class="-rotate-90">
                  <defs>
                    <linearGradient id="donutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#c084fc" />
                      <stop offset="100%" stop-color="#e879f9" />
                    </linearGradient>
                  </defs>
                  <circle cx="90" cy="90" r="70" fill="none" stroke="#1e293b" stroke-width="16" />
                  <circle cx="90" cy="90" r="70" fill="none" stroke="url(#donutGrad)" stroke-width="16" stroke-linecap="round"
                          :stroke-dasharray="DASH" :stroke-dashoffset="dashoffset"
                          class="transition-all duration-700 ease-out" />
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <span class="text-3xl font-bold leading-none">{{ stats.loading ? '—' : pctAsignados }}<span class="text-lg">%</span></span>
                  <span class="text-[11px] text-slate-400 mt-1">asignado</span>
                </div>
              </div>

              <!-- Leyenda -->
              <div class="flex-1 space-y-3">
                <div class="flex items-center gap-3">
                  <span class="h-2.5 w-2.5 rounded-full bg-violet-400"></span>
                  <div>
                    <div class="text-lg font-bold leading-none tabular-nums">{{ fmt(stats.asignados) }}</div>
                    <div class="text-xs text-slate-400">Asignados</div>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <span class="h-2.5 w-2.5 rounded-full bg-fuchsia-400"></span>
                  <div>
                    <div class="text-lg font-bold leading-none tabular-nums">{{ fmt(disponibles) }}</div>
                    <div class="text-xs text-slate-400">Disponibles</div>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <span class="h-2.5 w-2.5 rounded-full bg-slate-500"></span>
                  <div>
                    <div class="text-lg font-bold leading-none tabular-nums">{{ detailsLoading ? '—' : fmt(rotos) }}</div>
                    <div class="text-xs text-slate-400">Rotos</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="relative mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
              <span class="text-xs text-slate-400">{{ fmt(stats.asignados) }} de {{ fmt(stats.celulares) }} dispositivos en uso</span>
              <router-link to="/estadisticas" class="text-xs font-semibold text-fuchsia-300 hover:text-fuchsia-200 transition-colors">Ver detalle →</router-link>
            </div>
          </div>

          <!-- Stat cards 2x2 -->
          <div class="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div v-for="c in statCards" :key="c.key" class="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5 flex flex-col">
              <div class="flex items-start justify-between">
                <div :class="['flex items-center justify-center w-10 h-10 rounded-xl', c.iconBg]">
                  <svg class="w-5 h-5" :class="c.iconText" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="c.icon" />
                  </svg>
                </div>
                <span v-if="c.badge" :class="['text-xs font-semibold px-2 py-0.5 rounded-full', c.badgeClass]">{{ c.badge }}</span>
              </div>
              <div class="mt-3 text-3xl font-bold text-slate-900 tabular-nums leading-none">{{ stats.loading ? '—' : fmt(c.value) }}</div>
              <div class="mt-1 text-sm text-slate-500"><span class="font-medium text-slate-700">{{ c.label }}</span> · {{ c.sub }}</div>
              <div class="mt-auto pt-4 flex items-end gap-1.5">
                <span v-for="(cls, i) in c.bars" :key="i" :class="['h-2 flex-1 rounded-full', cls]"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Fila 2: Actividad + Accesos rápidos -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <!-- Actividad de movimientos -->
          <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6">
            <div class="flex items-start justify-between mb-1">
              <h3 class="text-base font-bold text-slate-900">Actividad de movimientos</h3>
              <span class="text-xs text-slate-400">últimos 7 días</span>
            </div>
            <p class="text-sm text-slate-500 mb-5">Movimientos registrados por día</p>

            <div v-if="detailsLoading" class="h-32 flex items-center justify-center text-sm text-slate-400">Cargando…</div>
            <div v-else class="flex items-end justify-between gap-2 h-32">
              <div v-for="(d, i) in activity" :key="i" class="flex-1 flex flex-col items-center gap-2 group">
                <div class="w-full flex items-end justify-center" style="height: 96px;">
                  <div :class="['w-full max-w-[26px] rounded-t-md transition-all', d.count > 0 ? 'bg-gradient-to-t from-violet-500 to-fuchsia-400' : 'bg-slate-100']"
                       :style="{ height: barHeight(d.count) }"
                       :title="`${d.count} movimiento(s)`"></div>
                </div>
                <span :class="['text-xs', d.isToday ? 'text-violet-600 font-semibold' : 'text-slate-400']">{{ d.label }}</span>
              </div>
            </div>
            <div class="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-500">
              <span class="font-semibold text-slate-900">{{ detailsLoading ? '—' : activityTotal }}</span> movimientos esta semana
            </div>
          </div>

          <!-- Accesos rápidos -->
          <div class="lg:col-span-2">
            <h2 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Accesos rápidos</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <router-link
                v-for="action in actions"
                :key="action.to"
                :to="action.to"
                class="group relative bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div :class="['flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0', action.iconBg]">
                  <svg class="w-6 h-6" :class="action.iconText" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="action.icon" />
                  </svg>
                </div>
                <div class="min-w-0">
                  <div class="font-semibold text-slate-900">{{ action.title }}</div>
                  <div class="text-sm text-slate-500 truncate">{{ action.desc }}</div>
                </div>
                <svg class="ml-auto w-5 h-5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </router-link>
            </div>
          </div>
        </div>

        <!-- Fila 3: Alertas + Notificaciones -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <!-- Alertas del Sistema -->
          <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Alertas del Sistema
              </h3>
              <span :class="['text-xs font-semibold px-2.5 py-0.5 rounded-full', alertas.length ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700']">
                {{ alertas.length }} {{ alertas.length === 1 ? 'activa' : 'activas' }}
              </span>
            </div>

            <div v-if="alertas.length" class="space-y-3">
              <div v-for="(a, i) in alertas" :key="i" :class="['flex items-start gap-3 p-3.5 rounded-xl border', a.wrap]">
                <div :class="['flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0', a.chip]">
                  <svg class="w-5 h-5" :class="a.iconText" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="a.icon" />
                  </svg>
                </div>
                <div>
                  <div :class="['font-semibold text-sm', a.title]">{{ a.heading }}</div>
                  <div :class="['text-sm mt-0.5', a.body]">{{ a.text }}</div>
                </div>
              </div>
            </div>
            <div v-else class="flex flex-col items-center gap-2 py-8 text-center">
              <div class="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50">
                <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p class="text-sm text-slate-500">Todo en orden, sin alertas activas</p>
            </div>
          </div>

          <!-- Panel de Notificaciones -->
          <NotificacionesPanel />
        </div>
      </div>
    </div>

    <!-- Stats Section para usuarios no admin -->
    <div v-if="!isAdmin" class="bg-gradient-to-r from-gray-50 to-gray-100 py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Información del Sistema</h2>
          <p class="text-lg text-gray-600">Vista general del inventario de dispositivos</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
            <div class="flex items-center justify-between mb-4">
              <div class="bg-blue-100 rounded-full p-3">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z"></path>
                </svg>
              </div>
            </div>
            <div class="text-4xl font-bold text-gray-900 mb-2">{{ stats.loading ? '...' : stats.celulares }}</div>
            <div class="text-gray-600 font-medium">Celulares Registrados</div>
            <div class="text-sm text-gray-500 mt-1">Total en inventario</div>
          </div>

          <div class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
            <div class="flex items-center justify-between mb-4">
              <div class="bg-orange-100 rounded-full p-3">
                <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <span class="text-sm font-medium text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                {{ stats.loading ? '...' : Math.floor((stats.asignados / stats.celulares) * 100) + '%' }}
              </span>
            </div>
            <div class="text-4xl font-bold text-gray-900 mb-2">{{ stats.loading ? '...' : stats.asignados }}</div>
            <div class="text-gray-600 font-medium">Dispositivos Asignados</div>
            <div class="text-sm text-gray-500 mt-1">En uso actualmente</div>
          </div>

          <div class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
            <div class="flex items-center justify-between mb-4">
              <div class="bg-purple-100 rounded-full p-3">
                <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                </svg>
              </div>
            </div>
            <div class="text-4xl font-bold text-gray-900 mb-2">{{ stats.loading ? '...' : stats.movimientos }}</div>
            <div class="text-gray-600 font-medium">Movimientos</div>
            <div class="text-sm text-gray-500 mt-1">Actividad reciente</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { celularService } from '@/services/celularService.ts';
import { movimientoService } from '@/services/movimientoService.ts';
import { authService } from '@/services/authService';
import estadisticasService from '@/services/estadisticasService';
import DashboardUsuario from '@/components/DashboardUsuario.vue';
import NotificacionesPanel from '@/components/NotificacionesPanel.vue';

const stats = ref({
  celulares: 0,
  usuarios: 0,
  movimientos: 0,
  asignados: 0,
  loading: true
});

// Datos de detalle (para donut/rotos y actividad)
const detailsLoading = ref(true);
const celularesList = ref([]);
const movimientosList = ref([]);

const currentUser = computed(() => authService.getCurrentUser());
const isAdmin = computed(() => authService.isAdmin());

// Métricas derivadas (reales)
const disponibles = computed(() => Math.max(0, (stats.value.celulares || 0) - (stats.value.asignados || 0)));
const pctAsignados = computed(() =>
  stats.value.celulares ? Math.round((stats.value.asignados / stats.value.celulares) * 100) : 0
);
const rotos = computed(() => celularesList.value.filter(c => c.estado === 'ROTO').length);

const fmt = (n) => (n ?? 0).toLocaleString('es-AR');
const formatRegion = (r) => (r || '').replace(/_/g, ' ');
const pad = (n) => String(n).padStart(2, '0');

// Donut
const DASH = 2 * Math.PI * 70;
const dashoffset = computed(() => DASH * (1 - (stats.value.loading ? 0 : pctAsignados.value) / 100));

// Actividad últimos 7 días (real)
const activity = computed(() => {
  const counts = {};
  for (const m of movimientosList.value) {
    const d = (m.fecha || '').split('T')[0];
    if (d) counts[d] = (counts[d] || 0) + 1;
  }
  const dow = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  const hoy = new Date();
  const hoyIso = `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())}`;
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const dt = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - i);
    const iso = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
    days.push({ label: dow[dt.getDay()], count: counts[iso] || 0, isToday: iso === hoyIso });
  }
  return days;
});
const activityMax = computed(() => Math.max(1, ...activity.value.map(d => d.count)));
const activityTotal = computed(() => activity.value.reduce((s, d) => s + d.count, 0));
const barHeight = (count) => `${Math.max(4, Math.round((count / activityMax.value) * 96))}px`;

// Movimientos de hoy
const movimientosHoy = computed(() => {
  const hoy = new Date();
  const hoyIso = `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())}`;
  return movimientosList.value.filter(m => (m.fecha || '').split('T')[0] === hoyIso).length;
});

// Stat cards (2x2)
const statCards = computed(() => [
  {
    key: 'disp', label: 'Dispositivos', sub: `${disponibles.value} disp.`, value: stats.value.celulares,
    icon: 'M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z',
    iconBg: 'bg-blue-50', iconText: 'text-blue-600', badge: null, badgeClass: '',
    bars: ['bg-blue-100', 'bg-blue-200', 'bg-blue-300', 'bg-blue-400', 'bg-blue-600']
  },
  {
    key: 'users', label: 'Usuarios', sub: 'activos', value: stats.value.usuarios,
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
    iconBg: 'bg-emerald-50', iconText: 'text-emerald-600', badge: null, badgeClass: '',
    bars: ['bg-emerald-100', 'bg-emerald-200', 'bg-emerald-300', 'bg-emerald-400', 'bg-emerald-600']
  },
  {
    key: 'asig', label: 'Asignados', sub: 'en uso', value: stats.value.asignados,
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    iconBg: 'bg-amber-50', iconText: 'text-amber-600',
    badge: stats.value.loading ? null : `${pctAsignados.value}%`, badgeClass: 'bg-amber-100 text-amber-700',
    bars: ['bg-amber-100', 'bg-amber-200', 'bg-amber-300', 'bg-amber-400', 'bg-orange-500']
  },
  {
    key: 'mov', label: 'Movimientos', sub: 'total', value: stats.value.movimientos,
    icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
    iconBg: 'bg-violet-50', iconText: 'text-violet-600',
    badge: (!detailsLoading.value && movimientosHoy.value > 0) ? `+${movimientosHoy.value} hoy` : null,
    badgeClass: 'bg-violet-100 text-violet-700',
    bars: ['bg-violet-100', 'bg-violet-200', 'bg-violet-300', 'bg-violet-400', 'bg-violet-600']
  }
]);

// Alertas (data-driven)
const alertas = computed(() => {
  const arr = [];
  if (disponibles.value > 0) {
    arr.push({
      heading: 'Dispositivos sin asignar',
      text: `${fmt(disponibles.value)} celulares disponibles para asignación`,
      icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      wrap: 'border-amber-200 bg-amber-50/60', chip: 'bg-amber-100', iconText: 'text-amber-600',
      title: 'text-amber-900', body: 'text-amber-700'
    });
  }
  if (!detailsLoading.value && rotos.value > 0) {
    arr.push({
      heading: 'Celulares rotos',
      text: `${fmt(rotos.value)} equipos marcados como rotos requieren atención`,
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z',
      wrap: 'border-rose-200 bg-rose-50/60', chip: 'bg-rose-100', iconText: 'text-rose-600',
      title: 'text-rose-900', body: 'text-rose-700'
    });
  }
  return arr;
});

const actions = [
  {
    to: '/celulares', title: 'Inventario', desc: 'Gestionar celulares',
    icon: 'M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z',
    iconBg: 'bg-blue-50', iconText: 'text-blue-600'
  },
  {
    to: '/usuarios', title: 'Usuarios', desc: 'Gestión de personal',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
    iconBg: 'bg-emerald-50', iconText: 'text-emerald-600'
  },
  {
    to: '/mis-solicitudes', title: 'Solicitudes', desc: 'Revisar pedidos',
    icon: 'M9 5H7a2 2 0 00-2 2v1a2 2 0 002 2h2m0 0a2 2 0 002 2v5.586a1 1 0 01-.293.707L9 18.414V20a2 2 0 01-2 2H5a2 2 0 01-2-2v-1.586a1 1 0 01.293-.707L5 16.414V14a2 2 0 012-2h2z',
    iconBg: 'bg-orange-50', iconText: 'text-orange-600'
  },
  {
    to: '/estadisticas', title: 'Analytics', desc: 'Reportes y métricas',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    iconBg: 'bg-purple-50', iconText: 'text-purple-600'
  }
];

const cargarEstadisticas = async () => {
  if (!authService.isAuthenticated()) {
    stats.value.loading = false;
    detailsLoading.value = false;
    return;
  }

  if (!isAdmin.value) {
    stats.value.loading = false;
    detailsLoading.value = false;
    return;
  }

  // 1) Totales rápidos
  stats.value.loading = true;
  try {
    const est = await estadisticasService.obtenerEstadisticasGenerales();
    stats.value.celulares = est.totalDispositivos;
    stats.value.asignados = est.totalAsignados;
    stats.value.usuarios = est.totalUsuarios;
    stats.value.movimientos = est.totalMovimientos;
  } catch (error) {
    console.error('Error cargando estadísticas:', error);
  } finally {
    stats.value.loading = false;
  }

  // 2) Detalle para donut (rotos) y actividad (movimientos)
  detailsLoading.value = true;
  try {
    const [celRes, movRes] = await Promise.all([
      celularService.obtenerTodos().catch(() => ({ data: [] })),
      movimientoService.obtenerTodos().catch(() => ({ data: [] }))
    ]);

    celularesList.value = Array.isArray(celRes.data) ? celRes.data : [];

    const movData = Array.isArray(movRes.data)
      ? movRes.data
      : (Array.isArray(movRes.data?.content) ? movRes.data.content : []);
    movimientosList.value = movData;
  } catch (error) {
    console.error('Error cargando detalle del dashboard:', error);
  } finally {
    detailsLoading.value = false;
  }
};

onMounted(() => {
  cargarEstadisticas();
});
</script>
