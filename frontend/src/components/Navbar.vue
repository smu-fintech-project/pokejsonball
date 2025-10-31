<template>
  <header
    class="bg-white/70 dark:bg-pj-surface/80 backdrop-blur sticky top-0 z-30 border-b border-gray-200 dark:border-slate-700">
    <div class="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
      <!-- Logo Section -->
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
          <div class="hidden sm:block text-xs text-gray-400 dark:text-slate-400">Pokémon card trading platform</div>
        </div>
      </div>

      <!-- Desktop Navigation (md and above) -->
      <nav class="hidden md:flex items-center text-sm w-full px-4">
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

        <div class="flex items-center space-x-3 ml-auto">
          <template v-if="isAuthed">
            <div class="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700">
              <span class="inline-block w-2.5 h-2.5 rounded-full bg-green-500"></span>
              <span class="text-gray-700 dark:text-gray-200 text-sm truncate max-w-[160px]">{{username}}</span>
            </div>
            <router-link to="/messages" class="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 relative"
              :class="{ 'bg-gray-100 dark:bg-slate-800': isActive('/messages') }">
              Messages
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

      <!-- Mobile/Tablet Actions (below md) -->
      <div class="md:hidden flex items-center gap-2">
        <!-- Theme Toggle -->
        <button @click="$emit('toggle-dark')"
          class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800">
          <span v-if="isDark">🌙</span>
          <span v-else>☀️</span>
        </button>

        <!-- Hamburger Menu Button -->
        <button @click="toggleMobileMenu"
          class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 relative">
          <!-- Hamburger Icon -->
          <div class="w-5 h-4 relative flex flex-col justify-between">
            <span class="block h-0.5 w-full bg-gray-600 dark:bg-gray-300 transition-all duration-300"
              :class="{ 'rotate-45 translate-y-1.5': isMobileMenuOpen }"></span>
            <span class="block h-0.5 w-full bg-gray-600 dark:bg-gray-300 transition-all duration-300"
              :class="{ 'opacity-0': isMobileMenuOpen }"></span>
            <span class="block h-0.5 w-full bg-gray-600 dark:bg-gray-300 transition-all duration-300"
              :class="{ '-rotate-45 -translate-y-1.5': isMobileMenuOpen }"></span>
          </div>
          <!-- Notification Badge on Hamburger -->
          <span v-if="hasUnreadMessages && !isMobileMenuOpen" 
            class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          </span>
        </button>
      </div>
    </div>

    <!-- Mobile Menu Dropdown -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="isMobileMenuOpen" 
        class="md:hidden border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/95 backdrop-blur">
        <nav class="px-4 py-3 space-y-1">
          <!-- User Info (if authenticated) -->
          <div v-if="isAuthed" class="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg bg-gray-50 dark:bg-slate-700/50">
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-green-500"></span>
            <span class="text-gray-700 dark:text-gray-200 text-sm font-medium truncate">{{username}}</span>
          </div>

          <!-- Navigation Links -->
          <router-link @click="closeMobileMenu" to="/" 
            class="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            :class="{ 'bg-gray-100 dark:bg-slate-700 font-semibold': isActive('/') }">
            🏠 Marketplace
          </router-link>
          
          <router-link @click="closeMobileMenu" to="/profile" 
            class="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            :class="{ 'bg-gray-100 dark:bg-slate-700 font-semibold': isActive('/profile') }">
            👤 Profile
          </router-link>
          
          <router-link @click="closeMobileMenu" to="/community" 
            class="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            :class="{ 'bg-gray-100 dark:bg-slate-700 font-semibold': isActive('/community') }">
            👥 Community
          </router-link>
          
          <router-link @click="closeMobileMenu" to="/upload" 
            class="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            :class="{ 'bg-gray-100 dark:bg-slate-700 font-semibold': isActive('/upload') }">
            📤 Upload
          </router-link>
          
          <router-link @click="closeMobileMenu" to="/about" 
            class="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            :class="{ 'bg-gray-100 dark:bg-slate-700 font-semibold': isActive('/about') }">
            ℹ️ About
          </router-link>

          <!-- Authenticated User Links -->
          <template v-if="isAuthed">
            <div class="border-t border-gray-200 dark:border-slate-700 my-2 pt-2">
              <router-link @click="closeMobileMenu" to="/messages" 
                class="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors relative"
                :class="{ 'bg-gray-100 dark:bg-slate-700 font-semibold': isActive('/messages') }">
                💬 Messages
                <span v-if="hasUnreadMessages" class="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {{ unreadCount }}
                </span>
              </router-link>
              
              <router-link @click="closeMobileMenu" to="/wallet" 
                class="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                :class="{ 'bg-gray-100 dark:bg-slate-700 font-semibold': isActive('/wallet') }">
                💳 Wallet
              </router-link>
              
              <button @click="logout" 
                class="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors">
                🚪 Sign out
              </button>
            </div>
          </template>

          <!-- Guest User Links -->
          <template v-else>
            <div class="border-t border-gray-200 dark:border-slate-700 my-2 pt-2 space-y-2">
              <router-link @click="closeMobileMenu" to="/login"
                class="block px-3 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 text-center font-semibold transition-colors">
                Login
              </router-link>
              <router-link @click="closeMobileMenu" to="/signup"
                class="block px-3 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 text-center font-semibold transition-colors">
                Sign up
              </router-link>
            </div>
          </template>
        </nav>
      </div>
    </transition>
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
const isMobileMenuOpen = ref(false)

// Global notifications for real-time message alerts
const {
  hasUnreadMessages,
  unreadCount,
  connect: connectNotifications,
  disconnect: disconnectNotifications,
  markAsRead
} = useGlobalNotifications()

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

watch(() => route.path, () => {
  syncAuthFromStorage()
  closeMobileMenu() // Close menu on navigation
  
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
    connectNotifications()
  } else if (!isAuthed.value && wasAuthed) {
    disconnectNotifications()
  }
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('userEmail')
  localStorage.removeItem('username')
  localStorage.removeItem('userId')
  syncAuthFromStorage()
  closeMobileMenu()
  router.push('/')
}

onMounted(() => {
  syncAuthFromStorage()
  window.addEventListener('storage', syncAuthFromStorage)
  
  if (isAuthed.value) {
    connectNotifications()
  }
})

onUnmounted(() => {
  window.removeEventListener('storage', syncAuthFromStorage)
  disconnectNotifications()
})
</script>