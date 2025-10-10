<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
    <div class="max-w-7xl mx-auto px-4 py-8 space-y-8">

      <!-- 3D Pokeball Hero Section -->
      <section class="relative overflow-hidden bg-[radial-gradient(circle_at_center,_#e5e7eb_0%,_#dfe3e8_30%,_#ffffff_100%)] dark:bg-[radial-gradient(circle_at_center,_#0f172a_0%,_#1e293b_100%)] rounded-3xl p-8 md:p-12 shadow-2xl">
         
        <div class="text-center">
          <!-- 3D Pokeball Canvas -->
          <div ref="canvasContainer" class="w-full h-80 mb-8 cursor-grab active:cursor-grabbing">
            <canvas ref="canvas" class="w-full h-full"></canvas>
          </div>
          
          <h1 class="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span class="inline-block hover:scale-110 transition-transform text-gray-900 dark:text-white">Catch</span>
            <span class="inline-block hover:scale-110 transition-transform text-red-500"> 'Em</span>
            <br />
            <span class="inline-block hover:scale-110 transition-transform text-yellow-500">All</span>
            <span class="inline-block hover:scale-110 transition-transform text-gray-900 dark:text-white"> Again</span>
          </h1>
          
          <p class="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join Singapore's newest & most trusted pokemon community. <br />Live prices, PSA-graded cards, and secure P2P trading guaranteed!
          </p>
          
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button @click="scrollToFeatured" class="px-8 py-4 bg-red-500 text-white rounded-full font-bold text-lg hover:bg-red-600 transition-all shadow-xl hover:shadow-2xl hover:scale-105">
              Begin Adventure →
            </button>
            <router-link to="/login" class="px-8 py-4 bg-white text-gray-900 rounded-full font-bold text-lg hover:bg-gray-50 transition-all shadow-lg border-2 border-gray-200">
              Login / Sign Up
            </router-link>
          </div>
        </div>
      </section>

      <!-- Search & Filters -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1 relative">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search for Pikachu, Charizard..." v-model="searchTerm"
              class="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-none dark:bg-slate-900" />
          </div>
          <button @click="showFilters = !showFilters"
            class="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all">
            <Filter class="w-5 h-5" />
            Filters
          </button>
        </div>

        <div v-if="showFilters" class="mt-6 pt-6 border-t dark:border-slate-700 grid md:grid-cols-2 gap-6">
          <div>
            <div>
              <label class="block text-m font-semibold mb-3">Price Range</label>
              <div class="flex gap-2 items-center">
                <input type="number" min="0" max="1000" v-model.number="priceRange[0]"
                  class="w-20 px-2 py-1 border rounded" />
                <span>-</span>
                <input type="number" min="0" max="1000" v-model.number="priceRange[1]"
                  class="w-20 px-2 py-1 border rounded" />
              </div>
              <p class="text-sm text-gray-500 mt-1">Selected: S${{ priceRange[0] }} - S${{ priceRange[1] }}</p>
            </div>
          </div>
          <div>
            <label class="block text-m font-semibold mb-3 mr-10">PSA Grade</label>
            <div class="relative">
              <select v-model="selectedGrade"
                class="w-full px-3 py-3 pr-10 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-none dark:bg-slate-900 appearance-none">
                <option value="all">All Grades</option>
                <option value="PSA 10">PSA 10</option>
                <option value="PSA 9">PSA 9</option>
                <option value="PSA 8">PSA 8</option>
              </select>

              <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

 <!-- Quick Filters -->
<div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
  <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
    <Star class="w-5 h-5 text-yellow-500" />
    Quick Filters
  </h3>
  <div class="flex gap-2 flex-wrap">
    <button 
      v-for="(filter, idx) in quickFilters" 
      :key="idx" 
      @click="filter.action"
      :class="[
        'px-4 py-2 border-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
        filterStates[filter.label] 
          ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg' 
          : 'border-indigo-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:border-indigo-400 text-gray-700 dark:text-gray-300'
      ]"
    >
      <CheckCircle v-if="filterStates[filter.label]" class="w-4 h-4" />
      {{ filter.label }}
    </button>
  </div>
