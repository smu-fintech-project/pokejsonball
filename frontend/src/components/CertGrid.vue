<template>
  <div class="w-full">
    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div v-for="n in 8" :key="n" class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden animate-pulse">
        <div class="aspect-[2/3] bg-gray-200 dark:bg-slate-700"></div>
        <div class="p-4 space-y-3">
          <div class="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
          <div class="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
          <div class="h-8 bg-gray-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
        <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Failed to load certs</h3>
      <p class="text-gray-600 dark:text-slate-400 mb-4">{{ error }}</p>
      <button 
        @click="fetchCerts" 
        class="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition"
      >
        Try Again
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="certs.length === 0" class="text-center py-12">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full mb-4">
        <svg class="w-8 h-8 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No certs available</h3>
      <p class="text-gray-600 dark:text-slate-400">No PSA certifications found to display.</p>
    </div>

    <!-- Cert Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <CertCard 
        v-for="cert in certs" 
        :key="cert.cert_number" 
        :cert="cert" 
      />
    </div>

    <!-- Partial Errors Warning -->
    <div v-if="partialErrors && partialErrors.length > 0" class="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
      <div class="flex items-start">
        <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <h4 class="font-medium text-yellow-800 dark:text-yellow-300 mb-1">Some certs failed to load</h4>
          <p class="text-sm text-yellow-700 dark:text-yellow-400">
            {{ partialErrors.length }} cert(s) could not be fetched. They may be temporarily unavailable.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import CertCard from './CertCard.vue';
import { getCerts } from '../utils/api';

const props = defineProps({
  certIds: {
    type: Array,
    default: () => []
  },
  autoFetch: {
    type: Boolean,
    default: true
  }
});

const certs = ref([]);
const loading = ref(false);
const error = ref(null);
const partialErrors = ref([]);

const fetchCerts = async () => {
  if (props.certIds.length === 0) {
    console.warn('No cert IDs provided to CertGrid');
    return;
  }

  loading.value = true;
  error.value = null;
  partialErrors.value = [];

  try {
    const response = await getCerts(props.certIds);
    
    if (response.certs) {
      certs.value = response.certs.filter(cert => !cert.error);
      
      // Track partial errors
      if (response.errors && response.errors.length > 0) {
        partialErrors.value = response.errors;
      }
    } else {
      throw new Error('Invalid response format');
    }
  } catch (err) {
    console.error('Failed to fetch certs:', err);
    error.value = err.message || 'An unexpected error occurred';
  } finally {
    loading.value = false;
  }
};

// Watch for certIds changes
watch(() => props.certIds, () => {
  if (props.autoFetch && props.certIds.length > 0) {
    fetchCerts();
  }
}, { immediate: false });

// Auto-fetch on mount if enabled
onMounted(() => {
  if (props.autoFetch && props.certIds.length > 0) {
    fetchCerts();
  }
});

// Expose fetchCerts for manual triggering
defineExpose({ fetchCerts });
</script>

