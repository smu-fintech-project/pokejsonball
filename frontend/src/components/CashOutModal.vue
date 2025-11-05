<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold">Cash Out</h3>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleCashOut" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">Amount (JSB)</label>
          <input
            v-model.number="amount"
            type="number"
            step="1"
            min="10"
            :max="maxAmount"
            required
            class="w-full px-4 py-2 border dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700"
            placeholder="Enter amount"
          />
          <p class="text-sm text-gray-500 mt-1">
            Available: {{ maxAmount }} JSB | Minimum: 10 JSB
          </p>
        </div>

        <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {{ getErrorMessage(error) }}
        </div>

        <div class="flex gap-3">
          <button
            type="button"
            @click="$emit('close')"
            class="flex-1 px-4 py-2 border dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="loading || amount < 10 || amount > maxAmount"
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
import { ref, computed } from 'vue'
import { API_BASE } from '@/utils/env'

const props = defineProps({
  show: Boolean,
  walletBalance: Number
})

const emit = defineEmits(['close', 'success'])

const amount = ref(10)
const loading = ref(false)
const error = ref('')

const maxAmount = computed(() => props.walletBalance || 0)

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
    const resp = await fetch(`${API_BASE}/api/wallet/cash-out`, {
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
      error.value = data.error || 'CASHOUT_FAILED'
    }
  } catch (err) {
    console.error('Cash out error:', err)
    error.value = 'Network error. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
