<template>
  <header
    class="bg-white/70 dark:bg-pj-surface/80 backdrop-blur sticky top-0 z-30 border-b border-gray-200 dark:border-slate-700">
    <div class="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
      <div class="flex items-center space-x-3">
        <router-link to="/" class="block">
  <div
    class="w-12 h-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 
    rounded-2xl flex items-center justify-center shadow-xl transform rotate-2 
    hover:rotate-0 hover:scale-110 transition-all duration-500 ease-in-out hover:shadow-2xl overflow-hidden">
    
    <img :src="logo" alt="PokeJsonBall Logo"
      class="w-10 h-10 object-cover rounded-xl select-none pointer-events-none" />
  </div>
</router-link>
        <div>
          <router-link to="/" class="text-lg font-semibold">PokeJsonBall</router-link>
          <div class="text-xs text-gray-400 dark:text-slate-400">Pokémon card trading platform </div>
        </div>
      </div>

      <nav class="hidden md:flex items-center text-sm w-full px-4">
        <!-- Left-aligned navigation links -->
        <div class="flex items-center space-x-2">
          <router-link to="/" class="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
            :class="{ 'bg-gray-100 dark:bg-slate-800': isActive('/') }">Marketplace</router-link>
          <router-link to="/profile" class="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
            :class="{ 'bg-gray-100 dark:bg-slate-800': isActive('/profile') }">Profile</router-link>
          <router-link to="/community" class="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
            :class="{ 'bg-gray-100 dark:bg-slate-800': isActive('/community') }">Community</router-link>
          <router-link to="/upload" class="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
            :class="{ 'bg-gray-100 dark:bg-slate-800': isActive('/upload') }">Upload</router-link>
            
          <router-link to="/about" class="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
            :class="{ 'bg-gray-100 dark:bg-slate-800': isActive('/about') }">About</router-link>
        </div>

        <!-- Right side -->
        <div class="flex items-center space-x-3 ml-auto">
          <!-- Authenticated view -->
          <template v-if="isAuthed">
            <div class="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700">
              <span class="inline-block w-2.5 h-2.5 rounded-full bg-green-500"></span>
              <span class="text-gray-700 dark:text-gray-200 text-sm truncate max-w-[160px]">{{username}}</span>
            </div>
            <router-link to="/messages" class="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 relative"
              :class="{ 'bg-gray-100 dark:bg-slate-800': isActive('/messages') }">
              Messages
              <!-- Notification Badge -->
              <span v-if="hasUnreadMessages" class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                {{ unreadCount > 9 ? '9+' : unreadCount }}
              </span>
            </router-link>
            <router-link to="/wallet" class="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
              :class="{ 'bg-gray-100 dark:bg-slate-800': isActive('/wallet') }">Wallet</router-link>

            <button @click="logout"
              class="px-3 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-700">
              Sign out
            </button>
          </template>

          <!-- Logged-out view -->
          <template v-else>
            <router-link to="/login"
              class="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">Login</router-link>
            <router-link to="/signup"
              class="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">Sign up</router-link>
          </template>

          <button @click="$emit('toggle-dark')"
            class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800">
            <span v-if="isDark">🌙</span>
            <span v-else>☀️</span>
            <span class="hidden sm:inline">Theme</span>
          </button>
        </div>
      </nav>

      <!-- Mobile Navigation -->
      <div class="md:hidden flex items-center gap-2">
        <button @click="$emit('toggle-dark')"
          class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800">
          <span v-if="isDark">🌙</span>
          <span v-else>☀️</span>
        </button>

        <!-- Mobile auth buttons -->
        <template v-if="isAuthed">
          <button @click="logout"
            class="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 text-sm">
            Sign out
          </button>
        </template>
          <template v-else>
            <router-link to="/login"
              class="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm transition-colors">Login</router-link>
            <router-link to="/signup"
              class="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm transition-colors">Sign up</router-link>
          </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import logo from '../assets/logo.png'
import { watch, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGlobalNotifications } from '@/composables/useGlobalNotifications'

const props = defineProps({ isDark: { type: Boolean, default: false } })
const route = useRoute()
const router = useRouter()

const isActive = (path) => route.path === path

const isAuthed = ref(false)
const userEmail = ref('')
const username = ref('')

// Global notifications for real-time message alerts
const {
  hasUnreadMessages,
  unreadCount,
  connect: connectNotifications,
  disconnect: disconnectNotifications,
  markAsRead
} = useGlobalNotifications()

watch(() => route.path, () => {
  syncAuthFromStorage()
  
  // Mark notifications as read when visiting messages page
  if (route.path === '/messages') {
    markAsRead()
  }
})

function syncAuthFromStorage() {
  const token = localStorage.getItem('token')
  const email = localStorage.getItem('userEmail')
  const storedUsername = localStorage.getItem('username');
  const wasAuthed = isAuthed.value
  isAuthed.value = !!token && !!email
  userEmail.value = email || ''
  username.value = storedUsername || ''
  
  // Connect/disconnect notifications based on auth state
  if (isAuthed.value && !wasAuthed) {
    // User just logged in
    connectNotifications()
  } else if (!isAuthed.value && wasAuthed) {
    // User just logged out
    disconnectNotifications()
  }
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('userEmail')
  localStorage.removeItem('username')
  localStorage.removeItem('userId')
  syncAuthFromStorage()
  router.push('/') // send them home
}

// init + keep in sync across tabs
onMounted(() => {
  syncAuthFromStorage()
  window.addEventListener('storage', syncAuthFromStorage)
  
  // Connect notifications if already logged in
  if (isAuthed.value) {
    connectNotifications()
  }
})

onUnmounted(() => {
  window.removeEventListener('storage', syncAuthFromStorage)
  disconnectNotifications()
})
</script>