</div>
      
      <!-- Watchlist feature -->
      <div v-if="watchlist.length > 0"
        class="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl p-6 shadow-lg border-2 border-red-200 dark:border-red-800">
        <h3 class="font-bold text-lg mb-2 flex items-center gap-2">
          <Heart class="w-5 h-5 text-red-500 fill-current" />
          Your Watchlist
        </h3>
        <p class="text-sm text-gray-600 dark:text-slate-300">
          You're watching {{ watchlist.length }} card{{ watchlist.length !== 1 ? 's' : '' }}.
        </p>
      </div>

      <!-- Featured Cards -->
      <div>
        <div class="flex items-center justify-between mb-6">
          <h2 id="featured-cards" class="text-2xl font-bold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"></svg>
            Featured PSA-Certified Cards
            <span class="text-sm font-normal text-gray-500">({{ filteredCards.length }} cards)</span>
          </h2>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p class="mt-4 text-gray-600 dark:text-slate-400">Loading cards from database...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="loadError" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
          <p class="text-red-600 dark:text-red-400 font-semibold mb-2">⚠️ {{ loadError }}</p>
          <p class="text-sm text-gray-600 dark:text-slate-400">Make sure your backend is running on port 3001</p>
          <button @click="loadFeaturedCards" class="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">
            Retry
          </button>
        </div>

        <!-- Cards Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="card in filteredCards" :key="card.id"
            class="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 overflow-hidden">
            <div class="relative p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-800">
              <button @click="toggleWatchlist(card.id)"
                class="absolute top-2 right-2 z-10 p-2 rounded-full backdrop-blur-sm transition-all" :class="watchlist.includes(card.id)
                  ? 'bg-red-500 text-white'
                  : 'bg-white/80 text-gray-600 hover:bg-red-50'">
                <Heart class="w-5 h-5" :class="watchlist.includes(card.id) ? 'fill-current' : ''" />
              </button>
              <img :src="card.img" :alt="card.title" class="w-full h-56 object-contain" />
            </div>

            <div class="p-4">
              <div class="flex items-start justify-between mb-2">
                <div>
                  <h3 class="font-bold text-lg">{{ card.title }}</h3>
                  <p class="text-sm text-gray-500 dark:text-slate-400">{{ card.set }}</p>
                </div>
                <span
                  class="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-xs font-bold rounded-lg">
                  {{ card.rarity }}
                </span>
              </div>

              <div class="flex items-center justify-between pt-3 border-t dark:border-slate-700">
                <div>
                  <p class="text-2xl font-black text-indigo-600">S${{ card.price }}</p>
                  <p class="text-xs text-gray-500">Last: S${{ card.lastSold }}</p>
                </div>
                <button @click="openCardModal(card)"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all">
                  View
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Card Detail Modal -->
    <div v-if="selectedCard" @click="closeModal" 
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div @click.stop class="bg-white dark:bg-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 flex items-center justify-between z-10">
          <h2 class="text-2xl font-black text-white">Card Details</h2>
          <button @click="closeModal" class="p-2 hover:bg-white/20 rounded-lg transition-all">
            <X class="w-6 h-6 text-white" />
          </button>
        </div>

        <div class="p-6 md:p-8">
          <div class="grid md:grid-cols-2 gap-8">
            <!-- Card Image -->
            <div class="relative">
              <div class="sticky top-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-800 rounded-2xl p-6 shadow-lg">
                <img :src="selectedCard.img" :alt="selectedCard.title" class="w-full object-contain max-h-96" />
              </div>
            </div>

            <!-- Card Information -->
            <div class="space-y-6">
              <!-- Basic Info -->
              <div>
                <div class="flex items-start justify-between mb-2">
                  <div>
                    <h3 class="text-3xl font-black mb-1">{{ selectedCard.title }}</h3>
                    <p class="text-lg text-gray-500 dark:text-slate-400">{{ selectedCard.set }}</p>
                  </div>
                  <span class="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-sm font-bold rounded-lg">
                    {{ selectedCard.rarity }}
                  </span>
                </div>
              </div>

              <!-- Price Section -->
              <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800">
                <p class="text-sm text-gray-600 dark:text-slate-400 mb-1">Current Price</p>
                <p class="text-4xl font-black text-green-600 mb-2">S${{ selectedCard.price }}</p>
                <p class="text-sm text-gray-500">Last sold: S${{ selectedCard.lastSold }}</p>
              </div>

              <!-- TODO: REPLACE WITH REAL API DATA FROM POKEMON TCG API -->
              <!-- API Integration Point: Fetch card details from https://api.pokemontcg.io/v2/cards/{id} -->
              <div class="space-y-4">
                <h4 class="font-bold text-lg">Card Information</h4>
                
                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                    <p class="text-xs text-gray-500 dark:text-slate-400 mb-1">Type</p>
                    <p class="font-semibold">{{ selectedCard.apiData?.types?.join(', ') || 'Fire' }}</p>
                  </div>
                  <div class="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                    <p class="text-xs text-gray-500 dark:text-slate-400 mb-1">HP</p>
                    <p class="font-semibold">{{ selectedCard.apiData?.hp || '120' }}</p>
                  </div>
                  <div class="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                    <p class="text-xs text-gray-500 dark:text-slate-400 mb-1">Rarity</p>
                    <p class="font-semibold">{{ selectedCard.apiData?.rarity || 'Holo Rare' }}</p>
                  </div>
                  <div class="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                    <p class="text-xs text-gray-500 dark:text-slate-400 mb-1">Artist</p>
                    <p class="font-semibold">{{ selectedCard.apiData?.artist || 'Ken Sugimori' }}</p>
                  </div>
                </div>

                <!-- Attacks/Abilities -->
                <div v-if="selectedCard.apiData?.attacks" class="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                  <p class="text-sm font-bold mb-3">Attacks</p>
                  <div v-for="(attack, idx) in selectedCard.apiData.attacks" :key="idx" class="mb-2 last:mb-0">
                    <p class="font-semibold">{{ attack.name }} - {{ attack.damage }}</p>
                    <p class="text-sm text-gray-600 dark:text-slate-400">{{ attack.text }}</p>
                  </div>
                </div>

                <!-- Seller Info -->
                <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-4 border-2 border-purple-200 dark:border-purple-800">
                  <p class="text-sm font-semibold mb-2">Seller Information</p>
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                      <User class="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p class="font-semibold">{{ selectedCard.sellerName || selectedCard.sellerEmail || 'Unknown Seller' }}</p>
                      <p class="text-sm text-gray-500">⭐ 4.9 ({{ selectedCard.sellerRating || '156' }} reviews)</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-3 pt-4">
                <button @click="handleBuyCard" 
                  class="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg transform hover:scale-105">
                  Buy Now - S${{ selectedCard.price }}
                </button>
                <button @click="handleContactSeller"
                  class="px-6 py-4 bg-white dark:bg-slate-700 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-xl font-semibold hover:bg-indigo-50 dark:hover:bg-slate-600 transition-all">
                  Contact Seller
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Heart, Search, Filter, TrendingUp, Star, X, User, CheckCircle } from "lucide-vue-next";

