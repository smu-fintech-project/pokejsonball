<template>
  <div :class="[isDark ? 'dark' : '']">
    <!-- 
      This is the main wrapper. 
      It needs `relative` and `overflow-hidden`.
    -->
    <div class="relative min-h-screen overflow-hidden bg-gradient-to-b from-white to-gray-50 text-gray-900 dark:from-pj-ink dark:to-pj-surface dark:text-slate-100">
      
      <!-- 
        This is the background pattern container.
        It sits at z-0, on top of the gradient.
      -->
      <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        
        <!-- 
          NEW: Scattering multiple icons instead of a grid.
          We use the `pokeballPattern` computed property for the image
          but add size, no-repeat, and transform classes here.
        -->
        <div 
          class="absolute -top-8 -left-12 w-32 h-32 opacity-[.14] dark:opacity-[.03] transform rotate-12"
          :style="{ backgroundImage: pokeballPattern, backgroundRepeat: 'no-repeat', backgroundSize: 'contain' }"
        ></div>
        <div 
          class="absolute top-1/3 -left-20 w-48 h-48 opacity-[.13] dark:opacity-[.02] transform -rotate-45"
          :style="{ backgroundImage: pokeballPattern, backgroundRepeat: 'no-repeat', backgroundSize: 'contain' }"
        ></div>
         <div 
          class="absolute top-1/4 -right-10 w-40 h-40 opacity-[.14] dark:opacity-[.03] transform rotate-45"
          :style="{ backgroundImage: pokeballPattern, backgroundRepeat: 'no-repeat', backgroundSize: 'contain' }"
        ></div>
        <div 
          class="absolute -bottom-10 left-1/3 w-32 h-32 opacity-[.15] dark:opacity-[.03] transform rotate-12"
          :style="{ backgroundImage: pokeballPattern, backgroundRepeat: 'no-repeat', backgroundSize: 'contain' }"
        ></div>
        <div 
          class="absolute -bottom-20 -right-12 w-48 h-48 opacity-[.14] dark:opacity-[.03] transform -rotate-12"
          :style="{ backgroundImage: pokeballPattern, backgroundRepeat: 'no-repeat', backgroundSize: 'contain' }"
        ></div>
         <div 
          class="absolute top-2/3 left-[40%] w-20 h-20 opacity-[.12] dark:opacity-[.02] transform rotate-12"
          :style="{ backgroundImage: pokeballPattern, backgroundRepeat: 'no-repeat', backgroundSize: 'contain' }"
        ></div>
        <div 
          class="absolute top-1/2 right-[30%] w-24 h-24 opacity-[.13] dark:opacity-[.02] transform rotate-12"
          :style="{ backgroundImage: pokeballPattern, backgroundRepeat: 'no-repeat', backgroundSize: 'contain' }"
        ></div>

      </div>

      <!-- 
        This is your content wrapper.
        It has `relative z-10` to sit on top of the pattern.
      -->
      <div class="relative z-10">
        <Navbar :is-dark="isDark" @toggle-dark="toggleDark" />
        
        <!-- 
          This is the main content area.
          It has *no horizontal padding* (px-).
        -->
        <main class="py-10">
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'; // Added 'computed'
import Navbar from './components/Navbar.vue';

const isDark = ref(false);
const year = new Date().getFullYear();

// NEW: Define the background pattern here, safely in JavaScript
const pokeballPattern = computed(() => {
  // SVG as a string. Note I've removed optional self-closing slashes
  // and used #000 for stroke color, which is cleaner.
  const svg = `<svg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'><circle cx='20' cy='20' r='18' fill='none' stroke='#000' stroke-width='1.5'></circle><line x1='2' y1='20' x2='38' y2='20' stroke='#000' stroke-width='1.5'></line><circle cx='20' cy='20' r='6' fill='none' stroke='#000' stroke-width='1.5'></circle></svg>`;
  
  // encodeURIComponent is the 100% correct way to encode this
  const encodedSvg = encodeURIComponent(svg);

  // Return the full, safe URL string
  return `url("data:image/svg+xml,${encodedSvg}")`;
});

const applyThemeClass = (dark) => {
  const root = document.documentElement;
  if (dark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

// FIX: Corrected the syntax error from `()_ =>` to `() =>`
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

