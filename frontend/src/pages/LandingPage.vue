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
              <label class="block text-m font-semibold mb-3">Price Range</label>
              <div class="flex gap-2 items-center">
                <input type="number" min="0" max="1000" v-model.number="priceRange[0]"
                  class="w-20 px-2 py-1 border rounded" />
                <span>-</span>
                <input type="number" min="0" max="1000" v-model.number="priceRange[1]"
                  class="w-20 px-2 py-1 border rounded" />
              </div>
              <p class="text-sm text-gray-500 mt-1">Selected: S${{ priceRange[0] }} - S${{ priceRange[1] }}</p>
            </div>
          </div>
          <div>
            <label class="block text-m font-semibold mb-3 mr-10">PSA Grade</label>
            <div class="relative">
              <select v-model="selectedGrade"
                class="w-full px-3 py-3 pr-10 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-none dark:bg-slate-900 appearance-none">
                <option value="all">All Grades</option>
                <option value="PSA 10">PSA 10</option>
                <option value="PSA 9">PSA 9</option>
                <option value="PSA 8">PSA 8</option>
              </select>

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
    <button 
      v-for="(filter, idx) in quickFilters" 
      :key="idx" 
      @click="filter.action"
      :class="[
        'px-4 py-2 border-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
        filterStates[filter.label] 
          ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg' 
          : 'border-indigo-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:border-indigo-400 text-gray-700 dark:text-gray-300'
      ]"
    >
      <CheckCircle v-if="filterStates[filter.label]" class="w-4 h-4" />
      {{ filter.label }}
    </button>
  </div>
