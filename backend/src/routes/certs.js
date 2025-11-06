import express from 'express';
import OpenAI from 'openai';
import admin from 'firebase-admin';
import { authenticateToken } from '../middleware/auth.js';
import { getCert, getPSACardDetails } from '../services/psaService.js';
import { getCardByCert, upsertCard } from '../services/firebaseDb.js';
import { getFirestore } from '../services/firebase.js';

const router = express.Router();

let openaiClient = null;

function getOpenAIClient() {
  if (openaiClient) return openaiClient;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw Object.assign(new Error('OPENAI_API_KEY is not configured'), {
      status: 500,
      code: 'OPENAI_KEY_MISSING'
    });
  }

  openaiClient = new OpenAI({ apiKey });
  return openaiClient;
}

// Require auth for all cert routes
router.use(authenticateToken);

function normalizeCertNumber(raw) {
  const trimmed = String(raw || '').trim();
  if (!trimmed) {
    return null;
  }
  if (!/^[0-9]+$/.test(trimmed)) {
    return null;
  }
  return trimmed;
}

router.get('/:certNumber', async (req, res) => {
  const certNumber = normalizeCertNumber(req.params.certNumber);

  if (!certNumber) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_CERT',
      message: 'Certification numbers must be numeric.',
    });
  }

  try {
    const cert = await getCert(certNumber);
    const existing = await getCardByCert(certNumber);

    const payload = existing
      ? { ...cert, existing_card: existing }
      : cert;

    return res.json({
      success: true,
      cert: payload,
    });
  } catch (error) {
    const status = Number.isInteger(error?.status) && error.status > 0 ? error.status : 500;
    return res.status(status).json({
      success: false,
      error: error?.code || 'PSA_LOOKUP_FAILED',
      message: error?.message || 'Failed to fetch PSA certification.',
    });
  }
});

router.post('/extract', async (req, res) => {
  const rawInput = String(req.body?.image || '').trim();

  if (!rawInput) {
    return res.status(400).json({
      success: false,
      error: 'IMAGE_REQUIRED',
      message: 'Image payload is required.',
    });
  }

  let dataUrl = rawInput;
  let pureBase64 = rawInput;

  if (rawInput.startsWith('data:')) {
    const [, base64Part] = rawInput.split(',');
    if (!base64Part) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_IMAGE',
        message: 'Image payload is not valid base64 content.',
      });
    }
    pureBase64 = base64Part.trim();
  } else {
    // Assume JPEG if no data URL prefix provided
    dataUrl = `data:image/jpeg;base64,${rawInput}`;
    pureBase64 = rawInput;
  }

  if (!pureBase64) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_IMAGE',
      message: 'Image payload is not valid base64 content.',
    });
  }

  if (pureBase64.length > 20 * 1024 * 1024) {
    return res.status(413).json({
      success: false,
      error: 'IMAGE_TOO_LARGE',
      message: 'Image payload exceeds the 20MB limit.',
    });
  }

  try {
    const client = getOpenAIClient();

    const response = await client.responses.create({
      model: 'gpt-4o-mini',
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'input_text',
              text: 'You are an assistant that reads PSA-graded trading card labels from photos. Extract only the PSA certification number shown on the label. Respond in strict JSON with fields "certNumber" (string of digits) and "confidence" (number between 0 and 1). Confidence should reflect how certain you are that the number is accurate.'
            }
          ]
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: 'Identify the PSA certification number on this label. If you cannot see it clearly, set confidence to 0 and leave certNumber empty.'
            },
            {
              type: 'input_image',
              image_url: dataUrl
            }
          ]
        }
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'psa_cert_result',
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              certNumber: { type: 'string', description: 'Digits read from the PSA certification label.' },
              confidence: { type: 'number', minimum: 0, maximum: 1, description: 'Confidence score between 0 and 1.' }
            },
            required: ['certNumber', 'confidence']
          },
          strict: true
        }
      }
    });

    const firstOutput = Array.isArray(response?.output?.[0]?.content)
      ? response.output[0].content
      : [];

    let jsonString = null;

    const jsonPart = firstOutput.find((entry) => entry.type === 'output_json' && entry.json_string);
    if (jsonPart) {
      jsonString = jsonPart.json_string;
    }

    if (!jsonString) {
      const textPart = firstOutput.find((entry) => entry.type === 'output_text' && entry.text);
      if (textPart) {
        jsonString = textPart.text;
      }
    }

    if (!jsonString && typeof response?.output_text === 'string') {
      jsonString = response.output_text;
    }

    if (!jsonString) {
      console.warn('OpenAI vision response missing JSON payload:', JSON.stringify(response)?.substring(0, 4000));
      throw Object.assign(new Error('Empty response from OpenAI Vision endpoint'), {
        status: 502,
        code: 'OPENAI_EMPTY_RESPONSE'
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (parseError) {
      throw Object.assign(new Error('OpenAI response was not valid JSON'), {
        status: 502,
        code: 'OPENAI_INVALID_JSON'
      });
    }

    const certNumber = String(parsed?.certNumber || '').replace(/[^0-9]/g, '');
    const confidence = typeof parsed?.confidence === 'number' ? parsed.confidence : null;

    if (!certNumber || certNumber.length < 5 || (confidence !== null && confidence < 0.55)) {
      return res.status(422).json({
        success: false,
        error: 'CERT_NOT_DETECTED',
        message: 'Unable to confidently read the certification number. Please try another photo.',
        confidence: confidence ?? null,
      });
    }

    return res.json({
      success: true,
      certNumber,
      confidence,
      model: response?.model ?? null,
    });
  } catch (error) {
    const status = Number.isInteger(error?.status) && error.status > 0 ? error.status : 500;
    return res.status(status).json({
      success: false,
      error: error?.code || 'CERT_EXTRACTION_FAILED',
      message: error?.message || 'Failed to extract certification number from the image.',
    });
  }
});

