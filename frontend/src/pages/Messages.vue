<template>
  <div class="messages-page min-h-screen bg-gray-100 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-6 bg-gray-100 dark:bg-gray-900">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Messages</h1>

      <div class="bg-white rounded-lg shadow-2xl overflow-hidden dark:bg-gray-800" style="height: calc(100vh - 200px);">
        <div class="flex h-full shadow-xl">
          <div class="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div class="pl-4 h-14 border-b dark:border-gray-700 flex flex-col justify-center">
              <h2 class="font-semibold text-gray-700 dark:text-gray-200">Conversations</h2>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                Continue chatting with other collectors
              </span>
            </div>

            <div v-if="loading" class="p-8 text-center text-gray-500 dark:text-gray-400">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
              Loading conversations...
            </div>

            <div v-else-if="conversations.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400">
              <p class="text-lg mb-2">📭 No messages yet</p>
              <p class="text-sm">Start browsing cards to message sellers!</p>
            </div>

            <div v-else>
              <div
                v-for="conv in conversations"
                :key="conv.id"
                @click="selectConversation(conv.id)"
                :class="[
                  'p-4 border-b cursor-pointer hover:bg-gray-50 transition dark:border-gray-700 dark:hover:bg-gray-700',
                  activeConversationId === conv.id ? 'bg-red-50 border-l-4 border-l-red-600 dark:bg-red-900/[.20] dark:border-l-red-500' : ''
                ]"
              >
                <div class="flex items-center justify-between gap-3">
                
                  <div class="flex items-start gap-3 flex-1 min-w-0">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-800 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {{ conv.otherUser?.name?.charAt(0).toUpperCase() || '?' }}
                    </div>
                
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between mb-1">
                        <h3 class="font-semibold text-gray-800 dark:text-gray-100 truncate">
                          {{ conv.otherUser?.name || 'Unknown User' }}
                        </h3>
                        <span v-if="conv.unreadCount > 0" class="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                          {{ conv.unreadCount }}
                        </span>
                      </div>
                
                      <p class="text-xs text-gray-500 dark:text-gray-400 truncate mb-1">
                        {{ conv.card?.name || 'Card listing' }}
                      </p>
                
                      <p class="text-sm text-gray-600 dark:text-gray-300 truncate">
                        {{ conv.lastMessage || 'No messages yet' }}
                      </p>
                
                      <p v-if="conv.lastMessageAt" class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {{ formatTimestamp(conv.lastMessageAt) }}
                      </p>
                    </div>
                  </div>
                
                  <div class="w-12 h-16 flex-shrink-0">
                    <img
                      v-if="conv.card?.imageUrl"
                      :src="conv.card.imageUrl"
                      :alt="conv.card.name || 'Card'"
                      class="w-full h-full object-contain rounded-sm"
                    />
                    <div
                      v-else
                      class="w-full h-full rounded-sm bg-gray-100 border border-gray-200 dark:bg-gray-700 dark:border-gray-600 flex items-center justify-center"
                    >
                      <span class="text-xs text-gray-400 dark:text-gray-500">Card</span>
                    </div>
                  </div>
                
                </div>
              </div>
            </div>
          </div>

          <div class="flex-1 flex flex-col">
            <ChatWindow
              v-if="activeConversation" 
              :conversationId="activeConversation.id"
              :key="activeConversation.id"
              :otherUser="activeConversation.otherUser"
              :card="activeConversation.card"
            />
            <div v-else class="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500">
              <div class="text-center">
                <p class="text-lg mb-2">👈 Select a conversation</p>
                <p class="text-sm">Choose a conversation from the left to start chatting</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { getAuthToken, getCurrentUser } from '@/utils/auth';
import ChatWindow from '@/components/ChatWindow.vue';
import { io } from 'socket.io-client';

const route = useRoute();

const conversations = ref([]);
const loading = ref(true);
const activeConversationId = ref(null);
const activeConversation = computed(() => {
  return conversations.value.find(conv => conv.id === activeConversationId.value);
});
const error = ref(null);

// Socket for real-time conversation list updates
let socket = null;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Fetch all conversations for the current user
 */
