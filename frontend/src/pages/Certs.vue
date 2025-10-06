<template>
  <section class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold dark:text-white">PSA Cert Gallery</h1>
        <p class="text-gray-600 dark:text-slate-400 mt-1">
          Explore our collection of PSA-certified Eeveelution cards
        </p>
      </div>
      
      <button 
        v-if="!loading && certs.length > 0"
        @click="refreshCerts"
        :disabled="refreshing"
        class="inline-flex items-center px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
      >
        <svg 
          class="w-4 h-4 mr-2" 
          :class="{ 'animate-spin': refreshing }"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh
      </button>
    </div>

    <!-- Stats Bar -->
    <div v-if="!loading && certs.length > 0" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
        <div class="text-2xl font-bold text-emerald-500">{{ certs.length }}</div>
        <div class="text-xs text-gray-600 dark:text-slate-400 mt-1">Total Certs</div>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
        <div class="text-2xl font-bold text-blue-500">{{ averageGrade }}</div>
        <div class="text-xs text-gray-600 dark:text-slate-400 mt-1">Avg Grade</div>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
        <div class="text-2xl font-bold text-purple-500">{{ gemMintCount }}</div>
        <div class="text-xs text-gray-600 dark:text-slate-400 mt-1">PSA 10</div>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
        <div class="text-2xl font-bold text-amber-500">${{ totalValue }}</div>
        <div class="text-xs text-gray-600 dark:text-slate-400 mt-1">Est. Value</div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-4">
        <svg class="w-8 h-8 text-emerald-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
      <p class="text-gray-600 dark:text-slate-400">Loading PSA certifications...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
      <div class="inline-flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full mb-3">
        <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Failed to load gallery</h3>
      <p class="text-red-700 dark:text-red-400 mb-4">{{ error }}</p>
      <button 
        @click="loadCerts" 
        class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
      >
        Try Again
      </button>
    </div>

    <!-- Cert Grid -->
    <div v-else-if="certIds.length > 0">
      <CertGrid :cert-ids="certIds" :auto-fetch="true" ref="certGridRef" />
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full mb-4">
        <svg class="w-8 h-8 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No cards available</h3>
      <p class="text-gray-600 dark:text-slate-400">Please add cards to the database first.</p>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import CertGrid from '../components/CertGrid.vue';
import { getAllCards } from '../utils/api';

const certIds = ref([]);
const certs = ref([]);
const loading = ref(true);
const refreshing = ref(false);
const error = ref(null);
const certGridRef = ref(null);

// Compute stats
const averageGrade = computed(() => {
  if (certs.value.length === 0) return '0.0';
  const total = certs.value.reduce((sum, cert) => sum + (parseFloat(cert.grade) || 0), 0);
  return (total / certs.value.length).toFixed(1);
});

const gemMintCount = computed(() => {
  return certs.value.filter(cert => cert.grade === '10').length;
});

const totalValue = computed(() => {
  const total = certs.value.reduce((sum, cert) => {
    return sum + (cert.last_sale?.price || 0);
  }, 0);
  return total.toFixed(2);
});

// Load cert IDs from cards database
const loadCerts = async () => {
  loading.value = true;
  error.value = null;

  try {
    // Fetch all cards to get cert numbers
    const response = await getAllCards({ limit: 200 });
    
    if (response && Array.isArray(response)) {
      // Extract cert numbers from cards
      certIds.value = response
        .map(card => card.cert_number)
        .filter(cert => cert);
      
      console.log(`Loaded ${certIds.value.length} cert IDs from cards database`);
    } else {
      throw new Error('Invalid response format');
    }
  } catch (err) {
    console.error('Failed to load certs:', err);
    error.value = err.message || 'Failed to load certifications';
  } finally {
    loading.value = false;
  }
};

// Refresh cert data
const refreshCerts = async () => {
  refreshing.value = true;
  
  try {
    if (certGridRef.value) {
      await certGridRef.value.fetchCerts();
    }
  } catch (err) {
    console.error('Failed to refresh:', err);
  } finally {
    refreshing.value = false;
  }
};

// Watch for cert data updates from CertGrid
const updateCertsData = (certsData) => {
  certs.value = certsData;
};

onMounted(() => {
  loadCerts();
});
</script>

