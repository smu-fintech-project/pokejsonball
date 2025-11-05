import { Server } from 'socket.io';
import { authenticateSocket } from './middleware/auth.js';
import * as Conversation from './models/Conversation.js';
import * as Message from './models/Message.js';
import admin from 'firebase-admin';

/**
 * Initialize Socket.IO server with JWT authentication and database persistence
 * 
 * @param {http.Server} httpServer - The HTTP server instance
 * @param {string[] | string} frontendOrigins - Allowed frontend origins for CORS
 * @returns {Server} The configured Socket.IO server instance
 */
export function initializeSocket(httpServer, frontendOrigins) {
  const originsArray = Array.isArray(frontendOrigins) ? frontendOrigins : [frontendOrigins];
  const allowedOrigins = originsArray.length > 0 ? originsArray : ['http://localhost:3000'];

  console.log(`🔌 Socket.IO allowed origins: ${JSON.stringify(allowedOrigins)}`);

  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });


  // ============================================================
  // JWT AUTHENTICATION MIDDLEWARE
  // ============================================================
  io.use(authenticateSocket);

  // ============================================================
  // CONNECTION HANDLER
  // ============================================================
  io.on('connection', (socket) => {
    
    // userId is now set by authenticateSocket middleware from JWT

    // ============================================================
    // JOIN PERSONAL USER ROOM (for global notifications)
    // ============================================================
    const personalRoom = `user_${socket.userId}`;
    socket.join(personalRoom);

    // ============================================================
    // JOIN CONVERSATION
    // ============================================================
    /**
     * Handle 'join_conversation' event
     * Client provides conversationId, server verifies participant and joins room
     * 
     * Payload: {
     *   conversationId: string
     * }
     */
    socket.on('join_conversation', async ({ conversationId }) => {
      
      if (!conversationId) {
        console.error('❌ join_conversation failed: Missing conversationId');
        socket.emit('error', { message: 'conversationId is required' });
        return;
      }

      try {
        // Verify user is participant in this conversation
        const isParticipant = await Conversation.isParticipant(conversationId, socket.userId);
        
        if (!isParticipant) {
          console.error(`❌ User ${socket.userId} is not a participant in conversation ${conversationId}`);
          socket.emit('error', { message: 'You are not authorized to join this conversation' });
          return;
        }

        // Leave any previous room
        if (socket.currentRoom) {
          socket.leave(socket.currentRoom);
        }

        // Join the conversation room
        const roomId = `conversation_${conversationId}`;
        socket.join(roomId);
        socket.currentRoom = roomId;
        socket.currentConversationId = conversationId;


        // Notify the client
        socket.emit('conversation_joined', { 
          conversationId,
          roomId,
          message: 'Successfully joined conversation'
        });

        // Notify others in the room
        socket.to(roomId).emit('user_joined', {
          userId: socket.userId,
          conversationId,
          timestamp: new Date()
        });

      } catch (error) {
        console.error('❌ Error joining conversation:', error);
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // ============================================================
    // SEND MESSAGE (with database persistence)
    // ============================================================
    /**
     * Handle 'send_message' event
     * Saves message to database, then broadcasts to room
     * 
     * Payload: {
     *   conversationId: string,
     *   text: string
     * }
     */
    socket.on('send_message', async ({ conversationId, text }) => {
      
      if (!conversationId || !text) {
        console.error('❌ send_message failed: Missing conversationId or text');
        socket.emit('error', { message: 'conversationId and text are required' });
        return;
      }

      const trimmedText = text.trim();
      if (trimmedText.length === 0) {
        socket.emit('error', { message: 'Message cannot be empty' });
        return;
      }

      try {
        // Verify user is participant
        const isParticipant = await Conversation.isParticipant(conversationId, socket.userId);
        
        if (!isParticipant) {
          console.error(`❌ User ${socket.userId} not authorized for conversation ${conversationId}`);
          socket.emit('error', { message: 'You are not authorized to send messages in this conversation' });
          return;
        }

        // Save message to database
        const message = await Message.createMessage(conversationId, socket.userId, trimmedText);
        
        // Update conversation's last message
        await Conversation.updateLastMessage(conversationId, trimmedText, message.createdAt);


        const roomId = `conversation_${conversationId}`;
        
        // Broadcast to all users in the room (including sender)
        io.to(roomId).emit('new_message', {
          id: message.id,
          conversationId: message.conversationId,
          senderId: message.senderId,
          text: message.text,
          createdAt: message.createdAt,
          read: message.read
        });

        // ============================================================
        // GLOBAL NOTIFICATION: Notify BOTH users (sender & recipient)
        // ============================================================
        try {
          // Get the full conversation object
          const conversation = await Conversation.getConversationById(conversationId);
          
          if (conversation) {
            // Get user details for enrichment
            const db = admin.firestore();
            const participants = [];
            
            for (const userId of conversation.participants) {
              try {
                const userDoc = await db.collection('users').doc(userId).get();
                if (userDoc.exists) {
                  const userData = userDoc.data();
                  participants.push({
                    id: userDoc.id,
                    name: userData.name,
                    email: userData.email
                  });
                }
              } catch (err) {
                console.error(`⚠️ Error fetching user ${userId}:`, err.message);
              }
            }
            
            // Get card details
            let card = null;
            try {
              const cardDoc = await db.collection('cards').doc(conversation.cardId).get();
              if (cardDoc.exists) {
                const cardData = cardDoc.data();
                card = {
                  id: cardDoc.id,
                  name: cardData.name,
                  imageUrl: cardData.imageUrl,
                  price: cardData.price
                };
              }
            } catch (err) {
              console.error(`⚠️ Error fetching card ${conversation.cardId}:`, err.message);
            }
            
            // Build enriched conversation object
            const enrichedConversation = {
              ...conversation,
              card,
              lastMessage: trimmedText,
              lastMessageAt: message.createdAt
            };
            
            // Notify BOTH participants (sender and recipient)
            for (const userId of conversation.participants) {
              const personalRoom = `user_${userId}`;
              const isRecipient = userId !== socket.userId;
              
              // Add otherUser info for this specific user
              const otherUserId = conversation.participants.find(id => id !== userId);
              const otherUser = participants.find(p => p.id === otherUserId);
              
              const conversationForUser = {
                ...enrichedConversation,
                otherUser,
                unreadCount: isRecipient ? 1 : 0 // Only recipient has unread
              };
              
              
              // Emit conversation_updated to update their conversation list
              io.to(personalRoom).emit('conversation_updated', conversationForUser);
              
              // Also send simple notification to recipient
              if (isRecipient) {
                io.to(personalRoom).emit('new_message_notification', {
                  conversationId,
                  senderId: socket.userId,
                  senderName: socket.user.username || 'User',
                  messageText: trimmedText.substring(0, 100),
                  timestamp: message.createdAt,
                  messageId: message.id
                });
              }
            }
          }
        } catch (notificationError) {
          console.error('⚠️ Failed to send notifications:', notificationError.message);
          // Don't fail the message send if notification fails
        }

        // Send confirmation to sender
        socket.emit('message_sent', {
          success: true,
          messageId: message.id
        });

      } catch (error) {
        console.error('❌ Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ============================================================
    // TYPING INDICATORS
    // ============================================================
    socket.on('typing_start', ({ conversationId }) => {
      if (!conversationId) return;
      
      const roomId = `conversation_${conversationId}`;
      socket.to(roomId).emit('user_typing', {
        userId: socket.userId,
        conversationId,
        isTyping: true
      });
    });

    socket.on('typing_stop', ({ conversationId }) => {
      if (!conversationId) return;
      
      const roomId = `conversation_${conversationId}`;
      socket.to(roomId).emit('user_typing', {
        userId: socket.userId,
        conversationId,
        isTyping: false
      });
    });

    // ============================================================
    // LEAVE CONVERSATION
    // ============================================================
    socket.on('leave_conversation', ({ conversationId }) => {
      if (!conversationId) return;

      const roomId = `conversation_${conversationId}`;
      socket.leave(roomId);
      

      socket.to(roomId).emit('user_left', {
        userId: socket.userId,
        conversationId,
        timestamp: new Date()
      });

      if (socket.currentRoom === roomId) {
        socket.currentRoom = null;
        socket.currentConversationId = null;
      }
    });

    // ============================================================
    // DISCONNECT HANDLER
    // ============================================================
    socket.on('disconnect', (reason) => {

      if (socket.currentRoom && socket.currentConversationId) {
        socket.to(socket.currentRoom).emit('user_disconnected', {
          userId: socket.userId,
          conversationId: socket.currentConversationId,
          timestamp: new Date(),
          reason
        });
      }
    });

    // ============================================================
    // ERROR HANDLER
    // ============================================================
    socket.on('error', (error) => {
      console.error(`\n❌ Socket error for user ${socket.userId}:`, error);
    });
  });

  // ============================================================
  // SERVER ERROR HANDLER
  // ============================================================
  io.on('error', (error) => {
    console.error('\n❌ Socket.IO server error:', error);
  });


  return io;
}
