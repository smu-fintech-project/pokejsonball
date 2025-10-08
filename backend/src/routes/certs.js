/**
 * PSA Cert Gallery API Routes
 * 
 * Endpoints:
 * - GET /api/certs?ids=comma,separated,certs - Batch fetch PSA certs
 * - GET /api/certs/all - Get all configured certs
 */

import express from 'express';
import { batchGetCerts } from '../services/psaService.js';
import adminAuth from '../middleware/adminAuth.js';
import CERT_NUMBERS from '../config/certs.js';

const router = express.Router();

/**
 * GET /api/certs/all
 * Get all configured cert numbers
 */
router.get('/all', adminAuth, async (req, res) => {
  try {
    res.json({
      success: true,
      count: CERT_NUMBERS.length,
      cert_numbers: CERT_NUMBERS
    });
  } catch (error) {
    console.error('❌ Get all certs error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch cert numbers'
    });
  }
});

/**
 * GET /api/certs?ids=comma,separated,certs
 * Batch fetch PSA certification data
 * 
 * Query params:
 * - ids: comma-separated list of PSA cert numbers (max 50)
 * 
 * Returns: Array of normalized cert objects with metadata, images, and last sale info
 */
router.get('/', adminAuth, async (req, res) => {
  try {
    const { ids } = req.query;
    
    // Validate input
    if (!ids) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_REQUEST',
        message: 'Missing required parameter: ids (comma-separated cert numbers)'
      });
    }
    
    // Parse and sanitize cert numbers
    const certNumbers = ids
      .split(',')
      .map(cert => cert.trim())
      .filter(cert => /^\d+$/.test(cert)); // Only allow numeric cert numbers
    
    if (certNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_REQUEST',
        message: 'No valid cert numbers provided. Cert numbers must be numeric.'
      });
    }
    
    // Enforce batch size limit
    if (certNumbers.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'BATCH_TOO_LARGE',
        message: 'Maximum 50 certs per request. Provided: ' + certNumbers.length
      });
    }
    
    console.log(`\n📋 Fetching ${certNumbers.length} certs:`, certNumbers.join(', '));
    
    // Fetch cert data with rate limiting and caching
    const { results, errors } = await batchGetCerts(certNumbers);
    
    // Return response with partial failure support
    const response = {
      success: true,
      count: results.length,
      certs: results
    };
    
    if (errors && errors.length > 0) {
      response.errors = errors;
      response.message = `Fetched ${results.length} certs with ${errors.length} partial failures`;
    }
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Cert batch fetch error:', error);
    
    // Handle specific error types
    if (error.code === 'RATE_LIMIT_EXCEEDED') {
      return res.status(429).json({
        success: false,
        error: error.code,
        message: error.message,
        retryAfter: 60
      });
    }
    
    if (error.code === 'AUTH_FAILED') {
      return res.status(401).json({
        success: false,
        error: error.code,
        message: error.message
      });
    }
    
    // Generic error
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch cert data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/certs/:certNumber
 * Get single cert details
 */
router.get('/:certNumber', adminAuth, async (req, res) => {
  try {
    const { certNumber } = req.params;
    
    // Validate cert number
    if (!/^\d+$/.test(certNumber)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_CERT_NUMBER',
        message: 'Cert number must be numeric'
      });
    }
    
    console.log(`\n🔍 Fetching single cert: ${certNumber}`);
    
    const { results, errors } = await batchGetCerts([certNumber]);
    
    if (results.length === 0 || results[0].error) {
      return res.status(404).json({
        success: false,
        error: 'CERT_NOT_FOUND',
        message: `PSA certificate ${certNumber} not found or unavailable`,
        details: errors?.[0]
      });
    }
    
    res.json({
      success: true,
      cert: results[0]
    });
    
  } catch (error) {
    console.error(`❌ Cert fetch error for ${req.params.certNumber}:`, error);
    
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch cert data'
    });
  }
});

export default router;

