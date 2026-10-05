<template>
  <!-- Imita la tarjeta de listado en móvil: título + meta, grilla de campos y acciones -->
  <div class="p-4">
    <div class="flex items-start justify-between gap-3 mb-3">
      <div class="min-w-0 flex-1 space-y-2">
        <div class="skeleton h-4 w-2/5"></div>
        <div class="skeleton h-3 w-1/4"></div>
      </div>
      <div class="skeleton h-5 w-20 rounded-full flex-shrink-0"></div>
    </div>

    <div class="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
      <div v-for="i in 4" :key="i" class="flex items-center justify-between gap-2">
        <div class="skeleton h-3 w-14"></div>
        <div class="skeleton h-3 w-16"></div>
      </div>
    </div>

    <div class="space-y-2 mb-3">
      <div class="skeleton h-2.5 w-12"></div>
      <div class="skeleton h-3 w-3/4"></div>
    </div>

    <div class="flex items-center gap-2 pt-3 border-t border-slate-100">
      <div class="skeleton h-9 flex-1 rounded-lg"></div>
      <div class="skeleton h-9 w-10 rounded-lg flex-shrink-0"></div>
    </div>
  </div>
</template>
