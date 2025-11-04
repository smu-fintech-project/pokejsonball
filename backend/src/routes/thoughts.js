import express from 'express';
import admin from 'firebase-admin';
import {
  createThought, listThoughts, getThought,
  addComment, listComments, COLLECTIONS
} from '../services/firebaseDb.js';

// If you already have a JWT middleware:
import { authenticateToken as requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/thoughts?limit=20&cursor=docId
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 50);
    const cursor = req.query.cursor || null;
    const communityId = req.query.communityId || null;
    const result = await listThoughts({ limit, cursor, communityId });
    res.json(result);
  } catch (e) {
    console.error('list thoughts error:', e.message);
    res.status(500).json({ error: 'FAILED_LIST' });
  }
});

// POST /api/thoughts  (protected)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, body, imageUrl, communityId } = req.body || {};
    if (!title || !body) return res.status(400).json({ error: 'TITLE_BODY_REQUIRED' });

    const user = req.user; // set by requireAuth
    const authorId = user.userId || user.id;
    const authorEmail = user.email;
    const authorName = user.name || authorEmail;
    const authorAvatar = user.avatar || null;
    const payload = await createThought({
      authorId, authorName, authorEmail, authorAvatar, title, body, imageUrl, communityId
    });

    res.status(201).json(payload);
  } catch (e) {
    console.error('create thought error:', e.message);
    res.status(500).json({ error: 'FAILED_CREATE' });
  }      
});

// GET /api/thoughts/:id
router.get('/:id', async (req, res) => {
  try {
    const t = await getThought(req.params.id);
    if (!t) return res.status(404).json({ error: 'NOT_FOUND' });
    res.json(t);
  } catch (e) {
    res.status(500).json({ error: 'FAILED_GET' });
  }
});

// GET /api/thoughts/:id/comments?limit=20&cursor=docId
router.get('/:id/comments', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 50);
    const cursor = req.query.cursor || null;
    const result = await listComments(req.params.id, { limit, cursor });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'FAILED_LIST_COMMENTS' });
  }
});

// POST /api/thoughts/:id/comments  (protected)
router.post('/:id/comments', requireAuth, async (req, res) => {
  try {
    const { body } = req.body || {};
    if (!body) return res.status(400).json({ error: 'BODY_REQUIRED' });

    const user = req.user; // from JWT
    const authorId = user.userId || user.id || user.uid || user.email;
    const authorEmail = user.email;
    const authorName = user.name || authorEmail || 'Anonymous';
    const authorAvatar = user.avatar || null;

    const comment = await addComment(req.params.id, {
      authorId,
      authorEmail,
      authorName,
      authorAvatar,
      body,
    });

    res.status(201).json(comment);
  } catch (e) {
    res.status(500).json({ error: 'FAILED_ADD_COMMENT' });
  }
});

// Accept 0 to "unvote"
function normalizeVote(v) {
  const n = Number(v);
  if (n === 1 || n === -1 || n === 0) return n;
  return null;
}

// POST /api/thoughts/:id/vote
router.post('/:id/vote', requireAuth, async (req, res) => {
  try {
    const value = normalizeVote(req.body?.value);
    if (value === null) return res.status(400).json({ error: 'INVALID_VALUE' });

    const db = admin.firestore();
    const thoughtRef = db.collection(COLLECTIONS.THOUGHTS).doc(req.params.id);

    const uid = req.user?.userId || req.user?.id || req.user?.uid || req.user?.email;
    if (!uid) return res.status(401).json({ error: 'NO_USER_ID' });

    const voteRef = thoughtRef.collection('votes').doc(String(uid));

    let after = { upvotes: 0, downvotes: 0, userVote: value };

    await db.runTransaction(async (tx) => {
      const [tSnap, vSnap] = await Promise.all([tx.get(thoughtRef), tx.get(voteRef)]);
      if (!tSnap.exists) throw new Error('NOT_FOUND');

      let up = tSnap.data().upvotes || 0;
      let down = tSnap.data().downvotes || 0;

      const prev = vSnap.exists ? (vSnap.data().value || 0) : 0;
      if (prev === value) {
        after = { upvotes: up, downvotes: down, userVote: prev };
        return; // nothing to change
      }

      // remove previous contribution
      if (prev === 1) up--;
      if (prev === -1) down--;

      if (value === 0) {
        // unvote
        tx.delete(voteRef);
      } else {
        // add new contribution
        if (value === 1) up++;
        if (value === -1) down++;
        tx.set(voteRef, { value }, { merge: true });
      }

      tx.update(thoughtRef, { upvotes: up, downvotes: down, updatedAt: new Date().toISOString() });
      after = { upvotes: up, downvotes: down, userVote: value };
    });

    // Return new counts so UI can reconcile
    res.json({ success: true, ...after });
  } catch (e) {
    const code = e.message === 'NOT_FOUND' ? 404 : 500;
    res.status(code).json({ error: e.message || 'FAILED_VOTE' });
  }
});