</div>
      
      <!-- Watchlist feature -->
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

      <!-- Featured Cards -->
      <div>
        <div class="flex items-center justify-between mb-6">
          <h2 id="featured-cards" class="text-2xl font-bold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"></svg>
            Featured Holographic Cards
            <span class="text-sm font-normal text-gray-500">({{ filteredCards.length }} cards)</span>
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
                <button @click="openCardModal(card)"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all">
                  View
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Card Detail Modal -->
    <div v-if="selectedCard" @click="closeModal" 
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div @click.stop class="bg-white dark:bg-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 flex items-center justify-between z-10">
          <h2 class="text-2xl font-black text-white">Card Details</h2>
          <button @click="closeModal" class="p-2 hover:bg-white/20 rounded-lg transition-all">
            <X class="w-6 h-6 text-white" />
          </button>
        </div>

        <div class="p-6 md:p-8">
          <div class="grid md:grid-cols-2 gap-8">
            <!-- Card Image -->
            <div class="relative">
              <div class="sticky top-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-800 rounded-2xl p-6 shadow-lg">
                <img :src="selectedCard.img" :alt="selectedCard.title" class="w-full object-contain max-h-96" />
              </div>
            </div>

            <!-- Card Information -->
            <div class="space-y-6">
              <!-- Basic Info -->
              <div>
                <div class="flex items-start justify-between mb-2">
                  <div>
                    <h3 class="text-3xl font-black mb-1">{{ selectedCard.title }}</h3>
                    <p class="text-lg text-gray-500 dark:text-slate-400">{{ selectedCard.set }}</p>
                  </div>
                  <span class="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-sm font-bold rounded-lg">
                    {{ selectedCard.rarity }}
                  </span>
                </div>
              </div>

              <!-- Price Section -->
              <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800">
                <p class="text-sm text-gray-600 dark:text-slate-400 mb-1">Current Price</p>
                <p class="text-4xl font-black text-green-600 mb-2">S${{ selectedCard.price }}</p>
                <p class="text-sm text-gray-500">Last sold: S${{ selectedCard.lastSold }}</p>
              </div>

              <!-- TODO: REPLACE WITH REAL API DATA FROM POKEMON TCG API -->
              <!-- API Integration Point: Fetch card details from https://api.pokemontcg.io/v2/cards/{id} -->
              <div class="space-y-4">
                <h4 class="font-bold text-lg">Card Information</h4>
                
                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                    <p class="text-xs text-gray-500 dark:text-slate-400 mb-1">Type</p>
                    <p class="font-semibold">{{ selectedCard.apiData?.types?.join(', ') || 'Fire' }}</p>
                  </div>
                  <div class="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                    <p class="text-xs text-gray-500 dark:text-slate-400 mb-1">HP</p>
                    <p class="font-semibold">{{ selectedCard.apiData?.hp || '120' }}</p>
                  </div>
                  <div class="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                    <p class="text-xs text-gray-500 dark:text-slate-400 mb-1">Rarity</p>
                    <p class="font-semibold">{{ selectedCard.apiData?.rarity || 'Holo Rare' }}</p>
                  </div>
                  <div class="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                    <p class="text-xs text-gray-500 dark:text-slate-400 mb-1">Artist</p>
                    <p class="font-semibold">{{ selectedCard.apiData?.artist || 'Ken Sugimori' }}</p>
                  </div>
                </div>

                <!-- Attacks/Abilities -->
                <div v-if="selectedCard.apiData?.attacks" class="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                  <p class="text-sm font-bold mb-3">Attacks</p>
                  <div v-for="(attack, idx) in selectedCard.apiData.attacks" :key="idx" class="mb-2 last:mb-0">
                    <p class="font-semibold">{{ attack.name }} - {{ attack.damage }}</p>
                    <p class="text-sm text-gray-600 dark:text-slate-400">{{ attack.text }}</p>
                  </div>
                </div>

                <!-- Seller Info -->
                <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-4 border-2 border-purple-200 dark:border-purple-800">
                  <p class="text-sm font-semibold mb-2">Seller Information</p>
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                      <User class="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p class="font-semibold">{{ selectedCard.sellerName || 'CardMaster88' }}</p>
                      <p class="text-sm text-gray-500">⭐ 4.9 ({{ selectedCard.sellerRating || '156' }} reviews)</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-3 pt-4">
                <button @click="handleBuyCard" 
                  class="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg transform hover:scale-105">
                  Buy Now - S${{ selectedCard.price }}
                </button>
                <button @click="handleContactSeller"
                  class="px-6 py-4 bg-white dark:bg-slate-700 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-xl font-semibold hover:bg-indigo-50 dark:hover:bg-slate-600 transition-all">
                  Contact Seller
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Heart, Search, Filter, TrendingUp, Star, X, User, CheckCircle } from "lucide-vue-next";

const scrollToFeatured = () => {
  const section = document.getElementById('featured-cards')
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' })
  }
}

