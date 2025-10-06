<template>
  <section class="space-y-10">
    <!-- hero -->
    <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
      <div class="flex-1">
        <h1 class="text-3xl md:text-4xl font-extrabold leading-tight">Singapore’s community marketplace for Pokémon cards.</h1>
        <p class="mt-4 text-gray-600 dark:text-slate-300 max-w-xl">Buy, sell and trade with trusted collectors. Live prices, verified listings and a friendly community to help you grow your collection.</p>

        <div class="mt-6 flex items-center gap-3">
          <router-link to="/profile" class="px-5 py-3 bg-indigo-600 text-white rounded-lg font-semibold">Start browsing</router-link>
          <router-link to="/login" class="px-4 py-3 border rounded-lg dark:border-slate-700">Login / Signup</router-link>
        </div>

        <div class="mt-6 text-xs text-gray-400">Made for collectors in Singapore • P2P trades supported</div>
      </div>

      <div v-if="featured.length >= 4" class="w-full md:w-96 grid grid-cols-2 gap-3">
        <div v-for="card in featured.slice(0, 4)" :key="card.id" class="rounded-xl bg-white dark:bg-slate-800 p-3 shadow">
          <img :src="card.img" :alt="card.title" class="w-full h-36 object-contain" />
        </div>
      </div>
    </div>
    
    <!-- quick filters To Be Implemented--> 
    <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
      <h3 class="font-semibold mb-3">Quick filters</h3>
      <div class="flex gap-2 flex-wrap">
        <button class="px-3 py-1 border rounded text-sm dark:border-slate-700">Pikachu</button>
        <button class="px-3 py-1 border rounded text-sm dark:border-slate-700">Rare</button>
        <button class="px-3 py-1 border rounded text-sm dark:border-slate-700">S$0 - S$50</button>
      </div>
    </div>

    <!-- featured -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">Featured holographic cards</h2>
        <router-link to="/" class="text-sm px-3 py-1 border rounded dark:border-slate-700">View all</router-link>
      </div>

      <CardGrid>
        <ListingCard v-for="card in featured" :key="card.id" v-bind="card" />
      </CardGrid>
    </div>

  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import CardGrid from '../components/CardGrid.vue';
import ListingCard from '../components/ListingCard.vue';
import { getProxiedImageUrl } from '../utils/imageProxy.js';

// Start with empty array - cards will be loaded from database only
const featuredRaw = ref([]);
const loading = ref(true);
const error = ref(null);

// Fetch ALL cards from backend database (PSA images only)
const loadFeaturedCards = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const resp = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:3001'}/api/cards`);
    
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
    }
    
    const cards = await resp.json();
    
    if (cards.length > 0) {
      console.log(`Loaded ${cards.length} cards from backend database`);
      
      // Map database cards to display format - ONLY use database images
      featuredRaw.value = cards.map(c => ({
        id: c.cert_number,
        img: c.image_url, // Use ONLY database PSA images, no fallback
        title: c.card_name,
        price: c.last_known_price || '0.00',
        lastSold: c.last_known_price || '0.00',
        rarity: `PSA ${c.psa_grade}`,
        set: c.set_name
      })).filter(card => card.img); // Only show cards that have images
      
      console.log(`Displaying ${featuredRaw.value.length} cards with PSA images`);
    } else {
      error.value = 'No cards found in database';
    }
  } catch (e) {
    console.error('Failed to load cards from backend:', e.message);
    error.value = 'Unable to load cards. Please check if the backend is running.';
  } finally {
    loading.value = false;
  }
};

onMounted(loadFeaturedCards);

const featured = computed(() => 
  featuredRaw.value.map(card => ({ ...card, img: getProxiedImageUrl(card.img) }))
);
</script>
