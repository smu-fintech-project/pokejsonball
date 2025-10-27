<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
    <div class="max-w-7xl mx-auto px-4 py-8 space-y-8">

      <!-- 3D Pokeball Hero Section -->
      <section class="relative overflow-hidden bg-[radial-gradient(circle_at_center,_#e5e7eb_0%,_#dfe3e8_30%,_#ffffff_100%)] dark:bg-[radial-gradient(circle_at_center,_#0f172a_0%,_#1e293b_100%)] rounded-3xl p-8 md:p-12 shadow-2xl">
         
        <div class="text-center">
          <!-- 3D Pokeball Canvas -->
          <div ref="canvasContainer" class="w-full h-80 mb-8 cursor-grab active:cursor-grabbing">
            <canvas ref="canvas" class="w-full h-full"></canvas>
          </div>
          
          <h1 class="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span class="inline-block hover:scale-110 transition-transform text-gray-900 dark:text-white">Catch</span>
            <span class="inline-block hover:scale-110 transition-transform text-red-500"> 'Em</span>
            <br />
            <span class="inline-block hover:scale-110 transition-transform text-yellow-500 mr-5">All</span>
            <span class="inline-block hover:scale-110 transition-transform text-gray-900 dark:text-white">Again</span>
          </h1>
          
          <p class="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join Singapore's newest & most trusted pokemon community. <br />Live prices, PSA-graded cards, and secure P2P trading guaranteed!
          </p>
          
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button @click="scrollToFeatured" class="px-8 py-4 bg-red-500 text-white rounded-full font-bold text-lg hover:bg-red-600 transition-all shadow-xl hover:shadow-2xl hover:scale-105">
              Begin Adventure →
            </button>
            <router-link v-if="!isLoggedIn" to="/login" class="px-8 py-4 bg-white text-gray-900 rounded-full font-bold text-lg hover:bg-gray-50 transition-all shadow-lg border-2 border-gray-200">
              Login / Sign Up
            </router-link>
          </div>
        </div>
      </section>

<!-- Main Search & Filter Bar -->
<div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
  <!-- Search Row -->
  <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
    <!-- Search Input -->
    <div class="flex-1 relative">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        placeholder="Search cards..."
        v-model="searchTerm"
        class="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
      />
    </div>

    <!-- Filter Toggle -->
    <button @click="showFilters = !showFilters"
      :class="[
        'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap',
        showFilters
          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
          : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 border border-gray-300 dark:border-slate-600'
      ]"
    >
      <Filter class="w-4 h-4" />
      <span>Filters</span>
      <svg :class="['w-4 h-4 transition-transform', showFilters ? 'rotate-180' : '']"
        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  </div>

  

  <!-- Filters Panel -->
  <div v-if="showFilters" class="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
      <!-- Sort Dropdown -->
      <div>
        <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Sort By</label>
        <div class="relative">
          <select
            v-model="sortBy"
            class="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pr-8 transition-all"
          >
            <option value="name-asc">Name: A-Z</option>
            <option value="name-desc">Name: Z-A</option>
            <option value="price-low">Price: Low→High</option>
            <option value="price-high">Price: High→Low</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
          <svg class="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      

      <!-- Price Range -->
      <div class="ml-4">
        <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Price Range ($)</label>
        <div class="flex gap-2 items-center"> 
          <input type="number" min="0" max="1000" v-model.number="priceRange[0]"
            class="w-16 px-2 py-2 border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 rounded text-gray-900 dark:text-white text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all" />
          <span class="text-gray-400">-</span>
          <input type="number" min="0" max="1000" v-model.number="priceRange[1]"
            class="w-16 px-2 py-2 border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 rounded text-gray-900 dark:text-white text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all" />
        </div>
      </div>

      <!-- PSA Grade -->
      <div>
        <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">PSA Grade</label>
        <div class="relative">
          <select v-model="selectedGrade"
            class="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 rounded text-gray-900 dark:text-white text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none pr-8 transition-all">
            <option value="all">All</option>
            <option value="PSA 10">PSA 10</option>
            <option value="PSA 9">PSA 9</option>
            <option value="PSA 8">PSA 8</option>
            <option value="PSA 7">PSA 7</option>
            <option value="PSA 6">PSA 6</option>
            <option value="PSA 5">PSA 5</option>
            <option value="PSA 4">PSA 4</option>
            <option value="PSA 3">PSA 3</option>
            <option value="PSA 2">PSA 2</option>
            <option value="PSA 1">PSA 1</option>
            
          </select>
          <svg class="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

        <!-- Clear Filters Button -->
      <div class="flex gap-3 items-end">
        <button v-if="searchTerm || selectedGrade !== 'all' || selectedRarity !== 'all' || priceRange[0] > 0 || priceRange[1] < 1000 || sortBy !== 'name-asc'" @click="resetAllFilters"
          class="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all whitespace-nowrap">
          Clear All
        </button>
      </div>
    </div>
  </div>
