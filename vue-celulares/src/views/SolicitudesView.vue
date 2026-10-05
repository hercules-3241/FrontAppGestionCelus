<template>
  <div class="min-h-screen bg-slate-50">
    <!-- ===== Hero con gradiente ===== -->
    <div class="px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4">
      <div class="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 shadow-xl shadow-purple-500/20 px-5 sm:px-8 pt-6 pb-20">
        <div class="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-white/10"></div>
        <div class="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-white/5"></div>

        <div class="relative mx-auto max-w-7xl">
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">Gestión de Solicitudes</h1>
          <p class="mt-1 text-white/80 text-sm sm:text-base">Administra y consulta las solicitudes de celulares</p>
        </div>
      </div>
    </div>

    <!-- ===== Contenido (se solapa con el hero) ===== -->
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-12 relative z-10 pb-10 space-y-6">

      <!-- Notificación -->
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="notification.show"
             :class="[
               'flex items-center justify-between gap-3 rounded-xl border px-4 py-3 shadow-sm',
               notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
             ]">
          <div class="flex items-center gap-3">
            <svg v-if="notification.type === 'success'" class="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <svg v-else class="w-5 h-5 text-rose-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="text-sm font-medium">{{ notification.message }}</span>
          </div>
          <button @click="notification.show = false" class="p-1 rounded-lg hover:bg-black/5 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </transition>

      <!-- ===== Nueva solicitud ===== -->
      <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-visible">
        <div class="flex items-center gap-4 px-6 py-5 border-b border-slate-100">
          <div class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-md">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">Nueva solicitud</h2>
            <p class="text-sm text-slate-500">Completa los datos para registrar el pedido</p>
          </div>
        </div>

        <form @submit.prevent="crearSolicitud" class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div>
              <label class="field-label">Región</label>
              <CustomSelect v-model="form.region" :options="regionOptions" placeholder="Seleccionar región" />
            </div>
            <div>
              <label class="field-label">Tipo de solicitud</label>
              <CustomSelect v-model="form.tipoSolicitud" :options="tipoOptions" placeholder="Seleccionar tipo" />
            </div>

            <div>
              <label for="admin-solicitante" class="field-label">Solicitante (Supervisor o Regional)</label>
              <EmpleadoAutocomplete id="admin-solicitante" v-model="form.nomSolicitante" :empleados="solicitantes"
                                    :loading="loadingEmpleados" :disabled="!form.region" input-class="input"
                                    :placeholder="form.region ? 'Buscar supervisor o regional' : 'Primero selecciona la región'"
                                    empty-text="No hay supervisores ni regionales en la región" />
            </div>
            <div>
              <label for="admin-cargo" class="field-label">Cargo del solicitante</label>
              <input id="admin-cargo" :value="cargoSolicitante" type="text" class="input text-slate-500"
                     placeholder="Se completa al elegir el solicitante" readonly />
            </div>

            <div>
              <label for="admin-usuario" class="field-label">Usuario del equipo</label>
              <EmpleadoAutocomplete id="admin-usuario" v-model="form.usuario" :empleados="empleadosRegion"
                                    :loading="loadingEmpleados" :disabled="!form.region" input-class="input"
                                    :placeholder="form.region ? 'Buscar por número de reparto' : 'Primero selecciona la región'"
                                    empty-text="No hay usuarios en la región" />
            </div>
            <div>
              <label for="admin-legajo" class="field-label">Legajo</label>
              <input id="admin-legajo" v-model="form.legajo" type="text" maxlength="50" class="input"
                     placeholder="Legajo del usuario del equipo" required />
            </div>

            <div>
              <label class="field-label">Fecha de incidencia</label>
              <DatePicker v-model="form.fechaIncidencia" placeholder="dd/mm/aaaa" />
            </div>
            <div>
              <label class="field-label">¿Necesita línea?</label>
              <CustomSelect v-model="form.necesitaLinea" :options="lineaOptions" />
            </div>

            <div>
              <label class="field-label">Motivo</label>
              <CustomSelect v-model="form.motivo" :options="motivoOptions" placeholder="Seleccionar motivo" />
            </div>
            <div class="md:col-span-2">
              <label for="admin-observacion" class="field-label">{{ form.motivo === 'OTRO' ? 'Observación' : 'Observación (opcional)' }}</label>
              <textarea id="admin-observacion" v-model="form.observacion" rows="3" maxlength="1000" class="input resize-none"
                        :required="form.motivo === 'OTRO'" placeholder="Detalles adicionales"></textarea>
            </div>
            <p v-if="errorEmpleados" class="md:col-span-2 text-sm text-rose-600">{{ errorEmpleados }}</p>
          </div>

          <div class="flex justify-end items-center gap-3 mt-6 pt-5 border-t border-slate-100">
            <button type="button" @click="resetForm" class="btn-secondary">Cancelar</button>
            <button type="submit"
                    class="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-md hover:opacity-90 transition-opacity">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Crear solicitud
            </button>
          </div>
        </form>
      </div>

      <!-- ===== Filtros ===== -->
      <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5">
        <div class="flex items-center gap-2 mb-4">
          <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"></path>
          </svg>
          <span class="text-sm font-semibold text-slate-800">Filtros</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label class="field-label">Región</label>
            <CustomSelect v-model="filtros.region" :options="regionFiltroOptions" placeholder="Todas las regiones" />
          </div>
          <div>
            <label class="field-label">Tipo de solicitud</label>
            <CustomSelect v-model="filtros.tipoSolicitud" :options="tipoFiltroOptions" placeholder="Todos los tipos" />
          </div>
          <div>
            <label class="field-label">Usuario</label>
            <input v-model="filtros.usuario" type="text" class="input" placeholder="Buscar usuario..." />
          </div>
        </div>
      </div>

      <!-- ===== Exportar a Excel ===== -->
      <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5">
        <div class="flex flex-col lg:flex-row lg:items-end gap-4">
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <div class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div class="min-w-0">
              <h3 class="text-base font-semibold text-slate-900">Exportar a Excel</h3>
              <p class="text-sm text-slate-500">
                <span class="font-semibold" :class="solicitudesDelMes > 0 ? 'text-emerald-600' : 'text-slate-400'">{{ solicitudesDelMes }}</span>
                {{ solicitudesDelMes === 1 ? 'solicitud' : 'solicitudes' }} en el mes seleccionado
              </p>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
            <div class="w-full sm:w-44">
              <label class="field-label">Mes</label>
              <CustomSelect v-model="exportacion.mes" :options="mesesOptions" />
            </div>
            <div class="w-full sm:w-28">
              <label class="field-label">Año</label>
              <CustomSelect v-model="exportacion.año" :options="aniosOptions" />
            </div>
            <button @click="exportarPorMes" :disabled="exportando || solicitudesDelMes === 0" class="btn-success whitespace-nowrap">
              <svg v-if="!exportando" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <div v-else class="animate-spin rounded-full h-4 w-4 border-2 border-white/40 border-t-white"></div>
              {{ exportando ? 'Exportando...' : 'Exportar' }}
            </button>
          </div>
        </div>
      </div>

      <!-- ===== Solicitudes recientes ===== -->
      <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <h2 class="text-base font-bold text-slate-900">Solicitudes recientes</h2>
            <span class="badge-indigo">{{ solicitudesFiltradas.length }} en total</span>
          </div>
          <button @click="cargarSolicitudes" class="btn-secondary !py-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Refrescar
          </button>
        </div>

        <SkeletonLoader
          v-if="loading"
          variant="table"
          :rows="solicitudesPorPagina"
          :cols="8"
          :ratios="[2, 1.2, 1.3, 2, 0.8, 1, 1.2, 1]"
          label="Cargando solicitudes…"
        />

        <div v-else-if="solicitudesFiltradas.length === 0" class="flex flex-col items-center gap-3 py-16">
          <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <svg class="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <p class="text-sm text-slate-500">No hay solicitudes que coincidan con los filtros</p>
        </div>

        <template v-else>
          <!-- Vista escritorio -->
          <div class="hidden lg:block overflow-x-auto">
            <table class="w-full" style="min-width: 1100px;">
              <thead>
                <tr class="border-b border-slate-200 bg-slate-50">
                  <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Solicitante</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Región</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Motivo</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Línea</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Incidencia</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="solicitud in solicitudesPaginadas" :key="solicitud.id" class="hover:bg-slate-50 transition-colors">
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="text-sm font-semibold text-slate-900">{{ solicitud.nomSolicitante }}</div>
                    <div v-if="solicitud.cargoSolicitante" class="text-xs text-slate-500">{{ formatearCargo(solicitud.cargoSolicitante) }}</div>
                    <div class="text-xs text-slate-400">Usuario: {{ solicitud.usuario }}<span v-if="solicitud.legajo"> · Legajo {{ solicitud.legajo }}</span></div>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <span class="text-sm font-medium text-slate-700">{{ solicitud.region?.replace(/_/g, ' ') }}</span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <span class="text-sm text-indigo-600">{{ formatTipo(solicitud.tipoSolicitud) }}</span>
                      <template v-if="solicitud.tipoSolicitud === 'ROBO'">
                        <span v-if="solicitud.tieneDenunciaAdjunta" class="badge-emerald" title="Con denuncia PDF">PDF</span>
                        <span v-else class="badge-rose" title="Sin denuncia">Sin PDF</span>
                      </template>
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <div class="text-sm text-slate-600 max-w-[200px] truncate" :title="solicitud.motivo">{{ solicitud.motivo }}</div>
                    <div v-if="solicitud.observacion" class="text-xs text-slate-400 max-w-[200px] truncate" :title="solicitud.observacion">{{ solicitud.observacion }}</div>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-center">
                    <span :class="solicitud.necesitaLinea ? 'badge-emerald' : 'badge-slate'">{{ solicitud.necesitaLinea ? 'Sí' : 'No' }}</span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{{ solicitud.fecha }}</td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{{ solicitud.fechaIncidencia || '-' }}</td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <!-- Edición inline -->
                    <div v-if="solicitudEditando === solicitud.id" class="flex items-center gap-2">
                      <div class="w-36">
                        <CustomSelect v-model="estadoTemporal" :options="estadoOptions" />
                      </div>
                      <button @click="guardarEstado(solicitud)" class="btn-icon-edit hover:text-emerald-600 hover:bg-emerald-50" title="Guardar">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </button>
                      <button @click="cancelarEdicion()" class="btn-icon-danger" title="Cancelar">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                    <!-- Visualización -->
                    <button v-else @click="iniciarEdicion(solicitud)" :class="estadoBadge(solicitud.estado)" class="cursor-pointer hover:opacity-80 transition-opacity" title="Click para editar">
                      {{ (solicitud.estado || EstadoSolicitud.PENDIENTE).replace(/_/g, ' ') }}
                    </button>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="flex items-center justify-end gap-1">
                      <button v-if="solicitud.tipoSolicitud === 'ROBO' && solicitud.tieneDenunciaAdjunta"
                              @click="verPdfDenuncia(solicitud.id)" class="btn-icon-edit" title="Ver PDF">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                      </button>
                      <button v-if="solicitud.tipoSolicitud === 'ROBO' && solicitud.tieneDenunciaAdjunta"
                              @click="descargarDenuncia(solicitud.id)" :disabled="descargandoDenuncia"
                              class="btn-icon-edit hover:text-emerald-600 hover:bg-emerald-50" title="Descargar PDF">
                        <svg v-if="descargandoDenuncia" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                      </button>
                      <button v-if="isAdmin" @click="abrirModalEstado(solicitud)" class="btn-icon-edit" title="Cambiar estado">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Vista móvil -->
          <div class="lg:hidden divide-y divide-slate-100">
            <div v-for="solicitud in solicitudesPaginadas" :key="solicitud.id" class="p-4">
              <div class="flex items-start justify-between gap-3 mb-3">
                <div class="min-w-0">
                  <h3 class="font-semibold text-slate-900 truncate">{{ solicitud.nomSolicitante }}<span v-if="solicitud.cargoSolicitante" class="ml-1 text-xs font-normal text-slate-500">{{ formatearCargo(solicitud.cargoSolicitante) }}</span></h3>
                  <p class="text-sm text-slate-500 truncate">Usuario: {{ solicitud.usuario }}<span v-if="solicitud.legajo"> · Legajo {{ solicitud.legajo }}</span></p>
                </div>
                <span :class="estadoBadge(solicitud.estado)">{{ (solicitud.estado || EstadoSolicitud.PENDIENTE).replace(/_/g, ' ') }}</span>
              </div>

              <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-3">
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Región</span>
                  <span class="font-medium text-slate-900">{{ solicitud.region?.replace(/_/g, ' ') }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Fecha</span>
                  <span class="font-medium text-slate-900">{{ solicitud.fecha }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Incidencia</span>
                  <span class="font-medium text-slate-900">{{ solicitud.fechaIncidencia || '-' }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Tipo</span>
                  <span class="font-medium text-indigo-600">{{ formatTipo(solicitud.tipoSolicitud) }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Línea</span>
                  <span :class="solicitud.necesitaLinea ? 'badge-emerald' : 'badge-slate'">{{ solicitud.necesitaLinea ? 'Sí' : 'No' }}</span>
                </div>
              </div>

              <div class="mb-3">
                <span class="text-xs text-slate-400">Motivo</span>
                <p class="text-sm text-slate-600">{{ solicitud.motivo }}</p>
                <p v-if="solicitud.observacion" class="text-xs text-slate-500 mt-1 whitespace-pre-line">{{ solicitud.observacion }}</p>
              </div>

              <!-- Denuncia (ROBO) -->
              <div v-if="solicitud.tipoSolicitud === 'ROBO'" class="mb-3">
                <PdfThumbnail
                  v-if="solicitud.tieneDenunciaAdjunta"
                  :solicitud-id="solicitud.id"
                  :nombre-archivo="solicitud.nombreArchivoDenuncia"
                  :tiene-denuncia="solicitud.tieneDenunciaAdjunta"
                />
                <span v-else class="badge-rose">Sin denuncia</span>
              </div>

              <div class="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button @click="iniciarEdicion(solicitud)" class="btn-secondary flex-1">Editar estado</button>
                <button v-if="solicitud.tipoSolicitud === 'ROBO' && solicitud.tieneDenunciaAdjunta"
                        @click="verPdfDenuncia(solicitud.id)" class="btn-icon-edit !w-10 !h-10 border border-slate-200" title="Ver PDF">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </button>
                <button v-if="solicitud.tipoSolicitud === 'ROBO' && solicitud.tieneDenunciaAdjunta"
                        @click="descargarDenuncia(solicitud.id)" :disabled="descargandoDenuncia"
                        class="btn-icon-edit !w-10 !h-10 border border-slate-200 hover:text-emerald-600 hover:bg-emerald-50" title="Descargar PDF">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </button>
                <button v-if="isAdmin" @click="abrirModalEstado(solicitud)" class="btn-icon-edit !w-10 !h-10 border border-slate-200" title="Cambiar estado">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Paginación -->
          <div class="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-100">
            <span class="text-sm text-slate-500">
              Mostrando {{ ((paginaActual - 1) * solicitudesPorPagina) + 1 }} - {{ Math.min(paginaActual * solicitudesPorPagina, solicitudesFiltradas.length) }} de {{ solicitudesFiltradas.length }}
            </span>
            <div class="flex items-center gap-2">
              <button @click="paginaActual = Math.max(1, paginaActual - 1)" :disabled="paginaActual === 1"
                      :class="['flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                               paginaActual === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 bg-white hover:bg-slate-50 border border-slate-200']">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Anterior
              </button>
              <span class="text-sm text-slate-500 px-2">
                <span class="font-semibold text-slate-900">{{ paginaActual }}</span> / {{ totalPaginas }}
              </span>
              <button @click="paginaActual = Math.min(totalPaginas, paginaActual + 1)" :disabled="paginaActual === totalPaginas"
                      :class="['flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                               paginaActual === totalPaginas ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 bg-white hover:bg-slate-50 border border-slate-200']">
                Siguiente
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- ===== Modal cambiar estado ===== -->
    <div v-if="showModalEstado" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4" @click.self="showModalEstado = false">
      <div class="bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 w-full max-w-md p-6">
        <h3 class="text-lg font-bold text-slate-900 mb-1">Cambiar estado</h3>
        <p class="text-sm text-slate-500 mb-5">{{ solicitudSeleccionada?.nomSolicitante }} · {{ solicitudSeleccionada?.region?.replace(/_/g, ' ') }}</p>
        <div class="mb-6">
          <label class="field-label">Estado</label>
          <CustomSelect v-model="nuevoEstado" :options="estadoOptions" />
        </div>
        <div class="flex gap-3">
          <button @click="showModalEstado = false" class="btn-secondary flex-1">Cancelar</button>
          <button @click="cambiarEstadoSolicitud" class="btn-primary flex-1">Guardar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { solicitudService, EstadoSolicitud, TIPOS_MOTIVO } from '@/services/solicitudService.ts';
import { excelService } from '@/services/excelService.ts';
import PdfThumbnail from '@/components/PdfThumbnail.vue';
import CustomSelect from '@/components/CustomSelect.vue';
import DatePicker from '@/components/DatePicker.vue';
import EmpleadoAutocomplete from '@/components/EmpleadoAutocomplete.vue';
import { useEmpleadosSolicitud } from '@/composables/useEmpleadosSolicitud';
import { formatearCargo, hoyLocal } from '@/utils/empleadosSolicitud';
import { mensajeErrorApi } from '@/utils/apiError';
import SkeletonLoader from '@/components/SkeletonLoader.vue';

const solicitudes = ref([]);
// Arranca en true: la carga se dispara en onMounted, así el primer frame ya
// muestra el skeleton en vez del estado vacío.
const loading = ref(true);
const notification = reactive({ show: false, type: 'success', message: '' });
const isAdmin = ref(true); // Cambiado a true para poder editar estados

// Exportación
const exportando = ref(false);
const fechaActual = new Date();
const exportacion = reactive({
  mes: fechaActual.getMonth() + 1,
  año: fechaActual.getFullYear()
});

// Generar años disponibles (últimos 3 años y próximos 2)
const añosDisponibles = computed(() => {
  const añoActual = new Date().getFullYear();
  const años = [];
  for (let i = añoActual - 3; i <= añoActual + 2; i++) {
    años.push(i);
  }
  return años;
});

// ===== Opciones para los selects =====
const REGIONES = [
  'NORTE', 'SUR', 'ESTE', 'OESTE', 'LA_PLATA', 'NAFA', 'LAVAZZA', 'TALLER',
  'IMPACTO', 'COMERCIAL', 'GERENCIA', 'PLANTA', 'SISTEMAS', 'RRHH', 'ADMINISTRACION', 'COMPRAS'
];

const regionOptions = REGIONES.map(r => ({ value: r, label: r.replace(/_/g, ' ') }));
const regionFiltroOptions = [{ value: '', label: 'Todas las regiones' }, ...regionOptions];

const tipoOptions = [
  { value: 'CAMBIO_POR_ROTURA', label: 'Cambio por rotura' },
  { value: 'NUEVO_EQUIPO', label: 'Nuevo equipo' },
  { value: 'ROBO', label: 'Robo' }
];
const tipoFiltroOptions = [{ value: '', label: 'Todos los tipos' }, ...tipoOptions];

const lineaOptions = [
  { value: true, label: 'Sí' },
  { value: false, label: 'No' }
];

const estadoOptions = [
  { value: EstadoSolicitud.PENDIENTE, label: 'Pendiente' },
  { value: EstadoSolicitud.EN_PROCESO, label: 'En proceso' },
  { value: EstadoSolicitud.RESUELTA, label: 'Resuelta' }
];

const mesesOptions = [
  { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' }, { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' }, { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' }, { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' }
];
const aniosOptions = computed(() => añosDisponibles.value.map(a => ({ value: a, label: String(a) })));

const formatTipo = (tipo) => {
  const found = tipoOptions.find(t => t.value === tipo);
  return found ? found.label : (tipo || '').replace(/_/g, ' ');
};

const estadoBadge = (estado) => {
  const e = estado || EstadoSolicitud.PENDIENTE;
  if (e === EstadoSolicitud.PENDIENTE) return 'badge-amber';
  if (e === EstadoSolicitud.EN_PROCESO) return 'badge-indigo';
  if (e === EstadoSolicitud.RESUELTA) return 'badge-emerald';
  return 'badge-slate';
};

// Función para mostrar notificación con auto-ocultar
const mostrarNotificacion = (mensaje, tipo = 'success') => {
  notification.message = mensaje;
  notification.type = tipo;
  notification.show = true;
  setTimeout(() => {
    notification.show = false;
  }, 4000);
};

const formVacio = () => ({
  id: '',
  nomSolicitante: '',
  fechaIncidencia: hoyLocal(),
  usuario: '',
  legajo: '',
  region: '',
  tipoSolicitud: '',
  motivo: '',
  observacion: '',
  necesitaLinea: true
});

const form = reactive(formVacio());

const resetForm = () => {
  Object.assign(form, formVacio());
};

const motivoOptions = TIPOS_MOTIVO.map(m => ({ value: m, label: m }));

const {
  empleadosRegion,
  solicitantes,
  loading: loadingEmpleados,
  error: errorEmpleados,
  cargar: cargarEmpleados,
  buscarPorNumReparto
} = useEmpleadosSolicitud(computed(() => form.region));

const cargoSolicitante = computed(() =>
  form.nomSolicitante ? formatearCargo(buscarPorNumReparto(form.nomSolicitante)?.cargo) : ''
);

// A selection from the previous region would be rejected by the backend.
watch(() => form.region, () => {
  form.nomSolicitante = '';
  form.usuario = '';
});

// Filtros
const filtros = reactive({
  region: '',
  tipoSolicitud: '',
  usuario: ''
});

// Paginación
const paginaActual = ref(1);
const solicitudesPorPagina = 10;

const solicitudesFiltradas = computed(() => {
  return solicitudes.value
    .filter(s => {
      if (filtros.region && s.region !== filtros.region) return false;
      if (filtros.tipoSolicitud && s.tipoSolicitud !== filtros.tipoSolicitud) return false;
      if (filtros.usuario && !s.usuario.toLowerCase().includes(filtros.usuario.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      // Ordenar por fecha de la más reciente a la más antigua
      const fechaA = new Date(a.fecha);
      const fechaB = new Date(b.fecha);
      return fechaB - fechaA;
    });
});

const totalPaginas = computed(() => {
  return Math.max(1, Math.ceil(solicitudesFiltradas.value.length / solicitudesPorPagina));
});

const solicitudesPaginadas = computed(() => {
  const start = (paginaActual.value - 1) * solicitudesPorPagina;
  return solicitudesFiltradas.value.slice(start, start + solicitudesPorPagina);
});

const showModalEstado = ref(false);
const solicitudSeleccionada = ref(null);
const nuevoEstado = ref('PENDIENTE');

// Variables para edición inline
const solicitudEditando = ref(null);
const estadoTemporal = ref('');

const cargarSolicitudes = async () => {
  loading.value = true;
  try {
    const resp = await solicitudService.obtenerTodas();
    solicitudes.value = resp.data;
    paginaActual.value = 1;
  } catch (error) {
    console.error('Error al cargar solicitudes:', error?.response?.data || error);
    mostrarNotificacion('Error al cargar solicitudes', 'error');
  } finally {
    loading.value = false;
  }
};

const crearSolicitud = async () => {
  if (!form.region || !form.tipoSolicitud || !form.motivo || !form.fechaIncidencia) {
    mostrarNotificacion('Completa región, tipo, motivo y fecha de incidencia', 'error');
    return;
  }
  if (!form.nomSolicitante || !form.usuario) {
    mostrarNotificacion('Selecciona el solicitante y el usuario del equipo de la lista', 'error');
    return;
  }
  try {
    form.id = `S${Math.floor(Math.random() * 10000)}`;
    // Preparar payload (asegurar estado inicial)
    const payload = {
      ...form,
      estado: EstadoSolicitud.PENDIENTE
    };
    await solicitudService.crear(payload);
    mostrarNotificacion('Solicitud creada correctamente');
    resetForm();
    cargarSolicitudes();
  } catch (error) {
    console.error('Error al crear solicitud:', error?.response?.data || error);
    mostrarNotificacion(mensajeErrorApi(error, 'Error al crear solicitud'), 'error');
  }
};

const abrirModalEstado = (solicitud) => {
  solicitudSeleccionada.value = solicitud;
  nuevoEstado.value = solicitud.estado || 'PENDIENTE';
  showModalEstado.value = true;
};

const cambiarEstadoSolicitud = async () => {
  try {
    await solicitudService.cambiarEstado(solicitudSeleccionada.value.id, nuevoEstado.value);
    mostrarNotificacion('Estado actualizado correctamente');
    showModalEstado.value = false;
    cargarSolicitudes();
  } catch (error) {
    mostrarNotificacion('Error al actualizar estado', 'error');
  }
};

// Funciones para edición inline
const iniciarEdicion = (solicitud) => {
  solicitudEditando.value = solicitud.id;
  estadoTemporal.value = solicitud.estado || EstadoSolicitud.PENDIENTE;
};

const cancelarEdicion = () => {
  solicitudEditando.value = null;
  estadoTemporal.value = '';
};

const guardarEstado = async (solicitud) => {
  if (estadoTemporal.value === solicitud.estado) {
    // No hay cambios, solo cancelar edición
    cancelarEdicion();
    return;
  }

  try {
    await solicitudService.cambiarEstado(solicitud.id, estadoTemporal.value);

    // Actualizar la solicitud local inmediatamente (optimistic update)
    const index = solicitudes.value.findIndex(s => s.id === solicitud.id);
    if (index !== -1) {
      solicitudes.value[index].estado = estadoTemporal.value;
    }

    mostrarNotificacion(`Estado cambiado a ${estadoTemporal.value}`);
    cancelarEdicion();
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    mostrarNotificacion(`Error al actualizar estado: ${error?.response?.data?.message || error?.message || 'Error desconocido'}`, 'error');
    cancelarEdicion();
  }
};

// Función para contar solicitudes del mes
const contarSolicitudesMes = (mes, año) => {
  return solicitudes.value.filter(s => {
    const fecha = new Date(s.fecha);
    return fecha.getMonth() + 1 === parseInt(mes) && fecha.getFullYear() === parseInt(año);
  }).length;
};

const solicitudesDelMes = computed(() => contarSolicitudesMes(exportacion.mes, exportacion.año));

// Función para exportar por mes
const exportarPorMes = async () => {
  exportando.value = true;
  try {
    const mes = parseInt(exportacion.mes);
    const año = parseInt(exportacion.año);

    // Filtrar solicitudes del mes específico
    const solicitudesMes = solicitudes.value.filter(s => {
      const fecha = new Date(s.fecha);
      return fecha.getMonth() + 1 === mes && fecha.getFullYear() === año;
    });

    if (solicitudesMes.length === 0) {
      mostrarNotificacion('No hay solicitudes para el mes seleccionado', 'error');
      return;
    }

    // Exportar usando el servicio de Excel
    excelService.exportarSolicitudesPorMes(solicitudesMes, mes, año);
    mostrarNotificacion(`Excel exportado correctamente: ${solicitudesMes.length} solicitudes`);
  } catch (error) {
    console.error('Error al exportar:', error);
    mostrarNotificacion('Error al exportar a Excel', 'error');
  } finally {
    exportando.value = false;
  }
};

// Estado para descarga de denuncias
const descargandoDenuncia = ref(false);

// Función para ver PDF en nueva ventana
const verPdfDenuncia = async (solicitudId) => {
  try {
    const response = await solicitudService.descargarDenuncia(solicitudId);
    const blob = response.data;

    if (!(blob instanceof Blob)) {
      throw new Error('La respuesta no es un blob válido');
    }

    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank', 'width=800,height=1000,scrollbars=yes');

    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);
  } catch (error) {
    console.error('Error al abrir PDF:', error);
    mostrarNotificacion('Error al abrir el PDF', 'error');
  }
};

// Función para descargar denuncia PDF
const descargarDenuncia = async (solicitudId) => {
  descargandoDenuncia.value = true;
  try {
    const response = await solicitudService.descargarDenuncia(solicitudId);
    const blob = response.data;

    if (!(blob instanceof Blob)) {
      throw new Error('La respuesta no es un blob válido');
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `denuncia-solicitud-${solicitudId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    mostrarNotificacion('Denuncia descargada correctamente');
  } catch (error) {
    console.error('Error al descargar denuncia:', error);
    mostrarNotificacion('Error al descargar la denuncia', 'error');
  } finally {
    descargandoDenuncia.value = false;
  }
};

onMounted(() => {
  cargarSolicitudes();
  cargarEmpleados();
});
</script>
