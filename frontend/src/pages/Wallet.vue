<template>
  <div class="max-w-6xl mx-auto p-6">
    <!-- Wallet Balance Card -->
    <div class="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">My Wallet</h2>
        <div class="flex gap-2">
          <button 
            @click="showAddFunds = true"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            + Add Funds
          </button>
          <button 
            @click="handleCashOut"
            :disabled="!isAccountVerified"
            :class="[
              'px-4 py-2 rounded-lg transition',
              isAccountVerified 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            ]"
          >
            💰 Cash Out
          </button>
        </div>
      </div>
      <div class="text-4xl font-bold text-indigo-600">
        {{ wallet.balance }} JSB
      </div>
    </div>

    <!-- Bank Account Status Card -->
    <div class="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-6">
      <h3 class="text-lg font-bold mb-4">Bank Account for Withdrawals</h3>
      
      <!-- Loading State -->
      <div v-if="accountLoading" class="flex items-center gap-3 text-gray-500">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        <span>Checking account status...</span>
      </div>

      <!-- Not Linked -->
      <div v-else-if="!accountStatus.hasAccount" class="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-gray-200 dark:bg-slate-600 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
          </div>
          <div>
            <p class="font-medium text-gray-900 dark:text-gray-100">No bank account linked</p>
            <p class="text-sm text-gray-500">Link your bank account to enable cash withdrawals</p>
          </div>
        </div>
        <button 
          @click="handleLinkAccount"
          :disabled="linkingAccount"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {{ linkingAccount ? 'Loading...' : 'Link Bank Account' }}
        </button>
      </div>

      <!-- Pending Verification -->
      <div v-else-if="!accountStatus.isVerified" class="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/40 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p class="font-medium text-gray-900 dark:text-gray-100">Verification Pending</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">Your bank account is being verified by Stripe</p>
          </div>
        </div>
        <button 
          @click="handleUpdateAccount"
          class="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition"
        >
          Update Details
        </button>
      </div>

      <!-- Verified -->
      <div v-else class="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600 dark:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <div>
            <p class="font-medium text-green-900 dark:text-green-100">✅ Bank Account Verified</p>
            <p class="text-sm text-green-700 dark:text-green-400">Ready to receive withdrawals</p>
          </div>
        </div>
        <button 
          @click="handleUpdateAccount"
          class="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition"
        >
          Update Account
        </button>
      </div>
    </div>

    <!-- Transaction History -->
    <div class="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">

      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Transaction History</h2>
        
        <!-- Filter Toggle Button -->
        <button 
          @click="showTransactionFilters = !showTransactionFilters"
          :class="[
            'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap',
            showTransactionFilters
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 border border-gray-300 dark:border-slate-600'
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
      <div v-if="showTransactionFilters" class="mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <!-- Sort By -->
          <div>
            <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Sort By</label>
            <div class="relative">
              <select
                v-model="txFilters.sortBy"
                class="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pr-8 transition-all"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount-high">Amount: High→Low</option>
                <option value="amount-low">Amount: Low→High</option>
              </select>
              <svg class="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>

          <!-- Type Filter -->
          <div>
            <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Type</label>
            <div class="relative">
              <select
                v-model="txFilters.type"
                class="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pr-8 transition-all"
              >
                <option value="all">All Transactions</option>
                <option value="deposit">Deposits Only</option>
                <option value="withdrawal">Withdrawals Only</option>
              </select>
              <svg class="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>

          <!-- Date Range -->
          <div>
            <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Date Range</label>
            <div class="relative">
              <select
                v-model="txFilters.dateRange"
                class="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pr-8 transition-all"
              >
                <option value="all">All Time</option>
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
              </select>
              <svg class="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>

          <!-- Clear Filters -->
          <div class="flex gap-3 items-end">
            <button 
              v-if="txFilters.sortBy !== 'newest' || txFilters.type !== 'all' || txFilters.dateRange !== 'all'"
              @click="resetTxFilters"
              class="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all whitespace-nowrap"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      <!-- Transaction List -->
      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p class="mt-2 text-gray-500">Loading transactions...</p>
      </div>
      
      <div v-else-if="transactions.length === 0" class="text-center py-8 text-gray-500">
        <svg class="w-16 h-16 mx-auto mb-3 text-gray-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
        </svg>
        <p class="font-medium">No transactions yet</p>
      </div>
      
      <div v-else class="space-y-3">
        <div v-for="tx in filteredTransactions" :key="tx.id" 
             class="flex items-center justify-between p-4 rounded-lg border dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all">
          <div class="flex items-center gap-4">
            <div 
              :class="[
                'w-10 h-10 rounded-full flex items-center justify-center',
                tx.type === 'deposit' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
              ]"
            >
              <svg 
                v-if="tx.type === 'deposit'"
                class="w-5 h-5 text-green-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              <svg 
                v-else
                class="w-5 h-5 text-red-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
              </svg>
            </div>
            <div>
              <p class="font-semibold text-gray-900 dark:text-gray-100">{{ tx.description }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(tx.timestamp) }}</p>
            </div>
          </div>
          <div class="text-right">
            <p 
              class="font-bold text-lg"
              :class="tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'"
            >
              {{ tx.type === 'deposit' ? '+' : '-' }}{{ tx.amount }} JSB
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Balance: {{ tx.balanceAfter }} JSB</p>
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

const router = useRouter();
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

onMounted(async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/login')
    return
  }

 
  await new Promise(resolve => setTimeout(resolve, 2500))
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

      if (transactions.value.length > 0) {
        console.log('First transaction:', transactions.value[0])
      }
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
   // Handle invalid or missing timestamps
  if (!timestamp) {
    return 'Unknown date'
  }
  
  try {
    const date = new Date(timestamp)
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  } catch (err) {
    console.error('Date formatting error:', err, timestamp)
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