</div>

<div class="flex items-center gap-3 mr-2 justify-self-end">
  
  <button @click="showOwnCards = !showOwnCards"
    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
    :class="showOwnCards ? 'bg-green-600' : 'bg-gray-300 dark:bg-slate-600'">
    <span class="sr-only">Toggle owned cards</span>
    <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
      :class="showOwnCards ? 'translate-x-6' : 'translate-x-1'" />
  </button>
    <span class="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Hide Owned</span>
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
        <div class=" -ml-6 flex items-center justify-between mb-6">
          <h2 id="featured-cards" class="text-2xl font-bold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"></svg>
            Featured PSA-Certified Cards
            <span class="text-m font-normal text-gray-500">Total ({{ filteredCards.length }} cards)</span>
          </h2>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p class="mt-4 text-gray-600 dark:text-slate-400">Loading cards from database...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="loadError" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
          <p class="text-red-600 dark:text-red-400 font-semibold mb-2">⚠️ {{ loadError }}</p>
          <p class="text-sm text-gray-600 dark:text-slate-400">Make sure your backend is running on port 3001</p>
          <button @click="loadFeaturedCards" class="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">
            Retry
          </button>
        </div>

        <!-- Cards Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <p class="text-2xl font-black text-indigo-600">
                    <img :src="jsbImg" alt="JSB" class="inline h-[25px] w-[25px] align-[-2px] mr-1" />
                    {{ card.price }}
                  </p>
                  <p class="text-sm font-bold">
                    <span class="text-gray-500">Last Sold: </span>
                    <span class="text-green-700">{{ card.lastSold }}</span>
                  </p>
                </div>
                <button @click="openCardModal(card)"
                  class="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all">
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
        <div class="sticky top-0 bg-gradient-to-r from-red-600 via-red-500 to-red-600 p-6 flex items-center justify-between z-10">
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
                <p class="text-4xl font-black text-green-600 mb-2">
                  <img :src="jsbImg" alt="JSB" class="inline h-[29px] w-[29px] align-[-3px] mr-2" />
                  {{ selectedCard.price }}
                </p>
                <!-- Market Price Suggestion -->
                <p v-if="formattedMarketPrice" class="market-price-suggestion text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Market Price: $<span class="font-semibold text-green-400">{{ formattedMarketPrice }}</span>
                </p>
                <p class="text-sm text-gray-500">
                  Last sold: <img :src="jsbImg" alt="JSB" class="inline h-[17px] w-[17px] align-[-2px] mr-1" />{{ selectedCard.lastSold }}
                </p>
              </div>

              <div class="space-y-4">
                <h4 class="font-bold text-lg">Card Information</h4>

                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                    <p class="text-xs text-gray-500 dark:text-slate-400 mb-1">PSA Population</p>
                    <p class="font-semibold">{{ selectedCard.db?.psa_population || 'Unavailable' }}</p>
                  </div>
                  <div class="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                    <p class="text-xs text-gray-500 dark:text-slate-400 mb-1">Grade Description</p>
                    <p class="font-semibold">{{ selectedCard.db?.grade_description || 'Unavailable' }}</p>
                  </div>
                  <div class="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                    <p class="text-xs text-gray-500 dark:text-slate-400 mb-1">Art Style</p>
                    <p class="font-semibold">{{ selectedCard.db?.variety || 'Unavailable' }}</p>
                  </div>
                  <div class="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                    <p class="text-xs text-gray-500 dark:text-slate-400 mb-1">Release Year</p>
                    <p class="font-semibold">{{ selectedCard.db?.release_year || 'Unavailable' }}</p>
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
                      <p class="font-semibold">{{ selectedCard.sellerName || selectedCard.sellerEmail || 'Unknown Seller' }}</p>
                      <p class="text-sm text-gray-500">⭐ 4.9 ({{ selectedCard.sellerRating || '156' }} reviews)</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-3 pt-4">
                  <button
                      @click="handleBuyCard"
                      :disabled="!selectedCard || !selectedCard.price"
                      class="flex-1 px-6 py-4 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl font-bold hover:from-red-700 hover:to-red-700 transition-all shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                      Buy Now - <img :src="jsbImg" alt="JSB" class="inline h-[21px] w-[21px] align-[-2px] mr-1" />{{ selectedCard.price }}
                  </button>
                  <button
                      @click="showOfferModal = true"
                      :disabled="!selectedCard"
                      class="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-indigo-700 transition-all shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                      Make Offer
                  </button>
                  
                  <button
                      @click="handleMessageSeller"
                      :disabled="!selectedCard || messagingLoading"
                      class="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-700 transition-all shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                      <span v-if="messagingLoading">Loading...</span>
                      <span v-else>Message Seller</span>
                  </button>
              </div>
            </div>
          </div>
        </div>       
      </div>
    </div>
    <!-- Make Offer Modal -->