// TODO: REPLACE WITH API CALL TO OUR BACKEND
// Expanded card list with more Pokémon
const sampleCards = [
  { id: 1, img: 'https://images.pokemontcg.io/base1/4_hires.png', title: 'Charizard Holo', price: '450.00', lastSold: '420.00', rarity: 'PSA 9', set: 'Base Set', sellerName: 'CardMaster88', sellerRating: '156' },
  { id: 2, img: 'https://images.pokemontcg.io/base1/58_hires.png', title: 'Pikachu', price: '85.00', lastSold: '80.00', rarity: 'PSA 10', set: 'Base Set', sellerName: 'PokeFan123', sellerRating: '89' },
  { id: 3, img: 'https://images.pokemontcg.io/base1/2_hires.png', title: 'Blastoise Holo', price: '280.00', lastSold: '265.00', rarity: 'PSA 8', set: 'Base Set', sellerName: 'TurtlePower', sellerRating: '142' },
  { id: 4, img: 'https://images.pokemontcg.io/base1/15_hires.png', title: 'Venusaur Holo', price: '320.00', lastSold: '310.00', rarity: 'PSA 9', set: 'Base Set', sellerName: 'GrassKing', sellerRating: '203' },
  { id: 5, img: 'https://images.pokemontcg.io/base1/7_hires.png', title: 'Hitmonchan Holo', price: '45.00', lastSold: '42.00', rarity: 'PSA 10', set: 'Base Set', sellerName: 'FightClub', sellerRating: '67' },
  { id: 6, img: 'https://images.pokemontcg.io/base1/8_hires.png', title: 'Machamp Holo', price: '38.00', lastSold: '35.00', rarity: 'PSA 8', set: 'Base Set', sellerName: 'MuscleMan', sellerRating: '94' },
  { id: 7, img: 'https://images.pokemontcg.io/base1/3_hires.png', title: 'Chansey Holo', price: '95.00', lastSold: '90.00', rarity: 'PSA 9', set: 'Base Set', sellerName: 'LuckyEgg', sellerRating: '178' },
  { id: 8, img: 'https://images.pokemontcg.io/base1/9_hires.png', title: 'Magneton Holo', price: '42.00', lastSold: '40.00', rarity: 'PSA 10', set: 'Base Set', sellerName: 'ElectricDreams', sellerRating: '121' },
  { id: 9, img: 'https://images.pokemontcg.io/base1/1_hires.png', title: 'Alakazam Holo', price: '165.00', lastSold: '158.00', rarity: 'PSA 9', set: 'Base Set', sellerName: 'PsychicMaster', sellerRating: '134' },
  { id: 10, img: 'https://images.pokemontcg.io/base1/10_hires.png', title: 'Mewtwo Holo', price: '195.00', lastSold: '185.00', rarity: 'PSA 10', set: 'Base Set', sellerName: 'LegendaryCards', sellerRating: '267' },
  { id: 11, img: 'https://images.pokemontcg.io/base1/11_hires.png', title: 'Nidoking Holo', price: '58.00', lastSold: '55.00', rarity: 'PSA 8', set: 'Base Set', sellerName: 'PoisonKing', sellerRating: '88' },
  { id: 12, img: 'https://images.pokemontcg.io/base1/12_hires.png', title: 'Ninetales Holo', price: '72.00', lastSold: '68.00', rarity: 'PSA 9', set: 'Base Set', sellerName: 'FireFox99', sellerRating: '145' },
  { id: 13, img: 'https://images.pokemontcg.io/base1/13_hires.png', title: 'Poliwrath Holo', price: '48.00', lastSold: '45.00', rarity: 'PSA 8', set: 'Base Set', sellerName: 'WaterWarrior', sellerRating: '76' },
  { id: 14, img: 'https://images.pokemontcg.io/base1/14_hires.png', title: 'Raichu Holo', price: '118.00', lastSold: '112.00', rarity: 'PSA 10', set: 'Base Set', sellerName: 'ThunderBolt', sellerRating: '198' },
  { id: 15, img: 'https://images.pokemontcg.io/base1/16_hires.png', title: 'Zapdos Holo', price: '225.00', lastSold: '215.00', rarity: 'PSA 9', set: 'Base Set', sellerName: 'BirdCollector', sellerRating: '234' },
  { id: 16, img: 'https://images.pokemontcg.io/base1/17_hires.png', title: 'Beedrill Holo', price: '52.00', lastSold: '48.00', rarity: 'PSA 8', set: 'Base Set', sellerName: 'BugCatcher', sellerRating: '102' },
];

const watchlist = ref([]);
const searchTerm = ref('');
const priceRange = ref([0, 1000]);
const selectedGrade = ref('all');
const showFilters = ref(false);
const selectedCard = ref(null);

function toggleWatchlist(id) {
  if (watchlist.value.includes(id)) {
    watchlist.value = watchlist.value.filter(i => i !== id);
  } else {
    watchlist.value.push(id);
  }
}

