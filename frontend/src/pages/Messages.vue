<template>
  <div class="messages-page min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-6">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">💬 Messages</h1>
      
      <div class="bg-white rounded-lg shadow-lg overflow-hidden" style="height: calc(100vh - 200px);">
        <div class="flex h-full">
          
          <!-- LEFT COLUMN: Conversation List -->
          <div class="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div class="p-4 border-b bg-gray-50">
              <h2 class="font-semibold text-gray-700">Conversations</h2>
            </div>
            
            <!-- Loading State -->
            <div v-if="loading" class="p-8 text-center text-gray-500">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              Loading conversations...
            </div>
            
            <!-- Empty State -->
            <div v-else-if="conversations.length === 0" class="p-8 text-center text-gray-500">
              <p class="text-lg mb-2">📭 No messages yet</p>
              <p class="text-sm">Start browsing cards to message sellers!</p>
            </div>
            
            <!-- Conversation List -->
            <div v-else>
              <div
                v-for="conv in conversations"
                :key="conv.id"
                @click="selectConversation(conv.id)"
                :class="[
                  'p-4 border-b cursor-pointer hover:bg-gray-50 transition',
                  activeConversationId === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                ]"
              >
                <div class="flex items-start gap-3">
                  <!-- User Avatar -->
                  <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {{ conv.otherUser?.name?.charAt(0).toUpperCase() || '?' }}
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <!-- Other User Name -->
                    <div class="flex items-center justify-between mb-1">
                      <h3 class="font-semibold text-gray-800 truncate">
                        {{ conv.otherUser?.name || 'Unknown User' }}
                      </h3>
                      <span v-if="conv.unreadCount > 0" class="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                        {{ conv.unreadCount }}
                      </span>
                    </div>
                    
                    <!-- Card Name -->
                    <p class="text-xs text-gray-500 truncate mb-1">
                      📦 {{ conv.card?.name || 'Card listing' }}
                    </p>
                    
                    <!-- Last Message -->
                    <p class="text-sm text-gray-600 truncate">
                      {{ conv.lastMessage || 'No messages yet' }}
                    </p>
                    
                    <!-- Timestamp -->
                    <p v-if="conv.lastMessageAt" class="text-xs text-gray-400 mt-1">
                      {{ formatTimestamp(conv.lastMessageAt) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- RIGHT COLUMN: Chat Window -->
          <div class="flex-1 flex flex-col">
            <ChatWindow
              v-if="activeConversationId"
              :conversationId="activeConversationId"
              :key="activeConversationId"
            />
            
            <!-- Empty State -->
            <div v-else class="flex-1 flex items-center justify-center text-gray-400">
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
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { getAuthToken, getCurrentUser } from '@/utils/auth';
import ChatWindow from '@/components/ChatWindow.vue';
import { io } from 'socket.io-client';
import { API_BASE, API_URL as SOCKET_API_URL } from '@/utils/env';

const route = useRoute();

const conversations = ref([]);
const loading = ref(true);
const activeConversationId = ref(null);
const error = ref(null);

// Socket for real-time conversation list updates
let socket = null;

const REST_API_BASE = API_BASE;
const SOCKET_URL = SOCKET_API_URL;

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
    
    const response = await fetch(`${REST_API_BASE}/api/chat/my-conversations`, {
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
    socket = io(SOCKET_URL, {
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
const handleRealtimeUpdate = (updatedConversation) => {
  
  // Find if this conversation already exists in the list
  const existingIndex = conversations.value.findIndex(
    conv => conv.id === updatedConversation.id
  );
  
  if (existingIndex !== -1) {
    // EXISTS: Replace in place, then move to top
    
    // Remove old version
    conversations.value.splice(existingIndex, 1);
  } else {
  }
  
  // Add/re-add to top
  conversations.value.unshift(updatedConversation);
  
  // Remove duplicates by ID (safety check)
  const seen = new Set();
  conversations.value = conversations.value.filter(conv => {
    if (seen.has(conv.id)) {
      return false;
    }
    seen.add(conv.id);
    return true;
  });
  
  // Sort by lastMessageAt (most recent first)
  conversations.value.sort((a, b) => {
    const timeA = a.lastMessageAt?.toDate ? a.lastMessageAt.toDate() : new Date(a.lastMessageAt || 0);
    const timeB = b.lastMessageAt?.toDate ? b.lastMessageAt.toDate() : new Date(b.lastMessageAt || 0);
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
