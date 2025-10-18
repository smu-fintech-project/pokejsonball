/**
 * Conversation Model (Firestore)
 * Represents a chat conversation between two users about a specific card listing
 */

import admin from 'firebase-admin';

/**
 * Create a new conversation
 * @param {string} buyerId - The buyer's user ID
 * @param {string} sellerId - The seller's user ID
 * @param {string} cardId - The card listing ID
 * @returns {Promise<Object>} The created conversation with ID
 */
export async function createConversation(buyerId, sellerId, cardId) {
  const db = admin.firestore();
  
  // Sort participants to ensure consistent querying
  const participants = [buyerId, sellerId].sort();
  
  const conversationData = {
    participants,
    buyerId,
    sellerId,
    cardId,
    lastMessage: null,
    lastMessageAt: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
  
  const conversationRef = await db.collection('conversations').add(conversationData);
  
  return {
    id: conversationRef.id,
    ...conversationData
  };
}

/**
 * Find existing conversation between two users for a specific card
 * @param {string} buyerId - The buyer's user ID
 * @param {string} sellerId - The seller's user ID
 * @param {string} cardId - The card listing ID
 * @returns {Promise<Object|null>} The conversation or null if not found
 */
export async function findConversation(buyerId, sellerId, cardId) {
  const db = admin.firestore();
  
  // First, try to find with buyerId and sellerId in the given order
  let snapshot = await db.collection('conversations')
    .where('buyerId', '==', buyerId)
    .where('sellerId', '==', sellerId)
    .where('cardId', '==', cardId)
    .limit(1)
    .get();
  
  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  }
  
  // If not found, try reversed (in case roles were swapped)
  snapshot = await db.collection('conversations')
    .where('buyerId', '==', sellerId)
    .where('sellerId', '==', buyerId)
    .where('cardId', '==', cardId)
    .limit(1)
    .get();
  
  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  }
  
  // Still not found? Try using participants array (in case structure changed)
  const allConversations = await db.collection('conversations')
    .where('cardId', '==', cardId)
    .get();
  
  for (const doc of allConversations.docs) {
    const data = doc.data();
    const participants = data.participants || [];
    
    // Check if both users are participants
    if (participants.includes(buyerId) && participants.includes(sellerId)) {
      return {
        id: doc.id,
        ...data
      };
    }
  }
  
  return null;
}

/**
 * Get conversation by ID
 * @param {string} conversationId - The conversation ID
 * @returns {Promise<Object|null>} The conversation or null if not found
 */
export async function getConversationById(conversationId) {
  const db = admin.firestore();
  
  const doc = await db.collection('conversations').doc(conversationId).get();
  
  if (!doc.exists) {
    return null;
  }
  
  return {
    id: doc.id,
    ...doc.data()
  };
}

/**
 * Get all conversations for a user
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} Array of conversations
 */
export async function getUserConversations(userId) {
  const db = admin.firestore();
  
  try {
    // Try with orderBy first
    const snapshot = await db.collection('conversations')
      .where('participants', 'array-contains', userId)
      .orderBy('updatedAt', 'desc')
      .get();
    
    const conversations = [];
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      conversations.push({
        id: doc.id,
        ...data
      });
    }
    
    return conversations;
  } catch (error) {
    // If orderBy fails (missing index), fetch without ordering
    
    const snapshot = await db.collection('conversations')
      .where('participants', 'array-contains', userId)
      .get();
    
    const conversations = [];
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      conversations.push({
        id: doc.id,
        ...data
      });
    }
    
    // Sort in JavaScript
    conversations.sort((a, b) => {
      const timeA = a.updatedAt?.toDate ? a.updatedAt.toDate() : new Date(0);
      const timeB = b.updatedAt?.toDate ? b.updatedAt.toDate() : new Date(0);
      return timeB - timeA;
    });
    
    return conversations;
  }
}

/**
 * Update conversation's last message info
 * @param {string} conversationId - The conversation ID
 * @param {string} messageText - The last message text
 * @param {Date} timestamp - The message timestamp
 * @returns {Promise<void>}
 */
export async function updateLastMessage(conversationId, messageText, timestamp) {
  const db = admin.firestore();
  
  await db.collection('conversations').doc(conversationId).update({
    lastMessage: messageText,
    lastMessageAt: timestamp,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

/**
 * Check if user is participant in conversation
 * @param {string} conversationId - The conversation ID
 * @param {string} userId - The user ID to check
 * @returns {Promise<boolean>} True if user is participant
 */
export async function isParticipant(conversationId, userId) {
  const conversation = await getConversationById(conversationId);
  
  if (!conversation) {
    return false;
  }
  
  return conversation.participants.includes(userId);
}

