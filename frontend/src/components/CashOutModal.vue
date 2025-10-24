<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold">Cash Out</h3>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Onboarding Status -->
      <div v-if="!isOnboarded" class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p class="text-sm text-yellow-800 mb-3">
          You need to complete verification before you can cash out.
        </p>
        <button 
          @click="startOnboarding"
          :disabled="loading"
          class="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          {{ loading ? 'Loading...' : 'Complete Verification' }}
        </button>
      </div>

      <!-- Cash Out Form -->
      <form v-else @submit.prevent="handleCashOut" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">Amount (JSB)</label>
          <input
            v-model.number="amount"
            type="number"
            step="1"
            min="10"
            :max="maxAmount"
            required
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600"
            placeholder="Enter amount"
          />
          <p class="text-sm text-gray-500 mt-1">
            Available: {{ maxAmount }} JSB | Minimum : 10 JSB |  1 JSB -> 1 SGD
          </p>
        </div>

        <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
           {{ getErrorMessage(error) }}
        </div>

        <div class="flex gap-3">
          <button
            type="button"
            @click="$emit('close')"
            class="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="loading || amount <= 0 || amount > maxAmount"
            class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Processing...' : 'Confirm Cash Out' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  show: Boolean,
  walletBalance: Number
})

const emit = defineEmits(['close', 'success'])

const amount = ref(0)
const loading = ref(false)
const error = ref('')
const isOnboarded = ref(false)
const accountStatus = ref(null)

const maxAmount = computed(() => props.walletBalance || 0)

onMounted(async () => {
  await checkOnboardingStatus()
})

async function checkOnboardingStatus() {
  try {
    const token = localStorage.getItem('token')
    const resp = await fetch('http://localhost:3001/api/wallet/stripe-account-status', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (resp.ok) {
      const data = await resp.json()
      isOnboarded.value = data.isOnboarded
      accountStatus.value = data.account
    }
  } catch (err) {
    console.error('Failed to check onboarding status:', err)
  }
}

async function startOnboarding() {
  loading.value = true
  error.value = ''
  
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
      // Redirect to Stripe onboarding
      window.location.href = data.url
    } else {
      error.value = data.error || 'Failed to start onboarding'
    }
  } catch (err) {
    error.value = 'Network error. Please try again.'
  } finally {
    loading.value = false
  }
}


// Add this function to translate error codes to user-friendly messages
function getErrorMessage(errorCode) {
  const messages = {
    'BELOW_MINIMUM': 'Minimum withdrawal amount is 10 JSB',
    'INSUFFICIENT_BALANCE': 'You do not have enough JSB balance',
    'NO_STRIPE_ACCOUNT': 'Please complete verification first',
    'ACCOUNT_NOT_READY': 'Your account verification is still pending',
    'CASHOUT_FAILED': 'Cash out failed. Please try again later'
  }
  return messages[errorCode] || errorCode
}


async function handleCashOut() {
  loading.value = true
  error.value = ''
  
  // Client-side validation
  if (amount.value < 10) {
    error.value = 'BELOW_MINIMUM'
    loading.value = false
    return
  }
  
  if (amount.value > maxAmount.value) {
    error.value = 'INSUFFICIENT_BALANCE'
    loading.value = false
    return
  }


  try {
    const token = localStorage.getItem('token')
    const resp = await fetch('http://localhost:3001/api/wallet/cash-out', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount: amount.value })
    })
    
    const data = await resp.json()
    
    if (data.success) {
      emit('success')
      emit('close')
    } else {
      error.value = data.error || 'Cash out failed'
    }
  } catch (err) {
    error.value = 'Network error. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
