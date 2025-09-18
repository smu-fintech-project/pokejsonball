<template>
  <article class="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-4 flex flex-col">
    <div class="relative">
      <img :src="img" alt="card" class="w-full h-44 object-contain rounded-lg bg-gray-50 p-3" />
      <div class="absolute top-3 left-3 bg-white/80 px-2 py-1 rounded text-xs font-medium">{{ rarity }}</div>
    </div>

    <div class="mt-3 flex-1">
      <h3 class="font-semibold text-sm line-clamp-2">{{ title }}</h3>
      <p class="text-xs text-gray-500 mt-1">{{ set }}</p>
    </div>

    <div class="mt-4 flex items-center justify-between">
      <div>
        <div class="text-sm font-bold">S$ {{ price }}</div>
        <div class="text-xs text-gray-400">Last sold S$ {{ lastSold }}</div>
      </div>
      <button class="px-3 py-1 bg-emerald-500 text-white rounded-lg text-sm">Buy</button>
    </div>
  </article>
</template>

<script setup>
const props = defineProps({
  img: { type: String, default: '/placeholder-card.png' },
  title: { type: String, default: 'Pikachu V' },
  price: { type: [Number, String], default: '12.00' },
  lastSold: { type: [Number, String], default: '10.50' },
  rarity: { type: String, default: 'Rare' },
  set: { type: String, default: 'Base Set' },
});
</script>
