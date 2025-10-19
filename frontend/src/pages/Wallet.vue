<template>
  <div class="max-w-6xl mx-auto p-6">
    <!-- Wallet Balance Card -->
    <div class="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">My Wallet</h2>
        <button 
          @click="handleAddFunds"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          + Add Funds
        </button>
      </div>
      <div class="flex items-center gap-4">
        <div class="text-4xl font-bold text-indigo-600">
          {{ wallet.balance }} {{ wallet.currency }}
        </div>
      </div>
    </div>

    <!-- Transaction History -->
    <div class="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
      <h3 class="text-xl font-bold mb-4">Transaction History</h3>
      
      <div v-if="loading" class="text-center py-8">Loading...</div>
      
      <div v-else-if="transactions.length === 0" class="text-center py-8 text-gray-500">
        No transactions yet
      </div>
      
      <div v-else class="space-y-3">
        <div v-for="tx in transactions" :key="tx.id" 
             class="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-slate-700">
          <div class="flex items-center gap-4">
         
            <div>
              <p class="font-semibold">{{ tx.description }}</p>
              <p class="text-sm text-gray-500">{{ formatDate(tx.timestamp) }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-bold" :class="getAmountColor(tx.type)">
              {{ getAmountPrefix(tx.type) }}{{ tx.amount }} {{ wallet.currency }}
            </p>
            <p class="text-sm text-gray-500">Balance: {{ tx.balanceAfter }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <AddFundsModal v-if="showAddFunds" @close="showAddFunds = false" @success="handleAddFundsSuccess" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AddFundsModal from '../components/AddFundsModal.vue'

const router = useRouter()
const loading = ref(true)
const wallet = ref({ balance: 0, currency: 'JSB' })
const transactions = ref([])

const showAddFunds = ref(false)
function handleAddFunds() {
  showAddFunds.value = true
}

async function handleAddFundsSuccess() {
  showAddFunds.value = false;
  const oldBalance = wallet.value.balance;
  await waitForWalletUpdate(oldBalance);
}

async function waitForWalletUpdate(oldBalance) {
  let tries = 0;
  while (tries < 10) { 
    await new Promise(res => setTimeout(res, 2000)); // wait 2 seconds
    await loadWallet();
    if (wallet.value.balance !== oldBalance) break;
    tries++;
  }
}

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
    
    const resp = await fetch('http://localhost:3001/api/wallet', {
      headers: { 
        'Authorization': `Bearer ${token}` 
      }
    })
    
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

// function getTypeColor(type) {
//   return type === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
// }

function getAmountColor(type) {
  return type === 'deposit' ? 'text-green-600' : 'text-red-600'
}

function getAmountPrefix(type) {
  return type === 'deposit' ? '+' : '-'
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
