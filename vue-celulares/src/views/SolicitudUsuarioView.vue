<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 py-8">
    <div class="w-full px-4 sm:px-6 lg:px-8">
      <!-- Header con gradiente -->
      <div class="relative mb-6 lg:mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-2xl p-6 lg:p-8 text-white shadow-2xl">
        <div class="absolute inset-0 bg-black opacity-10 rounded-2xl"></div>
        <div class="relative">
          <h1 class="text-2xl sm:text-4xl lg:text-5xl font-bold mb-2">Mi Perfil</h1>
          <p class="text-blue-100 text-sm sm:text-lg">Gestiona tus solicitudes y consulta tu flota por región</p>
        </div>
        <!-- Decoración -->
        <div class="absolute top-0 right-0 -mt-4 -mr-4 w-24 sm:w-32 h-24 sm:h-32 bg-white opacity-10 rounded-full"></div>
        <div class="absolute bottom-0 left-0 -mb-6 -ml-6 w-16 sm:w-24 h-16 sm:h-24 bg-white opacity-5 rounded-full"></div>
      </div>

      <!-- Tabs modernas -->
      <div class="mb-6 lg:mb-8">
        <div class="bg-white/70 backdrop-blur-lg rounded-2xl p-2 inline-flex shadow-lg border border-white/20 overflow-x-auto">
          <button @click="activeTab = 'solicitudes'"
                  :class="[
                    'px-4 sm:px-6 py-3 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 flex items-center gap-2 whitespace-nowrap',
                    activeTab === 'solicitudes' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                  ]">
            <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <span class="hidden xs:inline">Mis </span>Solicitudes
          </button>
          <button @click="activeTab = 'mi-flota'; if (!flotaCargada) cargarMiFlota();"
                  v-if="authService.isAuthenticated()"
                  :class="[
                    'px-4 sm:px-6 py-3 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 flex items-center gap-2 whitespace-nowrap',
                    activeTab === 'mi-flota' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                  ]">
            <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <span class="hidden xs:inline">Mi </span>Flota
          </button>
        </div>
      </div>

      <!-- Notificación moderna -->
      <div v-if="notification.show" 
           :class="[
             'mb-8 p-4 rounded-2xl flex items-center justify-between shadow-xl transform transition-all duration-300',
             notification.type === 'success' 
               ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' 
               : 'bg-gradient-to-r from-red-400 to-pink-500 text-white'
           ]">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-white/20 rounded-xl">
            <svg v-if="notification.type === 'success'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <span class="font-medium">{{ notification.message }}</span>
        </div>
        <button @click="notification.show = false" class="p-2 hover:bg-white/20 rounded-xl transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Formulario para crear solicitud (solo cuando pestaña solicitudes) -->
      <div v-if="activeTab === 'solicitudes'" class="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8 mb-8">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Nueva Solicitud</h2>
            <p class="text-gray-600">Completa el formulario para crear una nueva solicitud</p>
          </div>
        </div>
        
        <form @submit.prevent="crearSolicitud" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-if="authService.isAdmin()" class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">Región</label>
            <select v-model="form.region" 
                    class="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/60 backdrop-blur-sm" 
                    required>
              <option value="">Seleccionar región</option>
              <option value="NORTE">NORTE</option>
              <option value="SUR">SUR</option>
              <option value="ESTE">ESTE</option>
              <option value="OESTE">OESTE</option>
              <option value="LA_PLATA">LA PLATA</option>
              <option value="NAFA">NAFA</option>
              <option value="LAVAZZA">LAVAZZA</option>
              <option value="IMPACTO">IMPACTO</option>
              <option value="COMERCIAL">COMERCIAL</option>
              <option value="GERENCIA">GERENCIA</option>
              <option value="PLANTA">PLANTA</option>
              <option value="SISTEMAS">SISTEMAS</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">Tipo de Solicitud</label>
            <select v-model="form.tipoSolicitud" 
                    class="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/60 backdrop-blur-sm" 
                    required>
              <option value="">Seleccionar tipo</option>
              <option value="CAMBIO_POR_ROTURA">CAMBIO POR ROTURA</option>
              <option value="NUEVO_EQUIPO">NUEVO EQUIPO</option>
              <option value="ROBO">ROBO</option>
              <option value="PERDIDA">PERDIDA</option>
            </select>
          </div>
          <div class="space-y-2">
            <label for="fecha-incidencia" class="block text-sm font-semibold text-gray-700">Fecha de Incidencia</label>
            <input id="fecha-incidencia"
                   v-model="form.fechaIncidencia"
                   type="date"
                   :max="hoyLocal()"
                   class="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/60 backdrop-blur-sm"
                   required />
          </div>
          <div class="space-y-2">
            <label for="solicitante" class="block text-sm font-semibold text-gray-700">Solicitante (Supervisor o Regional)</label>
            <EmpleadoAutocomplete id="solicitante"
                                  v-model="form.nomSolicitante"
                                  :empleados="solicitantes"
                                  :loading="loadingEmpleados"
                                  :disabled="regionPendiente"
                                  :input-class="inputClase"
                                  :placeholder="regionPendiente ? 'Primero selecciona la región' : 'Buscar supervisor o regional'"
                                  empty-text="No hay supervisores ni regionales en la región" />
          </div>
          <div class="space-y-2">
            <label for="cargo-solicitante" class="block text-sm font-semibold text-gray-700">Cargo del Solicitante</label>
            <input id="cargo-solicitante"
                   :value="cargoSolicitante"
                   type="text"
                   class="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/60 backdrop-blur-sm text-gray-500"
                   placeholder="Se completa al elegir el solicitante"
                   readonly />
          </div>
          <div class="space-y-2">
            <label for="usuario-equipo" class="block text-sm font-semibold text-gray-700">Usuario del Equipo</label>
            <EmpleadoAutocomplete id="usuario-equipo"
                                  v-model="form.usuario"
                                  :empleados="empleadosRegion"
                                  :loading="loadingEmpleados"
                                  :disabled="regionPendiente"
                                  :input-class="inputClase"
                                  :placeholder="regionPendiente ? 'Primero selecciona la región' : 'Buscar por número de reparto'"
                                  empty-text="No hay usuarios en la región" />
          </div>
          <div class="space-y-2">
            <label for="legajo" class="block text-sm font-semibold text-gray-700">Legajo</label>
            <input id="legajo"
                   v-model="form.legajo"
                   type="text"
                   maxlength="50"
                   class="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/60 backdrop-blur-sm"
                   placeholder="Legajo del usuario del equipo"
                   required />
          </div>
          <p v-if="errorEmpleados" class="md:col-span-2 text-sm text-red-600">{{ errorEmpleados }}</p>
          <div class="md:col-span-2 space-y-2">
            <label for="motivo" class="block text-sm font-semibold text-gray-700">Motivo</label>
            <select id="motivo"
                    v-model="form.motivo"
                    class="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/60 backdrop-blur-sm"
                    required>
              <option value="">Seleccionar motivo</option>
              <option v-for="tipo in tiposMotivo" :key="tipo" :value="tipo">{{ tipo }}</option>
            </select>
          </div>

          <div class="md:col-span-2 space-y-2">
            <label for="observacion" class="block text-sm font-semibold text-gray-700">
              {{ form.motivo === 'OTRO' ? 'Observación' : 'Observación (opcional)' }}
            </label>
            <textarea
              id="observacion"
              v-model="form.observacion"
              class="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/60 backdrop-blur-sm resize-none"
              rows="4"
              maxlength="1000"
              :placeholder="form.motivo === 'OTRO' ? 'Describe detalladamente el problema...' : 'Agrega detalles adicionales si es necesario...'"
              :required="form.motivo === 'OTRO'"
            ></textarea>
          </div>

          <!-- Componente de upload de denuncia para ROBO -->
          <div v-if="form.tipoSolicitud === 'ROBO'" class="md:col-span-2 space-y-3">
            <label class="block text-sm font-semibold text-gray-700 flex items-center gap-2">
              <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Adjuntar Denuncia PDF (Obligatorio para casos de robo)
            </label>
            <div class="border-2 border-dashed border-red-300 rounded-2xl p-6 bg-red-50/30 backdrop-blur-sm">
              <input 
                ref="denunciaInput"
                type="file" 
                accept=".pdf"
                @change="onDenunciaSelected"
                class="hidden"
                required
              />
              
              <div v-if="!form.archivoDenuncia" 
                   @click="$refs.denunciaInput.click()"
                   class="cursor-pointer text-center space-y-3 p-4 hover:bg-red-100/30 rounded-xl transition-all duration-200">
                <div class="flex justify-center">
                  <svg class="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-lg font-semibold text-gray-700">Haz click para seleccionar la denuncia</p>
                  <p class="text-sm text-gray-500">Solo archivos PDF • Máximo 10MB</p>
                </div>
              </div>

              <div v-else class="flex items-center justify-between bg-white/70 rounded-xl p-4">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-red-100 rounded-lg">
                    <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900">{{ form.archivoDenuncia.name }}</p>
                    <p class="text-sm text-gray-500">{{ formatFileSize(form.archivoDenuncia.size) }}</p>
                  </div>
                </div>
                <button 
                  @click="removeDenuncia"
                  type="button"
                  class="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                  title="Remover archivo"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <div v-if="form.tipoSolicitud === 'NUEVO_EQUIPO'" class="space-y-3">
            <label class="block text-sm font-semibold text-gray-700">¿Necesitas línea nueva?</label>
            <div class="flex gap-4">
              <label class="flex items-center cursor-pointer group">
                <input v-model="form.necesitaLinea" type="radio" :value="true" class="sr-only" />
                <div class="relative">
                  <div :class="['w-6 h-6 rounded-full border-2 transition-all duration-200', 
                               form.necesitaLinea === true ? 'border-blue-500 bg-blue-500' : 'border-gray-300 group-hover:border-blue-300']">
                    <div v-if="form.necesitaLinea === true" class="absolute inset-1 bg-white rounded-full"></div>
                  </div>
                </div>
                <span class="ml-3 text-gray-700 group-hover:text-gray-900">Sí, necesito línea</span>
              </label>
              <label class="flex items-center cursor-pointer group">
                <input v-model="form.necesitaLinea" type="radio" :value="false" class="sr-only" />
                <div class="relative">
                  <div :class="['w-6 h-6 rounded-full border-2 transition-all duration-200', 
                               form.necesitaLinea === false ? 'border-blue-500 bg-blue-500' : 'border-gray-300 group-hover:border-blue-300']">
                    <div v-if="form.necesitaLinea === false" class="absolute inset-1 bg-white rounded-full"></div>
                  </div>
                </div>
                <span class="ml-3 text-gray-700 group-hover:text-gray-900">No necesito línea</span>
              </label>
            </div>
          </div>
          <div class="md:col-span-2 flex justify-end items-center mt-6">
            <button 
              type="submit" 
              :disabled="loading"
              class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transform hover:scale-105 transition-all duration-200 shadow-xl"
            >
              <svg v-if="loading" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
              {{ loading ? 'Enviando...' : 'Crear Solicitud' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Lista de mis solicitudes -->
      <div v-if="activeTab === 'solicitudes'" class="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8">
        <div class="flex justify-between items-center mb-8">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Solicitudes de Mi Región</h2>
              <p class="text-gray-600">Historial de todas tus solicitudes</p>
            </div>
          </div>
          <button @click="cargarMisSolicitudes" 
                  :class="[
                    'px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200',
                    'hover:from-gray-200 hover:to-gray-300 rounded-2xl text-sm font-semibold',
                    'flex items-center gap-2 transform hover:scale-105',
                    'transition-all duration-200 shadow-lg'
                  ]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Actualizar
          </button>
        </div>

        <SkeletonLoader v-if="loadingSolicitudes" variant="cards" :rows="4" label="Cargando solicitudes…" />

        <div v-else-if="misSolicitudes.length === 0" class="text-center py-16">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full mb-6">
            <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">No hay solicitudes en tu región aún</h3>
          <p class="text-gray-500 mb-6">Crea la primera solicitud usando el formulario de arriba</p>
          <div class="inline-flex items-center gap-2 text-blue-600 font-medium">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Crear primera solicitud
          </div>
        </div>

        <div v-else class="space-y-4 sm:space-y-6">
          <div v-for="solicitud in solicitudesPaginadas" :key="solicitud.id" 
               class="bg-white/60 backdrop-blur-sm border-2 border-white/50 rounded-2xl p-4 sm:p-6 hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
              <div class="flex items-center gap-3 sm:gap-4">
                <div class="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex-shrink-0">
                  <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg sm:text-xl font-bold text-gray-900">Solicitud #{{ solicitud.id }}</h3>
                  <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      <span class="truncate">{{ solicitud.nomSolicitante }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a4 4 0 118 0v4m-4 0v4m-4 0h8m0 0V3m0 4h.01"></path>
                      </svg>
                      <span>{{ solicitud.fecha }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                <!-- Estado badge mejorado -->
                <span :class="{
                  'bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg': solicitud.estado === EstadoSolicitud.PENDIENTE,
                  'bg-gradient-to-r from-blue-400 to-indigo-400 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg': solicitud.estado === EstadoSolicitud.EN_PROCESO,
                  'bg-gradient-to-r from-green-400 to-emerald-400 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg': solicitud.estado === EstadoSolicitud.RESUELTA
                }">
                  {{ formatearEstado(solicitud.estado) }}
                </span>
                <!-- Botón PDF mejorado -->
                <button 
                  @click="descargarPDF(solicitud)"
                  :class="[
                    'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600',
                    'text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold',
                    'flex items-center gap-2 transform hover:scale-105',
                    'transition-all duration-200 shadow-lg w-full sm:w-auto justify-center sm:justify-start'
                  ]"
                  title="Descargar PDF"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  PDF
                </button>
              </div>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm mb-4">
              <div class="bg-white/50 rounded-xl p-3 sm:p-4">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                  </svg>
                  <span class="font-semibold text-gray-700">Tipo:</span>
                </div>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-gray-900 font-medium text-xs sm:text-sm">{{ formatearTipoSolicitud(solicitud.tipoSolicitud) }}</span>
                  <!-- Indicador de ROBO con denuncia -->
                  <PdfThumbnail 
                    v-if="solicitud.tipoSolicitud === 'ROBO' && solicitud.tieneDenunciaAdjunta"
                    :solicitud-id="solicitud.id"
                    :nombre-archivo="solicitud.nombreArchivoDenuncia"
                    :tiene-denuncia="solicitud.tieneDenunciaAdjunta"
                  />
                  <span v-else-if="solicitud.tipoSolicitud === 'ROBO'" 
                        class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                    Sin denuncia
                  </span>
                  <!-- Botón descargar denuncia -->
                  <button v-if="solicitud.tipoSolicitud === 'ROBO' && solicitud.tieneDenunciaAdjunta"
                          @click="descargarDenuncia(solicitud.id)"
                          :disabled="descargandoDenuncia"
                          class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Descargar denuncia PDF">
                    <svg v-if="!descargandoDenuncia" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <svg v-else class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ descargandoDenuncia ? 'Descargando...' : 'Descargar' }}
                  </button>
                </div>
              </div>
              <div class="bg-white/50 rounded-xl p-3 sm:p-4">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span class="font-semibold text-gray-700">Región:</span>
                </div>
                <span class="text-gray-900 font-medium text-xs sm:text-sm">{{ formatearRegion(solicitud.region) }}</span>
              </div>
              <div class="bg-white/50 rounded-xl p-3 sm:p-4">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-4 h-4 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                  <span class="font-semibold text-gray-700">Necesita línea:</span>
                </div>
                <span class="text-gray-900 font-medium text-xs sm:text-sm">{{ solicitud.necesitaLinea ? 'Sí' : 'No' }}</span>
              </div>
              <div class="bg-white/50 rounded-xl p-3 sm:p-4">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  <span class="font-semibold text-gray-700">Reparto:</span>
                </div>
                <span class="text-gray-900 font-medium">{{ solicitud.usuario }}</span>
              </div>
              <div class="bg-white/50 rounded-xl p-3 sm:p-4">
                <span class="block font-semibold text-gray-700 mb-2">Fecha de incidencia:</span>
                <span class="text-gray-900 font-medium text-xs sm:text-sm">{{ solicitud.fechaIncidencia || '-' }}</span>
              </div>
              <div class="bg-white/50 rounded-xl p-3 sm:p-4">
                <span class="block font-semibold text-gray-700 mb-2">Cargo solicitante:</span>
                <span class="text-gray-900 font-medium text-xs sm:text-sm">{{ solicitud.cargoSolicitante ? formatearCargo(solicitud.cargoSolicitante) : '-' }}</span>
              </div>
              <div class="bg-white/50 rounded-xl p-3 sm:p-4">
                <span class="block font-semibold text-gray-700 mb-2">Legajo:</span>
                <span class="text-gray-900 font-medium text-xs sm:text-sm">{{ solicitud.legajo || '-' }}</span>
              </div>
            </div>

            <div class="bg-white/50 rounded-xl p-4">
              <div class="flex items-center gap-2 mb-3">
                <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                </svg>
                <span class="font-semibold text-gray-700">Motivo:</span>
              </div>
              <p class="text-gray-900 leading-relaxed">{{ solicitud.motivo }}</p>
              <template v-if="solicitud.observacion">
                <span class="block font-semibold text-gray-700 mt-3 mb-1">Observación:</span>
                <p class="text-gray-900 leading-relaxed whitespace-pre-line">{{ solicitud.observacion }}</p>
              </template>
            </div>
          </div>
          
          <!-- Paginación para Mis Solicitudes -->
          <div v-if="misSolicitudes.length > itemsPerPageSolicitudes" class="mt-6 sm:mt-8">
            <Pagination
              :current-page="currentPageSolicitudes"
              :total-pages="totalPagesSolicitudes"
              :items-per-page="itemsPerPageSolicitudes"
              :total-records="misSolicitudes.length"
              @page-changed="onPageChangedSolicitudes"
              @items-per-page-changed="onItemsPerPageChangedSolicitudes"
            />
          </div>
        </div>
      </div>
    
      <!-- Mi Flota -->
      <div v-if="activeTab === 'mi-flota'" class="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-4 sm:p-6 lg:p-8">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div class="flex items-center gap-3">
            <div class="p-2 sm:p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl sm:rounded-2xl">
              <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <div>
              <h2 class="text-xl sm:text-2xl font-bold text-gray-900">Mi Flota</h2>
              <p class="text-sm sm:text-base text-gray-600">Usuarios de tu región</p>
            </div>
          </div>
          <button @click="cargarMiFlota" 
                  :class="[
                    'px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-gray-100 to-gray-200',
                    'hover:from-gray-200 hover:to-gray-300 rounded-xl sm:rounded-2xl',
                    'text-sm font-semibold flex items-center gap-2 justify-center sm:justify-start',
                    'transform hover:scale-105 transition-all duration-200 shadow-lg',
                    'w-full sm:w-auto'
                  ]">
            <svg class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <span class="hidden xs:inline">Actualizar</span>
            <span class="xs:hidden">Actualizar</span>
          </button>
        </div>

        <!-- Filtros por cargo -->
        <div class="mb-6 bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50">
          <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"></path>
            </svg>
            Filtrar por cargo
          </h3>
          <div class="flex flex-wrap gap-2">
            <button @click="filtrarPorCargo('TODOS')"
                    :class="[
                      'px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200',
                      filtroCargoFlota === 'TODOS'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'bg-white/70 text-gray-700 hover:bg-white border border-gray-200/50'
                    ]">
              Todos
            </button>
            <button @click="filtrarPorCargo('REPARTIDOR')"
                    :class="[
                      'px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200',
                      filtroCargoFlota === 'REPARTIDOR'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'bg-white/70 text-gray-700 hover:bg-white border border-gray-200/50'
                    ]">
              Repartidores
            </button>
            <button @click="filtrarPorCargo('AYUDANTE')"
                    :class="[
                      'px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200',
                      filtroCargoFlota === 'AYUDANTE'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'bg-white/70 text-gray-700 hover:bg-white border border-gray-200/50'
                    ]">
              Ayudantes
            </button>
            <button @click="filtrarPorCargo('AYUDANTE_ROTATIVO')"
                    :class="[
                      'px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200',
                      filtroCargoFlota === 'AYUDANTE_ROTATIVO'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'bg-white/70 text-gray-700 hover:bg-white border border-gray-200/50'
                    ]">
              Ayudantes Rotativos
            </button>
            <button @click="filtrarPorCargo('SUPERVISOR')"
                    :class="[
                      'px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200',
                      filtroCargoFlota === 'SUPERVISOR'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'bg-white/70 text-gray-700 hover:bg-white border border-gray-200/50'
                    ]">
              Supervisores
            </button>
            <button @click="filtrarPorCargo('REGIONAL')"
                    :class="[
                      'px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200',
                      filtroCargoFlota === 'REGIONAL'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'bg-white/70 text-gray-700 hover:bg-white border border-gray-200/50'
                    ]">
              Regional
            </button>
            <button @click="filtrarPorCargo('SUPLENTE')"
                    :class="[
                      'px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200',
                      filtroCargoFlota === 'SUPLENTE'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'bg-white/70 text-gray-700 hover:bg-white border border-gray-200/50'
                    ]">
              Suplentes
            </button>
            <button @click="filtrarPorCargo('ANALISTA')"
                    :class="[
                      'px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200',
                      filtroCargoFlota === 'ANALISTA'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'bg-white/70 text-gray-700 hover:bg-white border border-gray-200/50'
                    ]">
              Analistas
            </button>
            <button @click="filtrarPorCargo('JEFE')"
                    :class="[
                      'px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200',
                      filtroCargoFlota === 'JEFE'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'bg-white/70 text-gray-700 hover:bg-white border border-gray-200/50'
                    ]">
              Jefes
            </button>
            <button @click="filtrarPorCargo('GERENTE')"
                    :class="[
                      'px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200',
                      filtroCargoFlota === 'GERENTE'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'bg-white/70 text-gray-700 hover:bg-white border border-gray-200/50'
                    ]">
              Gerentes
            </button>
          </div>
        </div>

        <SkeletonLoader v-if="loadingFlota" variant="cards" :rows="4" label="Cargando flota…" />

        <div v-else-if="miFlota.length === 0" class="text-center py-16">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full mb-6">
            <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">No se encontraron usuarios en tu región</h3>
          <p class="text-gray-500">La flota de tu región está vacía o no tienes permisos para verla</p>
        </div>

        <div v-else class="bg-white/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/50">
          <!-- Estadísticas rápidas -->
          <div class="bg-gradient-to-r from-cyan-500 to-blue-500 p-4 sm:p-6 text-white">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div class="text-center sm:text-left">
                <h3 class="text-base sm:text-lg font-semibold mb-1">Total de Usuarios</h3>
                <p class="text-2xl sm:text-3xl font-bold">{{ miFlota.length }}</p>
              </div>
              <div class="text-center sm:text-right">
                <p class="text-cyan-100 text-sm sm:text-base">Con Celular Asignado</p>
                <p class="text-xl sm:text-2xl font-bold">{{ miFlota.filter(u => u.celular || u.numeroSerieCelular || u.marcaCelular).length }}</p>
              </div>
            </div>
          </div>
          
          <!-- Vista móvil con tarjetas (lg:hidden) -->
          <div class="lg:hidden space-y-4 p-4">
            <div 
              v-for="u in flotaPaginada" 
              :key="u.numReparto"
              class="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {{ u.numReparto.toString().slice(-2) }}
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900">Reparto {{ u.numReparto }}</p>
                    <p class="text-sm text-gray-600">{{ u.zona }}</p>
                  </div>
                </div>
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {{ u.region }}
                </span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div class="bg-white/50 rounded-xl p-3">
                  <div class="flex items-center gap-2 mb-2">
                    <svg class="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    <span class="font-semibold text-gray-700 text-sm">Línea:</span>
                  </div>
                  <div v-if="!editandoLinea[u.numReparto]" class="flex items-center gap-2">
                    <span v-if="u.numeroLinea" class="text-gray-900 font-medium text-sm">
                      {{ u.numeroLinea }}
                    </span>
                    <span v-else class="text-gray-400 italic text-sm">Sin línea</span>
                    <button @click="iniciarEdicionLinea(u)" 
                            class="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                            title="Editar línea">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                  </div>
                  <div v-else class="flex items-center gap-2">
                    <input 
                      v-model="numeroLineaTemporal[u.numReparto]"
                      type="text" 
                      class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Número de línea"
                      @keyup.enter="guardarLinea(u)"
                      @keyup.escape="cancelarEdicionLinea(u)"
                    />
                    <div class="flex gap-1">
                      <button @click="guardarLinea(u)" 
                              class="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                              title="Guardar">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </button>
                      <button @click="cancelarEdicionLinea(u)" 
                              class="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                              title="Cancelar">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="bg-white/50 rounded-xl p-3">
                  <div class="flex items-center gap-2 mb-2">
                    <svg class="w-4 h-4 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                    </svg>
                    <span class="font-semibold text-gray-700 text-sm">Celular:</span>
                  </div>
                  <div v-if="u.celular">
                    <p class="text-sm font-medium text-gray-900">{{ u.celular.marca }} {{ u.celular.modelo }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ u.celular.numeroSerie || 'S/N no disponible' }}</p>
                  </div>
                  <div v-else-if="u.marcaCelular && u.modeloCelular">
                    <p class="text-sm font-medium text-gray-900">{{ u.marcaCelular }} {{ u.modeloCelular }}</p>
                    <p class="text-xs text-gray-500 mt-1">Nº Serie: {{ u.numeroSerieCelular || 'No disponible' }}</p>
                  </div>
                  <div v-else-if="u.numeroSerieCelular">
                    <p class="text-sm font-medium text-gray-900">Nº Serie: {{ u.numeroSerieCelular }}</p>
                    <p class="text-xs text-gray-500 mt-1">Celular asignado</p>
                  </div>
                  <div v-else>
                    <span class="text-gray-400 italic text-sm">Sin asignar</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Vista de escritorio con tabla (hidden lg:block) -->
          <div class="hidden lg:block overflow-x-auto">
            <table class="min-w-full">
              <thead class="bg-gray-50/80">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      Reparto
                    </div>
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0L8 6"></path>
                      </svg>
                      Cargo
                    </div>
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      Región
                    </div>
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                      </svg>
                      Zona
                    </div>
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                      Línea
                    </div>
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                      </svg>
                      Celular
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200/50">
                <tr v-for="u in flotaPaginada" :key="u.numReparto" 
                    class="hover:bg-blue-50/50 transition-colors duration-200 group">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {{ u.numReparto.toString().slice(-2) }}
                      </div>
                      <span class="text-sm font-semibold text-gray-900">{{ u.numReparto }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="[
                      'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
                      getCargoClass(u.cargo)
                    ]">
                      {{ formatearCargo(u.cargo) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {{ u.region }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-sm text-gray-700 font-medium">{{ u.zona }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div v-if="!editandoLinea[u.numReparto]" class="flex items-center gap-2">
                      <span v-if="u.numeroLinea" class="inline-flex items-center gap-1 text-sm text-gray-900 font-medium">
                        <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        {{ u.numeroLinea }}
                      </span>
                      <span v-else class="text-gray-400 italic text-sm">Sin línea</span>
                      <button @click="iniciarEdicionLinea(u)" 
                              class="ml-2 p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                              title="Editar línea">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </button>
                    </div>
                    <div v-else class="flex items-center gap-2">
                      <input 
                        v-model="numeroLineaTemporal[u.numReparto]"
                        type="text" 
                        class="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Línea"
                        @keyup.enter="guardarLinea(u)"
                        @keyup.escape="cancelarEdicionLinea(u)"
                      />
                      <button @click="guardarLinea(u)" 
                              class="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                              title="Guardar">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </button>
                      <button @click="cancelarEdicionLinea(u)" 
                              class="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                              title="Cancelar">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div v-if="u.celular" class="flex items-center gap-2">
                      <div class="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg flex items-center justify-center">
                        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                      <div>
                        <p class="text-sm font-semibold text-gray-900">{{ u.celular.marca }} {{ u.celular.modelo }}</p>
                        <p class="text-xs text-gray-500">{{ u.celular.numeroSerie || 'S/N no disponible' }}</p>
                      </div>
                    </div>
                    <div v-else-if="u.marcaCelular && u.modeloCelular" class="flex items-center gap-2">
                      <div class="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg flex items-center justify-center">
                        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                      <div>
                        <p class="text-sm font-semibold text-gray-900">{{ u.marcaCelular }} {{ u.modeloCelular }}</p>
                        <p class="text-xs text-gray-500">Nº Serie: {{ u.numeroSerieCelular || 'No disponible' }}</p>
                      </div>
                    </div>
                    <div v-else-if="u.numeroSerieCelular" class="flex items-center gap-2">
                      <div class="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg flex items-center justify-center">
                        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                      <div>
                        <p class="text-sm font-semibold text-gray-900">Nº Serie: {{ u.numeroSerieCelular }}</p>
                        <p class="text-xs text-gray-500">Celular asignado</p>
                      </div>
                    </div>
                    <div v-else class="flex items-center gap-2">
                      <div class="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </div>
                      <span class="text-gray-400 italic text-sm">Sin asignar</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Paginación para Mi Flota -->
          <div v-if="miFlota.length > itemsPerPageFlota" class="mt-4 sm:mt-6 px-4 sm:px-6 pb-4 sm:pb-6">
            <Pagination
              :current-page="currentPageFlota"
              :total-pages="totalPagesFlota"
              :items-per-page="itemsPerPageFlota"
              :total-records="miFlota.length"
              @page-changed="onPageChangedFlota"
              @items-per-page-changed="onItemsPerPageChangedFlota"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { solicitudService, EstadoSolicitud, TIPOS_MOTIVO } from '@/services/solicitudService';
import { authService } from '@/services/authService';
import { excelService } from '@/services/excelService';
import { pdfService } from '@/services/pdfService';
import { obtenerMiFlota, obtenerMisSolicitudes, obtenerSolicitudesMiRegion, crearMiSolicitud, actualizarLineaFlota } from '@/services/usuarioService';
import Pagination from '@/components/Pagination.vue';
import SkeletonLoader from '@/components/SkeletonLoader.vue';
import PdfThumbnail from '@/components/PdfThumbnail.vue';
import EmpleadoAutocomplete from '@/components/EmpleadoAutocomplete.vue';
import { useEmpleadosSolicitud } from '@/composables/useEmpleadosSolicitud';
import { hoyLocal } from '@/utils/empleadosSolicitud';
import { mensajeErrorApi } from '@/utils/apiError';

// Funciones helper para formatear enums
const formatearTipoSolicitud = (tipo) => {
  switch (tipo) {
    case 'CAMBIO_POR_ROTURA':
      return 'Cambio por rotura';
    case 'NUEVO_EQUIPO':
      return 'Equipo nuevo';
    case 'ROBO':
      return 'Robo';
    case 'PERDIDA':
      return 'Pérdida';
    default:
      return tipo?.replace(/_/g, ' ') || 'N/A';
  }
};

const formatearRegion = (region) => {
  switch (region) {
    case 'LA_PLATA':
      return 'La Plata';
    default:
      return region?.replace(/_/g, ' ') || 'N/A';
  }
};

const formatearEstado = (estado) => {
  switch (estado) {
    case 'PENDIENTE':
      return 'Pendiente';
    case 'EN_PROCESO':
      return 'En proceso';
    case 'RESUELTA':
      return 'Resuelta';
    default:
      return estado?.replace(/_/g, ' ') || 'Pendiente';
  }
};

// Tabs
const activeTab = ref('solicitudes'); // 'solicitudes' | 'mi-flota'

// Estado
const misSolicitudes = ref([]);
const loading = ref(false);
// Arranca en true: se carga en onMounted, así el primer frame ya muestra el
// skeleton en vez del estado vacío. (loadingFlota no: esa pestaña carga on-demand.)
const loadingSolicitudes = ref(true);
const loadingFlota = ref(false);
const descargandoDenuncia = ref(false);
const miFlota = ref([]);
const flotaCargada = ref(false);
const notification = reactive({ show: false, type: 'success', message: '' });

// Paginación para Mis Solicitudes
const currentPageSolicitudes = ref(1);
const itemsPerPageSolicitudes = ref(5);

// Paginación para Mi Flota
const currentPageFlota = ref(1);
const itemsPerPageFlota = ref(10);

// Filtros para Mi Flota
const filtroCargoFlota = ref('TODOS');
const mostrarMenuCargo = ref(false);

// Estado para edición de líneas
const editandoLinea = ref({});
const numeroLineaTemporal = ref({});

// Formulario - inicialización condicional según rol
const initializeForm = () => {
  const baseForm = {
    id: '',
    nomSolicitante: '',
    fechaIncidencia: hoyLocal(),
    usuario: '',
    legajo: '',
    tipoSolicitud: '',
    motivo: '',
    observacion: '',
    necesitaLinea: false,
    archivoDenuncia: null
  };
  
  // Solo incluir región si es admin
  if (authService.isAdmin()) {
    baseForm.region = '';
  }
  
  return baseForm;
};

const form = reactive(initializeForm());

const inputClase = 'w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/60 backdrop-blur-sm';

// Non-admins get their region's employees straight from the backend; admins narrow by the region they pick.
const regionFiltro = computed(() => (authService.isAdmin() ? form.region : null));
const regionPendiente = computed(() => authService.isAdmin() && !form.region);
const {
  empleadosRegion,
  solicitantes,
  loading: loadingEmpleados,
  error: errorEmpleados,
  cargar: cargarEmpleados,
  buscarPorNumReparto
} = useEmpleadosSolicitud(regionFiltro);

const cargoSolicitante = computed(() =>
  form.nomSolicitante ? formatearCargo(buscarPorNumReparto(form.nomSolicitante)?.cargo) : ''
);

// A selection from the previous region would be rejected by the backend.
watch(() => form.region, () => {
  form.nomSolicitante = '';
  form.usuario = '';
});

const tiposMotivo = TIPOS_MOTIVO;

// Computed para paginación de Mis Solicitudes
const totalPagesSolicitudes = computed(() => {
  return Math.ceil(solicitudesOrdenadas.value.length / itemsPerPageSolicitudes.value);
});

const solicitudesOrdenadas = computed(() => {
  return [...misSolicitudes.value].sort((a, b) => {
    // Ordenar por fecha de creación descendente (más reciente primero)
    if (a.fecha && b.fecha) {
      return new Date(b.fecha) - new Date(a.fecha);
    }
    // Si no hay fecha, ordenar por ID descendente
    return (b.id || 0) - (a.id || 0);
  });
});

const solicitudesPaginadas = computed(() => {
  const inicio = (currentPageSolicitudes.value - 1) * itemsPerPageSolicitudes.value;
  const fin = inicio + itemsPerPageSolicitudes.value;
  return solicitudesOrdenadas.value.slice(inicio, fin);
});

// Computed para paginación de Mi Flota
const flotaFiltrada = computed(() => {
  let datos = miFlota.value;
  
  // Filtrar por cargo si no es 'TODOS'
  if (filtroCargoFlota.value !== 'TODOS') {
    datos = datos.filter(usuario => usuario.cargo === filtroCargoFlota.value);
  }
  
  // Ordenar por número de reparto de menor a mayor
  const ordenados = datos.sort((a, b) => {
    const numA = parseInt(a.numReparto) || 0;
    const numB = parseInt(b.numReparto) || 0;
    return numA - numB;
  });
  
  console.log('Números de reparto ordenados:', ordenados.map(u => u.numReparto));
  return ordenados;
});

const totalPagesFlota = computed(() => {
  return Math.ceil(flotaFiltrada.value.length / itemsPerPageFlota.value);
});

const flotaPaginada = computed(() => {
  const inicio = (currentPageFlota.value - 1) * itemsPerPageFlota.value;
  const fin = inicio + itemsPerPageFlota.value;
  return flotaFiltrada.value.slice(inicio, fin);
});

// Usuario actual (esto vendría de tu sistema de autenticación)
const usuarioActual = ref(''); // Se debe setear con el usuario logueado

// Función para mostrar notificación con auto-ocultar
const mostrarNotificacion = (mensaje, tipo = 'success') => {
  notification.message = mensaje;
  notification.type = tipo;
  notification.show = true;
  setTimeout(() => {
    notification.show = false;
  }, 4000);
};

// Métodos de paginación para Mis Solicitudes
const onPageChangedSolicitudes = (newPage) => {
  currentPageSolicitudes.value = newPage;
};

const onItemsPerPageChangedSolicitudes = (newItemsPerPage) => {
  itemsPerPageSolicitudes.value = newItemsPerPage;
  currentPageSolicitudes.value = 1; // Reset a la primera página
};

// Métodos de paginación para Mi Flota
const onPageChangedFlota = (newPage) => {
  currentPageFlota.value = newPage;
};

const onItemsPerPageChangedFlota = (newItemsPerPage) => {
  itemsPerPageFlota.value = newItemsPerPage;
  currentPageFlota.value = 1; // Reset a la primera página
};

// Métodos de filtrado para Mi Flota
const filtrarPorCargo = (cargo) => {
  filtroCargoFlota.value = cargo;
  currentPageFlota.value = 1; // Reset a la primera página al filtrar
  mostrarMenuCargo.value = false;
};

const toggleMenuCargo = () => {
  mostrarMenuCargo.value = !mostrarMenuCargo.value;
};

// Función para obtener la clase CSS del cargo
const getCargoClass = (cargo) => {
  const cargoClasses = {
    'REPARTIDOR': 'bg-blue-100 text-blue-800',
    'AYUDANTE': 'bg-green-100 text-green-800',
    'AYUDANTE_ROTATIVO': 'bg-purple-100 text-purple-800',
    'SUPERVISOR': 'bg-orange-100 text-orange-800',
    'REGIONAL': 'bg-red-100 text-red-800',
    'SUPLENTE': 'bg-yellow-100 text-yellow-800',
    'ANALISTA': 'bg-indigo-100 text-indigo-800',
    'JEFE': 'bg-rose-100 text-rose-800',
    'GERENTE': 'bg-emerald-100 text-emerald-800'
  };
  return cargoClasses[cargo] || 'bg-gray-100 text-gray-800';
};

// Función para formatear el cargo
const formatearCargo = (cargo) => {
  if (!cargo) return 'N/A';
  return cargo.charAt(0).toUpperCase() + cargo.slice(1).toLowerCase();
};

// Métodos para editar líneas
const iniciarEdicionLinea = (usuario) => {
  editandoLinea.value[usuario.numReparto] = true;
  numeroLineaTemporal.value[usuario.numReparto] = usuario.numeroLinea || '';
};

const cancelarEdicionLinea = (usuario) => {
  editandoLinea.value[usuario.numReparto] = false;
  delete numeroLineaTemporal.value[usuario.numReparto];
};

const guardarLinea = async (usuario) => {
  try {
    const nuevoNumeroLinea = numeroLineaTemporal.value[usuario.numReparto];

    // Log de depuración
    console.log('🔄 Actualizando línea', {
      numReparto: usuario.numReparto,
      numeroAnterior: usuario.numeroLinea,
      nuevoNumeroLinea
    });

    // Llamada al backend
    await actualizarLineaFlota(usuario.numReparto, nuevoNumeroLinea || null);

    // Refrescar estado local
    const idx = miFlota.value.findIndex(u => u.numReparto === usuario.numReparto);
    if (idx !== -1) miFlota.value[idx].numeroLinea = nuevoNumeroLinea || null;

    // Salir de modo edición
    editandoLinea.value[usuario.numReparto] = false;
    delete numeroLineaTemporal.value[usuario.numReparto];

    mostrarNotificacion('Número de línea actualizado correctamente');
  } catch (error) {
    console.error('Error al actualizar línea:', error);
    if (error.response?.status === 403) {
      mostrarNotificacion('No tienes permisos para actualizar líneas en esta región', 'error');
    } else if (error.response?.status === 404) {
      mostrarNotificacion('Usuario no encontrado en tu flota', 'error');
    } else {
      mostrarNotificacion('Error al actualizar el número de línea', 'error');
    }
  }
};

// Crear solicitud
const crearSolicitud = async () => {
  try {
    loading.value = true;
    
    if (!form.nomSolicitante || !form.usuario) {
      mostrarNotificacion('Selecciona el solicitante y el usuario del equipo de la lista', 'error');
      return;
    }

    // Validar que si es ROBO, tenga denuncia adjunta
    if (form.tipoSolicitud === 'ROBO' && !form.archivoDenuncia) {
      mostrarNotificacion('Debe adjuntar la denuncia PDF para solicitudes de robo', 'error');
      return;
    }
    
    // Debug de autenticación
    console.log('Auth header:', authService.getAuthHeader());
    console.log('Is authenticated:', authService.isAuthenticated());
    console.log('Current user:', authService.getCurrentUser());
    
    // Generar ID único
    form.id = `S${Date.now()}`;
    
    // Preparar payload (sin el archivo)
    const payload = {
      ...form,
      necesitaLinea: form.tipoSolicitud === 'NUEVO_EQUIPO' ? form.necesitaLinea : false,
      estado: EstadoSolicitud.PENDIENTE
    };

    // Remover archivoDenuncia del payload
    delete payload.archivoDenuncia;

    // Si no es admin, la región se maneja automáticamente por el backend
    // (el backend debería usar la región del usuario autenticado)
    if (!authService.isAdmin()) {
      delete payload.region;
    }
    
    console.log('Creando solicitud:', payload);
    const solicitudCreada = await crearMiSolicitud(payload);
    
    // Si es ROBO y hay denuncia, adjuntarla
    if (form.tipoSolicitud === 'ROBO' && form.archivoDenuncia) {
      const denunciaExitosa = await adjuntarDenuncia(solicitudCreada.data.id, form.archivoDenuncia);
      if (!denunciaExitosa) {
        mostrarNotificacion('Solicitud creada pero hubo error al adjuntar la denuncia. Contacte al administrador.', 'error');
        return;
      }
    }
    
    mostrarNotificacion('¡Solicitud creada exitosamente! Recibirás una respuesta pronto.');
    
    // Limpiar formulario
    Object.assign(form, initializeForm());
    
    // Limpiar el input file
    const input = document.querySelector('input[type="file"]');
    if (input) input.value = '';
    
    // Recargar mis solicitudes
    cargarMisSolicitudes();
    
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    mostrarNotificacion(mensajeErrorApi(error, 'Error al crear la solicitud. Intenta nuevamente.'), 'error');
  } finally {
    loading.value = false;
  }
};

// Cargar solicitudes del usuario actual
const cargarMisSolicitudes = async () => {
  try {
    loadingSolicitudes.value = true;
    
    console.log('Cargando solicitudes de mi región...');
    console.log('Auth header:', authService.getAuthHeader());
    console.log('DEBUG: Iniciando función cargarMisSolicitudes');

    // Si no hay autenticación, no intentar llamar al backend
    if (!authService.isAuthenticated()) {
      console.log('⛔ No autenticado: omitiendo carga de solicitudes');
      misSolicitudes.value = [];
      return;
    }
    
    // Obtener todas las solicitudes y filtrar por región del usuario
    const response = await solicitudService.obtenerTodas();
    const todasLasSolicitudes = response.data || [];
    
    // Obtener la región del usuario desde múltiples fuentes
    let userRegion = null;
    
    // Método 1: Desde la flota si ya está cargada
    if (miFlota.value && miFlota.value.length > 0) {
      userRegion = miFlota.value[0].region;
    }
    
    // Método 2: Desde la sesión (el backend devuelve la región en el login/me)
    if (!userRegion) {
      userRegion = authService.getCurrentUser()?.region || null;
    }
    
    // Filtrar solicitudes por región si tenemos la región
    if (userRegion) {
      misSolicitudes.value = todasLasSolicitudes.filter(solicitud => 
        solicitud.region === userRegion
      );
    } else {
      // Si no podemos determinar la región, mostrar todas las solicitudes
      misSolicitudes.value = todasLasSolicitudes;
    }
    
    console.log('Región del usuario:', userRegion);
    console.log('Total solicitudes:', todasLasSolicitudes.length);
    console.log('Solicitudes filtradas por región:', misSolicitudes.value.length);
    console.log('Muestra de solicitud:', misSolicitudes.value[0]);
    
    // Ordenar por fecha de creación descendente (más recientes primero)
    misSolicitudes.value.sort((a, b) => {
      // Si tienen fecha, compararla
      if (a.fecha && b.fecha) {
        return new Date(b.fecha) - new Date(a.fecha);
      }
      // Si tienen ID, usar el ID (asumiendo que IDs más altos = más recientes)
      if (a.id && b.id) {
        return b.id - a.id;
      }
      return 0;
    });
    
    console.log('Solicitudes de mi región ordenadas:', misSolicitudes.value);
    
  } catch (error) {
    console.error('Error al cargar solicitudes:', error);
    
    if (error.response?.status === 403) {
      mostrarNotificacion('No tienes permisos para ver tus solicitudes', 'error');
    } else if (error.response?.status === 404) {
      // Fallback al método anterior si el endpoint no existe
      console.log('Endpoint /api/usuarios/me/solicitudes no disponible, usando método anterior');
      try {
        const response = await solicitudService.obtenerTodas();
        // Filtrar por usuario actual si no hay endpoint específico
        misSolicitudes.value = response.data || [];
        
        // Ordenar por fecha de creación descendente (más recientes primero)
        misSolicitudes.value.sort((a, b) => {
          if (a.fecha && b.fecha) {
            return new Date(b.fecha) - new Date(a.fecha);
          }
          if (a.id && b.id) {
            return b.id - a.id;
          }
          return 0;
        });
      } catch (fallbackError) {
        console.error('Error en fallback:', fallbackError);
        mostrarNotificacion('Error al cargar tus solicitudes', 'error');
      }
    } else {
      mostrarNotificacion('Error al cargar tus solicitudes', 'error');
    }
  } finally {
    loadingSolicitudes.value = false;
  }
};

// Descargar PDF
const descargarPDF = async (solicitud) => {
  try {
    console.log('Generando PDF para solicitud:', solicitud.id);
    await pdfService.generarPDFSolicitud(solicitud);
    mostrarNotificacion('PDF descargado correctamente');
  } catch (error) {
    console.error('Error al generar PDF:', error);
    mostrarNotificacion('Error al generar el PDF', 'error');
  }
};

// Métodos para manejo de archivo de denuncia
const onDenunciaSelected = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Validar tipo de archivo
    if (file.type !== 'application/pdf') {
      mostrarNotificacion('Solo se permiten archivos PDF', 'error');
      event.target.value = '';
      return;
    }
    
    // Validar tamaño (10MB máximo)
    const maxSize = 10 * 1024 * 1024; // 10MB en bytes
    if (file.size > maxSize) {
      mostrarNotificacion('El archivo es demasiado grande. Máximo 10MB', 'error');
      event.target.value = '';
      return;
    }
    
    form.archivoDenuncia = file;
    console.log('Archivo seleccionado:', file.name, 'Tamaño:', formatFileSize(file.size));
  }
};

const removeDenuncia = () => {
  form.archivoDenuncia = null;
  // Limpiar el input file
  const input = document.querySelector('input[type="file"]');
  if (input) input.value = '';
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const adjuntarDenuncia = async (solicitudId, archivo) => {
  try {
    console.log('Adjuntando denuncia a solicitud:', solicitudId);
    await solicitudService.adjuntarDenuncia(solicitudId, archivo);
    mostrarNotificacion('Denuncia adjuntada correctamente');
    return true;
  } catch (error) {
    console.error('Error al adjuntar denuncia:', error);
    mostrarNotificacion('Error al adjuntar la denuncia', 'error');
    return false;
  }
};

const descargarDenuncia = async (solicitudId) => {
  descargandoDenuncia.value = true;
  try {
    console.log('Descargando denuncia de solicitud:', solicitudId);
    const response = await solicitudService.descargarDenuncia(solicitudId);
    
    // Verificar que la respuesta sea válida
    console.log('Response type:', typeof response);
    console.log('Response data:', response.data);
    
    // Obtener el blob de la respuesta
    const blob = response.data;
    
    // Verificar que sea un Blob válido
    if (!(blob instanceof Blob)) {
      throw new Error('La respuesta no es un blob válido');
    }
    
    // Crear URL del blob y descargar
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

// Cargar al montar
onMounted(() => {
  // Aquí deberías obtener el usuario actual del sistema de autenticación
  // usuarioActual.value = obtenerUsuarioActual();
  
  cargarMisSolicitudes();
  cargarEmpleados();
});

// Cargar Mi Flota
const cargarMiFlota = async () => {
  try {
    loadingFlota.value = true;
    console.log('Cargando mi flota...');
    console.log('Auth header:', authService.getAuthHeader());
    console.log('Current user:', authService.getCurrentUser());
    
    const resp = await obtenerMiFlota();
    miFlota.value = resp.data || [];
    flotaCargada.value = true;
    console.log('Mi flota cargada:', miFlota.value);
    console.log('Cargos encontrados:', miFlota.value.map(u => u.cargo));
  } catch (error) {
    console.error('Error al cargar mi flota:', error);
    
    if (error.response?.status === 403) {
      mostrarNotificacion('No tienes permisos para ver la flota de tu región. Esta función podría estar disponible solo para ciertos roles.', 'error');
    } else if (error.response?.status === 404) {
      mostrarNotificacion('El servicio de flota no está disponible. Contacta al administrador.', 'error');
    } else {
      mostrarNotificacion('Error al cargar la flota de tu región', 'error');
    }
    
    miFlota.value = [];
  } finally {
    loadingFlota.value = false;
  }
};
</script>
