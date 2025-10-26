import { ref, onUnmounted } from 'vue';
import { io } from 'socket.io-client';
import { getAuthToken } from '@/utils/auth';

/**
 * Composable for persistent, authenticated Socket.IO chat
 * Uses JWT authentication and database-backed messaging
 * 
 * @returns {Object} Chat state and methods
 */
export function useChat() {
  const socket = ref(null);
  const messages = ref([]);
  const isConnected = ref(false);
  const currentConversationId = ref(null);
  const typingUsers = ref([]);
  const error = ref(null);
  
  const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  /**
   * Connect to Socket.IO with JWT authentication
   */
  const connect = () => {
    const token = getAuthToken();
    
    if (!token) {
      error.value = 'Authentication required. Please log in.';
      console.error('❌ No auth token found');
      return;
    }

    try {
      socket.value = io(SERVER_URL, {
        auth: { token }, // JWT token in auth handshake
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      setupSocketListeners();
      
    } catch (err) {
      error.value = `Failed to connect: ${err.message}`;
      console.error('❌ Connection error:', err);
    }
  };

  /**
   * Setup socket event listeners
   */
  const setupSocketListeners = () => {
    if (!socket.value) return;

    socket.value.on('connect', () => {
      isConnected.value = true;
      error.value = null;
    });

    socket.value.on('disconnect', (reason) => {
      isConnected.value = false;
    });

    socket.value.on('connect_error', (err) => {
      console.error('❌ Connection error:', err.message);
      error.value = `Connection error: ${err.message}`;
      isConnected.value = false;
    });

    socket.value.on('conversation_joined', (data) => {
      currentConversationId.value = data.conversationId;
    });

    socket.value.on('new_message', (message) => {
      messages.value.push(message);
    });

    socket.value.on('message_sent', (data) => {
    });

    socket.value.on('user_joined', (data) => {
    });

    socket.value.on('user_left', (data) => {
    });

    socket.value.on('user_typing', (data) => {
      if (data.isTyping) {
        if (!typingUsers.value.includes(data.userId)) {
          typingUsers.value.push(data.userId);
        }
      } else {
        typingUsers.value = typingUsers.value.filter(id => id !== data.userId);
      }
    });

    socket.value.on('error', (err) => {
      console.error('❌ Socket error:', err);
      error.value = err.message || 'An error occurred';
    });
  };

  /**
   * Join a conversation by ID
   */
  const joinConversation = (conversationId) => {
    if (!socket.value || !isConnected.value) {
      error.value = 'Socket not connected';
      console.error('❌ Cannot join conversation: not connected');
      return;
    }

    socket.value.emit('join_conversation', { conversationId });
  };

  /**
   * Leave current conversation
   */
  const leaveConversation = () => {
    if (!socket.value || !currentConversationId.value) return;

    socket.value.emit('leave_conversation', {
      conversationId: currentConversationId.value
    });

    currentConversationId.value = null;
    messages.value = [];
    typingUsers.value = [];
  };

  /**
   * Send a message
   */
  const sendMessage = (text) => {
    if (!socket.value || !isConnected.value) {
      error.value = 'Socket not connected';
      return;
    }

    if (!currentConversationId.value) {
      error.value = 'Not in a conversation';
      return;
    }

    const trimmed = text.trim();
    if (!trimmed) return;

    socket.value.emit('send_message', {
      conversationId: currentConversationId.value,
      text: trimmed
    });

    error.value = null;
  };

  /**
   * Typing indicators
   */
  const startTyping = () => {
    if (!socket.value || !currentConversationId.value) return;
    socket.value.emit('typing_start', {
      conversationId: currentConversationId.value
    });
  };

  const stopTyping = () => {
    if (!socket.value || !currentConversationId.value) return;
    socket.value.emit('typing_stop', {
      conversationId: currentConversationId.value
    });
  };

  /**
   * Disconnect
   */
  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
      isConnected.value = false;
      currentConversationId.value = null;
      messages.value = [];
      typingUsers.value = [];
    }
  };

  // Auto-cleanup
  onUnmounted(() => {
    disconnect();
  });

  return {
    // State
    socket,
    messages,
    isConnected,
    currentConversationId,
    typingUsers,
    error,
    
    // Methods
    connect,
    joinConversation,
    leaveConversation,
    sendMessage,
    startTyping,
    stopTyping,
    disconnect
  };
}

