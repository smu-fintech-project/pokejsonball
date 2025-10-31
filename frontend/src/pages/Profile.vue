<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">

    <!-- Not authenticated: CTA -->
    <div v-if="!isAuthed" class="max-w-md mx-auto py-24 px-6">
      <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-10 text-center">
        <User class="w-14 h-14 mx-auto mb-4 text-red-600" />
        <h2 class="text-2xl font-black mb-2">Welcome, Trainer!</h2>
        <p class="text-slate-600 dark:text-slate-300 mb-6">
          Sign in to view your profile and card portfolio.
        </p>
        <div class="flex gap-3 justify-center">
          <router-link
          to="/login"
          class="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700">
          Login
        </router-link>
        <router-link
          to="/login"
          class="px-6 py-3 bg-white dark:bg-slate-700 border-2 border-red-600 text-red-600 dark:text-red-300 rounded-xl font-semibold hover:bg-red-50 dark:hover:bg-slate-600">
          Sign Up
        </router-link>
        </div>
      </div>
    </div>

    <!-- Authenticated content -->
    <div v-else class="max-w-7xl mx-auto px-4 py-8 space-y-6">

      <!-- Profile Header -->
      <div class="bg-gradient-to-r from-red-600 via-red-500 to-red-400 rounded-3xl p-8 shadow-2xl">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="flex items-center gap-6">
            <div class="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <User class="w-12 h-12 text-white" />
            </div>
            <div class="text-white">
              <h1 class="text-3xl font-black mb-2">{{ userProfile.name || derivedName }}</h1>
              <div class="flex items-center gap-2 text-white/80 mb-1">
                <Mail class="w-4 h-4" />
                <span>{{ userProfile.email }}</span>
              </div>
              <div class="flex items-center gap-2 text-white/80">
                <Clock class="w-4 h-4" />
                <span>Member since {{ userProfile.joinDate || '—' }}</span>
              </div>
            </div>
          </div>

          <div class="flex gap-4">
            <!-- Total Cards -->
            <div class="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-2xl px-6 py-4">
              <div class="flex items-center gap-2 text-white/80 text-sm mb-1">
                <Package class="w-6 h-6" />
                <div class="text-base font-black text-white">Total Cards</div>
              </div>
              <div class="flex items-center justify-center">
                <div class="text-3xl font-black text-white">{{ totalCards }}</div>
              </div>
            </div>

            <!-- Portfolio Value -->
            <div class="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-2xl px-6 py-4">
              <div class="flex items-center gap-2 text-white/80 text-sm mb-1">
                <DollarSign class="w-6 h-6" />
                <div class="text-base font-black text-white">Portfolio Value</div>
              </div>
              <div class="flex items-center justify-center">
                <div class="text-3xl font-black text-yellow-300">
                  <img :src="jsbImg" alt="JSB" class="inline h-[25px] w-[25px] align-[-2px] mr-1" />
                  {{ portfolioValue.toFixed(2) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
        <div class="flex border-b dark:border-slate-700">
          <button @click="activeTab = 'collection'" :class="[
            'flex-1 px-6 py-4 font-semibold transition-all',
            activeTab === 'collection'
              ? 'bg-red-600 text-white'
              : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'
          ]">
            My Card Collection
          </button>
          <!-- New Offers tab button -->
          <button @click="activeTab = 'offers'" :class="[
            'flex-1 px-6 py-4 font-semibold transition-all',
            activeTab === 'offers'
              ? 'bg-red-600 text-white'
              : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'
          ]">
            Offers
          </button>

          <button @click="activeTab = 'transactions'" :class="[
            'flex-1 px-6 py-4 font-semibold transition-all',
            activeTab === 'transactions'
              ? 'bg-red-600 text-white'
              : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'
          ]">
            Trade History
          </button>

          <button @click="activeTab = 'portfolio'" :class="[
            'flex-1 px-6 py-4 font-semibold transition-all',
            activeTab === 'portfolio'
              ? 'bg-red-600 text-white'
              : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'
          ]">
            Portfolio
          </button>

          <button @click="activeTab = 'reviews'" :class="[
            'flex-1 px-6 py-4 font-semibold transition-all',
            activeTab === 'reviews'
              ? 'bg-red-600 text-white'
              : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'
          ]">
            Reviews
          </button>

        </div>
        
        <!-- Collection Tab -->
        <div v-if="activeTab === 'collection'" class="p-6">

          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold">Your Cards</h2>
            <router-link
              to="/upload"
              class="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all shadow-lg"
            >
              <Plus class="w-5 h-5" />
              Add Card
            </router-link>
          </div>

          <!-- Loading -->
          <div v-if="loading" class="text-center py-12 text-gray-500 dark:text-slate-400">
            Loading your profile...
          </div>

          <!-- Cards -->
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

            <div v-for="card in ownedCards.filter(c => c.status !== 'sold')" :key="card.id"
            class="group relative bg-white dark:bg-slate-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 overflow-hidden
            flex flex-col min-h-[420px]">
              <div class="relative p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-600 dark:to-slate-700">
                <img :src="card.img" :alt="card.title" class="w-full h-48 object-contain" />
                <div v-if="card.quantity > 1"
                  class="absolute top-2 left-2 px-3 py-1 bg-purple-500 text-white text-sm font-bold rounded-full">
                  x{{ card.quantity }}
                </div>
              </div>

              <div class="p-4 flex-1 flex flex-col">
                <div class="mb-3">
                  <h3 class="font-bold text-lg break-words">{{ card.title }}</h3>
                  <p class="text-sm text-gray-500 dark:text-slate-400">{{ card.set }}</p>
                  <span class="inline-block mt-2 px-2 py-1 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 text-s font-bold rounded-lg">
                    {{ card.grade }}
                  </span>
                  
                  <!-- Status pill -->
                  <span v-if="card.status === 'listed'" class="ml-2 incline-block mt-2 px-2 py-1 
                  bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200 text-s font-bold rounded">
                    LISTED
                  </span>
                  
                  <span v-else-if="card.status === 'reserved'"
                  class="inline-block mt-2 px-2 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200 text-[10px] font-bold rounded">
                  RESERVED
                  </span>
                </div>

                <div class="pt-3 border-t dark:border-slate-600 mb-3">
                  <p class="text-2xl font-black text-black-600">
                    <img :src="jsbImg" alt="JSB" class="inline h-[25px] w-[25px] align-[-2px] mr-1" />
                    {{ Number(card.price).toFixed(2) }}
                  </p>
                  <p class="text-xs text-gray-500">Cert: {{ card.cert }}</p>
                </div>
                
                <div class="flex flex-wrap gap-2 mt-auto sm:flex-nowrap">
                <!-- Edit Button -->
                  <button @click="openEditModal(card)"
                    class="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 text-sm bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-slate-200 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-slate-500 transition-all">
                    <Edit2 class="w-3 h-3" />
                    Edit
                  </button>

                  <!-- Sell / Undo -->
                  <button v-if="card.status !== 'listed'"
                  @click="openSellModal(card)"
                  class="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 text-sm bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all">
                  <Plus class="w-3 h-3" />
                  Sell
                  </button>
                  <button v-else
                  @click="undoListing(card)"
                  class="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 text-sm bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-all">
                  Undo
                  </button>

                  <!-- Delete Button -->
                  <button @click="handleDeleteCard(card.id)"
                    class="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 text-sm bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg font-semibold hover:bg-red-200 dark:hover:bg-red-800 transition-all">
                    <Trash2 class="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="!loading && ownedCards.length === 0" class="text-center py-12 text-gray-500 dark:text-slate-400">
            <Package class="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p class="text-lg font-semibold mb-2">No cards in your collection yet</p>
            <p class="text-sm">Start building your profile by adding your first card!</p>
          </div>
        </div>

