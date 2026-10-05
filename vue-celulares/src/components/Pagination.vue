<template>
  <div class="flex flex-col sm:flex-row items-center justify-between gap-4 card px-5 py-3">
    <!-- Información de registros -->
    <div class="flex items-center text-sm text-slate-500">
      <span class="mr-1">Mostrando</span>
      <span class="font-semibold text-slate-700">{{ startRecord }}</span>
      <span class="mx-1">-</span>
      <span class="font-semibold text-slate-700">{{ endRecord }}</span>
      <span class="mx-1">de</span>
      <span class="font-semibold text-slate-700">{{ totalRecords }}</span>
      <span class="ml-1">registros</span>
    </div>

    <!-- Controles de paginación -->
    <div class="flex items-center space-x-2">
      <!-- Botón anterior -->
      <button
        @click="goToPreviousPage"
        :disabled="currentPage === 1"
        :class="[
          'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
          currentPage === 1
            ? 'text-slate-300 cursor-not-allowed'
            : 'text-slate-600 bg-white hover:bg-slate-50 border border-slate-200'
        ]"
      >
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        Anterior
      </button>

      <!-- Números de página -->
      <div class="flex space-x-1">
        <!-- Primera página -->
        <button
          v-if="showFirstPage"
          @click="goToPage(1)"
          :class="pageButtonClass(1)"
        >
          1
        </button>

        <!-- Puntos suspensivos izquierdos -->
        <span v-if="showLeftEllipsis" class="px-3 py-2 text-gray-400">...</span>

        <!-- Páginas visibles -->
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="goToPage(page)"
          :class="pageButtonClass(page)"
        >
          {{ page }}
        </button>

        <!-- Puntos suspensivos derechos -->
        <span v-if="showRightEllipsis" class="px-3 py-2 text-gray-400">...</span>

        <!-- Última página -->
        <button
          v-if="showLastPage"
          @click="goToPage(totalPages)"
          :class="pageButtonClass(totalPages)"
        >
          {{ totalPages }}
        </button>
      </div>

      <!-- Botón siguiente -->
      <button
        @click="goToNextPage"
        :disabled="currentPage === totalPages"
        :class="[
          'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
          currentPage === totalPages
            ? 'text-slate-300 cursor-not-allowed'
            : 'text-slate-600 bg-white hover:bg-slate-50 border border-slate-200'
        ]"
      >
        Siguiente
        <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>
    </div>

    <!-- Selector de items por página -->
    <div class="flex items-center gap-2 text-sm">
      <label class="text-slate-500">Por página:</label>
      <select
        :value="itemsPerPage"
        @change="changeItemsPerPage"
        class="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 bg-white text-slate-700"
      >
        <option value="10">10</option>
        <option value="25">25</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits } from 'vue';

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalRecords: {
    type: Number,
    required: true
  },
  itemsPerPage: {
    type: Number,
    default: 25
  }
});

const emit = defineEmits(['page-changed', 'items-per-page-changed']);

// Computed properties
const totalPages = computed(() => Math.ceil(props.totalRecords / props.itemsPerPage));

const startRecord = computed(() => {
  if (props.totalRecords === 0) return 0;
  return (props.currentPage - 1) * props.itemsPerPage + 1;
});

const endRecord = computed(() => {
  const end = props.currentPage * props.itemsPerPage;
  return end > props.totalRecords ? props.totalRecords : end;
});

// Páginas visibles (máximo 5 páginas alrededor de la actual)
const visiblePages = computed(() => {
  const pages = [];
  const maxVisiblePages = 5;
  let start = Math.max(1, props.currentPage - Math.floor(maxVisiblePages / 2));
  let end = Math.min(totalPages.value, start + maxVisiblePages - 1);

  // Ajustar el inicio si estamos cerca del final
  if (end - start + 1 < maxVisiblePages) {
    start = Math.max(1, end - maxVisiblePages + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

const showFirstPage = computed(() => {
  return !visiblePages.value.includes(1) && totalPages.value > 1;
});

const showLastPage = computed(() => {
  return !visiblePages.value.includes(totalPages.value) && totalPages.value > 1;
});

const showLeftEllipsis = computed(() => {
  return showFirstPage.value && visiblePages.value[0] > 2;
});

const showRightEllipsis = computed(() => {
  return showLastPage.value && visiblePages.value[visiblePages.value.length - 1] < totalPages.value - 1;
});

// Methods
const pageButtonClass = (page) => {
  const isCurrentPage = page === props.currentPage;
  return [
    'min-w-[2.25rem] px-3 py-2 text-sm font-medium rounded-lg transition-colors',
    isCurrentPage
      ? 'bg-indigo-600 text-white'
      : 'text-slate-600 bg-white hover:bg-slate-50 border border-slate-200'
  ];
};

const goToPage = (page) => {
  if (page !== props.currentPage && page >= 1 && page <= totalPages.value) {
    emit('page-changed', page);
  }
};

const goToPreviousPage = () => {
  if (props.currentPage > 1) {
    goToPage(props.currentPage - 1);
  }
};

const goToNextPage = () => {
  if (props.currentPage < totalPages.value) {
    goToPage(props.currentPage + 1);
  }
};

const changeItemsPerPage = (event) => {
  const newItemsPerPage = parseInt(event.target.value);
  emit('items-per-page-changed', newItemsPerPage);
};
</script>
