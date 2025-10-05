<template>
  <article class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-md transition p-4 flex flex-col">
    <div class="relative">
      <router-link :to="`/card/${id}`">
        <img :src="img" alt="card" class="w-full h-44 object-contain rounded-lg bg-gray-50 dark:bg-slate-700 p-3" />
      </router-link>
      <div class="absolute top-3 left-3 bg-white/80 dark:bg-slate-900/70 px-2 py-1 rounded text-xs font-medium">{{ rarity }}</div>
    </div>

    <div class="mt-3 flex-1">
      <router-link :to="`/card/${id}`" class="font-semibold text-sm line-clamp-2 hover:underline">{{ title }}</router-link>
      <p class="text-xs text-gray-500 dark:text-slate-400 mt-1">{{ set }}</p>
    </div>

    <div class="mt-4 flex items-center justify-between">
      <div>
        <div class="text-sm font-bold">S$ {{ price }}</div>
        <div class="text-xs text-gray-400 dark:text-slate-400">Last sold S$ {{ lastSold }}</div>
      </div>
      <router-link :to="`/card/${id}`" class="px-3 py-1 bg-emerald-500 text-white rounded-lg text-sm">Buy</router-link>
    </div>
  </article>
</template>

<script setup>
const props = defineProps({
  id: { type: [Number, String], default: 0 },
  img: { type: String, default: '/placeholder-card.png' },
  title: { type: String, default: 'Pikachu V' },
  price: { type: [Number, String], default: '12.00' },
  lastSold: { type: [Number, String], default: '10.50' },
  rarity: { type: String, default: 'Rare' },
  set: { type: String, default: 'Base Set' },
});
</script>