<!-- Transactions Tab -->
<div v-if="activeTab === 'transactions'" class="p-6">
  <h2 class="text-2xl font-bold mb-6">Transaction History</h2>
  
  <div v-if="loadingTransactions" class="text-center py-12">
    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    <p class="mt-2 text-gray-500">Loading transactions...</p>
  </div>
  
  <div v-else-if="transactionHistory.length === 0" class="text-center py-12">
    <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
      <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <p class="text-gray-500 dark:text-slate-400 text-lg font-semibold">No transactions yet</p>
    <p class="text-sm text-gray-400 dark:text-slate-500 mt-2">Your transaction history will appear here</p>
  </div>
  
  <div v-else class="space-y-3">
    <div v-for="tx in transactionHistory" :key="tx.id"
      class="flex items-center justify-between p-5 rounded-xl border-2 border-gray-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md transition-all">
      <div class="flex items-center gap-4">
        <!-- Transaction Icon -->
        <div :class="[
          'w-12 h-12 rounded-full flex items-center justify-center',
          tx.type === 'deposit' || tx.type === 'sale' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
        ]">
          <svg v-if="tx.type === 'deposit' || tx.type === 'sale'" class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <svg v-else class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
          </svg>
        </div>
        
        <div>
          <p class="font-bold text-gray-900 dark:text-white">{{ tx.description }}</p>
          <p class="text-sm text-gray-500 dark:text-slate-400">{{ formatTransactionDate(tx.timestamp) }}</p>
          <p v-if="tx.cert_number" class="text-xs text-gray-400 mt-1">Cert: {{ tx.cert_number }}</p>
        </div>
      </div>
      
      <div class="text-right">
        <p class="text-xl font-black" :class="tx.type === 'deposit' || tx.type === 'sale' ? 'text-green-600' : 'text-red-600'">
          {{ tx.type === 'deposit' || tx.type === 'sale' ? '+' : '-' }}
          <img :src="jsbImg" alt="JSB" class="inline h-[21px] w-[21px] align-[-2px] mx-1" />
          {{ Number(tx.amount).toFixed(2) }}
        </p>
        <p class="text-sm text-gray-500 dark:text-slate-400">
          Balance: <img :src="jsbImg" alt="JSB" class="inline h-[14px] w-[14px] align-[-1px] mr-1" />{{ Number(tx.balanceAfter).toFixed(2) }}
        </p>
      </div>
    </div>
  </div>
