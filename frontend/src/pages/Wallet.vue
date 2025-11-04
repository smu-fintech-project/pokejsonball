<template>
  <div class="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 p-6">
    <div class="max-w-7xl mx-auto">
      
      <!-- Header Section -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent mb-2">MY WALLET</h1>
      </div>

      <!-- Main Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        <!-- Balance Card -->
        <div class="lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 via-rose-500 to-red-600 p-8 shadow-2xl">
          <div class="absolute inset-0 opacity-10">
            <div class="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
            <div class="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl transform -translate-x-48 translate-y-48"></div>
          </div>
          
          <div class="relative z-10">
            <div class="flex justify-between items-start mb-8">
              <div>
                <p class="text-white/80 text-sm uppercase tracking-wider mb-2">Total Balance</p>
                <div class="flex items-baseline gap-2">
                  <h2 class="text-6xl font-bold text-white">{{ wallet.balance }}</h2>
                  <span class="text-3xl font-semibold text-white/90">JSB</span>
                </div>
              </div>
              <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>

            <div class="flex gap-3">
              <button 
                @click="showAddFunds = true"
                class="flex-1 px-6 py-3 bg-white text-red-600 rounded-xl hover:bg-red-50 transition-all transform hover:scale-105 font-semibold shadow-lg flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Add Funds
              </button>
              <button 
                @click="handleCashOut"
                :disabled="!isAccountVerified"
                :class="[
                  'flex-1 px-6 py-3 rounded-xl transition-all transform font-semibold shadow-lg flex items-center justify-center gap-2',
                  isAccountVerified 
                    ? 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 hover:scale-105' 
                    : 'bg-white/10 text-white/50 cursor-not-allowed'
                ]"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                Cash Out
              </button>
            </div>
          </div>
        </div>

        <!-- Quick Stats Card -->
        <div class="bg-white rounded-2xl p-6 shadow-lg border border-red-100">
          <h3 class="text-gray-800 font-semibold mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            Quick Stats
          </h3>
          <div class="space-y-4">
            <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <p class="text-green-700 text-sm mb-1 font-medium">Total Incoming</p>
              <p class="text-2xl font-bold text-green-800">{{ totalDeposits }} JSB</p>
            </div>
            <div class="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border border-red-200">
              <p class="text-red-700 text-sm mb-1 font-medium">Total Outgoing</p>
              <p class="text-2xl font-bold text-red-800">{{ totalWithdrawals }} JSB</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Bank Account Status Card -->
      <div class="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-red-100">
        <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
          </svg>
          Bank Account for Withdrawals
        </h3>
        
        <!-- Loading State -->
        <div v-if="accountLoading" class="flex items-center gap-3 text-gray-600">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
          <span>Checking account status...</span>
        </div>

        <!-- Not Linked -->
        <div v-else-if="!accountStatus.hasAccount" class="flex flex-col sm:flex-row items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-red-50 rounded-xl border border-gray-200 gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
              </svg>
            </div>
            <div>
              <p class="font-semibold text-gray-800 text-lg">No bank account linked</p>
              <p class="text-sm text-gray-600">Link your bank account to enable cash withdrawals</p>
            </div>
          </div>
          <button 
            @click="handleLinkAccount"
            :disabled="linkingAccount"
            class="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:to-rose-600 transition-all transform hover:scale-105 font-semibold shadow-lg disabled:opacity-50 whitespace-nowrap"
          >
            {{ linkingAccount ? 'Loading...' : 'Link Bank Account' }}
          </button>
        </div>

        <!-- Pending Verification -->
        <div v-else-if="!accountStatus.isVerified" class="flex flex-col sm:flex-row items-center justify-between p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <p class="font-semibold text-gray-800 text-lg">Verification Pending</p>
              <p class="text-sm text-gray-600">Your bank account is being verified by Stripe</p>
            </div>
          </div>
          <button 
            @click="handleUpdateAccount"
            class="px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all border border-gray-300 whitespace-nowrap"
          >
            Update Details
          </button>
        </div>

        <!-- Verified -->
        <div v-else class="flex flex-col sm:flex-row items-center justify-between p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <div>
              <p class="font-semibold text-gray-800 text-lg">✅ Bank Account Verified</p>
              <p class="text-sm text-gray-600">Ready to receive withdrawals</p>
            </div>
          </div>
          <button 
            @click="handleUpdateAccount"
            class="px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all border border-gray-300 whitespace-nowrap"
          >
            Update Account
          </button>
        </div>
      </div>

      <!-- Transaction History -->
      <div class="bg-white rounded-2xl p-6 shadow-lg border border-red-100">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Transaction History
          </h2>
          
          <!-- Filter Toggle Button -->
          <button 
            @click="showTransactionFilters = !showTransactionFilters"
            :class="[
              'flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap',
              showTransactionFilters
                ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
            ]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
            </svg>
            <span>Filters</span>
            <svg 
              :class="['w-4 h-4 transition-transform', showTransactionFilters ? 'rotate-180' : '']"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
        </div>

        <!-- Filters Panel -->
        <div v-if="showTransactionFilters" class="mb-6 pb-6 border-b border-gray-200">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Sort By -->
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Sort By</label>
              <div class="relative">
                <select
                  v-model="txFilters.sortBy"
                  class="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 text-sm appearance-none cursor-pointer focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 pr-10 transition-all"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="amount-high">Amount: High→Low</option>
                  <option value="amount-low">Amount: Low→High</option>
                </select>
                <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
            </div>

            <!-- Type Filter -->
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Type</label>
              <div class="relative">
                <select
                  v-model="txFilters.type"
                  class="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 text-sm appearance-none cursor-pointer focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 pr-10 transition-all"
                >
                  <option value="all">All Transactions</option>
                  <option value="deposit">Deposits Only</option>
                  <option value="withdrawal">Withdrawals Only</option>
                  <option value="purchase">Purchased Cards Only</option>
                  <option value="sale">Sold Cards Only</option>
                </select>
                <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
            </div>

            <!-- Date Range -->
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Date Range</label>
              <div class="relative">
                <select
                  v-model="txFilters.dateRange"
                  class="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 text-sm appearance-none cursor-pointer focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 pr-10 transition-all"
                >
                  <option value="all">All Time</option>
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="90">Last 90 Days</option>
                </select>
                <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
            </div>

            <!-- Clear Filters -->
            <div class="flex items-end">
              <button 
                v-if="txFilters.sortBy !== 'newest' || txFilters.type !== 'all' || txFilters.dateRange !== 'all'"
                @click="resetTxFilters"
                class="w-full px-5 py-3 text-sm font-medium text-red-600 border border-red-300 rounded-xl hover:bg-red-50 transition-all whitespace-nowrap"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        <!-- Transaction List -->
        <div v-if="loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Loading transactions...</p>
        </div>
        
        <div v-else-if="filteredTransactions.length === 0" class="text-center py-12 text-gray-500">
          <svg class="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
          </svg>
          <p class="font-semibold text-lg">No transactions yet</p>
          <p class="text-sm mt-2">Your transaction history will appear here</p>
        </div>
        
        <div v-else class="space-y-3">
          <div v-for="tx in filteredTransactions" :key="tx.id" 
               class="group flex items-center justify-between p-5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white hover:border-red-200 hover:shadow-md transition-all">
            <div class="flex items-center gap-4">
              <div 
                :class="[
                  'w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110',
                  getTransactionDisplayType(tx) === 'income' 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                    : 'bg-gradient-to-br from-red-500 to-rose-500'
                ]"
              >
                <svg 
                  v-if="getTransactionDisplayType(tx) === 'income'"
                  class="w-6 h-6 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                <svg 
                  v-else
                  class="w-6 h-6 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                </svg>
              </div>
              <div>
                <p class="font-semibold text-gray-800 text-lg">{{ tx.description }}</p>
                <p class="text-sm text-gray-500">{{ formatDate(tx.timestamp) }}</p>
              </div>
            </div>
            <div class="text-right">
              <p 
                class="font-bold text-xl"
                :class="getTransactionDisplayType(tx) === 'income' ? 'text-green-600' : 'text-red-600'"
              >
                {{ getTransactionDisplayType(tx) === 'income' ? '+' : '-' }}{{ tx.amount }} JSB
              </p>
              <p class="text-sm text-gray-500">Balance: {{ tx.balanceAfter }} JSB</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modals -->
  <AddFundsModal 
    v-if="showAddFunds" 
    @close="showAddFunds = false" 
    @success="handleAddFundsSuccess" 
  />
  
  <CashOutModal 
    v-if="showCashOut" 
    :show="showCashOut"
    :wallet-balance="wallet.balance"
    @close="showCashOut = false" 
    @success="handleCashOutSuccess" 
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AddFundsModal from '../components/AddFundsModal.vue'
import CashOutModal from '../components/CashOutModal.vue'

