<template>
  <div class="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-2xl border-4 border-red-200">
      
      <!-- Header -->
      <div class="text-center">
      <div class="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4">
        <img src="../assets/JS.png" alt="App Logo" class="w-20 h-20 object-contain" />
      </div>
      <h2 class="text-3xl font-black text-gray-900">Create your account</h2>
        <p class="mt-2 text-sm text-gray-600">Join our pokemon trading community!</p>
      </div>

      <!-- Error Alert -->
      <div v-if="error" class="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-lg">
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <span>{{ error }}</span>
        </div>
      </div>

      <!-- Success Alert -->
      <div v-if="success" class="bg-green-50 border-2 border-green-300 text-green-700 px-4 py-3 rounded-lg">
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <span>{{ success }}</span>
        </div>
      </div>

      <!-- Signup Form -->
      <form @submit.prevent="handleSignup" class="mt-8 space-y-6">
        
        <!-- Name Field -->
        <div>
          <label for="name" class="block text-sm font-bold text-red-600 mb-1">
            Full Name
          </label>
          <input
            id="name"
            v-model="name"
            type="text"
            required
            :disabled="loading"
            placeholder="Ash Ketchum"
            class="appearance-none block w-full px-3 py-3 border-2 border-red-200 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <!-- Avatar Selection -->
        <div>
          <label class="block text-sm font-bold text-red-600 mb-2">
            Choose Your Avatar
          </label>
          
          <!-- Loading State -->
          <div v-if="loadingAvatars" class="text-center py-4">
            <svg class="animate-spin h-6 w-6 text-red-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-xs text-gray-500 mt-2">Loading avatars...</p>
          </div>

          <!-- No Avatars Message -->
          <div v-else-if="!avatars || avatars.length === 0" class="text-center py-4 bg-red-50 rounded-lg border-2 border-red-200">
            <p class="text-sm text-gray-500">No avatars available</p>
          </div>

          <!-- Avatar Grid -->
          <div v-else class="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-60 overflow-y-auto p-2 bg-red-50 rounded-lg border-2 border-red-200">
            <button
              v-for="avatar in avatars"
              :key="avatar"
              type="button"
              @click="selectedAvatar = avatar"
              :class="[
                'relative aspect-square rounded-lg overflow-hidden border-2 transition-all transform hover:scale-110',
                selectedAvatar === avatar 
                  ? 'border-red-600 ring-4 ring-red-300 scale-105' 
                  : 'border-gray-300 hover:border-red-400'
              ]"
              :disabled="loading"
            >
              <img 
                :src="`${API_BASE}/api/cards/images/avatar/${avatar}`" 
                :alt="avatar"
                class="w-full h-full object-cover"
                loading="lazy"
              />
              <!-- Selected Checkmark -->
              <div 
                v-if="selectedAvatar === avatar"
                class="absolute inset-0 bg-red-600/20 flex items-center justify-center"
              >
                <svg class="w-8 h-8 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              </div>
            </button>
          </div>
          <p class="mt-1 text-xs text-gray-500">
            {{ selectedAvatar ? `Selected: ${selectedAvatar}` : 'Click an avatar to select' }}
          </p>
        </div>

        <!-- Email Field -->
        <div>
          <label for="email" class="block text-sm font-bold text-red-600 mb-1">
            Email address
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            :disabled="loading"
            placeholder="ash@pokemon.com"
            class="appearance-none block w-full px-3 py-3 border-2 border-red-200 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <!-- Password Field -->
        <div>
          <label for="password" class="block text-sm font-bold text-red-600 mb-1">
            Password
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            :disabled="loading"
            placeholder="At least 6 characters"
            class="appearance-none block w-full px-3 py-3 border-2 border-red-200 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <p class="mt-1 text-xs text-gray-500">
            Password must be at least 6 characters
          </p>
        </div>

        <!-- Confirm Password Field -->
        <div>
          <label for="confirmPassword" class="block text-sm font-bold text-red-600 mb-1">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            :disabled="loading"
            placeholder="Re-enter your password"
            class="appearance-none block w-full px-3 py-3 border-2 border-red-200 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="loading || !name || !email || !password || !confirmPassword"
          class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all transform hover:scale-105"
        >
          <span v-if="loading" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating account...
          </span>
          <span v-else>Create account</span>
        </button>

        <!-- Link to Login -->
        <div class="text-center">
          <p class="text-sm text-gray-600">
            Already have an account?
            <router-link to="/login" class="font-bold text-red-600 hover:text-red-500 ml-1">
              Sign in
            </router-link>
          </p>
        </div>
      </form>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

import { API_BASE } from '@/utils/env';

const router = useRouter();
const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');

// Avatar Selection
const avatars = ref([]);
const selectedAvatar = ref(null);
const loadingAvatars = ref(false);

const error = ref('');
const success = ref('');
const loading = ref(false);

// Load available avatars on mount
onMounted(async () => {
  try {
    loadingAvatars.value = true;
    console.log('🎨 Fetching avatars from:', `${API_BASE}/api/auth/avatars`);
    const response = await axios.get(`${API_BASE}/api/auth/avatars`);
    avatars.value = response.data.avatars || [];
    console.log('✅ Loaded avatars:', avatars.value.length, avatars.value);
  } catch (err) {
    console.error('❌ Failed to load avatars:', err);
    // Don't block signup if avatars fail to load
  } finally {
    loadingAvatars.value = false;
  }
});

async function handleSignup() {
  try {
    error.value = '';
    success.value = '';

    // Validate name
    if (name.value.trim().length < 2) {
      error.value = '❌ Name must be at least 2 characters';
      return;
    }

    // Validate passwords match
    if (password.value !== confirmPassword.value) {
      error.value = '❌ Passwords do not match';
      return;
    }

    // Validate password length
    if (password.value.length < 6) {
      error.value = '❌ Password must be at least 6 characters';
      return;
    }

    loading.value = true;

    console.log('Attempting signup with name...');

    const response = await axios.post(`${API_BASE}/api/auth/signup`, {
      name: name.value.trim(),
      email: email.value,
      password: password.value,
      avatar: selectedAvatar.value // Include selected avatar
    });

    console.log('Signup successful:', response.data);

    success.value = '✅ Account created successfully! Redirecting to login...';

    setTimeout(() => {
      router.push('/login');
    }, 2000);

  } catch (err) {
    console.error('Signup error:', err);

    if (err.response?.data?.error) {
      error.value = err.response.data.error;
    } else if (err.code === 'ECONNREFUSED') {
      error.value = '❌ Cannot connect to server. Make sure backend is running.';
    } else if (err.response?.status === 400) {
      error.value = '❌ User already exists or invalid data';
    } else {
      error.value = '❌ Signup failed. Please try again.';
    }
  } finally {
    loading.value = false;
  }
}
</script>