</div>

        <!-- Portfolio Tab -->
        <div v-if="activeTab === 'portfolio'" class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold">Portfolio Growth</h2>
            
            <!-- Timeframe selector -->
            <div class="flex gap-2 bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
              <button
                v-for="option in timeframeOptions"
                :key="option.value"
                @click="timeframe = option.value"
                :class="[
                  'px-4 py-2 rounded-md font-semibold text-sm transition-all',
                  timeframe === option.value
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                ]"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <!-- Loading state -->
          <div v-if="portfolioLoading" class="text-center py-12 text-gray-500 dark:text-slate-400">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p>Loading portfolio data...</p>
          </div>

          <!-- Empty state -->
          <div v-else-if="portfolioHistory.length === 0" class="text-center py-12">
            <TrendingUp class="w-16 h-16 mx-auto mb-4 opacity-50 text-gray-400 dark:text-slate-500" />
            <p class="text-lg font-semibold mb-2 text-gray-600 dark:text-slate-400">No Portfolio History</p>
            <p class="text-sm text-gray-500 dark:text-slate-500">
              Your portfolio history will appear here once you own cards.
            </p>
          </div>

          <!-- Chart -->
          <div v-else class="space-y-6">
            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Current Value -->
              <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                <div class="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-sm mb-1">
                  <DollarSign class="w-4 h-4" />
                  <span class="font-semibold">Current Value</span>
                </div>
                <div class="text-2xl font-black text-purple-900 dark:text-purple-100">
                  <img :src="jsbImg" alt="JSB" class="inline h-[20px] w-[20px] align-[-2px] mr-1" />
                  {{ currentPortfolioValue.toFixed(2) }}
                </div>
              </div>

              <!-- Change (24h) -->
              <div :class="[
                'rounded-xl p-4 border',
                portfolioChange >= 0
                  ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700'
                  : 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700'
              ]">
                <div :class="[
                  'flex items-center gap-2 text-sm mb-1 font-semibold',
                  portfolioChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                ]">
                  <TrendingUp v-if="portfolioChange >= 0" class="w-4 h-4" />
                  <TrendingUp v-else class="w-4 h-4 rotate-180" />
                  <span>Change ({{ timeframe }})</span>
                </div>
                <div :class="[
                  'text-2xl font-black',
                  portfolioChange >= 0 ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'
                ]">
                  {{ portfolioChange >= 0 ? '+' : '' }}{{ portfolioChange.toFixed(2) }}%
                </div>
              </div>

              <!-- All Time High -->
              <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-700">
                <div class="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 text-sm mb-1">
                  <TrendingUp class="w-4 h-4" />
                  <span class="font-semibold">All Time High</span>
                </div>
                <div class="text-2xl font-black text-yellow-900 dark:text-yellow-100">
                  <img :src="jsbImg" alt="JSB" class="inline h-[20px] w-[20px] align-[-2px] mr-1" />
                  {{ allTimeHigh.toFixed(2) }}
                </div>
              </div>
            </div>

            <!-- Chart Container -->
            <div class="bg-white dark:bg-slate-700 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-600">
              <div class="h-96">
                <PortfolioChart :chartData="filteredChartData" />
              </div>
            </div>
          </div>
        </div>

        <!-- Reviews Tab -->
        <div v-if="activeTab === 'reviews'" class="p-6 space-y-6">
          <div class="flex flex-col lg:flex-row gap-6">
            <div class="lg:w-1/3 bg-gradient-to-br from-red-600 via-red-500 to-red-400 rounded-2xl p-6 text-white shadow-xl">
              <div class="flex items-center gap-2 text-white/80 text-sm">
                <Star class="w-5 h-5 text-yellow-300" />
                <span>Average Rating</span>
              </div>
              <div class="mt-4 text-5xl font-black">{{ averageRating.toFixed(1) }}</div>
              <div class="mt-2 flex items-center gap-1">
                <div
                  v-for="n in starRange"
                  :key="`avg-${n}`"
                  class="relative w-6 h-6"
                >
                  <Star class="w-6 h-6 text-white/30 dark:text-white/20" />
                  <Star
                    class="w-6 h-6 text-yellow-300 fill-yellow-300 absolute inset-0"
                    :style="{ clipPath: `inset(0 ${100 - getStarFillPercentage(averageRating, n)}% 0 0)` }"
                  />
                </div>
              </div>
              <div class="mt-4 text-white/80 text-sm">
                {{ totalReviews }} {{ totalReviewsLabel }}
              </div>
            </div>

            <div class="flex-1 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
              <h3 class="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-800 dark:text-slate-100">
                <MessageCircle class="w-5 h-5 text-red-500" />
                Rating Breakdown
              </h3>
              <div class="space-y-3">
                <div
                  v-for="item in ratingBreakdown"
                  :key="`breakdown-${item.rating}`"
                  class="flex items-center gap-3"
                >
                  <div class="w-12 text-sm font-semibold text-gray-500 dark:text-slate-300">
                    {{ item.rating }}★
                  </div>
                  <div class="flex-1 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-red-500 rounded-full transition-all"
                      :style="{ width: `${item.percentage}%` }"
                    ></div>
                  </div>
                  <div class="w-12 text-right text-sm font-semibold text-gray-500 dark:text-slate-300">
                    {{ item.percentage }}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-slate-100 mb-4">Recent Reviews</h3>
            <div
              v-if="reviewsLoading"
              class="text-center py-12 text-gray-500 dark:text-slate-400 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl"
            >
              <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p>Fetching reviews...</p>
            </div>
            <div
              v-else-if="totalReviews === 0"
              class="text-center py-12 text-gray-500 dark:text-slate-400 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl"
            >
              <MessageCircle class="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-slate-600" />
              <p>Reviews will appear here once other trainers share their experience.</p>
            </div>
            <div v-else class="space-y-4">
              <article
                v-for="review in reviews"
                :key="review.id"
                class="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm"
              >
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div class="flex items-center gap-2">
                      <p class="text-lg font-semibold text-gray-900 dark:text-slate-100">
                        {{ review.reviewerName || review.reviewer || review.reviewerEmail || 'Anonymous Trainer' }}
                      </p>
                      <span
                        class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-200"
                      >
                        <BadgeCheck class="w-3.5 h-3.5" />
                        Review from {{ review.role === 'seller' ? 'Seller' : 'Buyer' }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-500 dark:text-slate-400">
                      {{ formatReviewDate(review.createdAt) }}
                    </p>
                  </div>
                  <div class="flex items-center gap-1">
                    <div
                      v-for="n in starRange"
                      :key="`${review.id}-${n}`"
                      class="relative w-4 h-4"
                    >
                      <Star class="w-4 h-4 text-gray-300 dark:text-slate-600" />
                      <Star
                        class="w-4 h-4 text-yellow-400 fill-yellow-400 absolute inset-0"
                        :style="{ clipPath: `inset(0 ${100 - getStarFillPercentage(review.rating, n)}% 0 0)` }"
                      />
                    </div>
                    <span class="ml-2 text-sm font-semibold text-gray-600 dark:text-slate-300">
                      {{ formatRatingDisplay(review.rating) }}
                    </span>
                  </div>
                </div>
                <p class="mt-4 text-gray-700 dark:text-slate-300 leading-relaxed">
                  {{ review.comment || 'No comment provided.' }}
                </p>
              </article>
            </div>
          </div>
        </div>

<!-- ✨ COMPLETE FIXED: Offers Tab -->
<div v-if="activeTab === 'offers'" class="p-6">
  <div class="space-y-6">
    <!-- Received Offers (Offers on your cards) -->
    <div>
      <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
        📥 Received Offers
        <span v-if="receivedOffers.length > 0" class="text-lg font-normal text-gray-500">
          ({{ receivedOffers.length }})
        </span>
      </h2>

      <div v-if="loadingOffers" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p class="mt-2 text-gray-500">Loading offers...</p>
      </div>

      <div v-else-if="receivedOffers.length === 0" class="text-center py-8 text-gray-500">
        <p>No pending offers on your cards</p>
      </div>

      <div v-else class="space-y-4">
        <div v-for="offer in receivedOffers" :key="offer.id"
          class="bg-white dark:bg-slate-700 rounded-xl p-5 border-2 border-gray-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                  <User class="w-5 h-5 text-white" />
                </div>
                <div>
                  <p class="font-bold">{{ offer.buyer_name || 'Unknown Buyer' }}</p>
                  <p class="text-xs text-gray-500">{{ formatOfferDate(offer.created_at) }}</p>
                </div>
              </div>

              <div class="ml-13">
                <p class="text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Offered for: <span class="font-semibold">{{ offer.card_name || 'Unknown Card' }}</span>
                </p>
                <p class="text-sm text-gray-500">
                  Listed at: <img :src="jsbImg" alt="JSB" class="inline h-[14px] w-[14px] align-[-1px] mr-1" />{{ Number(offer.listing_price || 0).toFixed(2) }}
                </p>
                
                <div class="mt-3 flex items-center gap-2">
                  <span class="text-sm text-gray-600 dark:text-gray-400">Offer Amount:</span>
                  <span class="text-2xl font-black text-green-600">
                    <img :src="jsbImg" alt="JSB" class="inline h-[21px] w-[21px] align-[-2px] mr-1" />
                    {{ Number(offer.offer_amount || 0).toFixed(2) }}
                  </span>
                  <span v-if="offer.offer_amount < offer.listing_price" 
                    class="text-sm text-orange-600 font-semibold">
                    ({{ ((offer.offer_amount / offer.listing_price) * 100).toFixed(0) }}% of listing)
                  </span>
                </div>

                <p v-if="offer.message" class="mt-3 text-sm text-gray-600 dark:text-gray-300 italic bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
                  "{{ offer.message }}"
                </p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col gap-2">
              <button @click="acceptOffer(offer.id)"
                class="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all whitespace-nowrap">
                ✓ Accept
              </button>
              <button @click="rejectOffer(offer.id)"
                class="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all whitespace-nowrap">
                ✕ Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div class="border-t-2 border-gray-200 dark:border-slate-700"></div>

    <!-- Sent Offers (Offers you made) -->
    <div>
      <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
        📤 Sent Offers
        <span v-if="sentOffers.length > 0" class="text-lg font-normal text-gray-500">
          ({{ sentOffers.length }})
        </span>
      </h2>

      <div v-if="sentOffers.length === 0" class="text-center py-8 text-gray-500">
        <p>You haven't made any offers yet</p>
      </div>

      <div v-else class="space-y-4">
        <div v-for="offer in sentOffers" :key="offer.id"
          class="bg-white dark:bg-slate-700 rounded-xl p-5 border-2"
          :class="{
            'border-yellow-300 dark:border-yellow-700': offer.status === 'pending',
            'border-green-300 dark:border-green-700': offer.status === 'accepted',
            'border-red-300 dark:border-red-700': offer.status === 'rejected',
            'border-gray-200 dark:border-slate-600': !offer.status
          }">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <p class="font-bold">{{ offer.card_name || 'Unknown Card' }}</p>
                <span class="px-2 py-1 rounded text-xs font-bold"
                  :class="{
                    'bg-yellow-100 text-yellow-700': offer.status === 'pending',
                    'bg-green-100 text-green-700': offer.status === 'accepted',
                    'bg-red-100 text-red-700': offer.status === 'rejected'
                  }">
                  {{ (offer.status || 'pending').toUpperCase() }}
                </span>
              </div>

              <p class="text-xs text-gray-500 mb-3">{{ formatOfferDate(offer.created_at) }}</p>

              <div class="flex items-center gap-2 mb-2">
                <span class="text-sm text-gray-600 dark:text-gray-400">Your Offer:</span>
                <span class="text-xl font-black text-indigo-600">
                  <img :src="jsbImg" alt="JSB" class="inline h-[18px] w-[18px] align-[-2px] mr-1" />
                  {{ Number(offer.offer_amount || 0).toFixed(2) }}
                </span>
              </div>

              <p class="text-sm text-gray-500">
                Listed at: <img :src="jsbImg" alt="JSB" class="inline h-[14px] w-[14px] align-[-1px] mr-1" />{{ Number(offer.listing_price || 0).toFixed(2) }}
              </p>

              <p v-if="offer.message" class="mt-2 text-sm text-gray-600 dark:text-gray-300 italic bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
                "{{ offer.message }}"
              </p>

              <p v-if="offer.status === 'accepted' && offer.accepted_at" class="mt-3 text-sm text-green-600 font-semibold">
                ✅ Accepted on {{ formatOfferDate(offer.accepted_at) }}
              </p>
              <p v-else-if="offer.status === 'rejected' && offer.rejected_at" class="mt-3 text-sm text-red-600 font-semibold">
                ❌ Rejected on {{ formatOfferDate(offer.rejected_at) }}
              </p>
              <p v-else-if="offer.status === 'pending'" class="mt-3 text-sm text-yellow-600 font-semibold">
                ⏳ Waiting for seller's response
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</div>
        
      <!-- Add Card Modal -->
      <!-- (unchanged UI; still mocked locally) -->
      <div v-if="showAddModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold">Add New Card</h3>
            <button @click="showAddModal = false" class="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
              <X class="w-6 h-6" />
            </button>
          </div>

          <div class="space-y-4">
            <!-- form fields unchanged -->
            <!-- … -->
            <button @click="handleAddCard"
              class="w-full px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg">
              Add to Portfolio
            </button>
          </div>
        </div>
      </div>

      <!-- Edit Card Modal (unchanged UI) -->
      <div v-if="showEditModal && editingCard"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl">
          <!-- form fields unchanged -->
          <!-- … -->
          <button @click="handleEditCard"
            class="w-full px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg">
            Save Changes
          </button>
        </div>
      </div>
    </div>

    <!-- ✅ Sell Modal -->
    <div v-if="showSellModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold">
            {{ sellStep === 'confirm' ? 'Confirm Listing' : 'Sell Card' }}
          </h3>
          <button @click="closeSellModal" class="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
            <X class="w-6 h-6" />
          </button>
        </div>

        <!-- Selected card summary (read-only) -->
        <div v-if="sellCard"
            class="mb-6 grid grid-cols-1 sm:grid-cols-[140px,1fr] gap-4 items-start">
          <div class="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-800 rounded-xl p-3">
            <img :src="sellCard.img" :alt="sellCard.title" class="w-full h-36 object-contain" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-slate-400 mb-1">You are selling</p>
            <h4 class="text-lg font-bold">{{ sellCard.title }}</h4>
            <p class="text-sm text-gray-500 dark:text-slate-400">
              Set: {{ sellCard.set }} &nbsp;•&nbsp; {{ sellCard.grade }}
            </p>
            <p class="text-xs text-gray-400 mt-1">Cert: {{ sellCard.cert }}</p>
          </div>
        </div>

        <!-- Step 1: Form -->
        <div v-if="sellStep === 'form'" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold mb-2">Selling Price</label>

            <!-- wrapper to position icon/unit inside the input -->
            <div class="relative">
              <!-- left icon inside the input -->
              <img
                :src="jsbImg"
                alt="JSB"
                class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5"
              />

              <!-- the input with extra left/right padding -->
              <input
                type="number"
                min="0"
                step="0.01"
                v-model="sellForm.price"
                class="w-full pl-11 pr-14 px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-none dark:bg-slate-900"
                placeholder="0.00"
              />

              <!-- right unit inside the input -->
              <span
                class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500 dark:text-slate-400"
              >JSB</span>
            </div>

            <p class="text-xs text-gray-500 mt-1">Enter the price buyers will see.</p>
          </div>


          <div>
            <label class="block text-sm font-semibold mb-2">Description <span class="text-gray-400">(optional)</span></label>
            <textarea v-model="sellForm.description" rows="3"
                      class="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-none dark:bg-slate-900"
                      placeholder="Any extra details for buyers (condition, notes, etc.)"></textarea>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-2">Delivery</label>
            <select v-model="sellForm.delivery"
                    class="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-none dark:bg-slate-900">
              <option value="meetup">Meet up</option>
              <option value="mail">Mail</option>
            </select>
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button @click="closeSellModal"
                    class="px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700">
              Cancel
            </button>
            <button @click="submitSellForm"
                    class="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-60"
                    :disabled="!sellForm.price || Number(sellForm.price) <= 0">
              Sell it
            </button>
          </div>
        </div>

        <!-- Step 2: Confirm -->
        <div v-else class="space-y-4">
          <div class="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
            <p class="text-sm text-gray-500 dark:text-slate-300 mb-2">Listing summary</p>
            <ul class="space-y-1 text-sm">
              <li><span class="font-semibold">Price:</span> {{ Number(sellForm.price).toFixed(2) }}</li>
              <li><span class="font-semibold">Delivery:</span> {{ sellForm.delivery === 'meetup' ? 'Meet up' : 'Mail' }}</li>
              <li v-if="sellForm.description"><span class="font-semibold">Description:</span> {{ sellForm.description }}</li>
            </ul>
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button @click="backToSellForm"
                    class="px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700">
              Back
            </button>
            <button @click="confirmSell"
                    class="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">
              Confirm & Publish
            </button>
          </div>
        </div>
      </div>
    </div>
        <!-- Transaction Result Modal -->
        <div v-if="showTransactionModal" @click="closeTransactionModal" 
          class="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div @click.stop class="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden transform transition-all">
            
            <!-- Success Header -->
            <div v-if="transactionResult.success" 
                class="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-center">
              <div class="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 class="text-3xl font-black text-white mb-2">Success! 🎉</h2>
              <p class="text-green-100">{{ transactionResult.title }}</p>
            </div>

            <!-- Error Header -->
            <div v-else 
                class="bg-gradient-to-r from-red-500 to-red-600 p-8 text-center">
              <div class="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 class="text-3xl font-black text-white mb-2">Action Failed</h2>
              <p class="text-red-100">{{ transactionResult.title }}</p>
            </div>

            <!-- Content -->
            <div class="p-8">
              <div class="space-y-6">
                <div class="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-900/30 rounded-2xl p-6 border-2" :class="transactionResult.success ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'">
                  <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {{ transactionResult.message }}
                  </p>
                </div>

                <div class="flex gap-3">
                  <button @click="closeTransactionModal" 
                          class="flex-1 px-6 py-3 rounded-xl font-bold transition-all shadow-lg" :class="transactionResult.success ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700' : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800'">
                    {{ transactionResult.success ? 'Great!' : 'Close' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

  </div>
  
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import {
  User, Mail, Clock, TrendingUp, Package, DollarSign, Plus, Edit2, Trash2, X,
  Star, MessageCircle, BadgeCheck
} from 'lucide-vue-next'
import jsbImg from '../../images/JSB_image.png'
import PortfolioChart from '../components/PortfolioChart.vue'

// --- Auth / state ---
const isAuthed = ref(false)
const userProfile = ref({ name: '', email: '', joinDate: '' })
const ownedCards = ref([])         // fetched from backend
const loading = ref(false)
const activeTab = ref('collection')

// --- Reviews ---
const starRange = [1, 2, 3, 4, 5]
const ratingScale = [5, 4, 3, 2, 1]
const reviews = ref([])
const reviewsLoading = ref(false)

const normalizeRating = (rating) => {
  const num = typeof rating === 'number' ? rating : parseFloat(rating)
  return Number.isNaN(num) ? 0 : num
}

const formatRatingDisplay = (rating) => normalizeRating(rating).toFixed(1)
const formatReviewDate = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const totalReviews = computed(() => reviews.value.length)
const totalReviewsLabel = computed(() => (totalReviews.value === 1 ? 'review' : 'reviews'))
const averageRating = computed(() => {
  if (!totalReviews.value) return 0
  const sum = reviews.value.reduce((acc, review) => acc + normalizeRating(review.rating), 0)
  return sum / totalReviews.value
})
const ratingBreakdown = computed(() => {
  const counts = ratingScale.reduce((acc, rating) => {
    acc[rating] = 0
    return acc
  }, {})

  reviews.value.forEach(review => {
    const bucket = Math.round(normalizeRating(review.rating))
    if (bucket >= 1 && bucket <= 5) {
      counts[bucket] += 1
    }
  })

  return ratingScale.map(rating => {
    const count = counts[rating]
    const percentage = totalReviews.value ? Math.round((count / totalReviews.value) * 100) : 0
    return { rating, count, percentage }
  })
})
const getStarFillPercentage = (rating, position) => {
  const value = normalizeRating(rating)
  const lowerBound = position - 1
  if (value >= position) return 100
  if (value <= lowerBound) return 0
  const fraction = value - lowerBound
  const roundedFraction = Math.round(fraction * 10) / 10
  return Math.round(Math.min(Math.max(roundedFraction * 100, 0), 100))
}

// --- Portfolio state ---
const portfolioHistory = ref([])
const portfolioLoading = ref(false)
const timeframe = ref('All')
const timeframeOptions = [
  { label: '1M', value: '1M' },
  { label: '6M', value: '6M' },
  { label: '1Y', value: '1Y' },
  { label: 'All', value: 'All' }
]

// Transaction modal state
const showTransactionModal = ref(false);
const transactionResult = ref({
  success: false,
  title: '',
  message: ''
});

function closeTransactionModal() {
  showTransactionModal.value = false;
  // Reload data after successful actions
  if (transactionResult.value.success) {
    loadReceivedOffers();
    loadSentOffers();
    loadOwnedCards();
  }
}

// Transaction history state
const transactionHistory = ref([]);
const loadingTransactions = ref(false);

// Load transaction history
async function loadTransactionHistory() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.warn('⚠️ No token found');
    return;
  }

  loadingTransactions.value = true;
  try {
    const resp = await fetch('http://localhost:3001/api/wallet', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (resp.ok) {
      const data = await resp.json();
      transactionHistory.value = data.transactions || [];
      console.log('✅ Loaded', transactionHistory.value.length, 'transactions');
    } else {
      console.error('❌ Failed to load transactions:', resp.status);
      transactionHistory.value = [];
    }
  } catch (error) {
    console.error('❌ Failed to load transactions:', error);
    transactionHistory.value = [];
  } finally {
    loadingTransactions.value = false;
  }
}

// Format transaction date
function formatTransactionDate(isoString) {
  if (!isoString) return 'Unknown date';
  
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid date';
  }
}