// POST /api/thoughts/:id/comments/:commentId/vote
router.post('/:id/comments/:commentId/vote', requireAuth, async (req, res) => {
  try {
    const value = normalizeVote(req.body?.value);
    if (value === null) return res.status(400).json({ error: 'INVALID_VALUE' });

    const db = admin.firestore();
    const cRef = db.collection(COLLECTIONS.THOUGHTS).doc(req.params.id)
      .collection('comments').doc(req.params.commentId);

    const uid = req.user?.userId || req.user?.id || req.user?.uid || req.user?.email;
    if (!uid) return res.status(401).json({ error: 'NO_USER_ID' });

    const voteRef = cRef.collection('votes').doc(String(uid));

    let after = { upvotes: 0, downvotes: 0, userVote: value };

    await db.runTransaction(async (tx) => {
      const [cSnap, vSnap] = await Promise.all([tx.get(cRef), tx.get(voteRef)]);
      if (!cSnap.exists) throw new Error('NOT_FOUND');

      let up = cSnap.data().upvotes || 0;
      let down = cSnap.data().downvotes || 0;

      const prev = vSnap.exists ? (vSnap.data().value || 0) : 0;
      if (prev === value) {
        after = { upvotes: up, downvotes: down, userVote: prev };
        return;
      }

      if (prev === 1) up--;
      if (prev === -1) down--;

      if (value === 0) {
        tx.delete(voteRef);
      } else {
        if (value === 1) up++;
        if (value === -1) down++;
        tx.set(voteRef, { value }, { merge: true });
      }

      tx.update(cRef, { upvotes: up, downvotes: down, updatedAt: new Date().toISOString() });
      after = { upvotes: up, downvotes: down, userVote: value };
    });

    res.json({ success: true, ...after });
  } catch (e) {
    const code = e.message === 'NOT_FOUND' ? 404 : 500;
    res.status(code).json({ error: e.message || 'FAILED_VOTE' });
  }
});

// --- Communities minimal endpoints ---

// GET /api/communities
router.get('/../communities', async (req, res, next) => next()); // no-op to keep Express ordering happy

// We attach to app as /api/communities using a child router to avoid path conflicts:

const communitiesRouter = express.Router();
export { communitiesRouter }; // optional export if you mount elsewhere

import {
  listCommunities,
  createCommunity,
  setUserFavouriteCommunity,
} from '../services/firebaseDb.js';

// GET /api/communities
communitiesRouter.get('/', async (req, res) => {
  try {
    const uid = req.user?.userId || req.user?.id || req.user?.uid || req.user?.email || null;
    const items = await listCommunities(uid); // pass uid so we can mark favourites
    res.json({ items });
  } catch (e) {
    res.status(500).json({ error: 'FAILED_LIST_COMMUNITIES' });
  }
});

// POST /api/communities (protected)
communitiesRouter.post('/', requireAuth, async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body || {};
    if (!name) return res.status(400).json({ error: 'NAME_REQUIRED' });

    const user = req.user;
    const creatorId = user.userId || user.id || user.uid || user.email;
    const created = await createCommunity({ name, description, imageUrl, creatorId });

    // auto-favourite by creator
    await setUserFavouriteCommunity(creatorId, created.id, true);

    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: 'FAILED_CREATE_COMMUNITY' });
  }
});

// POST /api/communities/:id/favourite (protected)
communitiesRouter.post('/:id/favourite', requireAuth, async (req, res) => {
  try {
    const { favourited } = req.body || {};
    const uid = req.user?.userId || req.user?.id || req.user?.uid || req.user?.email;
    if (!uid) return res.status(401).json({ error: 'NO_USER_ID' });

    await setUserFavouriteCommunity(uid, req.params.id, !!favourited);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'FAILED_TOGGLE_FAV' });
  }
});

export default router;

