<template>
  <div class="chat-window flex flex-col h-full bg-stone-500">
    <div class="p-2 h-14 border-b bg-gradient-to-r from-stone-50 to-red-100 dark:border-b-gray-700 dark:from-gray-800 dark:to-red-900/[.20]">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-semibold text-gray-800 dark:text-gray-100">
            Chat with {{ props.otherUser?.name || 'User' }}
          </h3>
          <div class="flex items-center gap-2">
            <div :class="['w-2 h-2 rounded-full', isConnected ? 'bg-green-500' : 'bg-gray-400']"></div>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {{ isConnected ? 'Connected' : 'Connecting...' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50 relative overflow-hidden dark:bg-gray-900"
      :style="{
        '--pokeball-light-svg': pokeballPatternLight,
        '--pokeball-dark-svg': pokeballPatternDark
      }"
    >
      <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          class="absolute -top-8 -left-12 w-32 h-32 opacity-[.14] dark:opacity-[.03] transform rotate-12
         bg-no-repeat bg-contain
         bg-[image:var(--pokeball-light-svg)]
         dark:bg-[image:var(--pokeball-dark-svg)]"
        ></div>
        <div
          class="absolute top-1/3 -left-20 w-48 h-48 opacity-[.13] dark:opacity-[.02] transform -rotate-45
                   bg-no-repeat bg-contain
         bg-[image:var(--pokeball-light-svg)]
         dark:bg-[image:var(--pokeball-dark-svg)]"
        ></div>
        <div
          class="absolute top-1/4 -right-10 w-40 h-40 opacity-[.14] dark:opacity-[.03] transform rotate-45
                   bg-no-repeat bg-contain
         bg-[image:var(--pokeball-light-svg)]
         dark:bg-[image:var(--pokeball-dark-svg)]"
        ></div>
        <div
          class="absolute -bottom-10 left-1/3 w-32 h-32 opacity-[.15] dark:opacity-[.03] transform rotate-12
                   bg-no-repeat bg-contain
         bg-[image:var(--pokeball-light-svg)]
         dark:bg-[image:var(--pokeball-dark-svg)]"
        ></div>
        <div
          class="absolute -bottom-20 -right-12 w-48 h-48 opacity-[.14] dark:opacity-[.03] transform -rotate-12
                   bg-no-repeat bg-contain
         bg-[image:var(--pokeball-light-svg)]
         dark:bg-[image:var(--pokeball-dark-svg)]"
        ></div>
        <div
          class="absolute top-2/3 left-[40%] w-20 h-20 opacity-[.12] dark:opacity-[.02] transform rotate-12
                   bg-no-repeat bg-contain
         bg-[image:var(--pokeball-light-svg)]
         dark:bg-[image:var(--pokeball-dark-svg)]"
        ></div>
        <div
          class="absolute top-1/2 right-[30%] w-24 h-24 opacity-[.13] dark:opacity-[.02] transform rotate-12
                   bg-no-repeat bg-contain
         bg-[image:var(--pokeball-light-svg)]
         dark:bg-[image:var(--pokeball-dark-svg)]"
        ></div>
      </div>

      <div class="relative z-10 space-y-3">
        <div v-if="loadingMessages" class="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <div class="text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
            Loading messages...
          </div>
        </div>
        <div
          v-for="message in messages"
          :key="message.id"
          :class="[
            'flex',
            message.senderId === currentUserId ? 'justify-end' : 'justify-start'
          ]"
        >
          <div
            :class="[
              'max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow',
              message.senderId === currentUserId
                ? 'bg-red-500 text-stone-100'
                : 'bg-blue-500 text-stone-100'
            ]"
          >
            <p class="text-sm break-words">{{ message.text }}</p>
            <p class="text-xs mt-1 opacity-70">
              {{ formatTime(message.createdAt) }}
            </p>
          </div>
        </div>
        <div v-if="typingUsers.length > 0" class="flex justify-start">
          <div class="px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            <span class="italic">Typing...</span>
          </div>
        </div>
      </div>
    </div>

    <div class="p-4 border-t bg-white dark:bg-gray-800 dark:border-t-gray-700">
      <form @submit.prevent="handleSendMessage" class="flex gap-2">
        <input
          v-model="newMessage"
          @input="handleTyping"
          type="text"
          placeholder="Type a message..."
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
          :disabled="!isConnected"
        />
        <button
          type="submit"
          :disabled="!isConnected || !newMessage.trim()"
          class="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>

    <div v-if="error" class="px-4 py-2 bg-red-50 border-t border-red-200 text-sm text-red-700 dark:bg-red-900/[.20] dark:border-t-red-800 dark:text-red-200">
      ❌ {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { useChat } from '@/composables/useChatRefactored';
import { getCurrentUser, getAuthToken } from '@/utils/auth';

// Props
const props = defineProps({
  conversationId: {
    type: String,
    required: true
  },
  otherUser: {
    type: Object,
    default: () => ({ name: 'User' }) // This is what you're seeing
  },
  card: {
    type: Object,
    default: () => ({ name: 'Card Listing' })
  }
});

// Get current user
const currentUser = getCurrentUser();
const currentUserId = currentUser.userId;

// Chat composable
const {
  messages: socketMessages,
  isConnected,
  typingUsers,
  error: socketError,
  connect,
  joinConversation,
  leaveConversation,
  sendMessage,
  startTyping,
  stopTyping,
  disconnect
} = useChat();

// Local state
const messages = ref([]);
const loadingMessages = ref(false);
const newMessage = ref('');
const error = ref(null);
const messagesContainer = ref(null);

let typingTimer = null;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const pokeballPatternLight = computed(() => {
  const svg = `<svg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'><circle cx='20' cy='20' r='18' fill='none' stroke='#000' stroke-width='1.5'></circle><line x1='2' y1='20' x2='38' y2='20' stroke='#000' stroke-width='1.5'></line><circle cx='20' cy='20' r='6' fill='none' stroke='#000' stroke-width='1.5'></circle></svg>`;
  const encodedSvg = encodeURIComponent(svg);
  return `url("data:image/svg+xml,${encodedSvg}")`;
});

// NEW: Create the dark mode version
const pokeballPatternDark = computed(() => {
  const svg = `<svg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'><circle cx='20' cy='20' r='18' fill='none' stroke='#E8E8E8' stroke-width='1.5'></circle><line x1='2' y1='20' x2='38' y2='20' stroke='#E8E8E8' stroke-width='1.5'></line><circle cx='20' cy='20' r='6' fill='none' stroke='#E8E8E8' stroke-width='1.5'></circle></svg>`;
  const encodedSvg = encodeURIComponent(svg);
  return `url("data:image/svg+xml,${encodedSvg}")`;
});

/**
 * Load message history from API
 */
const loadMessages = async (conversationId) => {
  loadingMessages.value = true;
  error.value = null;
  try {
    const token = getAuthToken();
    const response = await fetch(
      `${API_URL}/api/chat/${conversationId}/messages`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    const data = await response.json();
    if (response.ok) {
      messages.value = data.messages;
      // Scroll to bottom
      await nextTick();
      scrollToBottom();
    } else {
      error.value = data.error || 'Failed to load messages';
      console.error('❌', error.value);
    }
  } catch (err) {
    error.value = 'Network error loading messages';
    console.error('❌', err);
  } finally {
    loadingMessages.value = false;
  }
};

/**
 * Send message handler
 */
const handleSendMessage = () => {
  if (!newMessage.value.trim()) return;
  sendMessage(newMessage.value);
  newMessage.value = '';
  stopTyping();
};

/**
 * Typing handler
 */
const handleTyping = () => {
  startTyping();
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    stopTyping();
  }, 2000);
};

