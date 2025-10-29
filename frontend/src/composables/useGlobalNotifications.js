import { ref, onUnmounted } from 'vue';
import { io } from 'socket.io-client';
import { getAuthToken, getCurrentUser } from '@/utils/auth';
import { API_URL } from '@/utils/env';

/**
 * Global notification system for real-time updates
 * Listens to user's personal room for notifications
 */
export function useGlobalNotifications() {
  const socket = ref(null);
  const isConnected = ref(false);
  const hasUnreadMessages = ref(false);
  const unreadCount = ref(0);
  const latestNotification = ref(null);
  
  const SERVER_URL = API_URL;

  /**
   * Connect to socket for global notifications
   */
  const connect = () => {
    const token = getAuthToken();
    const user = getCurrentUser();
    
    if (!token || !user.isAuthenticated) {
      return;
    }

    try {
      socket.value = io(SERVER_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      setupListeners();
      
    } catch (err) {
      console.error('❌ Failed to connect global notifications:', err);
    }
  };

  /**
   * Setup socket event listeners
   */
  const setupListeners = () => {
    if (!socket.value) return;

    socket.value.on('connect', () => {
      isConnected.value = true;
    });

    socket.value.on('disconnect', (reason) => {
      isConnected.value = false;
    });

    socket.value.on('connect_error', (err) => {
      console.error('❌ Global notification connection error:', err.message);
      isConnected.value = false;
    });

    // ============================================================
    // NEW MESSAGE NOTIFICATION (The Doorbell!)
    // ============================================================
    socket.value.on('new_message_notification', (notification) => {
      
      hasUnreadMessages.value = true;
      unreadCount.value += 1;
      latestNotification.value = notification;
      
      // Show browser notification if supported
      showBrowserNotification(notification);
      
      // Play sound (optional)
      playNotificationSound();
    });
  };

  /**
   * Show browser notification
   */
  const showBrowserNotification = (notification) => {
    if (!('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
      new Notification('New Message', {
        body: `${notification.senderName}: ${notification.messageText}`,
        icon: '/favicon.ico',
        tag: notification.conversationId
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          showBrowserNotification(notification);
        }
      });
    }
  };

  /**
   * Play notification sound (optional)
   */
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3'); // Add this file to public folder
      audio.volume = 0.3;
      audio.play().catch(err => {
        // Autoplay might be blocked, that's okay
      });
    } catch (err) {
      // Sound file might not exist, that's okay
    }
  };

  /**
   * Mark notifications as read
   */
  const markAsRead = () => {
    hasUnreadMessages.value = false;
    unreadCount.value = 0;
    latestNotification.value = null;
  };

  /**
   * Disconnect
   */
  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
      isConnected.value = false;
    }
  };

  // Auto-cleanup
  onUnmounted(() => {
    disconnect();
  });

  return {
    // State
    isConnected,
    hasUnreadMessages,
    unreadCount,
    latestNotification,
    
    // Methods
    connect,
    disconnect,
    markAsRead
  };
}