router.post('/ingest', async (req, res) => {
  const certNumber = normalizeCertNumber(req.body?.certNumber);

  if (!certNumber) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_CERT',
      message: 'Certification numbers must be numeric.',
    });
  }

  const requestedOwnerEmail = String(req.body?.ownerEmail || '').trim();
  const authEmail = req.user?.email || null;
  const ownerEmail = requestedOwnerEmail || authEmail;

  if (!ownerEmail) {
    return res.status(400).json({
      success: false,
      error: 'OWNER_EMAIL_REQUIRED',
      message: 'Owner email is required to ingest a card.',
    });
  }

  if (authEmail && requestedOwnerEmail && requestedOwnerEmail !== authEmail) {
    return res.status(403).json({
      success: false,
      error: 'OWNER_MISMATCH',
      message: 'Authenticated user does not match requested owner email.',
    });
  }

  try {
    const cert = await getCert(certNumber);
    let psaDetails = null;

    try {
      psaDetails = await getPSACardDetails(certNumber);
    } catch (detailError) {
      console.warn(`⚠️ PSA detail fetch failed for ${certNumber}:`, detailError?.message || detailError);
    }

    const cardData = {
      cert_number: certNumber,
      card_name: cert.item_title,
      card_number: cert.card_number || psaDetails?.cardNumber || null,
      set_name: cert.brand_title || cert.subject || null,
      psa_grade: cert.grade ? parseInt(String(cert.grade).replace(/[^0-9]/g, ''), 10) || null : null,
      release_year: cert.year ? parseInt(cert.year, 10) || null : null,
      year: psaDetails?.year || cert.year || null,
      grade_description: psaDetails?.gradeDescription || null,
      variety: psaDetails?.variety || cert.variety_pedigree || null,
      cert_date: psaDetails?.certification?.dateGraded || null,
      category: cert.category || null,
      psa_population: cert.psa_population?.toString() || null,
      psa_pop_higher: cert.psa_pop_higher?.toString() || null,
      label_type: cert.label_type || null,
      reverse_barcode: cert.reverse_cert_barcode ? 1 : 0,
      variety_pedigree: cert.variety_pedigree || null,
      last_sale_price: cert.last_sale?.price || null,
      last_sale_date: cert.last_sale?.date || null,
      last_sale_market: cert.last_sale?.market || null,
      last_sale_source: cert.last_sale?.source || null,
      last_sale_listing_url: cert.last_sale?.listing_url || null,
      image_url: cert.images?.left || null,
      image_back_url: cert.images?.right || null,
      brand_title: cert.brand_title || null,
      subject: cert.subject || null,
    };

    Object.keys(cardData).forEach((key) => {
      if (cardData[key] === undefined) {
        delete cardData[key];
      }
    });

    await upsertCard(cardData);

    const db = getFirestore();
    const now = new Date().toISOString();
    let listingInfo = null;

    // Prioritize userId from JWT for lookup; fallback to email query
    const userId = req.user?.userId || null;
    let resolvedEmail = ownerEmail || req.user?.email || null;
    
    // Declare userRef here, initialized to null
    let userRef = null; 

    if (userId) {
      const docRef = db.collection('users').doc(userId);
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        // ✅ userRef is assigned here
        userRef = docRef; 
      }
    }

    if (!userRef) {
      const userSnap = await db
        .collection('users')
        .where('email', '==', ownerEmail)
        .limit(1)
        .get();

      if (!userSnap.empty) {
        userRef = userSnap.docs[0].ref;
      }
    }

    if (!userRef) {
      resolvedEmail = ownerEmail || req.user?.email || null;
      if (!resolvedEmail) {
        return res.status(404).json({
          success: false,
          error: 'OWNER_NOT_FOUND',
          message: 'Could not find a user record for the provided email.',
        });
      }

      const fallbackName =
        req.user?.username ||
        resolvedEmail.split('@')[0]?.replace(/[^a-zA-Z0-9]+/g, ' ') ||
        'Collector';

      const newUserRef = await db.collection('users').add({
        email: resolvedEmail,
        name: fallbackName,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        cards: []
      });

      console.log(`🔧 Created user placeholder for ${resolvedEmail} (id=${newUserRef.id})`);
      userRef = newUserRef;
    }

    const userDocSnap = await userRef.get();
    const currentCards = userDocSnap.get('cards') || [];
    if (!currentCards.includes(certNumber)) {
       await userRef.update({ cards: [...currentCards, certNumber] });
    }

    const listingsRef = userRef.collection('listings').doc(certNumber);
    const existingListing = await listingsRef.get();

    const listingEmail = resolvedEmail || ownerEmail || req.user?.email || null;

    const listingPayload = {
      cert_number: certNumber,
      sellerEmail: listingEmail,
      sellerId: userRef.id,
      updated_at: now,
    };

    if (!existingListing.exists) {
      listingPayload.created_at = now;
      listingPayload.status = 'display';
      if (typeof req.body?.listing_price === 'number') {
        listingPayload.listing_price = req.body.listing_price;
      } else {
        listingPayload.listing_price = null;
      }
    }

    await listingsRef.set(listingPayload, { merge: true });

    listingInfo = {
      sellerId: userRef.id,
      sellerEmail: ownerEmail,
      id: listingsRef.id,
    };

    return res.json({
      success: true,
      message: 'Card ingested successfully.',
      cert,
      card: cardData,
      listing: listingInfo,
    });
  } catch (error) {
    const status = Number.isInteger(error?.status) && error.status > 0 ? error.status : 500;
    return res.status(status).json({
      success: false,
      error: error?.code || 'INGEST_FAILED',
      message: error?.message || 'Failed to ingest certification.',
    });
  }
});

export default router;
