<template>
  <div class="max-w-2xl mx-auto p-6 text-center">
    <div v-if="loading" class="py-12">
      <div class="text-4xl mb-4">⏳</div>
      <h2 class="text-2xl font-bold mb-2">Verifying your account...</h2>
      <p class="text-gray-600">Please wait while we confirm your information.</p>
    </div>
    
    <div v-else-if="success" class="py-12">
      <div class="text-6xl mb-4">✅</div>
      <h2 class="text-2xl font-bold mb-2 text-green-600">Verification Complete!</h2>
      <p class="text-gray-600 mb-6">You can now withdraw funds to your bank account.</p>
      <button 
        @click="goToWallet"
        class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
      >
        Go to Wallet
      </button>
    </div>
    
    <div v-else class="py-12">
      <div class="text-6xl mb-4">⚠️</div>
      <h2 class="text-2xl font-bold mb-2 text-yellow-600">Verification Incomplete</h2>
      <p class="text-gray-600 mb-6">{{ error || 'Please complete all required information.' }}</p>
      <button 
        @click="goToWallet"
        class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
      >
        Back to Wallet
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(true)
const success = ref(false)
const error = ref('')

onMounted(async () => {
  await checkAccountStatus()
})

async function checkAccountStatus() {
  try {
    const token = localStorage.getItem('token')
    const resp = await fetch('http://localhost:3001/api/wallet/stripe-account-status', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    const data = await resp.json()
    
    if (data.isOnboarded) {
      success.value = true
    } else {
      error.value = 'Please complete all verification steps'
    }
  } catch (err) {
    error.value = 'Unable to verify account status'
  } finally {
    loading.value = false
  }
}

function goToWallet() {
  router.push('/wallet')
}
</script>
