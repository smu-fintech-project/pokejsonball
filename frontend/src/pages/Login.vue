<template>
  <div class="max-w-md mx-auto bg-white rounded-2xl shadow p-6">
    <h2 class="text-2xl font-bold mb-2">Welcome back</h2>
    <p class="text-sm text-gray-500 mb-6">Log in to access your portfolio and trades.</p>

    <form @submit.prevent="onSubmit" class="space-y-4">
      <div>
        <label class="text-xs text-gray-600">Email</label>
        <input v-model="email" type="email" required class="w-full mt-1 p-3 border rounded-lg" />
      </div>

      <div>
        <label class="text-xs text-gray-600">Password</label>
        <input v-model="password" type="password" required class="w-full mt-1 p-3 border rounded-lg" />
      </div>

      <button type="submit" class="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold">Sign in</button>

      <div class="text-center text-sm text-gray-500">
        Or continue with
      </div>

      <div class="flex gap-3">
        <button type="button" class="flex-1 py-2 border rounded-lg">Google</button>
        <button type="button" class="flex-1 py-2 border rounded-lg">Apple</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
const email = ref('');
const password = ref('');
const router = useRouter();

function onSubmit() {
  // mock login — replace with real auth later
  localStorage.setItem('token', 'demo-token');
  localStorage.setItem('userEmail', email.value || 'collector@example.com');
  router.push('/profile');
}
</script>
