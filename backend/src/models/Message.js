/**
 * Message Model (Firestore)
 * Represents individual messages within a conversation
 */

import admin from 'firebase-admin';

/**
 * Create a new message
 * @param {string} conversationId - The conversation ID
 * @param {string} senderId - The sender's user ID
 * @param {string} text - The message content
 * @returns {Promise<Object>} The created message with ID
 */
export async function createMessage(conversationId, senderId, text) {
  const db = admin.firestore();
  
  const messageData = {
    conversationId,
    senderId,
    text: text.trim(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    read: false
  };
  
  const messageRef = await db.collection('messages').add(messageData);
  
  // Return with actual timestamp for immediate use
  return {
    id: messageRef.id,
    ...messageData,
    createdAt: new Date()
  };
}

/**
 * Get all messages for a conversation
 * @param {string} conversationId - The conversation ID
 * @param {number} limit - Maximum number of messages to return (default: 50)
 * @param {string|null} lastMessageId - ID of last message for pagination
 * @returns {Promise<Array>} Array of messages
 */
export async function getMessages(conversationId, limit = 50, lastMessageId = null) {
  const db = admin.firestore();
  
  try {
    let query = db.collection('messages')
      .where('conversationId', '==', conversationId)
      .limit(limit);
    
    // Pagination: start after the last message
    if (lastMessageId) {
      const lastDoc = await db.collection('messages').doc(lastMessageId).get();
      if (lastDoc.exists) {
        query = query.startAfter(lastDoc);
      }
    }
    
    const snapshot = await query.get();
    
    const messages = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Convert Firestore Timestamp to ISO string for JSON serialization
      let createdAt = data.createdAt;
      if (createdAt?.toDate) {
        createdAt = createdAt.toDate().toISOString();
      } else if (createdAt?._seconds) {
        // Handle serialized Firestore timestamp
        createdAt = new Date(createdAt._seconds * 1000).toISOString();
      }
      
      messages.push({
        id: doc.id,
        conversationId: data.conversationId,
        senderId: data.senderId,
        text: data.text,
        read: data.read,
        createdAt: createdAt
      });
    });
    
    // Sort by timestamp (oldest first) - now using ISO strings
    messages.sort((a, b) => {
      const timeA = new Date(a.createdAt);
      const timeB = new Date(b.createdAt);
      return timeA - timeB;
    });
    
    return messages;
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    throw error;
  }
}

/**
 * Mark messages as read
 * @param {string} conversationId - The conversation ID
 * @param {string} userId - The user ID who is reading
 * @returns {Promise<number>} Number of messages marked as read
 */
export async function markMessagesAsRead(conversationId, userId) {
  const db = admin.firestore();
  
  try {
    // Simpler query: just get all messages in conversation
    const snapshot = await db.collection('messages')
      .where('conversationId', '==', conversationId)
      .get();
    
    const batch = db.batch();
    let updateCount = 0;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      // Only mark as read if: not sent by current user AND currently unread
      if (data.senderId !== userId && data.read === false) {
        batch.update(doc.ref, { read: true });
        updateCount++;
      }
    });
    
    if (updateCount > 0) {
      await batch.commit();
    }
    
    return updateCount;
  } catch (error) {
    console.error('❌ Error marking messages as read:', error);
    // Don't throw - just return 0
    return 0;
  }
}

/**
 * Get unread message count for a conversation
 * @param {string} conversationId - The conversation ID
 * @param {string} userId - The user ID to check unread for
 * @returns {Promise<number>} Number of unread messages
 */
export async function getUnreadCount(conversationId, userId) {
  const db = admin.firestore();
  
  try {
    // Simpler query: get all messages and count in JavaScript
    const snapshot = await db.collection('messages')
      .where('conversationId', '==', conversationId)
      .get();
    
    let unreadCount = 0;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      // Count if: not sent by current user AND currently unread
      if (data.senderId !== userId && data.read === false) {
        unreadCount++;
      }
    });
    
    return unreadCount;
  } catch (error) {
    console.error('❌ Error getting unread count:', error);
    return 0;
  }
}

/**
 * Delete a message
 * @param {string} messageId - The message ID
 * @param {string} senderId - The sender's ID (for verification)
 * @returns {Promise<boolean>} True if deleted
 */
export async function deleteMessage(messageId, senderId) {
  const db = admin.firestore();
  
  const messageDoc = await db.collection('messages').doc(messageId).get();
  
  if (!messageDoc.exists) {
    return false;
  }
  
  const messageData = messageDoc.data();
  
  // Only allow sender to delete their own message
  if (messageData.senderId !== senderId) {
    return false;
  }
  
  await db.collection('messages').doc(messageId).delete();
  
  return true;
}

