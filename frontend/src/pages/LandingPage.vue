<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
    <div class="max-w-7xl mx-auto px-4 py-8 space-y-8">

      <!-- Main header Section -->
      <div
        class="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 md:p-12 shadow-2xl">
        <div class="absolute inset-0 bg-black/10"></div>
        <div class="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div class="flex-1 text-white">
            <div class="inline-block px-3 py-1 bg-white/20 rounded-full text-m font-medium mb-4 backdrop-blur-sm">
              Singapore's #1 Pokemon Trading card Marketplace
            </div>
            <h1 class="text-4xl md:text-5xl font-black leading-tight mb-4">
              Trade<br />
              <span class="text-yellow-300"> Pokémon Cards</span><br />
              With Ease
            </h1>
            <p class="text-lg text-white/90 max-w-xl mb-6">
              Join Singapore's newest & most trusted pokemon community. <br />Live prices, PSA-graded cards, and secure
              P2P
              trading guaranteed!
            </p>

            <div class="flex flex-wrap items-center gap-3 mb-6">
              <button
                class="px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-lg"
                @click="scrollToFeatured">
                Start Browsing
              </button>
              <button class="">
                <router-link to="/login"
                  class="px-6 py-3 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-semibold hover:bg-white/20 transition-all">
                  Login / Sign Up
                </router-link>
              </button>
            </div>

            <div class="flex items-center gap-10 text-sm text-white/80">
              <div class="flex items-center gap-2">
                <TrendingUp class="w-6 h-6" />
                <span>Live Pricing</span>
              </div>
              <div class="flex items-center gap-2">
                <Star class="w-6 h-6" />
                <span>PSA Verified</span>
              </div>
              <div class="flex items-center gap-2">

              </div>
            </div>
          </div>

          <div class="w-full md:w-96 grid grid-cols-2 gap-3">
            <div v-for="card in sampleCards.slice(0, 4)" :key="card.id"
              class="relative rounded-2xl bg-white/95 backdrop-blur-sm p-3 shadow-xl transform hover:scale-105 transition-all">
              <img :src="card.img" :alt="card.title" class="w-full h-36 object-contain" />
              <div class="absolute top-2 right-2 px-2 py-1 bg-yellow-400 text-black text-xs font-bold rounded-full">
                S${{ card.price }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1 relative">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search for Pikachu, Charizard..." v-model="searchTerm"
              class="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-none dark:bg-slate-900" />
          </div>
          <button @click="showFilters = !showFilters"
            class="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all">
            <Filter class="w-5 h-5" />
            Filters
          </button>
        </div>

        <div v-if="showFilters" class="mt-6 pt-6 border-t dark:border-slate-700 grid md:grid-cols-2 gap-6">
          <div>
            <div>
              <label class="block text-sm font-semibold mb-3">Price Range</label>
              <div class="flex gap-2 items-center">
                <input type="number" min="0" max="500" v-model.number="priceRange[0]"
                  class="w-20 px-2 py-1 border rounded" />
                <span>-</span>
                <input type="number" min="0" max="500" v-model.number="priceRange[1]"
                  class="w-20 px-2 py-1 border rounded" />
              </div>
              <p class="text-sm text-gray-500 mt-1">Selected: S${{ priceRange[0] }} - S${{ priceRange[1] }}</p>
            </div>
          </div>
          <div>
            <label class="block text-sm font-semibold mb-3 mr-10">PSA Grade</label>
            <div class="relative">
              <select v-model="selectedGrade"
                class="w-full px-3 py-3 pr-10 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-none dark:bg-slate-900 appearance-none">
                <option value="all">All Grades</option>
                <option value="PSA 10">PSA 10</option>
                <option value="PSA 9">PSA 9</option>
                <option value="PSA 8">PSA 8</option>
              </select>

              <!-- better arrow down -->
              <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Filters -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
        <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
          <Star class="w-5 h-5 text-yellow-500" />
          Quick Filters
        </h3>
        <div class="flex gap-2 flex-wrap">
          <button v-for="(filter, idx) in quickFilters" :key="idx" @click="filter.action"
            class="px-4 py-2 border-2 border-indigo-200 dark:border-slate-700 rounded-xl text-sm font-medium hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all hover:border-indigo-400">
            {{ filter.label }}
          </button>
        </div>
      </div>

      <!-- Featured Cards -->
      <div>
        <div class="flex items-center justify-between mb-6">
          <h2 id="featured-cards" class="text-2xl font-bold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"></svg>
            Featured Holographic Cards
            <span class="text-sm font-normal text-gray-500">(8 cards)</span>
          </h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="card in filteredCards" :key="card.id"
            class="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 overflow-hidden">
            <div class="relative p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-800">
              <button @click="toggleWatchlist(card.id)"
                class="absolute top-2 right-2 z-10 p-2 rounded-full backdrop-blur-sm transition-all" :class="watchlist.includes(card.id)
                  ? 'bg-red-500 text-white'
                  : 'bg-white/80 text-gray-600 hover:bg-red-50'">
                <Heart class="w-5 h-5" :class="watchlist.includes(card.id) ? 'fill-current' : ''" />
              </button>
              <img :src="card.img" :alt="card.title" class="w-full h-56 object-contain" />
            </div>

            <div class="p-4">
              <div class="flex items-start justify-between mb-2">
                <div>
                  <h3 class="font-bold text-lg">{{ card.title }}</h3>
                  <p class="text-sm text-gray-500 dark:text-slate-400">{{ card.set }}</p>
                </div>
                <span
                  class="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-xs font-bold rounded-lg">
                  {{ card.rarity }}
                </span>
              </div>

              <div class="flex items-center justify-between pt-3 border-t dark:border-slate-700">
                <div>
                  <p class="text-2xl font-black text-indigo-600">S${{ card.price }}</p>
                  <p class="text-xs text-gray-500">Last: S${{ card.lastSold }}</p>
                </div>
                <button
                  class="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all">
                  View
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Watchlist -->
      <div v-if="watchlist.length > 0"
        class="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl p-6 shadow-lg border-2 border-red-200 dark:border-red-800">
        <h3 class="font-bold text-lg mb-2 flex items-center gap-2">
          <Heart class="w-5 h-5 text-red-500 fill-current" />
          Your Watchlist
        </h3>
        <p class="text-sm text-gray-600 dark:text-slate-300">
          You're watching {{ watchlist.length }} card{{ watchlist.length !== 1 ? 's' : '' }}.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Heart, Search, Filter, TrendingUp, Star, Eye } from "lucide-vue-next";
import { ref, computed } from 'vue';
const scrollToFeatured = () => {
  const section = document.getElementById('featured-cards')
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' })
  }
}