const scrollToFeatured = () => {
  const section = document.getElementById('featured-cards')
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' })
  }
}

// Three.js refs
const canvas = ref(null);
const canvasContainer = ref(null);

let scene, camera, renderer, pokeball, isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let rotationVelocity = { x: 0, y: 0 };

// State management
const sampleCards = ref([]);
const loading = ref(true);
const loadError = ref(null);
const watchlist = ref([]);
const searchTerm = ref('');
const priceRange = ref([0, 1000]);
const selectedGrade = ref('all');
const showFilters = ref(false);
const selectedCard = ref(null);

// Fetch cards from backend database
const loadFeaturedCards = async () => {
  loading.value = true;
  loadError.value = null;
  
  try {
    const myEmail = localStorage.getItem('userEmail');
    
    const resp = await fetch(`http://localhost:3001/api/cards?excludeEmail=${encodeURIComponent(myEmail)}`);
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
    }
    
    const cards = await resp.json();
    
    if (cards.length > 0) {
      console.log(`Loaded ${cards.length} cards from backend database`);
      
      // Map database cards to display format
      sampleCards.value = cards.map(c => ({
        id: c.cert_number,
        img: c.image_url, // PSA certified card image
        title: c.card_name,
        price: c.last_sale_price || '0.00',
        lastSold: c.last_sale_price || '0.00',
        rarity: `PSA ${c.psa_grade}`,
        set: c.set_name || 'Unknown Set',
        sellerName: c?.sellerName || c?.sellerEmail || 'Unknown Seller',
        sellerId: c?.sellerId || null,
        sellerRating: '156'
      })).filter(card => card.img); // Only show cards with images
      
      console.log(`Displaying ${sampleCards.value.length} PSA-certified cards`);
    } else {
      loadError.value = 'No cards found in database. Please sync cards first.';
    }
  } catch (e) {
    console.error('Failed to load cards from backend:', e.message);
    loadError.value = 'Unable to load cards. Please check if the backend is running.';
  } finally {
    loading.value = false;
  }
};

// Three.js initialization
function initThreeJS() {
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  script.onload = () => {
    setupScene();
  };
  document.head.appendChild(script);
}

