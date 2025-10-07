<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
    <div class="max-w-7xl mx-auto px-4 py-8 space-y-6">

      <!-- Profile Header -->
      <div class="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="flex items-center gap-6">
            <div class="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <User class="w-12 h-12 text-white" />
            </div>
            <div class="text-white">
              <h1 class="text-3xl font-black mb-2">{{ userProfile.name }}</h1>
              <div class="flex items-center gap-2 text-white/80 mb-1">
                <Mail class="w-4 h-4" />
                <span>{{ userProfile.email }}</span>
              </div>
              <div class="flex items-center gap-2 text-white/80">
                <Clock class="w-4 h-4" />
                <span>Member since {{ userProfile.joinDate }}</span>
              </div>
            </div>
          </div>

<div class="flex gap-4">
  <!-- Total Cards Stat -->
  <div class="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-2xl px-6 py-4">
    <div class="flex items-center gap-2 text-white/80 text-sm mb-1">
      <Package class="w-6 h-6" />
      <div class="text-base font-black text-white">Total Cards</div>
    </div>
    <div class="flex items-center justify-center">
      <div class="text-3xl font-black text-white">{{ totalCards }}</div>
    </div>
  </div>

  <!-- Portfolio Value Stat -->
  <div class="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-2xl px-6 py-4">
    <div class="flex items-center gap-2 text-white/80 text-sm mb-1">
      <DollarSign class="w-6 h-6" />
      <div class="text-base font-black text-white">Portfolio Value</div>
    </div>
    <div class="flex items-center justify-center">
      <div class="text-3xl font-black text-yellow-300">S${{ portfolioValue.toFixed(2) }}</div>
    </div>
  </div>
