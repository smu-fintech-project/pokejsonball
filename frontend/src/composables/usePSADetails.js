/**
 * Lazy loading composable for PSA card details
 * Only fetches when user requests it - no upfront API calls!
 */

import { ref } from 'vue';
import { API_BASE } from '@/utils/env';

// Global cache to avoid re-fetching
const metadataCache = new Map();

export function usePSADetails() {
  const loading = ref(false);
  const error = ref(null);
  const data = ref(null);

  /**
   * Lazy load card details - only fetch when called
   * Uses cache to avoid redundant API calls
   */
  async function fetchCardDetails(certNumber) {
    // Check cache first
    if (metadataCache.has(certNumber)) {
      console.log(`✅ Using cached data for cert ${certNumber}`);
      data.value = metadataCache.get(certNumber);
      return data.value;
    }

    loading.value = true;
    error.value = null;

    try {
      console.log(`📡 Fetching details for cert ${certNumber}...`);

      // Fetch from your backend API (which calls PSA API)
      const response = await fetch(`${API_BASE}/api/cards/${certNumber}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const cardData = await response.json();
      
      // Cache the result
      metadataCache.set(certNumber, cardData);
      data.value = cardData;

      console.log(`✅ Details loaded for ${certNumber}`);
      return cardData;

    } catch (err) {
      console.error(`❌ Failed to fetch cert ${certNumber}:`, err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Clear cache for a specific card or all cards
   */
  function clearCache(certNumber = null) {
    if (certNumber) {
      metadataCache.delete(certNumber);
      console.log(`🗑️ Cleared cache for cert ${certNumber}`);
    } else {
      metadataCache.clear();
      console.log(`🗑️ Cleared all cache`);
    }
  }

  return {
    loading,
    error,
    data,
    fetchCardDetails,
    clearCache,
  };
}
