<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between bg-white p-4 rounded-2xl shadow">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-400 text-white flex items-center justify-center font-bold text-xl">
          {{ initials }}
        </div>
        <div>
          <div class="font-semibold text-lg">{{ name }}</div>
          <div class="text-sm text-gray-500">{{ email }}</div>
        </div>
      </div>

      <div class="flex gap-2">
        <button @click="logout" class="px-4 py-2 border rounded-lg">Logout</button>
        <button class="px-4 py-2 bg-indigo-600 text-white rounded-lg">Edit Profile</button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="col-span-2 space-y-4">
        <div class="bg-white rounded-2xl p-4 shadow">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold">My Portfolio</h3>
            <button class="text-sm border px-2 py-1 rounded">Add card</button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <ListingCard v-for="c in portfolio" :key="c.id" v-bind="c" />
          </div>
        </div>

        <div class="bg-white rounded-2xl p-4 shadow">
          <h3 class="font-semibold mb-3">Trade history</h3>
          <ul class="space-y-3 text-sm text-gray-600">
            <li v-for="t in trades" :key="t.id" class="flex justify-between">
              <div>{{ t.item }}</div>
              <div class="text-right">
                <div class="font-medium">S$ {{ t.price }}</div>
                <div class="text-xs text-gray-400">{{ t.date }}</div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <aside class="space-y-4">
        <div class="bg-white rounded-2xl p-4 shadow">
          <h4 class="font-semibold mb-2">Reputation</h4>
          <div class="text-3xl font-bold">4.8</div>
          <div class="text-sm text-gray-500">Based on 24 trades</div>
        </div>

        <div class="bg-white rounded-2xl p-4 shadow">
          <h4 class="font-semibold mb-2">Quick actions</h4>
          <div class="flex flex-col gap-2">
            <button class="py-2 px-3 border rounded">Create listing</button>
            <button class="py-2 px-3 border rounded">View messages</button>
            <button class="py-2 px-3 border rounded">KYC status</button>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import ListingCard from '../components/ListingCard.vue';
import { ref } from 'vue';
const name = ref('Jonah Koh');
const email = ref(localStorage.getItem('userEmail') || 'you@example.com');
const initials = ref(name.value.split(' ').map(n=>n[0]).slice(0,2).join(''));

const portfolio = [
  { id: 1, img: 'https://images.pokemontcg.io/base1/4_hires.png', title: 'Pikachu VMax', price: '120.00', lastSold: '115.00', rarity: 'Ultra Rare', set: 'Sword & Shield' },
  { id: 2, img: 'https://images.pokemontcg.io/base1/5_hires.png', title: 'Charizard Holo', price: '450.00', lastSold: '430.00', rarity: 'Secret', set: 'Base Set' },
  { id: 3, img: 'https://images.pokemontcg.io/base1/6_hires.png', title: 'Bulbasaur', price: '25.00', lastSold: '20.00', rarity: 'Common', set: 'Base Set' },
];

const trades = [
  { id: 1, item: 'Sold Pikachu VMax', price: '120.00', date: '2025-09-15' },
  { id: 2, item: 'Bought Bulbasaur', price: '25.00', date: '2025-08-31' },
];

function logout(){
  localStorage.removeItem('token');
  localStorage.removeItem('userEmail');
  window.location.href = '/';
}
</script>