function setupScene() {
  const THREE = window.THREE;
  
  // Scene
  scene = new THREE.Scene();
  
  // Camera
  const container = canvasContainer.value;
  camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 5;
  
  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvas.value,
    antialias: true,
    alpha: true
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  
  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);
  
  const pointLight = new THREE.PointLight(0xffffff, 0.5);
  pointLight.position.set(-5, -5, 5);
  scene.add(pointLight);
  
  // Create Pokeball
  pokeball = new THREE.Group();
  
  // Top half (red)
  const topGeometry = new THREE.SphereGeometry(1, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
  const topMaterial = new THREE.MeshPhongMaterial({
    color: 0xef4444,
    shininess: 100
  });
  const topHalf = new THREE.Mesh(topGeometry, topMaterial);
  pokeball.add(topHalf);
  
  // Bottom half (white)
  const bottomGeometry = new THREE.SphereGeometry(1, 32, 32, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  const bottomMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    shininess: 100
  });
  const bottomHalf = new THREE.Mesh(bottomGeometry, bottomMaterial);
  pokeball.add(bottomHalf);
  
  // Black band
  const bandGeometry = new THREE.TorusGeometry(1, 0.08, 16, 100);
  const bandMaterial = new THREE.MeshPhongMaterial({
    color: 0x1f2937,
    shininess: 100
  });
  const band = new THREE.Mesh(bandGeometry, bandMaterial);
  band.rotation.x = Math.PI / 2;
  pokeball.add(band);
  
  // Center button
  const buttonGeometry = new THREE.CircleGeometry(0.25, 32);
  const buttonMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    shininess: 100
  });
  const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
  button.position.z = 1.01;
  pokeball.add(button);
  
  // Button border
  const buttonBorderGeometry = new THREE.RingGeometry(0.25, 0.32, 32);
  const buttonBorderMaterial = new THREE.MeshPhongMaterial({
    color: 0x1f2937,
    shininess: 100
  });
  const buttonBorder = new THREE.Mesh(buttonBorderGeometry, buttonBorderMaterial);
  buttonBorder.position.z = 1.02;
  pokeball.add(buttonBorder);
  
  scene.add(pokeball);
  
  // Mouse events
  canvas.value.addEventListener('mousedown', onMouseDown);
  canvas.value.addEventListener('mousemove', onMouseMove);
  canvas.value.addEventListener('mouseup', onMouseUp);
  canvas.value.addEventListener('mouseleave', onMouseUp);
  
  // Touch events
  canvas.value.addEventListener('touchstart', onTouchStart);
  canvas.value.addEventListener('touchmove', onTouchMove);
  canvas.value.addEventListener('touchend', onTouchEnd);
}

function onMouseDown(e) {
  isDragging = true;
  previousMousePosition = { x: e.clientX, y: e.clientY };
}

function onMouseMove(e) {
  if (!isDragging || !pokeball) return;
  
  const deltaX = e.clientX - previousMousePosition.x;
  const deltaY = e.clientY - previousMousePosition.y;
  
  rotationVelocity.x = deltaY * 0.01;
  rotationVelocity.y = deltaX * 0.01;
  
  pokeball.rotation.x += rotationVelocity.x;
  pokeball.rotation.y += rotationVelocity.y;
  
  previousMousePosition = { x: e.clientX, y: e.clientY };
}

function onMouseUp() {
  isDragging = false;
}

function onTouchStart(e) {
  isDragging = true;
  const touch = e.touches[0];
  previousMousePosition = { x: touch.clientX, y: touch.clientY };
}

function onTouchMove(e) {
  if (!isDragging || !pokeball) return;
  
  const touch = e.touches[0];
  const deltaX = touch.clientX - previousMousePosition.x;
  const deltaY = touch.clientY - previousMousePosition.y;
  
  rotationVelocity.x = deltaY * 0.01;
  rotationVelocity.y = deltaX * 0.01;
  
  pokeball.rotation.x += rotationVelocity.x;
  pokeball.rotation.y += rotationVelocity.y;
  
  previousMousePosition = { x: touch.clientX, y: touch.clientY };
}

function onTouchEnd() {
  isDragging = false;
}

function animate() {
  requestAnimationFrame(animate);
  
  if (pokeball && !isDragging) {
    // Auto-rotate slowly
    pokeball.rotation.y += 0.005;
    
    // Apply damping to rotation velocity
    rotationVelocity.x *= 0.95;
    rotationVelocity.y *= 0.95;
  }
  
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

function onWindowResize() {
  if (!camera || !renderer || !canvasContainer.value) return;
  
  const container = canvasContainer.value;
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

// Load cards on component mount
onMounted(() => {
  loadFeaturedCards();
  initThreeJS();
  animate();
  window.addEventListener('resize', onWindowResize);
});

// Cleanup on unmount
onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize);
  if (renderer) {
    renderer.dispose();
  }
});

