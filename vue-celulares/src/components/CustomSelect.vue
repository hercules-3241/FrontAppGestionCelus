<template>
  <div ref="root" class="relative">
    <button
      type="button"
      @click="open = !open"
      :class="[
        'w-full flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-lg border bg-white text-left transition-colors focus:outline-none',
        open ? 'border-indigo-500 ring-2 ring-indigo-500/40' : 'border-slate-300 hover:border-slate-400'
      ]">
      <span :class="selectedLabel ? 'text-slate-900' : 'text-slate-400'" class="truncate">{{ selectedLabel || placeholder }}</span>
      <svg class="w-4 h-4 text-slate-400 flex-shrink-0 transition-transform" :class="{ 'rotate-180': open }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </button>

    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="open" class="absolute z-40 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg py-1 max-h-60 overflow-auto">
        <button
          v-for="opt in options"
          :key="String(opt.value)"
          type="button"
          @click="select(opt.value)"
          :class="[
            'w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left transition-colors',
            opt.value === modelValue ? 'text-indigo-700 font-medium bg-indigo-50/60' : 'text-slate-700 hover:bg-slate-50'
          ]">
          <span class="truncate">{{ opt.label }}</span>
          <svg v-if="opt.value === modelValue" class="w-4 h-4 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  modelValue: { type: [String, Number, Boolean], default: '' },
  options: { type: Array, default: () => [] }, // [{ value, label }]
  placeholder: { type: String, default: 'Seleccionar' }
});

const emit = defineEmits(['update:modelValue']);

const root = ref(null);
const open = ref(false);

const selectedLabel = computed(() => {
  const found = props.options.find(o => o.value === props.modelValue);
  return found ? found.label : '';
});

const select = (value) => {
  emit('update:modelValue', value);
  open.value = false;
};

const onDocClick = (e) => {
  if (root.value && !root.value.contains(e.target)) open.value = false;
};

onMounted(() => document.addEventListener('click', onDocClick));
onUnmounted(() => document.removeEventListener('click', onDocClick));
</script>
