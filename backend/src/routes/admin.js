/**
 * Admin Routes
 * Secured endpoints for admin-only operations
 */

import express from 'express';
import adminAuth from '../middleware/adminAuth.js';
import { getFirestore } from '../services/firebase.js';
import admin from 'firebase-admin';

const router = express.Router();

// All routes require admin authentication
router.use(adminAuth);

// ============================================================
// USER MANAGEMENT
// ============================================================

/**
 * GET /api/admin/users - Get all non-admin users
 */
router.get('/users', async (req, res) => {
  try {
    const db = getFirestore();
    const currentAdminEmail = req.user?.email; // Get current admin's email from JWT
    const usersSnap = await db.collection('users').get();
    
    const users = [];
    for (const doc of usersSnap.docs) {
      const data = doc.data();
      
      // Skip admin users (don't show them in the list)
      if (data.isAdmin || data.email === currentAdminEmail) {
        continue;
      }
      
      users.push({
        id: doc.id,
        email: data.email,
        name: data.name,
        avatar: data.avatar || null,
        createdAt: data.createdAt,
        wallet: data.wallet || { balance: 0, currency: 'JSB' }
      });
    }
    
    // Sort by creation date (newest first)
    users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    console.log(`✅ Admin fetched ${users.length} non-admin users`);
    res.json({ users, total: users.length });
  } catch (error) {
    console.error('❌ Admin users fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * DELETE /api/admin/users/:userId - Delete a user and all their data
 */
router.delete('/users/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const db = getFirestore();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userData = userDoc.data();
    
    // Prevent deleting admin users
    if (userData.isAdmin) {
      return res.status(403).json({ error: 'Cannot delete admin users' });
    }
    
    // Delete user subcollections
    const batch = db.batch();
    
    // Delete transactions
    const transactionsSnap = await userRef.collection('transactions').get();
    transactionsSnap.forEach(doc => batch.delete(doc.ref));
    
    // Delete listings
    const listingsSnap = await userRef.collection('listings').get();
    listingsSnap.forEach(doc => batch.delete(doc.ref));
    
    // Delete reviews
    const reviewsSnap = await userRef.collection('reviews').get();
    reviewsSnap.forEach(doc => batch.delete(doc.ref));
    
    // Delete community favourites
    const favsSnap = await userRef.collection('community_favourites').get();
    favsSnap.forEach(doc => batch.delete(doc.ref));
    
    await batch.commit();
    
    // Delete the user document
    await userRef.delete();
    
    console.log(`✅ Admin deleted user ${userId} (${userData.email})`);
    res.json({ 
      success: true, 
      message: `User ${userData.email} deleted successfully`,
      deletedUserId: userId
    });
  } catch (error) {
    console.error('❌ Admin user deletion error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ============================================================
// TRANSACTION STATISTICS
// ============================================================

/**
 * GET /api/admin/transactions/stats - Get transaction statistics
 */
router.get('/transactions/stats', async (req, res) => {
  try {
    const db = getFirestore();
    const usersSnap = await db.collection('users').get();
    
    let totalDeposits = 0;
    let totalWithdrawals = 0;
    let depositCount = 0;
    let withdrawalCount = 0;
    const monthlyData = {};
    
    for (const userDoc of usersSnap.docs) {
      const transactionsSnap = await userDoc.ref.collection('transactions').get();
      
      transactionsSnap.forEach(txDoc => {
        const tx = txDoc.data();
        const amount = tx.amount || 0;
        const type = tx.type || '';
        
        if (type === 'deposit') {
          totalDeposits += amount;
          depositCount++;
        } else if (type === 'withdrawal' || type === 'withdraw') {
          totalWithdrawals += amount;
          withdrawalCount++;
        }
        
        // Monthly aggregation
        if (tx.timestamp) {
          const date = new Date(tx.timestamp);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { deposits: 0, withdrawals: 0, month: monthKey };
          }
          
          if (type === 'deposit') {
            monthlyData[monthKey].deposits += amount;
          } else if (type === 'withdrawal' || type === 'withdraw') {
            monthlyData[monthKey].withdrawals += amount;
          }
        }
      });
    }
    
    // Convert monthly data to array and sort
    const monthlyStats = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
    
    console.log(`✅ Admin fetched transaction stats`);
    res.json({
      summary: {
        totalDeposits,
        totalWithdrawals,
        depositCount,
        withdrawalCount,
        netFlow: totalDeposits - totalWithdrawals
      },
      monthly: monthlyStats
    });
  } catch (error) {
    console.error('❌ Admin transaction stats error:', error);
    res.status(500).json({ error: 'Failed to fetch transaction statistics' });
  }
});

// ============================================================
// COMMUNITY MODERATION
// ============================================================

/**
 * GET /api/admin/thoughts - Get all thoughts with author info and comment count
 */
router.get('/thoughts', async (req, res) => {
  try {
    const db = getFirestore();
    const thoughtsSnap = await db.collection('thoughts')
      .orderBy('createdAt', 'desc')
      .limit(500)
      .get();
    
    const thoughts = [];
    for (const doc of thoughtsSnap.docs) {
      const data = doc.data();
      
      // Get comment count
      const commentsSnap = await doc.ref.collection('comments').get();
      
      thoughts.push({
        id: doc.id,
        title: data.title,
        body: data.body,
        authorName: data.authorName,
        authorEmail: data.authorEmail,
        authorAvatar: data.authorAvatar || null,
        createdAt: data.createdAt,
        upvotes: data.upvotes || 0,
        downvotes: data.downvotes || 0,
        commentsCount: commentsSnap.size,
        imageUrl: data.imageUrl || null,
        communityId: data.communityId || null
      });
    }
    
    console.log(`✅ Admin fetched ${thoughts.length} thoughts`);
    res.json({ thoughts, total: thoughts.length });
  } catch (error) {
    console.error('❌ Admin thoughts fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch thoughts' });
  }
});

/**
 * GET /api/admin/thoughts/:thoughtId - Get thought details with comments
 */
router.get('/thoughts/:thoughtId', async (req, res) => {
  const { thoughtId } = req.params;
  
  try {
    const db = getFirestore();
    const thoughtRef = db.collection('thoughts').doc(thoughtId);
    const thoughtDoc = await thoughtRef.get();
    
    if (!thoughtDoc.exists) {
      return res.status(404).json({ error: 'Thought not found' });
    }
    
    const thoughtData = thoughtDoc.data();
    
    // Get all comments
    const commentsSnap = await thoughtRef.collection('comments').orderBy('createdAt', 'asc').get();
    const comments = commentsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json({
      thought: {
        id: thoughtDoc.id,
        ...thoughtData
      },
      comments
    });
  } catch (error) {
    console.error('❌ Admin thought detail error:', error);
    res.status(500).json({ error: 'Failed to fetch thought details' });
  }
});

/**
 * DELETE /api/admin/thoughts/:thoughtId - Delete a thought
 */
router.delete('/thoughts/:thoughtId', async (req, res) => {
  const { thoughtId } = req.params;
  
  try {
    const db = getFirestore();
    const thoughtRef = db.collection('thoughts').doc(thoughtId);
    const thoughtDoc = await thoughtRef.get();
    
    if (!thoughtDoc.exists) {
      return res.status(404).json({ error: 'Thought not found' });
    }
    
    // Delete all comments in this thought
    const commentsSnap = await thoughtRef.collection('comments').get();
    const batch = db.batch();
    commentsSnap.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    
    // Delete the thought
    await thoughtRef.delete();
    
    console.log(`✅ Admin deleted thought ${thoughtId}`);
    res.json({ 
      success: true, 
      message: 'Thought and all comments deleted successfully',
      deletedThoughtId: thoughtId
    });
  } catch (error) {
    console.error('❌ Admin thought deletion error:', error);
    res.status(500).json({ error: 'Failed to delete thought' });
  }
});

/**
 * DELETE /api/admin/thoughts/:thoughtId/comments/:commentId - Delete a comment
 */
router.delete('/thoughts/:thoughtId/comments/:commentId', async (req, res) => {
  const { thoughtId, commentId } = req.params;
  
  try {
    const db = getFirestore();
    const commentRef = db.collection('thoughts').doc(thoughtId).collection('comments').doc(commentId);
    const commentDoc = await commentRef.get();
    
    if (!commentDoc.exists) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    // Delete the comment
    await commentRef.delete();
    
    // Decrement comment count on thought
    const thoughtRef = db.collection('thoughts').doc(thoughtId);
    await thoughtRef.update({
      commentsCount: admin.firestore.FieldValue.increment(-1)
    }).catch(() => {}); // Ignore if thought doesn't exist
    
    console.log(`✅ Admin deleted comment ${commentId} from thought ${thoughtId}`);
    res.json({ 
      success: true, 
      message: 'Comment deleted successfully',
      deletedCommentId: commentId
    });
  } catch (error) {
    console.error('❌ Admin comment deletion error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

export default router;