//HARD CODED CARDS, NEED REPLACE WITH GRABBED API 
const sampleCards = [
  { id: 1, img: 'https://images.pokemontcg.io/base1/4_hires.png', title: 'Charizard Holo', price: '450.00', lastSold: '420.00', rarity: 'PSA 9', set: 'Base Set' },
  { id: 2, img: 'https://images.pokemontcg.io/base1/58_hires.png', title: 'Pikachu', price: '85.00', lastSold: '80.00', rarity: 'PSA 10', set: 'Base Set' },
  { id: 3, img: 'https://images.pokemontcg.io/base1/2_hires.png', title: 'Blastoise Holo', price: '280.00', lastSold: '265.00', rarity: 'PSA 8', set: 'Base Set' },
  { id: 4, img: 'https://images.pokemontcg.io/base1/15_hires.png', title: 'Venusaur Holo', price: '320.00', lastSold: '310.00', rarity: 'PSA 9', set: 'Base Set' },
  { id: 5, img: 'https://images.pokemontcg.io/base1/7_hires.png', title: 'Hitmonchan Holo', price: '45.00', lastSold: '42.00', rarity: 'PSA 10', set: 'Base Set' },
  { id: 6, img: 'https://images.pokemontcg.io/base1/8_hires.png', title: 'Machamp Holo', price: '38.00', lastSold: '35.00', rarity: 'PSA 8', set: 'Base Set' },
  { id: 7, img: 'https://images.pokemontcg.io/base1/3_hires.png', title: 'Chansey Holo', price: '95.00', lastSold: '90.00', rarity: 'PSA 9', set: 'Base Set' },
  { id: 8, img: 'https://images.pokemontcg.io/base1/9_hires.png', title: 'Magneton Holo', price: '42.00', lastSold: '40.00', rarity: 'PSA 10', set: 'Base Set' },
];

const watchlist = ref([]);
const searchTerm = ref('');
const priceRange = ref([0, 500]);
const selectedGrade = ref('all');
const showFilters = ref(false);

function toggleWatchlist(id) {
  if (watchlist.value.includes(id)) {
    watchlist.value = watchlist.value.filter(i => i !== id);
  } else {
    watchlist.value.push(id);
  }
}

const filteredCards = computed(() =>
  sampleCards.filter(card => {
    const matchesSearch = card.title.toLowerCase().includes(searchTerm.value.toLowerCase());
    const matchesPrice = parseFloat(card.price) >= priceRange.value[0] && parseFloat(card.price) <= priceRange.value[1];
    const matchesGrade = selectedGrade.value === 'all' || card.rarity.includes(selectedGrade.value);
    return matchesSearch && matchesPrice && matchesGrade;
  })
);

//HARD CODED SELECTIONS, CAN ADD
const quickFilters = [
  { label: 'Pikachu', action: () => (searchTerm.value = 'Pikachu') },
  { label: 'Charizard', action: () => (searchTerm.value = 'Charizard') },
  { label: 'Under S$50', action: () => (priceRange.value = [0, 50]) },
  { label: 'PSA 10', action: () => (selectedGrade.value = 'PSA 10') },
  { label: 'Reset', action: () => { searchTerm.value = ''; priceRange.value = [0, 500]; selectedGrade.value = 'all'; } },
];
</script>