const router = useRouter()
const wallet = ref({ balance: 0, currency: 'JSB' })
const transactions = ref([])
const loading = ref(true)
const accountLoading = ref(true)
const linkingAccount = ref(false)
const showAddFunds = ref(false)
const showCashOut = ref(false)

const accountStatus = ref({
  hasAccount: false,
  isVerified: false,
  accountId: null
})

// Transaction filters
const showTransactionFilters = ref(false)
const txFilters = ref({
  sortBy: 'newest',
  type: 'all',
  dateRange: 'all'
})

const isAccountVerified = computed(() => accountStatus.value.isVerified)

// Calculate totals for deposits and withdrawals
const totalDeposits = computed(() => {
  return transactions.value
    .filter(tx => tx.type === 'deposit' || tx.type === 'sale')
    .reduce((sum, tx) => sum + tx.amount, 0)
})

const totalWithdrawals = computed(() => {
  return transactions.value
    .filter(tx => tx.type === 'withdrawal' || tx.type === 'purchase')
    .reduce((sum, tx) => sum + tx.amount, 0)
})

const filteredTransactions = computed(() => {
  let txs = [...transactions.value]
  
  // Filter by type
  if (txFilters.value.type !== 'all') {
    txs = txs.filter(tx => tx.type === txFilters.value.type)
  }
  
  // Filter by date range
  if (txFilters.value.dateRange !== 'all') {
    const now = new Date()
    const days = parseInt(txFilters.value.dateRange)
    const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000))
    txs = txs.filter(tx => new Date(tx.timestamp) >= cutoffDate)
  }
  
  // Sort
  switch(txFilters.value.sortBy) {
    case 'oldest':
      txs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      break
    case 'amount-high':
      txs.sort((a, b) => b.amount - a.amount)
      break
    case 'amount-low':
      txs.sort((a, b) => a.amount - b.amount)
      break
    case 'newest':
    default:
      txs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }
  
  return txs
})

