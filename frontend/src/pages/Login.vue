<template>
  <div class="max-w-md mx-auto bg-white rounded-2xl shadow p-6">
    <h2 class="text-2xl font-bold mb-2 text-red-700">Welcome back</h2>
    <p class="text-sm text-gray-500 mb-6">Log in to access your portfolio and trades.</p>

    <form @submit.prevent="onSubmit" class="space-y-4">
      <div>
        <label class="text-xs text-gray-600">Email</label>
        <input v-model="email" type="email" required class="text-red-700 w-full mt-1 p-3 border rounded-lg" />
      </div>

      <div>
        <label class="text-xs text-gray-600">Password</label>
        <input v-model="password" type="password" required class="text-red-700 w-full mt-1 p-3 border rounded-lg" />
      </div>

      <button 
        type="submit" 
        class="w-full py-3 bg-red-600 text-white rounded-lg font-semibold 
              hover:bg-red-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500">
        Sign in
      </button>

    </form>
    <p v-if="error" class="text-sm text-red-500 mt-2">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { API_BASE } from '@/utils/env';
const email = ref('');
const password = ref('');
const router = useRouter();
const error = ref(''); 

 


async function onSubmit() {

   // mock login — replace with real auth later
  // localStorage.setItem('token', 'demo-token');
  // localStorage.setItem('userEmail', email.value || 'collector@example.com');

  

  try {
    // Call your backend API (like calling ASP.NET controller)
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    });

    const data = await response.json();

    console.log('🔍 Login response:', data);

    if (response.ok) {
      // Store token (like storing auth cookie in ASP.NET)
      localStorage.setItem('token', data.token);
      localStorage.setItem('userEmail', data.email);
      localStorage.setItem('username', data.username);
      localStorage.setItem('userId', data.userId);  // Store userId for Socket.IO chat
      window.dispatchEvent(new Event('storage')); // look for user login
      console.log('✅ Stored userId:', localStorage.getItem('userId'));
      
      // Navigate to portfolio
      router.push('/profile');
    } else {
      // Handle error
      error.value = data.message || 'Login failed';
    }
  } catch (err) {
    error.value = 'Network error';
    console.error(err);
  }
}
</script>