// derives a friendly name from email if no name present
const derivedName = computed(() => {
  const email = userProfile.value.email || ''
  return email ? email.split('@')[0] : 'Your Profile'
})

// Stats
const totalCards = computed(() =>
  ownedCards.value.reduce((t, c) => t + (c.quantity ?? 1), 0)  //what is this???
)

const portfolioValue = computed(() =>
  ownedCards.value.reduce((t, c) => t + (Number(c.price || 0) * (c.quantity ?? 1)), 0)
)

// Portfolio computed properties
const filteredChartData = computed(() => {
  if (!portfolioHistory.value || portfolioHistory.value.length === 0) {
    return []
  }

  const now = new Date()
  let cutoffDate = null

  switch (timeframe.value) {
    case '1M':
      cutoffDate = new Date(now.setMonth(now.getMonth() - 1))
      break
    case '6M':
      cutoffDate = new Date(now.setMonth(now.getMonth() - 6))
      break
    case '1Y':
      cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1))
      break
    case 'All':
    default:
      return portfolioHistory.value
  }

  return portfolioHistory.value.filter(item => {
    const itemDate = new Date(item.time)
    return itemDate >= cutoffDate
  })
})

const currentPortfolioValue = computed(() => {
  if (portfolioHistory.value.length === 0) return 0
  return portfolioHistory.value[portfolioHistory.value.length - 1]?.value || 0
})

