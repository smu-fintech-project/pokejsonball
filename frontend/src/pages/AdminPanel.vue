<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-gradient-to-r from-red-600 to-red-500 shadow">
      <div class="max-w-7xl mx-auto px-4 py-6">
        <h1 class="text-3xl font-bold text-white flex items-center gap-3">
          <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd" />
          </svg>
          Admin Panel
        </h1>
        <p class="text-red-100 mt-1">Manage users, transactions, and community content</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="max-w-7xl mx-auto px-4 mt-6">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors'
            ]"
          >
            {{ tab.name }}
          </button>
        </nav>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Users Tab -->
      <div v-if="activeTab === 'users'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-bold text-gray-900">User Management</h2>
          <div class="text-sm text-gray-600">
            Total Users: <span class="font-semibold text-blue-600">{{ users.length }}</span>
          </div>
        </div>

        <!-- Users Table -->
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet Balance</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <img v-if="user.avatar" :src="`/api/cards/images/avatar/${user.avatar}`" class="h-10 w-10 rounded-full" @error="$event.target.src='/api/cards/images/avatar/pikachu.png'" />
                    <div v-else class="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold">
                      {{ user.name?.[0]?.toUpperCase() || '?' }}
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                      <div class="text-xs text-gray-500">ID: {{ user.id.substring(0, 8) }}...</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.email }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(user.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span class="font-semibold text-green-600">{{ user.wallet?.balance?.toFixed(2) || '0.00' }}</span> JSB
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="deleteUser(user)"
                    class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Transactions Tab -->
      <div v-if="activeTab === 'transactions'" class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-900">Transaction Statistics</h2>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="text-sm font-medium text-gray-500">Total Deposits</div>
            <div class="mt-2 text-3xl font-bold text-green-600">{{ transactionStats.summary.depositCount }}</div>
            <div class="text-sm text-gray-600 mt-1">{{ transactionStats.summary.totalDeposits.toFixed(2) }} JSB</div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="text-sm font-medium text-gray-500">Total Withdrawals</div>
            <div class="mt-2 text-3xl font-bold text-red-600">{{ transactionStats.summary.withdrawalCount }}</div>
            <div class="text-sm text-gray-600 mt-1">{{ transactionStats.summary.totalWithdrawals.toFixed(2) }} JSB</div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="text-sm font-medium text-gray-500">Net Flow</div>
            <div class="mt-2 text-3xl font-bold" :class="transactionStats.summary.netFlow >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ transactionStats.summary.netFlow >= 0 ? '+' : '' }}{{ transactionStats.summary.netFlow.toFixed(2) }}
            </div>
            <div class="text-sm text-gray-600 mt-1">JSB</div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="text-sm font-medium text-gray-500">Total Transactions</div>
            <div class="mt-2 text-3xl font-bold text-blue-600">
              {{ transactionStats.summary.depositCount + transactionStats.summary.withdrawalCount }}
            </div>
            <div class="text-sm text-gray-600 mt-1">All time</div>
          </div>
        </div>

        <!-- Chart -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Monthly Transaction Volume</h3>
          <div class="h-80" ref="chartContainer">
            <canvas ref="chartCanvas"></canvas>
          </div>
        </div>
      </div>

      <!-- Community Moderation Tab -->
      <div v-if="activeTab === 'moderation'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-bold text-gray-900">Community Moderation</h2>
          <div class="text-sm text-gray-600">
            Total Thoughts: <span class="font-semibold text-blue-600">{{ thoughts.length }}</span>
          </div>
        </div>

        <!-- Thoughts Log Table -->
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posted</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="thought in thoughts" :key="thought.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <img v-if="thought.authorAvatar" :src="`/api/cards/images/avatar/${thought.authorAvatar}`" class="h-8 w-8 rounded-full" @error="$event.target.src='/api/cards/images/avatar/pikachu.png'" />
                    <div v-else class="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                      {{ thought.authorName?.[0]?.toUpperCase() || '?' }}
                    </div>
                    <div class="ml-3">
                      <div class="text-sm font-medium text-gray-900">{{ thought.authorName }}</div>
                      <div class="text-xs text-gray-500">{{ thought.authorEmail }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900 font-medium max-w-md truncate">{{ thought.title }}</div>
                  <div class="text-xs text-gray-500 max-w-md truncate">{{ thought.body }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(thought.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div class="flex items-center gap-3">
                    <span class="flex items-center gap-1">
                      <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                      {{ thought.upvotes }}
                    </span>
                    <span class="flex items-center gap-1">
                      <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
                      </svg>
                      {{ thought.commentsCount }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex items-center gap-2">
                    <button
                      @click="viewThoughtDetail(thought)"
                      class="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
                    >
                      View
                    </button>
                    <button
                      @click="deleteThought(thought)"
                      class="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Messaging Tab -->
      <div v-if="activeTab === 'messaging'" class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-900">Broadcast Message</h2>

        <div class="bg-white shadow rounded-lg p-6">
          <div class="space-y-4">
            <!-- Target Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Target Recipients</label>
              <div class="space-y-2">
                <!-- Broadcast to All -->
                <label class="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    v-model="broadcastMode"
                    value="all"
                    class="text-blue-600 focus:ring-blue-500"
                  />
                  <span class="ml-3 text-sm font-medium text-gray-900">Broadcast to All Users</span>
                </label>

                <!-- Select Single User -->
                <label class="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    v-model="broadcastMode"
                    value="single"
                    class="text-blue-600 focus:ring-blue-500"
                  />
                  <span class="ml-3 text-sm font-medium text-gray-900">Send to Single User</span>
                </label>

                <!-- Select Multiple Users -->
                <label class="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    v-model="broadcastMode"
                    value="multiple"
                    class="text-blue-600 focus:ring-blue-500"
                  />
                  <span class="ml-3 text-sm font-medium text-gray-900">Send to Multiple Users</span>
                </label>
              </div>
            </div>

            <!-- Single User Selection -->
            <div v-if="broadcastMode === 'single'">
              <label class="block text-sm font-medium text-gray-700 mb-2">Select User</label>
              <select
                v-model="broadcastTarget"
                class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose a user...</option>
                <option v-for="user in users" :key="user.id" :value="user.id">
                  {{ user.name }} ({{ user.email }})
                </option>
              </select>
            </div>

            <!-- Multiple Users Selection -->
            <div v-if="broadcastMode === 'multiple'">
              <label class="block text-sm font-medium text-gray-700 mb-2">Select Users</label>
              <div class="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
                <label v-for="user in users" :key="user.id" class="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    :value="user.id"
                    v-model="selectedUsers"
                    class="text-blue-600 focus:ring-blue-500"
                  />
                  <div class="ml-3 flex items-center gap-2">
                    <img v-if="user.avatar" :src="`/api/cards/images/avatar/${user.avatar}`" class="h-6 w-6 rounded-full" @error="$event.target.src='/api/cards/images/avatar/pikachu.png'" />
                    <div v-else class="h-6 w-6 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-xs font-bold">
                      {{ user.name?.[0]?.toUpperCase() || '?' }}
                    </div>
                    <span class="text-sm font-medium text-gray-900">{{ user.name }}</span>
                    <span class="text-xs text-gray-500">({{ user.email }})</span>
                  </div>
                </label>
              </div>
              <div v-if="selectedUsers.length > 0" class="mt-2 text-sm text-blue-600">
                {{ selectedUsers.length }} user(s) selected
              </div>
            </div>

            <!-- Message Input -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                v-model="broadcastMessage"
                rows="4"
                class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your message..."
              ></textarea>
            </div>

            <!-- Send Button -->
            <button
              @click="sendBroadcast"
              :disabled="!canSendBroadcast || sendingBroadcast"
              class="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ sendingBroadcast ? 'Sending...' : 'Send Message' }}
            </button>
          </div>

          <!-- Broadcast History -->
          <div v-if="broadcastHistory.length > 0" class="mt-6 pt-6 border-t border-gray-200">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">Recent Messages</h3>
            <div class="space-y-2">
              <div v-for="(broadcast, idx) in broadcastHistory" :key="idx" class="text-sm p-3 bg-gray-50 rounded">
                <div class="font-medium text-gray-900">{{ broadcast.message }}</div>
                <div class="text-xs text-gray-500 mt-1">
                  Sent to {{ broadcast.targetName }} at {{ formatDate(broadcast.timestamp) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Thought Detail Modal -->
    <div v-if="showThoughtModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="closeThoughtModal">
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 class="text-xl font-bold text-gray-900">Thought Details</h3>
          <button @click="closeThoughtModal" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loadingThoughtDetail" class="px-6 py-12 text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p class="mt-4 text-gray-600">Loading thought details...</p>
        </div>

        <!-- Thought Content -->
        <div v-else-if="selectedThought" class="p-6">
          <!-- Author Info -->
          <div class="flex items-center gap-3 mb-4">
            <img v-if="selectedThought.authorAvatar" :src="`/api/cards/images/avatar/${selectedThought.authorAvatar}`" class="h-12 w-12 rounded-full" @error="$event.target.src='/api/cards/images/avatar/pikachu.png'" />
            <div v-else class="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-xl font-bold">
              {{ selectedThought.authorName?.[0]?.toUpperCase() || '?' }}
            </div>
            <div>
              <div class="text-lg font-semibold text-gray-900">{{ selectedThought.authorName }}</div>
              <div class="text-sm text-gray-500">{{ selectedThought.authorEmail }}</div>
            </div>
          </div>

          <!-- Title -->
          <h2 class="text-2xl font-bold text-gray-900 mb-3">{{ selectedThought.title }}</h2>

          <!-- Body -->
          <div class="prose max-w-none mb-4">
            <p class="text-gray-700 whitespace-pre-wrap">{{ selectedThought.body }}</p>
          </div>

          <!-- Image (if exists) -->
          <div v-if="selectedThought.imageUrl" class="mb-4">
            <img :src="selectedThought.imageUrl" alt="Thought image" class="rounded-lg max-w-full h-auto" />
          </div>

          <!-- Metadata -->
          <div class="flex items-center gap-6 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-200">
            <span class="flex items-center gap-1">
              <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              {{ selectedThought.upvotes }} upvotes
            </span>
            <span class="flex items-center gap-1">
              <svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
              </svg>
              {{ selectedThought.downvotes }} downvotes
            </span>
            <span>Posted {{ formatDate(selectedThought.createdAt) }}</span>
            <button @click="deleteThought(selectedThought)" class="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Delete Thought
            </button>
          </div>

          <!-- Comments Section -->
          <div>
            <h3 class="text-lg font-bold text-gray-900 mb-4">Comments ({{ thoughtComments.length }})</h3>
            
            <div v-if="thoughtComments.length === 0" class="text-center py-8 text-gray-500">
              No comments yet.
            </div>

            <div v-else class="space-y-4">
              <div v-for="comment in thoughtComments" :key="comment.id" class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <!-- Comment Author -->
                <div class="flex items-center gap-2 mb-2">
                  <img v-if="comment.authorAvatar" :src="`/api/cards/images/avatar/${comment.authorAvatar}`" class="h-8 w-8 rounded-full" @error="$event.target.src='/api/cards/images/avatar/pikachu.png'" />
                  <div v-else class="h-8 w-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-sm font-bold">
                    {{ comment.authorName?.[0]?.toUpperCase() || '?' }}
                  </div>
                  <div>
                    <div class="text-sm font-semibold text-gray-900">{{ comment.authorName }}</div>
                    <div class="text-xs text-gray-500">{{ comment.authorEmail }}</div>
                  </div>
                </div>

                <!-- Comment Body -->
                <p class="text-gray-700 mb-2 whitespace-pre-wrap">{{ comment.body }}</p>

                <!-- Comment Metadata -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4 text-xs text-gray-500">
                    <span class="flex items-center gap-1">
                      <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                      {{ comment.upvotes }}
                    </span>
                    <span class="flex items-center gap-1">
                      <svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                      </svg>
                      {{ comment.downvotes }}
                    </span>
                    <span>{{ formatDate(comment.createdAt) }}</span>
                  </div>
                  <button @click="deleteComment(selectedThought.id, comment.id)" class="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '../utils/api';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const router = useRouter();

// State
const activeTab = ref('users');
const users = ref([]);
const transactionStats = ref({
  summary: {
    totalDeposits: 0,
    totalWithdrawals: 0,
    depositCount: 0,
    withdrawalCount: 0,
    netFlow: 0
  },
  monthly: []
});
const thoughts = ref([]);

// Messaging state
const broadcastMode = ref('all'); // 'all', 'single', 'multiple'
const broadcastTarget = ref(''); // For single user
const selectedUsers = ref([]); // For multiple users
const broadcastMessage = ref('');
const sendingBroadcast = ref(false);
const broadcastHistory = ref([]);

// Thought detail modal state
const showThoughtModal = ref(false);
const selectedThought = ref(null);
const thoughtComments = ref([]);
const loadingThoughtDetail = ref(false);

// Computed for send button state
const canSendBroadcast = computed(() => {
  if (!broadcastMessage.value.trim()) return false;
  
  if (broadcastMode.value === 'all') return true;
  if (broadcastMode.value === 'single') return !!broadcastTarget.value;
  if (broadcastMode.value === 'multiple') return selectedUsers.value.length > 0;
  
  return false;
});

const tabs = [
  { id: 'users', name: 'Users' },
  { id: 'transactions', name: 'Transactions' },
  { id: 'moderation', name: 'Moderation' },
  { id: 'messaging', name: 'Messaging' }
];

// Chart
const chartCanvas = ref(null);
const chartContainer = ref(null);
let chartInstance = null;

// Check admin access
onMounted(async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/login');
    return;
  }

  // Decode token to check isAdmin
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.isAdmin) {
      alert('Access denied. Admin privileges required.');
      router.push('/');
      return;
    }
  } catch (e) {
    router.push('/login');
    return;
  }

  await loadUsers();
  await loadTransactionStats();
  await loadThoughts();
});

// Watch for tab changes to render chart
watch(activeTab, async (newTab) => {
  if (newTab === 'transactions') {
    await nextTick();
    renderChart();
  }
});

// Load functions
async function loadUsers() {
  try {
    const response = await api.get('/admin/users');
    users.value = response.data.users || [];
  } catch (error) {
    console.error('Failed to load users:', error);
    if (error.response?.status === 403) {
      alert('Access denied');
      router.push('/');
    }
  }
}

async function loadTransactionStats() {
  try {
    const response = await api.get('/admin/transactions/stats');
    transactionStats.value = response.data;
  } catch (error) {
    console.error('Failed to load transaction stats:', error);
  }
}

async function loadThoughts() {
  try {
    const response = await api.get('/admin/thoughts');
    thoughts.value = response.data.thoughts || [];
  } catch (error) {
    console.error('Failed to load thoughts:', error);
  }
}

// Actions
async function deleteUser(user) {
  if (!confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
    return;
  }

  try {
    await api.delete(`/admin/users/${user.id}`);
    alert(`User ${user.name} has been deleted.`);
    await loadUsers();
  } catch (error) {
    console.error('Failed to delete user:', error);
    alert('Failed to delete user. Please try again.');
  }
}

async function viewThoughtDetail(thought) {
  showThoughtModal.value = true;
  selectedThought.value = thought;
  thoughtComments.value = [];
  loadingThoughtDetail.value = true;

  try {
    const response = await api.get(`/admin/thoughts/${thought.id}`);
    selectedThought.value = response.data.thought;
    thoughtComments.value = response.data.comments || [];
  } catch (error) {
    console.error('Failed to load thought details:', error);
    alert('Failed to load thought details.');
    showThoughtModal.value = false;
  } finally {
    loadingThoughtDetail.value = false;
  }
}

function closeThoughtModal() {
  showThoughtModal.value = false;
  selectedThought.value = null;
  thoughtComments.value = [];
}

async function deleteThought(thought) {
  if (!confirm('Are you sure you want to delete this thought? This action cannot be undone.')) {
    return;
  }

  try {
    await api.delete(`/admin/thoughts/${thought.id}`);
    alert('Thought has been deleted.');
    
    // Close modal if open
    if (showThoughtModal.value && selectedThought.value?.id === thought.id) {
      closeThoughtModal();
    }
    
    await loadThoughts();
  } catch (error) {
    console.error('Failed to delete thought:', error);
    alert('Failed to delete thought. Please try again.');
  }
}

async function deleteComment(thoughtId, commentId) {
  if (!confirm('Are you sure you want to delete this comment?')) {
    return;
  }

  try {
    await api.delete(`/admin/thoughts/${thoughtId}/comments/${commentId}`);
    alert('Comment has been deleted.');
    
    // Refresh thought details
    await viewThoughtDetail({ id: thoughtId });
    await loadThoughts(); // Refresh comment counts
  } catch (error) {
    console.error('Failed to delete comment:', error);
    alert('Failed to delete comment. Please try again.');
  }
}

async function sendBroadcast() {
  if (!canSendBroadcast.value) return;

  sendingBroadcast.value = true;
  try {
    // Use socket to send broadcast
    const socket = window.socket;
    if (!socket) {
      alert('Socket connection not available. Please refresh the page.');
      sendingBroadcast.value = false;
      return;
    }

    // Determine targets based on broadcast mode
    let targets = [];
    let targetName = '';

    if (broadcastMode.value === 'all') {
      targets = [null]; // null means all users
      targetName = 'All Users';
    } else if (broadcastMode.value === 'single') {
      targets = [broadcastTarget.value];
      const user = users.value.find(u => u.id === broadcastTarget.value);
      targetName = user ? user.name : 'Unknown User';
    } else if (broadcastMode.value === 'multiple') {
      targets = selectedUsers.value;
      targetName = `${selectedUsers.value.length} user(s)`;
    }

    // Send message to each target
    for (const targetUserId of targets) {
      socket.emit('admin_broadcast', {
        message: broadcastMessage.value,
        targetUserId: targetUserId
      });
    }

    // Add to history
    broadcastHistory.value.unshift({
      message: broadcastMessage.value,
      targetName: targetName,
      timestamp: new Date().toISOString()
    });

    // Clear form
    broadcastMessage.value = '';
    if (broadcastMode.value === 'single') {
      broadcastTarget.value = '';
    } else if (broadcastMode.value === 'multiple') {
      selectedUsers.value = [];
    }

    alert('Message sent successfully!');
  } catch (error) {
    console.error('Failed to send broadcast:', error);
    alert('Failed to send message. Please try again.');
  } finally {
    sendingBroadcast.value = false;
  }
}

// Chart rendering
function renderChart() {
  if (!chartCanvas.value) return;

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = chartCanvas.value.getContext('2d');
  const monthlyData = transactionStats.value.monthly || [];

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: monthlyData.map(d => d.month),
      datasets: [
        {
          label: 'Deposits',
          data: monthlyData.map(d => d.deposits),
          backgroundColor: 'rgba(34, 197, 94, 0.8)', // green
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1
        },
        {
          label: 'Withdrawals',
          data: monthlyData.map(d => d.withdrawals),
          backgroundColor: 'rgba(239, 68, 68, 0.8)', // red
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} JSB`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return value.toFixed(0) + ' JSB';
            }
          }
        }
      }
    }
  });
}

// Utilities
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}
</script>
