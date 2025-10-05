<template>
  <section class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
      <img :src="card.img" alt="card" class="w-full h-96 object-contain bg-gray-50 dark:bg-slate-700 rounded-xl p-4" />
      <div class="mt-3 flex items-center gap-3 text-sm text-gray-500 dark:text-slate-400">
        <span class="px-2 py-1 rounded bg-gray-100 dark:bg-slate-700">{{ card.rarity }}</span>
        <span>{{ card.set }}</span>
        <span>#{{ card.id }}</span>
      </div>
    </div>

    <div class="space-y-6">
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
        <h1 class="text-2xl font-bold">{{ card.title }}</h1>
        <div class="mt-4 flex items-end gap-6">
          <div>
            <div class="text-3xl font-extrabold">S$ {{ card.price }}</div>
            <div class="text-xs text-gray-500 dark:text-slate-400">Last sold S$ {{ card.lastSold }}</div>
          </div>
          <div class="ml-auto flex gap-2">
            <button class="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">Buy</button>
            <button class="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Sell</button>
            <button class="px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-sm">Trade</button>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold">Pricing history</h2>
          <div class="flex gap-1 text-xs">
            <button v-for="r in ranges" :key="r" @click="range=r" class="px-2 py-1 rounded border border-gray-200 dark:border-slate-700" :class="{ 'bg-gray-100 dark:bg-slate-700': range===r }">{{ r }}</button>
          </div>
        </div>
        <div class="h-56 rounded-lg bg-gray-50 dark:bg-slate-700 flex items-end gap-2 p-4">
          <div v-for="(p,i) in displayedPrices" :key="i" class="bg-pj-purple/70 dark:bg-pj-pink/70 w-full" :style="{ height: `${p}px` }"></div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 class="font-semibold mb-3">Condition</h3>
          <div class="flex flex-wrap gap-2 text-sm">
            <button v-for="c in conditions" :key="c" @click="condition=c" class="px-3 py-1 rounded border border-gray-200 dark:border-slate-700" :class="{ 'bg-gray-100 dark:bg-slate-700': condition===c }">{{ c }}</button>
          </div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 class="font-semibold mb-3">Seller ratings</h3>
          <div class="flex items-center gap-2">
            <div class="text-yellow-500">★★★★★</div>
            <div class="text-sm text-gray-500 dark:text-slate-400">4.8 (128 reviews)</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const id = route.params.id; // treat as cert_number for backend

const card = ref({ id, img: '', title: '', price: null, lastSold: null, rarity: '', set: '' });
const loading = ref(true);
const error = ref(null);

async function loadCard() {
  loading.value = true;
  error.value = null;
  try {
    const resp = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/cards/${encodeURIComponent(id)}`);
    if (!resp.ok) throw new Error(`Fetch failed (${resp.status})`);
    const data = await resp.json();
    card.value = {
      id,
      img: data.image_url,
      title: data.psa?.cardName || data.tcg?.name || 'Card',
      price: data.last_known_price,
      lastSold: data.last_known_price,
      rarity: data.tcg?.rarity || '—',
      set: data.psa?.setName || data.tcg?.set?.name || '—'
    };
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}

onMounted(loadCard);

const ranges = ['7D','1M','3M','1Y'];
const range = ref('1M');
const base = [20, 40, 25, 60, 45, 80, 55, 70, 30, 50, 65, 90];
const displayedPrices = computed(() => {
  const multiplier = range.value === '7D' ? 0.6 : range.value === '1M' ? 1 : range.value === '3M' ? 1.5 : 2;
  return base.map(v => Math.min(200, Math.round(v * multiplier)));
});

const conditions = ['Mint', 'Near Mint', 'Lightly Played', 'Moderately Played', 'Heavily Played'];
const condition = ref('Near Mint');
</script>

