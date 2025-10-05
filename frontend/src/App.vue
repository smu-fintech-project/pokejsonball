<template>
  <div :class="[isDark ? 'dark' : '']">
    <div class="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900 dark:from-pj-ink dark:to-pj-surface dark:text-slate-100">
      <Navbar :is-dark="isDark" @toggle-dark="toggleDark" />
      <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <router-view />
      </main>
      <footer class="border-t mt-12 border-gray-200 dark:border-slate-700">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-sm text-gray-500 dark:text-slate-400 flex justify-between">
          <div>© {{ year }} PokeJsonBall</div>
          <div>Built by ❤️ • Elroy, Ye Zhan, Wen Bao, Dao Jun & Marcus</div>
        </div>
      </footer>
    </div>
  </div>
  
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Navbar from './components/Navbar.vue';

const isDark = ref(false);
const year = new Date().getFullYear();

const applyThemeClass = (dark) => {
  const root = document.documentElement;
  if (dark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

const toggleDark = () => {
  isDark.value = !isDark.value;
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
  applyThemeClass(isDark.value);
};

onMounted(() => {
  const stored = localStorage.getItem('theme');
  if (stored) {
    isDark.value = stored === 'dark';
  } else {
    isDark.value = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  applyThemeClass(isDark.value);
});
</script>
