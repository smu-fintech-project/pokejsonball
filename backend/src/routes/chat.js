/**
 * Chat API Routes
 * Handles conversation and message endpoints for the marketplace chat system
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as Conversation from '../models/Conversation.js';
import * as Message from '../models/Message.js';
import admin from 'firebase-admin';

const router = express.Router();

// ============================================================
// POST /api/chat/find-or-create
// Find or create a conversation between buyer and seller for a card
// ============================================================
router.post('/find-or-create', authenticateToken, async (req, res) => {
  try {
    const buyerId = req.user.userId; // From JWT token
    const { sellerId, cardId } = req.body;
    
    // Validation
    if (!sellerId || !cardId) {
      return res.status(400).json({
        success: false,
        error: 'sellerId and cardId are required'
      });
    }
    
    // Can't chat with yourself
    if (buyerId === sellerId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot create conversation with yourself'
      });
    }
    
    
    // Try to find existing conversation
    let conversation = await Conversation.findConversation(buyerId, sellerId, cardId);
    
    if (conversation) {
      
      return res.json({
        success: true,
        conversationId: conversation.id,
        conversation,
        isNew: false
      });
    }
    
    // Create new conversation
    conversation = await Conversation.createConversation(buyerId, sellerId, cardId);
    
    
    res.json({
      success: true,
      conversationId: conversation.id,
      conversation,
      isNew: true
    });
    
  } catch (error) {
    console.error('❌ ERROR IN FIND-OR-CREATE:', error);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to create conversation',
      details: error.message
    });
  }
});

// ============================================================
// GET /api/chat/my-conversations
// Get all conversations for the authenticated user
// ============================================================
router.get('/my-conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // From JWT token
    
    
    // Get all conversations where user is a participant
    const conversations = await Conversation.getUserConversations(userId);
    
    
    // Enrich each conversation with user details and card info
    const db = admin.firestore();
    const enrichedConversations = [];
    
    for (const conv of conversations) {
      try {
        // Determine the "other user" ID
        const otherUserId = conv.participants.find(id => id !== userId);
        
        // Fetch other user's details
        let otherUser = null;
        try {
          if (otherUserId) {
            const userDoc = await db.collection('users').doc(otherUserId).get();
            if (userDoc.exists) {
              const userData = userDoc.data();
              otherUser = {
                id: userDoc.id,
                name: userData.name,
                email: userData.email
              };
            }
          }
        } catch (err) {
          console.error(`⚠️ Error fetching user ${otherUserId}:`, err.message);
        }
        
        // Fetch card details
        let card = null;
        try {
          if (conv.cardId) {
            const cardDoc = await db.collection('cards').doc(conv.cardId).get();
            if (cardDoc.exists) {
              const cardData = cardDoc.data();
              card = {
                id: cardDoc.id,
                name: cardData.name,
                imageUrl: cardData.imageUrl,
                price: cardData.price
              };
            }
          }
        } catch (err) {
          console.error(`⚠️ Error fetching card ${conv.cardId}:`, err.message);
        }
        
        // Get unread count
        let unreadCount = 0;
        try {
          unreadCount = await Message.getUnreadCount(conv.id, userId);
        } catch (err) {
          console.error(`⚠️ Error getting unread count:`, err.message);
        }
        
        enrichedConversations.push({
          id: conv.id,
          participants: conv.participants,
          buyerId: conv.buyerId,
          sellerId: conv.sellerId,
          cardId: conv.cardId,
          lastMessage: conv.lastMessage || null,
          lastMessageAt: conv.lastMessageAt || null,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
          otherUser,
          card,
          unreadCount
        });
      } catch (convError) {
        console.error(`⚠️ Error enriching conversation ${conv.id}:`, convError.message);
        // Skip this conversation if there's an error
        continue;
      }
    }
    
    res.json({
      success: true,
      conversations: enrichedConversations
    });
    
  } catch (error) {
    console.error('❌ ERROR FETCHING CONVERSATIONS:', error);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations',
      details: error.message
    });
  }
});

// ============================================================
// GET /api/chat/:conversationId/messages
// Get all messages for a specific conversation
// ============================================================
router.get('/:conversationId/messages', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // From JWT token
    const { conversationId } = req.params;
    const { limit = 50, lastMessageId } = req.query;
    
    
    // Verify conversation exists
    const conversation = await Conversation.getConversationById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }
    
    // Verify user is participant in this conversation
    const isParticipant = await Conversation.isParticipant(conversationId, userId);
    
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to view this conversation'
      });
    }
    
    
    // Fetch messages
    const messages = await Message.getMessages(conversationId, parseInt(limit), lastMessageId);
    
    
    // Mark messages as read
    try {
      await Message.markMessagesAsRead(conversationId, userId);
    } catch (markReadError) {
      console.error('⚠️ Failed to mark messages as read:', markReadError.message);
      // Don't fail the request if marking as read fails
    }
    
    res.json({
      success: true,
      messages,
      conversationId
    });
    
  } catch (error) {
    console.error('❌ ERROR FETCHING MESSAGES:', error);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages',
      details: error.message // Include error details for debugging
    });
  }
});

// ============================================================
// POST /api/chat/:conversationId/messages
// Send a new message (REST endpoint as backup to Socket.IO)
// ============================================================
router.post('/:conversationId/messages', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { conversationId } = req.params;
    const { text } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message text is required'
      });
    }
    
    // Verify user is participant
    const isParticipant = await Conversation.isParticipant(conversationId, userId);
    
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to send messages in this conversation'
      });
    }
    
    // Create message
    const message = await Message.createMessage(conversationId, userId, text);
    
    // Update conversation's last message
    await Conversation.updateLastMessage(conversationId, text, message.createdAt);
    
    
    res.json({
      success: true,
      message
    });
    
  } catch (error) {
    console.error('❌ ERROR SENDING MESSAGE:', error);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
      details: error.message
    });
  }
});

export default router;