const portfolioChange = computed(() => {
  if (filteredChartData.value.length < 2) return 0
  
  const firstValue = filteredChartData.value[0]?.value || 0
  const lastValue = filteredChartData.value[filteredChartData.value.length - 1]?.value || 0
  
  if (firstValue === 0) return 0
  
  return ((lastValue - firstValue) / firstValue) * 100
})

const allTimeHigh = computed(() => {
  if (portfolioHistory.value.length === 0) return 0
  return Math.max(...portfolioHistory.value.map(item => item.value || 0))
})

// UI state (modals)
const showAddModal = ref(false)
const showEditModal = ref(false)
const editingCard = ref(null)

// Add/Edit form (still local for now)
const newCard = reactive({
  title: '', price: '', quantity: 1, grade: 'PSA 10', set: '', img: ''
})

// ---------------- Loaders ----------------

async function loadProfile() {
  const token = localStorage.getItem('token')
  const email = localStorage.getItem('userEmail')
  const username = localStorage.getItem('username')
  if (!token || !email) {
    isAuthed.value = false
    return
  }

  isAuthed.value = true
  userProfile.value.email = email

  // optional: call /api/users/profile to verify token (and maybe get name later)
  try {
    const resp = await fetch('http://localhost:3001/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (resp.ok) {
      const data = await resp.json()
      // your current route only returns { email, portfolio: [] }
      userProfile.value.email = data.email || email
      if (data.id) {
        userProfile.value.id = data.id
        localStorage.setItem('userId', data.id)   // <-- store it
       }
     if (data.name) userProfile.value.name = data.name
     if (data.joinDate) userProfile.value.joinDate = data.joinDate
    } else if (resp.status === 401) {
      // token invalid
      isAuthed.value = false
    }
  } catch {
    // network error? still keep basic local email
  }

  // If no name from backend, leave it empty and use derivedName in UI
}