// TODO: INTEGRATE WITH POKEMON TCG API
// Function to fetch card details from API
async function fetchCardDetails(card) {
  // Example API integration point:
  // const response = await fetch(`https://api.pokemontcg.io/v2/cards?q=name:"${card.title}"`);
  // const data = await response.json();
  // return data.data[0]; // Returns full card data including attacks, abilities, etc.
  
  // For now, return mock data
  return {
    types: ['Fire'],
    hp: '120',
    rarity: 'Holo Rare',
    artist: 'Ken Sugimori',
    attacks: [
      { name: 'Fire Blast', damage: '100', text: 'Discard an Energy card attached to Charizard.' }
    ]
  };
}

async function openCardModal(card) {
  selectedCard.value = card;
  
  // TODO: Uncomment and implement when backend is ready
  // const apiData = await fetchCardDetails(card);
  // selectedCard.value.apiData = apiData;
}

function closeModal() {
  selectedCard.value = null;
}

// TODO: CONNECT TO YOUR BACKEND FOR PURCHASE FLOW
function handleBuyCard() {
  // Integrate with your backend payment/transaction system
  alert(`Initiating purchase for ${selectedCard.value.title} at S$${selectedCard.value.price}`);
  // Example: router.push({ name: 'checkout', params: { cardId: selectedCard.value.id } });
}

// TODO: CONNECT TO YOUR MESSAGING SYSTEM
function handleContactSeller() {
  // Integrate with your messaging/chat system
  alert(`Opening chat with ${selectedCard.value.sellerName}`);
  // Example: router.push({ name: 'messages', params: { sellerId: selectedCard.value.sellerId } });
}

const filteredCards = computed(() =>
  sampleCards.filter(card => {
    const matchesSearch = card.title.toLowerCase().includes(searchTerm.value.toLowerCase());
    const matchesPrice = parseFloat(card.price) >= priceRange.value[0] && parseFloat(card.price) <= priceRange.value[1];
    const matchesGrade = selectedGrade.value === 'all' || card.rarity.includes(selectedGrade.value);
    return matchesSearch && matchesPrice && matchesGrade;
  })
);

const activeQuickFilter = ref('')

const filterStates = ref({
  'Pikachu': false,
  'Charizard': false,
  'Under S$50': false,
  'PSA 10': false,
  'Legendary': false,
  'Reset': false
})

// Updated quickFilters with individual state tracking
const quickFilters = [
  { 
    label: 'Pikachu', 
    action: () => {
      searchTerm.value = 'Pikachu'
      filterStates.value['Pikachu'] = !filterStates.value['Pikachu']
      // Turn off other search-based filters
      filterStates.value['Charizard'] = false
      filterStates.value['Legendary'] = false
    }
  },
  { 
    label: 'Charizard', 
    action: () => {
      searchTerm.value = 'Charizard'
      filterStates.value['Charizard'] = !filterStates.value['Charizard']
      // Turn off other search-based filters
      filterStates.value['Pikachu'] = false
      filterStates.value['Legendary'] = false
    }
  },
  { 
    label: 'Under S$50', 
    action: () => {
      priceRange.value = filterStates.value['Under S$50'] ? [0, 1000] : [0, 50]
      filterStates.value['Under S$50'] = !filterStates.value['Under S$50']
    }
  },
  { 
    label: 'PSA 10', 
    action: () => {
      selectedGrade.value = filterStates.value['PSA 10'] ? 'all' : 'PSA 10'
      filterStates.value['PSA 10'] = !filterStates.value['PSA 10']
    }
  },
  { 
    label: 'Legendary', 
    action: () => {
      searchTerm.value = filterStates.value['Legendary'] ? '' : 'Mewtwo'
      filterStates.value['Legendary'] = !filterStates.value['Legendary']
      // Turn off other search-based filters
      filterStates.value['Pikachu'] = false
      filterStates.value['Charizard'] = false
    }
  },
  { 
    label: 'Reset', 
    action: () => {
      searchTerm.value = ''
      priceRange.value = [0, 1000]
      selectedGrade.value = 'all'
      // Reset all filter states
      Object.keys(filterStates.value).forEach(key => {
        filterStates.value[key] = false
      })
    }
  },
]

</script>