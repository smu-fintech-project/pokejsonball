<template>
  <section class="space-y-10">
    <!-- hero -->
    <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
      <div class="flex-1">
        <h1 class="text-3xl md:text-4xl font-extrabold leading-tight">Singapore’s community marketplace for Pokémon & One Piece cards.</h1>
        <p class="mt-4 text-gray-600 max-w-xl">Buy, sell and trade with trusted collectors. Live prices, verified listings and a friendly community to help you grow your collection.</p>

        <div class="mt-6 flex items-center gap-3">
          <router-link to="/profile" class="px-5 py-3 bg-indigo-600 text-white rounded-lg font-semibold">Start browsing</router-link>
          <router-link to="/login" class="px-4 py-3 border rounded-lg">Login / Signup</router-link>
        </div>

        <div class="mt-6 text-xs text-gray-400">Made for collectors in Singapore • P2P trades supported</div>
      </div>

      <div class="w-full md:w-96 grid grid-cols-2 gap-3">
        <div class="rounded-xl bg-white p-3 shadow">
          <img src="https://images.pokemontcg.io/base1/4_hires.png" alt="card" class="w-full h-36 object-contain" />
        </div>
        <div class="rounded-xl bg-white p-3 shadow">
          <img src="https://images.pokemontcg.io/base1/5_hires.png" alt="card" class="w-full h-36 object-contain" />
        </div>
        <div class="rounded-xl bg-white p-3 shadow">
          <img src="https://images.pokemontcg.io/base1/6_hires.png" alt="card" class="w-full h-36 object-contain" />
        </div>
        <div class="rounded-xl bg-white p-3 shadow">
          <img src="https://images.pokemontcg.io/base1/7_hires.png" alt="card" class="w-full h-36 object-contain" />
        </div>
      </div>
    </div>

    <!-- featured -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">Featured listings</h2>
        <button class="text-sm px-3 py-1 border rounded">View all</button>
      </div>

      <CardGrid>
        <ListingCard v-for="card in featured" :key="card.id" v-bind="card" />
      </CardGrid>
    </div>

    <!-- quick filters -->
    <div class="bg-white rounded-2xl p-4 shadow-sm">
      <h3 class="font-semibold mb-3">Quick filters</h3>
      <div class="flex gap-2 flex-wrap">
        <button class="px-3 py-1 border rounded text-sm">Pikachu</button>
        <button class="px-3 py-1 border rounded text-sm">Rare</button>
        <button class="px-3 py-1 border rounded text-sm">S$0 - S$50</button>
        <button class="px-3 py-1 border rounded text-sm">One Piece</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import CardGrid from '../components/CardGrid.vue';
import ListingCard from '../components/ListingCard.vue';

const featured = [
  { id: 1, img: 'https://images.pokemontcg.io/base1/4_hires.png', title: 'Pikachu VMax', price: '120.00', lastSold: '115.00', rarity: 'Ultra Rare', set: 'Sword & Shield' },
  { id: 2, img: 'https://images.pokemontcg.io/base1/5_hires.png', title: 'Charizard Holo', price: '450.00', lastSold: '430.00', rarity: 'Secret', set: 'Base Set' },
  { id: 3, img: 'https://images.pokemontcg.io/base1/6_hires.png', title: 'Bulbasaur', price: '25.00', lastSold: '20.00', rarity: 'Common', set: 'Base Set' },
  { id: 4, img: 'https://images.pokemontcg.io/base1/7_hires.png', title: 'Squirtle', price: '30.00', lastSold: '28.00', rarity: 'Uncommon', set: 'Base Set' },
];
</script>
