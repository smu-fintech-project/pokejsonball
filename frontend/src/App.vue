<template>
  <div class="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900">
    <Navbar />
    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <router-view />
    </main>
    <footer class="border-t mt-12">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-sm text-gray-500 flex justify-between">
        <div>© {{ new Date().getFullYear() }} PokeJsonBall</div>
        <div>Built by ❤️ • Elroy, Ye Zhan, Wen Bao, Dao Jun & Marcus

</div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue';
</script>
