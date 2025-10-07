<template>
  <header class="bg-white/70 dark:bg-pj-surface/80 backdrop-blur sticky top-0 z-30 border-b border-gray-200 dark:border-slate-700">
    <div class="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
          PJ
        </div>
        <div>
          <router-link to="/" class="text-lg font-semibold">PokeJsonBall</router-link>
          <div class="text-xs text-gray-400 dark:text-slate-400">Pokémon trading cards • SG</div>
        </div>
      </div>

      <!-- Desktop Navigation -->
      <nav class="hidden md:flex items-center space-x-1 text-sm">
        <router-link to="/" class="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800" :class="{ 'bg-gray-100 dark:bg-slate-800': isActive('/') }">Marketplace</router-link>
        <router-link to="/portfolio" class="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800" :class="{ 'bg-gray-100 dark:bg-slate-800': isActive('/portfolio') }">Portfolio</router-link>
        <router-link to="/certs" class="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800" :class="{ 'bg-gray-100 dark:bg-slate-800': isActive('/certs') }">Cert Gallery</router-link>
        <router-link to="/community" class="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800" :class="{ 'bg-gray-100 dark:bg-slate-800': isActive('/community') }">Community</router-link>
        <router-link to="/about" class="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800" :class="{ 'bg-gray-100 dark:bg-slate-800': isActive('/about') }">About</router-link>
        
        <!-- Auth Buttons -->
        <router-link to="/login" class="ml-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800">Login</router-link>
        <router-link to="/signup" class="px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Sign up</router-link>
        
        <button @click="$emit('toggle-dark')" class="ml-2 inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800">
          <span v-if="isDark">🌙</span>
          <span v-else>☀️</span>
          <span class="hidden sm:inline">Theme</span>
        </button>
      </nav>

      <!-- Mobile Navigation -->
      <div class="md:hidden flex items-center gap-2">
        <button @click="$emit('toggle-dark')" class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800">
          <span v-if="isDark">🌙</span>
          <span v-else>☀️</span>
        </button>
        <router-link to="/login" class="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 text-sm">Login</router-link>
        <router-link to="/signup" class="px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm">Sign up</router-link>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRoute } from 'vue-router';
const props = defineProps({ isDark: { type: Boolean, default: false } });
const route = useRoute();
const isActive = (path) => route.path === path;
</script>