/**
 * Format time
 */
const formatTime = (timestamp) => {
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Scroll to bottom
 */
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

/**
 * Watch for new socket messages and add to local messages
 */
watch(socketMessages, (newMessages) => {
  // Add only new messages (avoid duplicates)
  newMessages.forEach(msg => {
    if (!messages.value.find(m => m.id === msg.id)) {
      messages.value.push(msg);
    }
  });
  nextTick(() => scrollToBottom());
}, { deep: true });

/**
 * Watch conversationId prop changes
 */
watch(() => props.conversationId, async (newConversationId, oldConversationId) => {
  if (newConversationId === oldConversationId) return;
  // Leave old conversation
  if (oldConversationId) {
    leaveConversation();
  }
  // Clear messages
  messages.value = [];
  // Load new conversation messages
  await loadMessages(newConversationId);
  // Join new conversation via socket
  if (isConnected.value) {
    joinConversation(newConversationId);
  }
}, { immediate: true });

/**
 * Watch socket connection
 */
watch(isConnected, (connected) => {
  if (connected && props.conversationId) {
    joinConversation(props.conversationId);
  }
});

/**
 * Initialize on mount
 */
onMounted(() => {
  connect();
});

/**
 * Cleanup on unmount
 */
onUnmounted(() => {
  leaveConversation();
  disconnect();
  clearTimeout(typingTimer);
});
</script>

<style scoped>
.overflow-y-auto {
  scroll-behavior: smooth;
}

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
/* Dark mode scrollbar for ChatWindow.vue */
.dark .chat-window .overflow-y-auto::-webkit-scrollbar-track {
  background: #1f2937; /* gray-800 */
}
.dark .chat-window .overflow-y-auto::-webkit-scrollbar-thumb {
  background: #4b5563; /* gray-600 */
}
.dark .chat-window .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #6b7280; /* gray-500 */
}
</style>