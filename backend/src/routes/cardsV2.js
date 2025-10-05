/**
 * Cards API Routes (Version 2 - Production Ready)
 * 
 * Endpoints:
 * - GET /api/v2/cards - List all cards
 * - GET /api/v2/cards/:cert - Get complete card details
 * - GET /api/v2/cards/:cert/price-comparison - Get price comparison
 * - POST /api/v2/cards/batch - Batch fetch multiple cards
 * - GET /api/v2/health - API health check
 */

import express from 'express';
import { getDb } from '../db.js';
import { getCompleteCardInfo, batchGetCompleteCardInfo, getPriceComparison } from '../services/cardIntegrationService.js';
import { checkPSAAPIHealth } from '../services/psaService.js';
import { checkTCGAPIHealth } from '../services/pokemonTCGService.js';

const router = express.Router();

/**
 * GET /api/v2/cards
 * List all cards from database
 */
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const { limit = 200, offset = 0, grade, set } = req.query;
    
    let query = 'SELECT * FROM cards';
    const params = [];
    const conditions = [];
    
    if (grade) {
      conditions.push('psa_grade = ?');
      params.push(grade);
    }
    
    if (set) {
      conditions.push('set_name = ?');
      params.push(set);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY id LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const rows = db.prepare(query).all(...params);
    
    res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error('List cards error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to list cards',
    });
  }
});

/**
 * GET /api/v2/cards/:cert
 * Get complete card details with PSA + Pokemon TCG data
 */
router.get('/:cert', async (req, res) => {
  const { cert } = req.params;
  
  try {
    const db = getDb();
    
    // Check if card exists in database
    const dbCard = db.prepare('SELECT * FROM cards WHERE cert_number = ?').get(cert);
    
    if (!dbCard) {
      return res.status(404).json({
        success: false,
        error: 'CERT_NOT_FOUND',
        message: `Card with certification number ${cert} not found in database`,
      });
    }
    
    // Fetch complete card information from both APIs
    const cardInfo = await getCompleteCardInfo(cert, dbCard);
    
    // Update database with latest info
    try {
      db.prepare(`
        UPDATE cards 
        SET 
          image_url = COALESCE(?, image_url),
          last_known_price = COALESCE(?, last_known_price),
          updated_at = CURRENT_TIMESTAMP
        WHERE cert_number = ?
      `).run(
        cardInfo.images.displayImage,
        cardInfo.pricing.currentMarketPrice,
        cert
      );
    } catch (updateError) {
      console.warn('Failed to update card in database:', updateError.message);
    }
    
    res.json({
      success: true,
      data: cardInfo,
    });
    
  } catch (error) {
    console.error(`Card fetch error for cert ${cert}:`, error);
    
    // Handle specific error types
    if (error.code === 'CERT_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: error.code,
        message: error.message,
      });
    }
    
    if (error.code === 'RATE_LIMIT_EXCEEDED') {
      return res.status(429).json({
        success: false,
        error: error.code,
        message: error.message,
        retryAfter: 60, // seconds
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch card details',
    });
  }
});

/**
 * GET /api/v2/cards/:cert/price-comparison
 * Get price comparison between raw and graded card
 */
router.get('/:cert/price-comparison', async (req, res) => {
  const { cert } = req.params;
  
  try {
    const comparison = await getPriceComparison(cert);
    
    res.json({
      success: true,
      data: comparison,
    });
    
  } catch (error) {
    console.error(`Price comparison error for cert ${cert}:`, error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to get price comparison',
    });
  }
});

/**
 * POST /api/v2/cards/batch
 * Batch fetch multiple cards
 * 
 * Body: { certNumbers: ["123456", "789012", ...] }
 */
router.post('/batch', async (req, res) => {
  try {
    const { certNumbers } = req.body;
    
    if (!Array.isArray(certNumbers) || certNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_REQUEST',
        message: 'certNumbers must be a non-empty array',
      });
    }
    
    if (certNumbers.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'BATCH_TOO_LARGE',
        message: 'Maximum 50 cards per batch request',
      });
    }
    
    const results = await batchGetCompleteCardInfo(certNumbers);
    
    res.json({
      success: true,
      count: results.length,
      data: results,
    });
    
  } catch (error) {
    console.error('Batch fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to batch fetch cards',
    });
  }
});

/**
 * GET /api/v2/health
 * API health check including external API status
 */
router.get('/health', async (req, res) => {
  try {
    const [psaHealth, tcgHealth] = await Promise.allSettled([
      checkPSAAPIHealth(),
      checkTCGAPIHealth(),
    ]);
    
    const db = getDb();
    const cardCount = db.prepare('SELECT COUNT(*) as count FROM cards').get();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        status: 'connected',
        cardCount: cardCount.count,
      },
      externalAPIs: {
        psa: psaHealth.status === 'fulfilled' ? psaHealth.value : { status: 'error', error: psaHealth.reason },
        pokemonTCG: tcgHealth.status === 'fulfilled' ? tcgHealth.value : { status: 'error', error: tcgHealth.reason },
      },
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

export default router;