</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
        <div class="flex border-b dark:border-slate-700">
          <button @click="activeTab = 'collection'" :class="[
            'flex-1 px-6 py-4 font-semibold transition-all',
            activeTab === 'collection'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'
          ]">
            My Card Collection
          </button>
          <button @click="activeTab = 'transactions'" :class="[
            'flex-1 px-6 py-4 font-semibold transition-all',
            activeTab === 'transactions'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'
          ]">
            Trade History
          </button>
        </div>

        <!-- Collection Tab -->
        <div v-if="activeTab === 'collection'" class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold">Your Cards</h2>
            <button @click="showAddModal = true"
              class="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg">
              <Plus class="w-5 h-5" />
              Add Card
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div v-for="card in ownedCards" :key="card.id"
              class="group relative bg-white dark:bg-slate-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 overflow-hidden">
              <div
                class="relative p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-600 dark:to-slate-700">
                <img :src="card.img" :alt="card.title" class="w-full h-56 object-contain" />
                <div v-if="card.quantity > 1"
                  class="absolute top-2 left-2 px-3 py-1 bg-purple-500 text-white text-sm font-bold rounded-full">
                  x{{ card.quantity }}
                </div>
              </div>

              <div class="p-4">
                <div class="mb-3">
                  <h3 class="font-bold text-lg">{{ card.title }}</h3>
                  <p class="text-sm text-gray-500 dark:text-slate-400">{{ card.set }}</p>
                  <span
                    class="inline-block mt-2 px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-xs font-bold rounded-lg">
                    {{ card.grade }}
                  </span>
                </div>

                <div class="pt-3 border-t dark:border-slate-600 mb-3">
                  <p class="text-2xl font-black text-indigo-600">S${{ card.price }}</p>
                  <p class="text-xs text-gray-500">Added {{ card.dateAdded }}</p>
                </div>

                <div class="flex gap-2">
                  <button @click="openEditModal(card)"
                    class="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-slate-200 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-slate-500 transition-all">
                    <Edit2 class="w-4 h-4" />
                    Edit
                  </button>
                  <button @click="handleDeleteCard(card.id)"
                    class="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg font-semibold hover:bg-red-200 dark:hover:bg-red-800 transition-all">
                    <Trash2 class="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="ownedCards.length === 0" class="text-center py-12 text-gray-500 dark:text-slate-400">
            <Package class="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p class="text-lg font-semibold mb-2">No cards in your collection yet</p>
            <p class="text-sm">Start building your portfolio by adding your first card!</p>
          </div>
        </div>

        <!-- Transactions Tab -->
        <div v-if="activeTab === 'transactions'" class="p-6">
          <h2 class="text-2xl font-bold mb-6">Transaction History</h2>
          <div class="space-y-3">
            <div v-for="transaction in transactions" :key="transaction.id"
              class="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-600 transition-all">
              <div class="flex items-center gap-4">
                <div :class="[
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  transaction.type === 'purchase'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                    : 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300'
                ]">
                  <TrendingUp :class="[
                    'w-6 h-6',
                    transaction.type === 'purchase' ? 'rotate-180' : ''
                  ]" />
                </div>
                <div>
                  <p class="font-semibold">{{ transaction.card }}</p>
                  <p class="text-sm text-gray-500 dark:text-slate-400">{{ transaction.date }}</p>
                </div>
              </div>
              <div class="text-right">
                <p :class="[
                  'text-xl font-bold',
                  transaction.type === 'purchase' ? 'text-red-600' : 'text-green-600'
                ]">
                  {{ transaction.type === 'purchase' ? '-' : '+' }}S${{ transaction.amount }}
                </p>
                <span
                  class="inline-block px-2 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 text-xs font-semibold rounded">
                  {{ transaction.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Card Modal -->
      <div v-if="showAddModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold">Add New Card</h3>
            <button @click="showAddModal = false" class="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
              <X class="w-6 h-6" />
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold mb-2">Card Name</label>
              <input type="text" v-model="newCard.title"
                class="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-none dark:bg-slate-900"
                placeholder="e.g., Charizard Holo" />
            </div>

            <div>
              <label class="block text-sm font-semibold mb-2">Set</label>
              <input type="text" v-model="newCard.set"
                class="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-none dark:bg-slate-900"
                placeholder="e.g., Base Set" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold mb-2">Price (S$)</label>
                <input type="number" v-model="newCard.price"
                  class="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-none dark:bg-slate-900"
                  placeholder="0.00" />
              </div>
              <div>
                <label class="block text-sm font-semibold mb-2">Quantity</label>
                <input type="number" v-model.number="newCard.quantity"
                  class="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-none dark:bg-slate-900"
                  min="1" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold mb-2">PSA Grade</label>
              <select v-model="newCard.grade"
                class="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-none dark:bg-slate-900">
                <option value="PSA 10">PSA 10</option>
                <option value="PSA 9">PSA 9</option>
                <option value="PSA 8">PSA 8</option>
                <option value="Raw">Raw (Ungraded)</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold mb-2">Image URL</label>
              <input type="text" v-model="newCard.img"
                class="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-none dark:bg-slate-900"
                placeholder="https://..." />
            </div>

            <button @click="handleAddCard"
              class="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg">
              Add to Portfolio
            </button>
          </div>
        </div>
      </div>

      <!-- Edit Card Modal -->
      <div v-if="showEditModal && editingCard"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold">Edit Card</h3>
            <button @click="showEditModal = false" class="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
              <X class="w-6 h-6" />
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold mb-2">Card Name</label>
              <input type="text" v-model="editingCard.title"
                class="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-none dark:bg-slate-900" />
            </div>

            <div>
              <label class="block text-sm font-semibold mb-2">Set</label>
              <input type="text" v-model="editingCard.set"
                class="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-none dark:bg-slate-900" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold mb-2">Price (S$)</label>
                <input type="number" v-model="editingCard.price"
                  class="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-none dark:bg-slate-900" />
              </div>
              <div>
                <label class="block text-sm font-semibold mb-2">Quantity</label>
                <input type="number" v-model.number="editingCard.quantity"
                  class="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-none dark:bg-slate-900"
                  min="1" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold mb-2">PSA Grade</label>
              <select v-model="editingCard.grade"
                class="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-none dark:bg-slate-900">
                <option value="PSA 10">PSA 10</option>
                <option value="PSA 9">PSA 9</option>
                <option value="PSA 8">PSA 8</option>
                <option value="Raw">Raw (Ungraded)</option>
              </select>
            </div>

            <button @click="handleEditCard"
              class="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import {
  User,
  Mail,
  Clock,
  TrendingUp,
  Package,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  X
} from 'lucide-vue-next'

// User profile data - removed totalCards and portfolioValue
const userProfile = ref({
  name: 'Alex Chen',
  email: 'alex.chen@email.com',
  joinDate: 'Jan 2025'
})

// User's card collection
const ownedCards = ref([
  { id: 1, img: 'https://images.pokemontcg.io/base1/4_hires.png', title: 'Charizard Holo', price: '450.00', quantity: 1, grade: 'PSA 9', set: 'Base Set', dateAdded: '15 Dec 2024' },
  { id: 2, img: 'https://images.pokemontcg.io/base1/58_hires.png', title: 'Pikachu', price: '85.00', quantity: 2, grade: 'PSA 10', set: 'Base Set', dateAdded: '20 Dec 2024' },
  { id: 3, img: 'https://images.pokemontcg.io/base1/2_hires.png', title: 'Blastoise Holo', price: '280.00', quantity: 1, grade: 'PSA 8', set: 'Base Set', dateAdded: '28 Dec 2024' },
  { id: 4, img: 'https://images.pokemontcg.io/base1/15_hires.png', title: 'Venusaur Holo', price: '320.00', quantity: 1, grade: 'PSA 9', set: 'Base Set', dateAdded: '5 Jan 2025' },
])

// Calculate total cards dynamically (sum of all quantities)
const totalCards = computed(() => {
  return ownedCards.value.reduce((total, card) => total + card.quantity, 0)
})

// Calculate portfolio value dynamically
const portfolioValue = computed(() => {
  return ownedCards.value.reduce((total, card) => {
    return total + (parseFloat(card.price) * card.quantity)
  }, 0)
})



// Transaction history HARD-CODED
const transactions = ref([
  { id: 1, type: 'purchase', card: 'Charizard Holo', amount: 450.00, date: '15 Dec 2024', status: 'completed' },
  { id: 2, type: 'purchase', card: 'Pikachu (x2)', amount: 170.00, date: '20 Dec 2024', status: 'completed' },
  { id: 3, type: 'sale', card: 'Mewtwo Holo', amount: 195.00, date: '22 Dec 2024', status: 'completed' },
  { id: 4, type: 'purchase', card: 'Blastoise Holo', amount: 280.00, date: '28 Dec 2024', status: 'completed' },
])

// UI state
const showAddModal = ref(false)
const showEditModal = ref(false)
const editingCard = ref(null)
const activeTab = ref('collection')

// New card form 
const newCard = reactive({
  title: '',
  price: '',
  quantity: 1,
  grade: 'PSA 10',
  set: '',
  img: ''
})

// Add new card to portfolio 
const handleAddCard = () => {
  if (!newCard.title || !newCard.price) return

  const cardToAdd = {
    id: Date.now(),
    ...newCard,
    dateAdded: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  // TODO: API call would go here
  // await fetch('/api/cards', { method: 'POST', body: JSON.stringify(cardToAdd) })

  ownedCards.value.push(cardToAdd)
  showAddModal.value = false

  // Reset form
  Object.assign(newCard, {
    title: '',
    price: '',
    quantity: 1,
    grade: 'PSA 10',
    set: '',
    img: ''
  })
}

// Edit existing card
const handleEditCard = () => {
  if (!editingCard.value) return

  // TODO: API call would go here
  // await fetch(`/api/cards/${editingCard.value.id}`, { method: 'PUT', body: JSON.stringify(editingCard.value) })

  const index = ownedCards.value.findIndex(card => card.id === editingCard.value.id)
  if (index !== -1) {
    ownedCards.value[index] = { ...editingCard.value }
  }

  showEditModal.value = false
  editingCard.value = null
}

// Delete card from portfolio
const handleDeleteCard = (id) => {
  if (!confirm('Are you sure you want to remove this card from your portfolio?')) return

  // TODO: API call would go here
  // await fetch(`/api/cards/${id}`, { method: 'DELETE' })

  ownedCards.value = ownedCards.value.filter(card => card.id !== id)
}

// Open edit modal with card data
const openEditModal = (card) => {
  editingCard.value = { ...card }
  showEditModal.value = true
}
</script>

<style scoped>
/* Additional custom styles if needed */
</style>