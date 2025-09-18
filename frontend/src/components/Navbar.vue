<template>
  <header class="bg-white/60 backdrop-blur sticky top-0 z-30 border-b">
    <div class="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
          PJ
        </div>
        <div>
          <router-link to="/" class="text-lg font-semibold">PokeJsonBall</router-link>
          <div class="text-xs text-gray-400">Pokémon & One Piece cards • SG</div>
        </div>
      </div>

      <nav class="flex items-center space-x-3">
        <router-link to="/" class="px-3 py-2 rounded hover:bg-gray-100">Marketplace</router-link>
        <router-link to="/profile" class="px-3 py-2 rounded hover:bg-gray-100">My Profile</router-link>
        <router-link to="/login" class="px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">Login</router-link>
      </nav>
    </div>
  </header>
</template>