<div v-if="showOfferModal" @click="closeOfferModal" 
  class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
  <div @click.stop class="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full shadow-2xl p-8">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-2xl font-bold">Make an Offer</h3>
      <button @click="closeOfferModal" class="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
        <X class="w-6 h-6" />
      </button>
    </div>

    <div class="space-y-4">
      <!-- Card Info -->
      <div class="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
        <p class="text-sm text-gray-500 dark:text-slate-400 mb-1">Offering on</p>
        <p class="font-bold text-lg">{{ selectedCard?.title }}</p>
        <p class="text-sm text-gray-600 dark:text-slate-300">
          Listed at: <img :src="jsbImg" alt="JSB" class="inline h-[17px] w-[17px] align-[-2px] mr-1" />{{ selectedCard?.price }}
        </p>
      </div>

      <!-- Offer Amount -->
        <div>
          <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Your Offer Amount (JSB)
          </label>
          <div class="relative">
            <img :src="jsbImg" alt="JSB" class="absolute left-3 top-1/2 -translate-y-1/2 h-[21px] w-[21px]" />
            <input
              v-model.number="offerAmount"
              type="number"
              :min="1"
              :max="selectedCard?.price"
              step="0.01"
              placeholder="Enter your offer"
              class="w-full pl-10 pr-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <p class="text-xs text-gray-500 mt-1">
            Suggested: <img :src="jsbImg" alt="JSB" class="inline h-[14px] w-[14px] align-[-1px] mr-1" />{{ (selectedCard?.price * 0.9).toFixed(2) }}
          </p>
        </div>

        <!-- Optional Message -->
        <div>
          <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Message to Seller (Optional)
          </label>
          <textarea
            v-model="offerMessage"
            rows="3"
            placeholder="Add a message to the seller..."
            class="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          ></textarea>
        </div>
        <!-- Correct Action Buttons in Offer Modal -->
<div class="flex gap-3">
  <button @click="closeOfferModal" 
    class="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-all">
    Cancel
  </button>
  <button @click="handleMakeOffer" 
    :disabled="!offerAmount || offerAmount <= 0 || offerLoading"
    class="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
    <span v-if="offerLoading">Sending...</span>
    <span v-else>Send Offer</span>
  </button>
</div>
      </div>
    </div>
  </div>
</div>
  
</template>

<script setup>
// Offer modal state
const selectedCard = ref(null);
const showOfferModal = ref(false);
const offerAmount = ref(0);
const offerMessage = ref('');
const offerLoading = ref(false);

