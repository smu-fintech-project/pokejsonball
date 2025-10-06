<template>
  <article class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
    <!-- Images Section -->
    <div class="relative bg-gray-50 dark:bg-slate-700">
      <div class="grid grid-cols-2 gap-1 p-2">
        <!-- Left Image (Front) -->
        <div class="aspect-[3/4] bg-gray-100 dark:bg-slate-600 rounded-lg overflow-hidden">
          <img 
            v-if="cert.images?.left" 
            :src="getProxiedImageUrl(cert.images.left)" 
            :alt="`${cert.item_title} - Front`"
            class="w-full h-full object-contain"
            @error="handleImageError"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <div class="animate-pulse w-16 h-16 bg-gray-300 dark:bg-slate-500 rounded"></div>
          </div>
        </div>
        
        <!-- Right Image (Back) -->
        <div class="aspect-[3/4] bg-gray-100 dark:bg-slate-600 rounded-lg overflow-hidden">
          <img 
            v-if="cert.images?.right" 
            :src="getProxiedImageUrl(cert.images.right)" 
            :alt="`${cert.item_title} - Back`"
            class="w-full h-full object-contain"
            @error="handleImageError"
          />
          <div v-else-if="!cert.images?.left" class="w-full h-full flex items-center justify-center">
            <div class="animate-pulse w-16 h-16 bg-gray-300 dark:bg-slate-500 rounded"></div>
          </div>
          <div v-else class="w-full h-full flex items-center justify-center text-xs text-gray-400">
            No back image
          </div>
        </div>
      </div>
      
      <!-- Grade Badge -->
      <div class="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
        PSA {{ cert.grade || '?' }}
      </div>
    </div>

    <!-- Card Info Section -->
    <div class="p-4">
      <!-- Title -->
      <h3 class="font-semibold text-sm md:text-base line-clamp-2 mb-2 dark:text-white">
        {{ cert.item_title || 'Unknown Card' }}
      </h3>

      <!-- Metadata Chips -->
      <div class="flex flex-wrap gap-1.5 mb-3">
        <span v-if="cert.year" class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
          {{ cert.year }}
        </span>
        <span v-if="cert.category" class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
          {{ cert.category }}
        </span>
        <span v-if="cert.label_type" class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
          {{ cert.label_type }}
        </span>
        <span v-if="cert.variety_pedigree" class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
          {{ cert.variety_pedigree }}
        </span>
      </div>

      <!-- Population Stats -->
      <div v-if="cert.psa_population || cert.psa_pop_higher" class="text-xs text-gray-600 dark:text-slate-400 mb-3 space-y-0.5">
        <div v-if="cert.psa_population" class="flex justify-between">
          <span>PSA Pop:</span>
          <span class="font-medium">{{ cert.psa_population }}</span>
        </div>
        <div v-if="cert.psa_pop_higher" class="flex justify-between">
          <span>Pop Higher:</span>
          <span class="font-medium">{{ cert.psa_pop_higher }}</span>
        </div>
      </div>

      <!-- Last Sale Section -->
      <div class="pt-3 border-t border-gray-200 dark:border-slate-700">
        <div v-if="hasLastSale" class="space-y-1">
          <div class="flex items-baseline justify-between">
            <span class="text-xs text-gray-500 dark:text-slate-400">Last Sale</span>
            <span v-if="isFallbackPrice" class="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5 rounded">
              Estimated
            </span>
          </div>
          
          <div class="flex items-baseline justify-between">
            <span class="text-lg font-bold text-gray-900 dark:text-white">
              {{ cert.last_sale.currency || '$' }}{{ formatPrice(cert.last_sale.price) }}
            </span>
            <span class="text-xs text-gray-500 dark:text-slate-400">
              {{ formatDate(cert.last_sale.date) }}
            </span>
          </div>
          
          <div v-if="cert.last_sale.market" class="text-xs text-gray-600 dark:text-slate-400">
            {{ cert.last_sale.market }}
          </div>
          
          <a 
            v-if="cert.last_sale.listing_url" 
            :href="cert.last_sale.listing_url" 
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center text-xs text-emerald-600 dark:text-emerald-400 hover:underline mt-1"
          >
            View listing
            <svg class="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
        
        <div v-else class="text-xs text-gray-400 dark:text-slate-500 italic">
          No recent sales
        </div>
      </div>

      <!-- Cert Number -->
      <div class="mt-3 pt-2 border-t border-gray-100 dark:border-slate-700">
        <div class="flex items-center justify-between text-xs">
          <span class="text-gray-500 dark:text-slate-400">Cert #{{ cert.cert_number }}</span>
          <a 
            :href="`https://www.psacard.com/cert/${cert.cert_number}`" 
            target="_blank"
            rel="noopener noreferrer"
            class="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Verify PSA
          </a>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue';
import { getProxiedImageUrl } from '../utils/imageProxy.js';

const props = defineProps({
  cert: {
    type: Object,
    required: true,
    default: () => ({
      cert_number: '',
      item_title: 'Loading...',
      grade: null,
      images: {},
      last_sale: {}
    })
  }
});

const hasLastSale = computed(() => {
  return props.cert.last_sale?.price != null && props.cert.last_sale.price > 0;
});

const isFallbackPrice = computed(() => {
  return props.cert.last_sale?.source === 'TCG_API_FALLBACK';
});

const formatPrice = (price) => {
  if (!price) return '0.00';
  return parseFloat(price).toFixed(2);
};

const formatDate = (date) => {
  if (!date) return '';
  try {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return date;
  }
};

const handleImageError = (e) => {
  e.target.src = 'https://via.placeholder.com/400x560/1a1a2e/eaeaea?text=PSA+Card';
};
</script>