// Determine if transaction is income or expense for display
function getTransactionDisplayType(tx) {
  if (tx.type === 'deposit' || tx.type === 'sale') {
    return 'income'
  }
  if (tx.type === 'withdrawal' || tx.type === 'purchase') {
    return 'expense'
  }
  return 'income'
}

onMounted(async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/login')
    return
  }

  await new Promise(resolve => setTimeout(resolve, 4000))
  await loadWallet()
  await loadAccountStatus()
  await loadTransactions()
})

async function loadWallet() {
  try {
    const token = localStorage.getItem('token')
    const resp = await fetch('http://localhost:3001/api/wallet', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await resp.json()
    if (data.success) {
      wallet.value = data.wallet
      transactions.value = data.transactions || []
    }
  } catch (err) {
    console.error('Failed to load wallet:', err)
  }
}

async function loadAccountStatus() {
  accountLoading.value = true
  try {
    const token = localStorage.getItem('token')
    const resp = await fetch('http://localhost:3001/api/wallet/stripe-account-status', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    const data = await resp.json()
    accountStatus.value = {
      hasAccount: !!data.account,
      isVerified: data.isOnboarded || false,
      accountId: data.account?.id || null
    }
  } catch (err) {
    console.error('Failed to load account status:', err)
  } finally {
    accountLoading.value = false
  }
}

async function loadTransactions() {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const resp = await fetch('http://localhost:3001/api/wallet', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await resp.json()
    if (data.success) {
      transactions.value = data.transactions || []
    }
  } catch (err) {
    console.error('Failed to load transactions:', err)
  } finally {
    loading.value = false
  }
}

function formatDate(timestamp) {
  if (!timestamp) return 'Unknown date'
  
  try {
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) return 'Invalid date'
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  } catch (err) {
    console.error('Date formatting error:', err)
    return 'Invalid date'
  }
}

function resetTxFilters() {
  txFilters.value = {
    sortBy: 'newest',
    type: 'all',
    dateRange: 'all'
  }
}

async function handleLinkAccount() {
  linkingAccount.value = true
  try {
    const token = localStorage.getItem('token')
    const resp = await fetch('http://localhost:3001/api/wallet/create-connect-account', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    const data = await resp.json()
    if (data.success && data.url) {
      window.location.href = data.url
    } else {
      alert('Failed to start account linking')
    }
  } catch (err) {
    console.error('Failed to link account:', err)
    alert('Error linking account')
  } finally {
    linkingAccount.value = false
  }
}

async function handleUpdateAccount() {
  await handleLinkAccount()
}

function handleCashOut() {
  if (!isAccountVerified.value) {
    alert('Please link and verify your bank account first')
    return
  }
  showCashOut.value = true
}

async function handleAddFundsSuccess() {
  showAddFunds.value = false
  await loadWallet()
  await loadTransactions()
}

async function handleCashOutSuccess() {
  showCashOut.value = false
  await loadWallet()
  await loadTransactions()
}
</script>