// Handle making an offer
async function handleMakeOffer() {
  if (!isLoggedIn.value) {
    alert('Please login to make an offer');
    return;
  }

  if (!offerAmount.value || offerAmount.value <= 0) {
    alert('Please enter a valid offer amount');
    return;
  }

  offerLoading.value = true;

  try {
    const token = localStorage.getItem('token');
    const buyerEmail = localStorage.getItem('userEmail');
    const buyerName = localStorage.getItem('username');
    const buyerId = localStorage.getItem('userId');  // ← Make sure this exists

    console.log('🔍 Making offer with:', {
      cert_number: selectedCard.value.id,
      card_name: selectedCard.value.title,
      seller_id: selectedCard.value.sellerId,
      buyer_id: buyerId,
      offer_amount: offerAmount.value
    });

    const response = await fetch('http://localhost:3001/api/offers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        cert_number: selectedCard.value.id,
        card_name: selectedCard.value.title,
        seller_id: selectedCard.value.sellerId,
        offer_amount: offerAmount.value,
        message: offerMessage.value,
        listing_price: selectedCard.value.price
      })
    });

    const data = await response.json();
    console.log('📥 Offer response:', data);

    if (response.ok) {
      alert(`✅ Offer of JSB ${offerAmount.value} sent successfully! The seller will be notified.`);
      showOfferModal.value = false;
      offerAmount.value = 0;
      offerMessage.value = '';
    } else {
      console.error('❌ Offer failed:', data);
      if (data.error === 'INSUFFICIENT_FUNDS') {
        alert(`❌ ${data.message}`);
      } else {
        alert(`❌ Failed to send offer: ${data.error || 'Unknown error'}`);
      }
    }
  } catch (error) {
    console.error('❌ Error making offer:', error);
    alert('❌ Failed to send offer. Please try again.');
  } finally {
    offerLoading.value = false;
  }
}
// Add this to close the offer modal
function closeOfferModal() {
  showOfferModal.value = false;
  offerAmount.value = 0;
  offerMessage.value = "";
}

const sortBy = ref("name-asc");
const selectedRarity = ref("all");

import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from 'vue-router';
import {
  Heart,
  Search,
  Filter,
  TrendingUp,
  Star,
  X,
  User,
  CheckCircle,
} from "lucide-vue-next";
import jsbImg from "../../images/JSB_image.png";
import { getCurrentUser, getAuthToken } from '@/utils/auth';

const router = useRouter();

const scrollToFeatured = () => {
  const section = document.getElementById("featured-cards");
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
};

// Three.js refs
const canvas = ref(null);
const canvasContainer = ref(null);

let scene,
  camera,
  renderer,
  pokeball,
  isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let rotationVelocity = { x: 0, y: 0 };

// State management
const sampleCards = ref([]);
const loading = ref(true);
const loadError = ref(null);
const watchlist = ref([]);
const searchTerm = ref("");
const priceRange = ref([0, 1000]);
const selectedGrade = ref("all");
const showFilters = ref(false);

const isLoggedIn = ref(false);

//check login status
const checkLoginStatus = () => {
  const userEmail = localStorage.getItem("userEmail");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  isLoggedIn.value = !!(userEmail || token);
};

// Update your onMounted to include the login check
onMounted(() => {
  checkLoginStatus();
  loadFeaturedCards();
  initThreeJS();
  animate();
  window.addEventListener("resize", onWindowResize);
});

const loadFeaturedCards = async () => {
  loading.value = true;
  loadError.value = null;
  try {
    const resp = await fetch("http://localhost:3001/api/cards");
    if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);

    const cards = await resp.json();

    if (Array.isArray(cards) && cards.length > 0) {
      // Map marketplace payload to UI fields
      sampleCards.value = cards
        .map((c) => ({
          id: c.cert_number,
          img: c.image_url,
          title: c.card_name || c.psa?.cardName || "Unknown Card",
          // use a number so price-range filter works
          price: Number(c.listing_price ?? 0),
          lastSold: c.average_sell_price
            ? `$${Number(c.average_sell_price).toFixed(2)}`
            : "Unknown",
          rarity: c?.psa?.grade ? `PSA ${c.psa.grade}` : "PSA —",
          set: c?.psa?.setName || c.set_name || "Unknown Set",
          sellerName: c?.sellerName || c?.sellerEmail || "Unknown Seller",
          sellerEmail: c?.sellerEmail || null,
          sellerId: c?.sellerId || null,
          sellerRating: "156",
          averageSellPrice: c?.average_sell_price || null,
        }))
        .filter((card) => card.img); // keep if you only want cards with images

      // ✅ important: clear any previous error
      loadError.value = null;

      if (sampleCards.value.length === 0) {
        // If everything got filtered out by the image filter, show a helpful message.
        loadError.value = "Cards loaded but none have images to display.";
      }
    } else {
      loadError.value = "No cards found in database. Please sync cards first.";
    }
  } catch (e) {
    console.error("Failed to load cards from backend:", e?.message || e);
    loadError.value =
      "Unable to load cards. Please check if the backend is running.";
  } finally {
    loading.value = false;
  }
};

