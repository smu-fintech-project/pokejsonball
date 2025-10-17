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

        </div>

        <!-- Collection Tab -->
        <div v-if="activeTab === 'collection'" class="p-6">

          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold">Your Cards</h2>
            <button @click="showAddModal = true"
          class="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all shadow-lg">
          <Plus class="w-5 h-5" />
          Add Card
        </button>
          </div>

          <!-- Loading -->
          <div v-if="loading" class="text-center py-12 text-gray-500 dark:text-slate-400">
            Loading your profile...
          </div>

          <!-- Cards -->
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div v-for="card in ownedCards" :key="card.id"
              class="group relative bg-white dark:bg-slate-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 overflow-hidden">
              <div class="relative p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-600 dark:to-slate-700">
                <img :src="card.img" :alt="card.title" class="w-full h-56 object-contain" />
                <div v-if="card.quantity > 1"
                  class="absolute top-2 left-2 px-3 py-1 bg-purple-500 text-white text-sm font-bold rounded-full">
                  x{{ card.quantity }}
                </div>
              </div>

              <div class="p-4">
                <div class="mb-3">
                  <h3 class="font-bold text-lg">{{ card.title }}</h3>
                  <p class="text-sm text-gray-500 dark:text-slate-400">{{ card.set }}</p>
                  <span class="inline-block mt-2 px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-xs font-bold rounded-lg">
                    {{ card.grade }}
                  </span>
                </div>

                <div class="pt-3 border-t dark:border-slate-600 mb-3">
                  <p class="text-2xl font-black text-indigo-600">
                    <img :src="jsbImg" alt="JSB" class="inline h-[25px] w-[25px] align-[-2px] mr-1" />
                    {{ Number(card.price).toFixed(2) }}
                  </p>
                  <p class="text-xs text-gray-500">Cert: {{ card.cert }}</p>
                </div>

                <div class="flex gap-2">
                  <button @click="openEditModal(card)"
                    class="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-slate-200 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-slate-500 transition-all">
                    <Edit2 class="w-4 h-4" />
                    Edit
                  </button>
                  <button @click="handleDeleteCard(card.id)"
                    class="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg font-semibold hover:bg-red-200 dark:hover:bg-red-800 transition-all">
                    <Trash2 class="w-4 h-4" />
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

        <!-- Transactions Tab (empty for now) -->
        <div v-if="activeTab === 'transactions'" class="p-6">
          <h2 class="text-2xl font-bold mb-6">Transaction History</h2>
          <div class="text-slate-500 dark:text-slate-400">No transactions yet.</div>
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import {
  User, Mail, Clock, TrendingUp, Package, DollarSign, Plus, Edit2, Trash2, X
} from 'lucide-vue-next'
import jsbImg from '../../images/JSB_image.png'
import PortfolioChart from '../components/PortfolioChart.vue'

// --- Auth / state ---
const isAuthed = ref(false)
const userProfile = ref({ name: '', email: '', joinDate: '' })
const ownedCards = ref([])         // fetched from backend
const loading = ref(false)
const activeTab = ref('collection')

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

// derives a friendly name from email if no name present
const derivedName = computed(() => {
  const email = userProfile.value.email || ''
  return email ? email.split('@')[0] : 'Your Profile'
})

// Stats
const totalCards = computed(() =>
  ownedCards.value.reduce((t, c) => t + (c.quantity ?? 1), 0)
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
      // if later you add name/joinDate to backend, hydrate here:
      // userProfile.value.name = data.name || ''
      // userProfile.value.joinDate = data.joinDate || ''
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
  if (!isAuthed.value) return
  loading.value = true
  try {
    // Get all marketplace entries then filter to this user's email
    const resp = await fetch('http://localhost:3001/api/cards')
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const list = await resp.json()
    const mine = list.filter(i => i.sellerEmail === userProfile.value.email)

    // Map to UI shape (no hardcoded values)
    ownedCards.value = mine.map(c => ({
      id: c.cert_number,
      cert: c.cert_number,
      img: c.image_url || c?.psa?.imageUrl || '',
      title: c.card_name || c?.psa?.cardName || 'Card',
      set: c.set_name || c?.psa?.setName || '—',
      grade: c?.psa?.grade ? `PSA ${c.psa.grade}` : 'PSA —',
      price: Number((c.listing_price ?? "Not For Sale")),
      quantity: 1,
      dateAdded: '' // (optional) if you later store per-user timestamps
    }))
  } catch (e) {
    console.error('Failed to load owned cards:', e.message)
    ownedCards.value = []
  } finally {
    loading.value = false
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
})

onMounted(async () => {
  await loadProfile()
  await loadOwnedCards()
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
</script>

<style scoped>
/* Optional custom styles */
</style>