async function loadOwnedCards() {
  if (!isAuthed.value) return;
  loading.value = true;
  
  try {
    const token = localStorage.getItem('token');
    const email = userProfile.value.email;
    
    // First, get the user's owned cards from their profile
    const userResp = await fetch('http://localhost:3001/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!userResp.ok) throw new Error(`HTTP ${userResp.status}`);
    const userData = await userResp.json();
    
    console.log('👤 User data:', userData);
    console.log('🎴 User owns these cert numbers:', userData.cards);
    
    // Get the cert numbers this user owns
    const ownedCertNumbers = userData.cards || [];
    
    if (ownedCertNumbers.length === 0) {
      console.log('📭 No cards owned by this user');
      ownedCards.value = [];
      loading.value = false;
      return;
    }
    
    // Fetch full card details for each cert number
    const cardPromises = ownedCertNumbers.map(async (certNumber) => {
      try {
        console.log(`🔍 Fetching details for cert: ${certNumber}`);
        
        // Get card details from cards endpoint
        const cardResp = await fetch(`http://localhost:3001/api/cards/${encodeURIComponent(certNumber)}`);
        if (!cardResp.ok) {
          console.warn(`⚠️ Failed to fetch card ${certNumber}: HTTP ${cardResp.status}`);
          return null;
        }
        
        const cardData = await cardResp.json();
        console.log(`✅ Got card data for ${certNumber}:`, cardData);
        
        // Check if this user has an active listing for this card
        let listingPrice = 0;
        let listingStatus = 'display';
        
        try {
          const listingsResp = await fetch(`http://localhost:3001/api/cards/ownedCards?email=${encodeURIComponent(email)}`);
          if (listingsResp.ok) {
            const listings = await listingsResp.json();
            const listing = listings.find(l => String(l.cert_number) === String(certNumber));
            if (listing) {
              listingPrice = listing.listing_price || 0;
              listingStatus = listing.status || 'display';
            }
          }
        } catch (e) {
          console.warn(`⚠️ Failed to check listing for ${certNumber}:`, e.message);
        }
        
        return {
          id: certNumber,
          cert: certNumber,
          img: cardData.image_url || cardData?.psa?.imageUrl || '',
          title: cardData.card_name || cardData?.psa?.cardName || 'Card',
          set: cardData.set_name || cardData?.psa?.setName || '—',
          grade: cardData?.psa?.grade ? `PSA ${cardData.psa.grade}` : 'PSA —',
          price: Number(listingPrice),
          quantity: 1,
          status: listingStatus,
          dateAdded: ''
        };
      } catch (e) {
        console.error(`❌ Error fetching card ${certNumber}:`, e.message);
        return null;
      }
    });
    
    const cards = await Promise.all(cardPromises);
    ownedCards.value = cards.filter(c => c !== null);
    
    console.log(`✅ Loaded ${ownedCards.value.length} owned cards`);
    
  } catch (e) {
    console.error('❌ Failed to load owned cards:', e.message);
    ownedCards.value = [];
  } finally {
    loading.value = false;
  }
}

async function loadReviews() {
  if (!isAuthed.value) return
  if (reviewsLoading.value) return

  reviewsLoading.value = true
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Missing auth token')

    const resp = await fetch('http://localhost:3001/api/users/reviews', {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)

    const data = await resp.json()
    reviews.value = Array.isArray(data.reviews) ? data.reviews : []
  } catch (e) {
    console.error('Failed to load reviews:', e.message)
    reviews.value = []
  } finally {
    reviewsLoading.value = false
  }
}

async function loadPortfolioHistory() {
  if (!isAuthed.value) return
  
  portfolioLoading.value = true
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('No token found')
      return
    }

    const resp = await fetch('http://localhost:3001/api/portfolio/history', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`)
    }

    const data = await resp.json()
    portfolioHistory.value = data

    console.log(`Loaded ${data.length} portfolio data points`)
  } catch (e) {
    console.error('Failed to load portfolio history:', e.message)
    portfolioHistory.value = []
  } finally {
    portfolioLoading.value = false
  }
}

// Watch for tab changes
watch(activeTab, (newTab) => {
  if (newTab === 'portfolio' && portfolioHistory.value.length === 0) {
    loadPortfolioHistory()
  }
  if (newTab === 'reviews' && reviews.value.length === 0 && !reviewsLoading.value) {
    loadReviews()
  }
})

onMounted(async () => {
  await loadProfile()
  if (isAuthed.value) {
    await loadOwnedCards()
    await loadReviews()
    await loadReceivedOffers()
    await loadSentOffers()
    await loadTransactionHistory()
  }
})


// ------- Existing modal handlers (kept local for now) -------
const handleAddCard = () => {
  if (!newCard.title || !newCard.price) return
  const cardToAdd = {
    id: Date.now(),
    ...newCard,
    dateAdded: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }
  ownedCards.value.push(cardToAdd)
  showAddModal.value = false
  Object.assign(newCard, { title: '', price: '', quantity: 1, grade: 'PSA 10', set: '', img: '' })
}

const openEditModal = (card) => {
  editingCard.value = { ...card }
  showEditModal.value = true
}

const handleEditCard = () => {
  if (!editingCard.value) return
  const idx = ownedCards.value.findIndex(c => c.id === editingCard.value.id)
  if (idx !== -1) ownedCards.value[idx] = { ...editingCard.value }
  showEditModal.value = false
  editingCard.value = null
}

const handleDeleteCard = (id) => {
  if (!confirm('Remove this card from your portfolio?')) return
  ownedCards.value = ownedCards.value.filter(c => c.id !== id)
}

// --- Sell modal state ---
const showSellModal = ref(false)
const sellCard = ref(null)
const sellStep = ref('form')
const sellForm = reactive({
  price: '',
  description: '',
  delivery: 'meetup'
})

function openSellModal(card) {
  sellCard.value = { ...card }         // keep a snapshot of the selected card
  sellForm.price = ''                  // reset form
  sellForm.description = ''
  sellForm.delivery = 'meetup'
  sellStep.value = 'form'
  showSellModal.value = true
}

function closeSellModal() {
  showSellModal.value = false
  sellCard.value = null
}

function submitSellForm() {
  // basic validation
  const p = Number(sellForm.price)
  if (!p || p <= 0) return
  sellStep.value = 'confirm'
}

function backToSellForm() {
  sellStep.value = 'form'
}

async function confirmSell() {
  if (!sellCard.value) return;
  const cert = sellCard.value.cert;
  const price = Number(sellForm.price);
  const description = (sellForm.description || '').trim();
  const delivery = sellForm.delivery;

  // minimal: read identity from localStorage
  const sellerEmail = localStorage.getItem('userEmail') || userProfile.value.email;
  const sellerId = localStorage.getItem('userId') || userProfile.value.id || ''; // set this somewhere in your login flow

  try {
    const resp = await fetch(`http://localhost:3001/api/cards/${encodeURIComponent(cert)}/list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerEmail, sellerId, price, description, delivery }),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    // Update local UI: mark as listed and set new price
    const idx = ownedCards.value.findIndex(c => c.cert === cert);
    if (idx !== -1) {
      ownedCards.value[idx] = {
        ...ownedCards.value[idx],
        status: 'listed',
        price,
      };
    }
  } catch (e) {
    console.error('List failed', e.message);
    alert('Failed to publish listing. Please try again.');
    return;
  } finally {
    closeSellModal();
  }
}