const fetchConversations = async () => {
  loading.value = true;
  error.value = null;
  try {
    const token = getAuthToken();
    if (!token) {
      error.value = 'Please log in to view messages';
      loading.value = false;
      return;
    }
    const response = await fetch(`${API_URL}/api/chat/my-conversations`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (response.ok) {
      conversations.value = data.conversations || [];
    } else {
      error.value = data.error || 'Failed to load conversations';
      console.error('Failed to fetch conversations:', error.value);
    }
  } catch (err) {
    error.value = 'Network error loading conversations';
    console.error('Network error loading conversations:', err);
  } finally {
    loading.value = false;
  }
};

/**
 * Select a conversation
 */
const selectConversation = (conversationId) => {
  activeConversationId.value = conversationId;
};

/**
 * Connect to socket for real-time conversation list updates
 */
const connectSocket = () => {
  const token = getAuthToken();
  const user = getCurrentUser();
  if (!token || !user.isAuthenticated) {
    return;
  }

  try {
    socket = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true
    });

    socket.on('connect', () => {
    });

    socket.on('disconnect', (reason) => {
    });

    // ============================================================
    // REAL-TIME CONVERSATION UPDATE (The Fix!)
    // ============================================================
    socket.on('conversation_updated', (updatedConversation) => {
      handleRealtimeUpdate(updatedConversation);
    });

  } catch (err) {
    console.error('❌ Failed to connect socket:', err);
  }
};

/**
 * Handle real-time conversation update
 * This is the key function that keeps the left pane in sync!
 */
/**
 * Handle real-time conversation update
 * This is the key function that keeps the left pane in sync!
 */
const handleRealtimeUpdate = (updatedConversation) => {
  // console.log('SOCKET: Received [conversation_updated]', updatedConversation);

  // Find if this conversation already exists in the list
  const existingIndex = conversations.value.findIndex(
    conv => conv.id === updatedConversation.id
  );

  let conversationToUpdate;

  if (existingIndex !== -1) {
    // === START OF FIX ===
    // IT EXISTS: Merge new data with existing rich data
    // Get the existing data (with card, otherUser, and good dates)
    const existingConv = conversations.value[existingIndex];
    // Create a new object to maintain reactivity
    // We start with the existing conversation (with all its good data)
    // and *manually* overwrite just the fields we care about
    // from the socket's incomplete payload.
    conversationToUpdate = {
      ...existingConv, // Keep all old data (card, otherUser, createdAt)
      // Selectively update with new data from the socket
      lastMessage: updatedConversation.lastMessage,
      lastMessageAt: updatedConversation.lastMessageAt,
      // Use socket's unreadCount, but fall back to existing if socket doesn't send one
      unreadCount: updatedConversation.unreadCount ?? existingConv.unreadCount,
    };
    // Remove old version from the list
    conversations.value.splice(existingIndex, 1);
    // === END OF FIX ===
  } else {
    // IT'S A NEW CONVERSATION
    // We add it to the top. It might be missing card/user data
    // until the next full refresh, but it will appear.
    conversationToUpdate = updatedConversation;
  }

  // Add the updated/new conversation to the top
  conversations.value.unshift(conversationToUpdate);

  // Re-sort by lastMessageAt (most recent first)
  conversations.value.sort((a, b) => {
    const timeA = new Date(a.lastMessageAt || 0);
    const timeB = new Date(b.lastMessageAt || 0);
    return timeB - timeA;
});
};

/**
 * Disconnect socket
 */
const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Format timestamp for display
 */
const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

onMounted(async () => {
  // Connect socket for real-time updates
  connectSocket();
  // Fetch initial conversations
  await fetchConversations();
  // Check if there's a conversation query parameter
  const conversationIdFromQuery = route.query.conversation;
  if (conversationIdFromQuery) {
    activeConversationId.value = conversationIdFromQuery;
  }
});

onUnmounted(() => {
  disconnectSocket();
});
</script>

<style scoped>
/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}
</style>

<style>
/* Dark mode scrollbar for Messages.vue */
.dark .messages-page .overflow-y-auto::-webkit-scrollbar-track {
  background: #374151; /* gray-700 */
}
.dark .messages-page .overflow-y-auto::-webkit-scrollbar-thumb {
  background: #6b7280; /* gray-500 */
}
.dark .messages-page .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af; /* gray-400 */
}
</style>