function toggleWatchlist(id) {
  if (watchlist.value.includes(id)) {
    watchlist.value = watchlist.value.filter(i => i !== id);
  } else {
    watchlist.value.push(id);
  }
}

// TODO: INTEGRATE WITH POKEMON TCG API
// Function to fetch card details from API
async function fetchCardDetails(card) {
  // Example API integration point:
  // const response = await fetch(`https://api.pokemontcg.io/v2/cards?q=name:"${card.title}"`);
  // const data = await response.json();
  // return data.data[0]; // Returns full card data including attacks, abilities, etc.
  
  // For now, return mock data
  return {
    types: ['Fire'],
    hp: '120',
    rarity: 'Holo Rare',
    artist: 'Ken Sugimori',
    attacks: [
      { name: 'Fire Blast', damage: '100', text: 'Discard an Energy card attached to Charizard.' }
    ]
  };
}

async function openCardModal(card) {
  selectedCard.value = card;
  
  // TODO: Uncomment and implement when backend is ready
  // const apiData = await fetchCardDetails(card);
  // selectedCard.value.apiData = apiData;
}

function closeModal() {
  selectedCard.value = null;
}

// TODO: CONNECT TO YOUR BACKEND FOR PURCHASE FLOW
function handleBuyCard() {
  // Integrate with your backend payment/transaction system
  alert(`Initiating purchase for ${selectedCard.value.title} at S$${selectedCard.value.price}`);
  // Example: router.push({ name: 'checkout', params: { cardId: selectedCard.value.id } });
}

// TODO: CONNECT TO YOUR MESSAGING SYSTEM
function handleContactSeller() {
  // Integrate with your messaging/chat system
  alert(`Opening chat with ${selectedCard.value.sellerName}`);
  // Example: router.push({ name: 'messages', params: { sellerId: selectedCard.value.sellerId } });
}

const filteredCards = computed(() =>
  sampleCards.value.filter(card => {
    const matchesSearch = card.title.toLowerCase().includes(searchTerm.value.toLowerCase());
    const matchesPrice = parseFloat(card.price) >= priceRange.value[0] && parseFloat(card.price) <= priceRange.value[1];
    const matchesGrade = selectedGrade.value === 'all' || card.rarity.includes(selectedGrade.value);
    return matchesSearch && matchesPrice && matchesGrade;
  })
);

const activeQuickFilter = ref('')

const filterStates = ref({
  'Pikachu': false,
  'Charizard': false,
  'Under S$50': false,
  'PSA 10': false,
  'Legendary': false,
  'Reset': false
})

// Updated quickFilters with individual state tracking
const quickFilters = [
  { 
    label: 'Pikachu', 
    action: () => {
      searchTerm.value = 'Pikachu'
      filterStates.value['Pikachu'] = !filterStates.value['Pikachu']
      // Turn off other search-based filters
      filterStates.value['Charizard'] = false
      filterStates.value['Legendary'] = false
    }
  },
  { 
    label: 'Charizard', 
    action: () => {
      searchTerm.value = 'Charizard'
      filterStates.value['Charizard'] = !filterStates.value['Charizard']
      // Turn off other search-based filters
      filterStates.value['Pikachu'] = false
      filterStates.value['Legendary'] = false
    }
  },
  { 
    label: 'Under S$50', 
    action: () => {
      priceRange.value = filterStates.value['Under S$50'] ? [0, 1000] : [0, 50]
      filterStates.value['Under S$50'] = !filterStates.value['Under S$50']
    }
  },
  { 
    label: 'PSA 10', 
    action: () => {
      selectedGrade.value = filterStates.value['PSA 10'] ? 'all' : 'PSA 10'
      filterStates.value['PSA 10'] = !filterStates.value['PSA 10']
    }
  },
  { 
    label: 'Legendary', 
    action: () => {
      searchTerm.value = filterStates.value['Legendary'] ? '' : 'Mewtwo'
      filterStates.value['Legendary'] = !filterStates.value['Legendary']
      // Turn off other search-based filters
      filterStates.value['Pikachu'] = false
      filterStates.value['Charizard'] = false
    }
  },
  { 
    label: 'Reset', 
    action: () => {
      searchTerm.value = ''
      priceRange.value = [0, 1000]
      selectedGrade.value = 'all'
      // Reset all filter states
      Object.keys(filterStates.value).forEach(key => {
        filterStates.value[key] = false
      })
    }
  },
]

</script>