const showOwnCards = ref(false);
// ADD THIS NEW FUNCTION for resetting all filters:
const resetAllFilters = () => {
  searchTerm.value = "";
  priceRange.value = [0, 1000];
  selectedGrade.value = "all";
  selectedRarity.value = "all";
  sortBy.value = "name-asc";
  showFilters.value = false;
};

// Three.js initialization
function initThreeJS() {
  const script = document.createElement("script");
  script.src =
    "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
  script.onload = () => {
    setupScene();
  };
  document.head.appendChild(script);
}

function setupScene() {
  const THREE = window.THREE;

  // Scene
  scene = new THREE.Scene();

  // Camera
  const container = canvasContainer.value;
  camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvas.value,
    antialias: true,
    alpha: true,
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  const pointLight = new THREE.PointLight(0xffffff, 0.5);
  pointLight.position.set(-5, -5, 5);
  scene.add(pointLight);

  // Create Pokeball
  pokeball = new THREE.Group();

  // Top half (red)
  const topGeometry = new THREE.SphereGeometry(
    1,
    32,
    32,
    0,
    Math.PI * 2,
    0,
    Math.PI / 2
  );
  const topMaterial = new THREE.MeshPhongMaterial({
    color: 0xef4444,
    shininess: 100,
  });
  const topHalf = new THREE.Mesh(topGeometry, topMaterial);
  pokeball.add(topHalf);

  // Bottom half (white)
  const bottomGeometry = new THREE.SphereGeometry(
    1,
    32,
    32,
    0,
    Math.PI * 2,
    Math.PI / 2,
    Math.PI / 2
  );
  const bottomMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    shininess: 100,
  });
  const bottomHalf = new THREE.Mesh(bottomGeometry, bottomMaterial);
  pokeball.add(bottomHalf);

  // Black band
  const bandGeometry = new THREE.TorusGeometry(1, 0.08, 16, 100);
  const bandMaterial = new THREE.MeshPhongMaterial({
    color: 0x1f2937,
    shininess: 100,
  });
  const band = new THREE.Mesh(bandGeometry, bandMaterial);
  band.rotation.x = Math.PI / 2;
  pokeball.add(band);

  // Center button
  const buttonGeometry = new THREE.CircleGeometry(0.25, 32);
  const buttonMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    shininess: 100,
  });
  const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
  button.position.z = 1.01;
  pokeball.add(button);

  // Button border
  const buttonBorderGeometry = new THREE.RingGeometry(0.25, 0.32, 32);
  const buttonBorderMaterial = new THREE.MeshPhongMaterial({
    color: 0x1f2937,
    shininess: 100,
  });
  const buttonBorder = new THREE.Mesh(
    buttonBorderGeometry,
    buttonBorderMaterial
  );
  buttonBorder.position.z = 1.02;
  pokeball.add(buttonBorder);

  scene.add(pokeball);

  // Mouse events
  canvas.value.addEventListener("mousedown", onMouseDown);
  canvas.value.addEventListener("mousemove", onMouseMove);
  canvas.value.addEventListener("mouseup", onMouseUp);
  canvas.value.addEventListener("mouseleave", onMouseUp);

  // Touch events
  canvas.value.addEventListener("touchstart", onTouchStart);
  canvas.value.addEventListener("touchmove", onTouchMove);
  canvas.value.addEventListener("touchend", onTouchEnd);
}

function onMouseDown(e) {
  isDragging = true;
  previousMousePosition = { x: e.clientX, y: e.clientY };
}

function onMouseMove(e) {
  if (!isDragging || !pokeball) return;

  const deltaX = e.clientX - previousMousePosition.x;
  const deltaY = e.clientY - previousMousePosition.y;

  rotationVelocity.x = deltaY * 0.01;
  rotationVelocity.y = deltaX * 0.01;

  pokeball.rotation.x += rotationVelocity.x;
  pokeball.rotation.y += rotationVelocity.y;

  previousMousePosition = { x: e.clientX, y: e.clientY };
}

function onMouseUp() {
  isDragging = false;
}

