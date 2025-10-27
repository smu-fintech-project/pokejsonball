<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 md:p-8">
    <div class="max-w-5xl mx-auto space-y-6">
      
      <!-- Hero Wallet Card -->
      <div class="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-red-400 rounded-3xl shadow-2xl p-8 md:p-10">
        <!-- Decorative Pokéball background -->
        <div class="absolute -right-20 -top-20 w-64 h-64 opacity-10">
          <div class="w-full h-full rounded-full border-[40px] border-white"></div>
        </div>
        
        <div class="relative z-10">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <div class="flex items-center gap-3 mb-2">
                <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h1 class="text-3xl md:text-4xl font-black text-white">My Wallet</h1>
              </div>
              <p class="text-red-100 text-sm md:text-base">Manage your JSB balance & transactions</p>
            </div>
            
            <button 
              @click="handleAddFunds"
              class="group px-6 py-3 bg-white text-red-600 rounded-xl font-bold hover:bg-red-50 transition-all shadow-lg transform hover:scale-105 flex items-center gap-2"
            >
              <svg class="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Funds
            </button>
          </div>
          
          <!-- Balance Display -->
          <div class="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-2xl p-6 md:p-8">
            <p class="text-red-100 text-sm mb-2 uppercase tracking-wider font-semibold">Available Balance</p>
            <div class="flex items-center gap-3">
              <img :src="jsbImg" alt="JSB" class="h-14 w-14 md:h-16 md:w-16 drop-shadow-lg" />
              <div class="text-5xl md:text-6xl font-black text-white">
                {{ wallet.balance.toFixed(2) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Transaction History Card -->
      <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-800 border-b-2 border-gray-200 dark:border-slate-600 px-6 md:px-8 py-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 class="text-2xl font-black text-gray-900 dark:text-white">Transaction History</h2>
            </div>
            <span class="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 text-sm font-bold rounded-lg">
              {{ transactions.length }} total
            </span>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6 md:p-8">
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-16">
            <div class="inline-block animate-spin rounded-full h-14 w-14 border-4 border-red-200 border-t-red-600"></div>
            <p class="mt-4 text-gray-600 dark:text-slate-400 font-semibold">Loading transactions...</p>
          </div>
          
          <!-- Empty State -->
          <div v-else-if="transactions.length === 0" class="text-center py-16">
            <div class="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800 rounded-2xl flex items-center justify-center">
              <svg class="w-10 h-10 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p class="text-gray-900 dark:text-white text-xl font-bold mb-2">No transactions yet</p>
            <p class="text-gray-500 dark:text-slate-400">Your transaction history will appear here once you start trading</p>
          </div>
          
          <!-- Transaction List -->
          <div v-else class="space-y-3">
            <div v-for="tx in transactions" :key="tx.id" 
                 class="group relative bg-gradient-to-r from-gray-50 to-white dark:from-slate-700 dark:to-slate-800 rounded-2xl p-5 border-2 border-gray-200 dark:border-slate-600 hover:border-red-300 dark:hover:border-red-700 hover:shadow-lg transition-all">
              
              <!-- Transaction Content -->
              <div class="flex items-center justify-between gap-4">
                <!-- Left: Icon + Details -->
                <div class="flex items-center gap-4 flex-1 min-w-0">
                  <!-- Icon -->
                  <div :class="[
                    'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg',
                    getTypeColor(tx.type)
                  ]">
                    <svg v-if="tx.type === 'deposit' || tx.type === 'sale'" 
                         class="w-7 h-7 text-green-600 dark:text-green-400" 
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                    <svg v-else 
                         class="w-7 h-7 text-red-600 dark:text-red-400" 
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                    </svg>
                  </div>
                  
                  <!-- Details -->
                  <div class="min-w-0 flex-1">
                    <p class="font-bold text-gray-900 dark:text-white text-base md:text-lg truncate">
                      {{ tx.description }}
                    </p>
                    <p class="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {{ formatDate(tx.timestamp) }}
                    </p>
                    <p v-if="tx.cert_number" class="text-xs text-gray-400 dark:text-slate-500 mt-1">
                      Cert: {{ tx.cert_number }}
                    </p>
                  </div>
                </div>
                
                <!-- Right: Amount -->
                <div class="text-right flex-shrink-0">
                  <p class="text-2xl md:text-3xl font-black mb-1 flex items-center justify-end gap-1" 
                     :class="getAmountColor(tx.type)">
                    <span>{{ getAmountPrefix(tx.type) }}</span>
                    <img :src="jsbImg" alt="JSB" class="h-[24px] w-[24px] inline" />
                    <span>{{ tx.amount.toFixed(2) }}</span>
                  </p>
                  <div class="flex items-center justify-end gap-1 text-sm text-gray-500 dark:text-slate-400">
                    <span class="font-semibold">Balance:</span>
                    <img :src="jsbImg" alt="JSB" class="h-[14px] w-[14px]" />
                    <span>{{ tx.balanceAfter.toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import jsbImg from '../../images/JSB_image.png'
import { apiUrl } from '@/utils/api'

const router = useRouter()
const loading = ref(true)
const wallet = ref({ balance: 0, currency: 'JSB' })
const transactions = ref([])

onMounted(async () => {
  await loadWallet()
})

async function loadWallet() {
  loading.value = true
  
  try {
    const token = localStorage.getItem('token')
    
    if (!token) {
      router.push('/login')
      return
    }
    
    const resp = await fetch(apiUrl('/api/wallet'), {
      headers: { 
        'Authorization': `Bearer ${token}` 
      }
    });
    
    if (!resp.ok) {
      if (resp.status === 401 || resp.status === 403) {
        router.push('/login')
        return
      }
      throw new Error(`HTTP ${resp.status}`)
    }
    
    const data = await resp.json()
    
    if (data.success) {
      wallet.value = data.wallet
      transactions.value = data.transactions
    }
    
  } catch (err) {
    console.error('Failed to load wallet:', err)
  } finally {
    loading.value = false
  }
}

function handleAddFunds() {
  alert('Add Funds feature coming soon!')
}

function getTypeColor(type) {
  if (type === 'deposit' || type === 'sale') {
    return 'bg-green-100 dark:bg-green-900/50'
  }
  return 'bg-red-100 dark:bg-red-900/50'
}

function getAmountColor(type) {
  if (type === 'deposit' || type === 'sale') {
    return 'text-green-600 dark:text-green-400'
  }
  return 'text-red-600 dark:text-red-400'
}

function getAmountPrefix(type) {
  if (type === 'deposit' || type === 'sale') {
    return '+'
  }
  return '-'
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>