async function undoListing(card) {
  if (!card) return;
  const cert = card.cert;

  const sellerEmail = localStorage.getItem('userEmail') || userProfile.value.email;
  const sellerId = localStorage.getItem('userId') || userProfile.value.id || '';

  try {
    const resp = await fetch(`http://localhost:3001/api/cards/${encodeURIComponent(cert)}/undo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerEmail, sellerId }),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    // Update local UI
    const idx = ownedCards.value.findIndex(c => c.cert === cert);
    if (idx !== -1) {
      ownedCards.value[idx] = {
        ...ownedCards.value[idx],
        status: 'display',
      };
    }
  } catch (e) {
    console.error('Withdraw failed', e.message);
    alert('Failed to withdraw listing. Please try again.');
  }
}

// START OF OFFERS STATE
const receivedOffers = ref([]);
const sentOffers = ref([]);
const loadingOffers = ref(false);

// Load received offers (offers on your cards)
async function loadReceivedOffers() {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  
  console.log('🔍 Loading received offers for userId:', userId);
  
  if (!token) {
    console.warn('⚠️ No token found');
    return;
  }

  loadingOffers.value = true;
  try {
    const resp = await fetch('http://localhost:3001/api/offers/received', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('📥 Offers response status:', resp.status);

    if (resp.ok) {
      const data = await resp.json();
      console.log('📥 Received offers data:', data);
      receivedOffers.value = data.offers || [];
      console.log('✅ Loaded', receivedOffers.value.length, 'received offers');
    } else {
      console.error('❌ Failed to load offers:', resp.status);
      receivedOffers.value = [];
    }
  } catch (error) {
    console.error('❌ Failed to load received offers:', error);
    receivedOffers.value = [];
  } finally {
    loadingOffers.value = false;
  }
}

// Load sent offers (offers buyers made)
async function loadSentOffers() {
  const token = localStorage.getItem('token');
  
  console.log('🔍 Loading sent offers');
  
  if (!token) {
    console.warn('⚠️ No token found');
    return;
  }

  try {
    const resp = await fetch('http://localhost:3001/api/offers/sent', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('📤 Sent offers response status:', resp.status);

    if (resp.ok) {
      const data = await resp.json();
      console.log('📤 Sent offers data:', data);
      sentOffers.value = data.offers || [];
      console.log('✅ Loaded', sentOffers.value.length, 'sent offers');
    } else {
      console.error('❌ Failed to load sent offers:', resp.status);
      sentOffers.value = [];
    }
  } catch (error) {
    console.error('❌ Failed to load sent offers:', error);
    sentOffers.value = [];
  }
}

// Accept an offer
async function acceptOffer(offerId) {
  const token = localStorage.getItem('token');
  try {
    const resp = await fetch(`http://localhost:3001/api/offers/${offerId}/accept`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await resp.json();

    if (resp.ok) {
      transactionResult.value = {
        success: true,
        title: 'Offer Accepted!',
        message: 'The transaction has been completed successfully. The card has been transferred and payment processed.'
      };
    } else {
      transactionResult.value = {
        success: false,
        title: 'Failed to Accept',
        message: data.error || data.message || 'Unknown error occurred'
      };
    }
    showTransactionModal.value = true;
  } catch (error) {
    transactionResult.value = {
      success: false,
      title: 'Network Error',
      message: 'Unable to process the offer. Please check your connection.'
    };
    showTransactionModal.value = true;
  }
}

async function rejectOffer(offerId) {
  const token = localStorage.getItem('token');
  try {
    const resp = await fetch(`http://localhost:3001/api/offers/${offerId}/reject`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (resp.ok) {
      transactionResult.value = {
        success: true,
        title: 'Offer Rejected',
        message: 'The offer has been rejected and the buyer has been notified.'
      };
    } else {
      transactionResult.value = {
        success: false,
        title: 'Failed to Reject',
        message: 'Unable to reject the offer. Please try again.'
      };
    }
    showTransactionModal.value = true;
  } catch (error) {
    transactionResult.value = {
      success: false,
      title: 'Network Error',
      message: 'Unable to process the rejection. Please check your connection.'
    };
    showTransactionModal.value = true;
  }
}


// Format date helper
function formatOfferDate(isoString) {
  if (!isoString) return 'Unknown date';
  
  try {
    const date = new Date(isoString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
}

// Update your onMounted to load offers
onMounted(async () => {
  await loadProfile();
  if (isAuthed.value) {
    await loadOwnedCards();
    await loadReceivedOffers();
    await loadSentOffers();
  }
});



</script>

<style scoped>
/* Optional custom styles */
</style>