function onTouchStart(e) {
  isDragging = true;
  const touch = e.touches[0];
  previousMousePosition = { x: touch.clientX, y: touch.clientY };
}

function onTouchMove(e) {
  if (!isDragging || !pokeball) return;

  const touch = e.touches[0];
  const deltaX = touch.clientX - previousMousePosition.x;
  const deltaY = touch.clientY - previousMousePosition.y;

  rotationVelocity.x = deltaY * 0.01;
  rotationVelocity.y = deltaX * 0.01;

  pokeball.rotation.x += rotationVelocity.x;
  pokeball.rotation.y += rotationVelocity.y;

  previousMousePosition = { x: touch.clientX, y: touch.clientY };
}

function onTouchEnd() {
  isDragging = false;
}

function animate() {
  requestAnimationFrame(animate);

  if (pokeball && !isDragging) {
    // Auto-rotate slowly
    pokeball.rotation.y += 0.005;

    // Apply damping to rotation velocity
    rotationVelocity.x *= 0.95;
    rotationVelocity.y *= 0.95;
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

function onWindowResize() {
  if (!camera || !renderer || !canvasContainer.value) return;

  const container = canvasContainer.value;
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

// Load cards on component mount
onMounted(() => {
  loadFeaturedCards();
  initThreeJS();
  animate();
  window.addEventListener("resize", onWindowResize);
});

// Cleanup on unmount
onUnmounted(() => {
  window.removeEventListener("resize", onWindowResize);
  if (renderer) {
    renderer.dispose();
  }
});

function toggleWatchlist(id) {
  if (watchlist.value.includes(id)) {
    watchlist.value = watchlist.value.filter((i) => i !== id);
  } else {
    watchlist.value.push(id);
  }
}

// TODO: INTEGRATE WITH POKEMON TCG API
// Function to fetch card details from API
// Fetch v1 database card for modal
async function fetchCardV1(certNumber) {
  try {
    const resp = await fetch(
      `http://localhost:3001/api/cards/${encodeURIComponent(certNumber)}`
    );
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const payload = await resp.json();
    return payload || null;
  } catch (e) {
    console.warn("Failed to fetch DB card:", e.message);
    return null;
  }
}

async function openCardModal(card) {
  selectedCard.value = card;
  // Load DB card first for modal info
  const dbCard = await fetchCardV1(card.id);
  if (dbCard) {
    selectedCard.value = { ...selectedCard.value, db: dbCard };
  }
}

function closeModal() {
  selectedCard.value = null;
}

// TODO: CONNECT TO YOUR BACKEND FOR PURCHASE FLOW
async function handleBuyCard() {
  console.log('🔘 Buy Now button clicked!');
  console.log('🔍 Selected card:', selectedCard.value);
  console.log('🔍 Is logged in:', isLoggedIn.value);

  if (!isLoggedIn.value) {
    alert('Please login to purchase cards');
    closeModal();
    return;
  }

  const cardTitle = selectedCard.value.title;
  const cardPrice = selectedCard.value.price;
  const certNumber = selectedCard.value.id;
  const sellerId = selectedCard.value.sellerId;

  console.log('💳 Purchase details:', {
    cardTitle,
    cardPrice,
    certNumber,
    sellerId
  });

  if (!confirm(`Purchase ${cardTitle} for JSB ${cardPrice}?\n\nThis will deduct JSB ${cardPrice} from your wallet.`)) {
    console.log('❌ User cancelled purchase');
    return;
  }

  console.log('✅ User confirmed purchase, sending request...');

  try {
    const token = localStorage.getItem('token');
    
    console.log('🔑 Token:', token ? 'exists' : 'missing');

    const requestBody = {
      cert_number: certNumber,
      card_name: cardTitle,
      seller_id: sellerId,
      price: cardPrice
    };

    console.log('📤 Sending request:', requestBody);

    const response = await fetch('http://localhost:3001/api/transactions/buy-now', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 Response status:', response.status);

    const data = await response.json();
    console.log('📥 Response data:', data);

    if (response.ok) {
      alert(`✅ Purchase successful! ${cardTitle} has been added to your collection.`);
      closeModal();
      // Reload cards to update the listing
      await loadFeaturedCards();
    } else {
      if (data.error === 'INSUFFICIENT_FUNDS') {
        alert(`❌ ${data.message}\n\nPlease add funds to your wallet.`);
      } else {
        alert(`❌ Purchase failed: ${data.error || data.message || 'Unknown error'}`);
      }
    }
  } catch (error) {
    console.error('❌ Purchase error:', error);
    alert('❌ Purchase failed. Please try again.');
  }
}

// Message seller functionality
const messagingLoading = ref(false);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Handle "Message Seller" button click
 * Creates or finds a conversation and redirects to Messages page
 */
async function handleMessageSeller() {
  const currentUser = getCurrentUser();
  
  // Check if user is logged in
  if (!currentUser.isAuthenticated) {
    alert('Please log in to message the seller');
    router.push('/login');
    return;
  }
  
  messagingLoading.value = true;
  
  try {
    const token = getAuthToken();
    
    // Use sellerId from the selected card, or fallback to mock
    const sellerId = selectedCard.value.sellerId || selectedCard.value.db?.sellerId || 'igyU5vIHYTADDrgHLt8X';
    const cardId = selectedCard.value.id;
    
    // Call find-or-create API
    const response = await fetch(`${API_URL}/api/chat/find-or-create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        sellerId: sellerId,
        cardId: cardId
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Close modal
      closeModal();
      
      // Redirect to Messages page with the conversation active
      router.push({
        path: '/messages',
        query: { conversation: data.conversationId }
      });
    } else {
      console.error('❌ Failed to create conversation:', data.error);
      alert(data.error || 'Failed to start conversation');
    }
    
  } catch (err) {
    console.error('❌ Network error:', err);
    alert('Network error. Please try again.');
  } finally {
    messagingLoading.value = false;
  }
}

// Computed property to format market price
const formattedMarketPrice = computed(() => {
  if (!selectedCard.value || !selectedCard.value.averageSellPrice) {
    return null;
  }
  const price = selectedCard.value.averageSellPrice;
  if (typeof price === "number" && price > 0) {
    return price.toFixed(2); // No dollar sign
  }
  return null;
});

const filteredCards = computed(() => {
  let cards = sampleCards.value.filter((card) => {
    const matchesSearch = card.title
      .toLowerCase()
      .includes(searchTerm.value.toLowerCase());
    const matchesPrice =
      parseFloat(card.price) >= priceRange.value[0] &&
      parseFloat(card.price) <= priceRange.value[1];
    const matchesGrade =
      selectedGrade.value === "all" ||
      card.rarity.includes(selectedGrade.value);
    const matchesRarity =
      selectedRarity.value === "all" ||
      card.rarity.includes(selectedRarity.value);

    // Filter by ownership - when showOwnCards is TRUE, HIDE cards where seller matches user
    const userEmail = localStorage.getItem("userEmail");
    const matchesOwnership =
      !showOwnCards.value ||
      (card.sellerEmail !== userEmail && card.sellerName !== userEmail);

    return (
      matchesSearch &&
      matchesPrice &&
      matchesGrade &&
      matchesRarity &&
      matchesOwnership
    );
  });

  // Apply sorting
  switch (sortBy.value) {
    case "name-desc":
      cards.sort((a, b) => b.title.localeCompare(a.title));
      break;
    case "price-low":
      cards.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      break;
    case "price-high":
      cards.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      break;
    case "newest":
      cards.reverse();
      break;
    case "oldest":
      break;
    case "name-asc":
    default:
      cards.sort((a, b) => a.title.localeCompare(b.title));
  }

  // Sort watchlisted cards to the top
  cards.sort((a, b) => {
    const aWatchlisted = watchlist.value.includes(a.id);
    const bWatchlisted = watchlist.value.includes(b.id);
    if (aWatchlisted && !bWatchlisted) return -1;
    if (!aWatchlisted && bWatchlisted) return 1;
    return 0;
  });

  return cards;
});
</script>

<style scoped>
/* Market Price Suggestion Styling */
.market-price-suggestion {
  font-size: 0.9rem;
  color: #6b7280; /* gray-600 */
  line-height: 1.5;
}

.dark .market-price-suggestion {
  color: #9ca3af; /* gray-400 in dark mode */
}

.market-price-suggestion span {
  font-weight: 600;
  color: #4ade80; /* green-400 - light green */
}

.dark .market-price-suggestion span {
  color: #4ade80; /* green-400 - light green in dark mode too */
}
</style>