<template>
  <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div class="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full">
      <h2 class="text-xl font-bold mb-4">Purchase JSB Coins</h2>
      <div>
        <label class="block mb-1">Amount (SGD)</label>
        <input v-model.number="amount" type="number" min="1" class="w-full mb-2 px-2 py-1 border rounded" />
        <p class="mb-4 text-sm text-gray-500">You will receive: {{ amount  }} JSB</p>
      </div>
      <div v-if="clientSecret" id="payment-element" class="mb-4"></div>
      <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>
      <div class="flex gap-2 mt-4">
        <button v-if="!clientSecret" @click="startPayment"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex-1">
          Continue to Payment
        </button>
        <button v-if="clientSecret" @click="confirmPayment"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex-1">
          Pay Now
        </button>
        <button @click="$emit('close')" class="px-4 py-2 border rounded-lg flex-1">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { loadStripe } from '@stripe/stripe-js'

const emit = defineEmits(['close', 'success'])
const amount = ref(10)
const clientSecret = ref('')
const error = ref('')
let stripe = null
let elements = null

async function startPayment() {
  error.value = ''
  try {
    const token = localStorage.getItem('token')
    const resp = await fetch('http://localhost:3001/api/wallet/purchase-jsb', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount: amount.value })
    })
    const data = await resp.json()
    if (data.success) {
      clientSecret.value = data.clientSecret
      await setupStripe()
    } else {
      error.value = data.message || 'Failed to start payment'
    }
  } catch (err) {
    error.value = 'Failed to start payment'
  }
}

async function setupStripe() {
  stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  elements = stripe.elements({ clientSecret: clientSecret.value })
  const paymentElement = elements.create('payment')
  paymentElement.mount('#payment-element')
}

async function confirmPayment() {
  const { error: stripeError , paymentIntent } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: window.location.origin + '/wallet?payment=success'
    },
    redirect: 'if_required'
  })
  if (stripeError) {
    error.value = stripeError.message
    return
  } 

  if (paymentIntent && paymentIntent.status === 'succeeded') {
    await new Promise(resolve => setTimeout(resolve, 500))
    emit('success')
  }
}
</script>
