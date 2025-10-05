# Pokemon Card Marketplace API Documentation

## Overview

Production-ready API for fetching Pokemon card details from PSA (grading certification) and Pokemon TCG (market pricing) with intelligent caching, retry logic, and fallback mechanisms.

---

## Table of Contents

1. [Architecture](#architecture)
2. [API Endpoints](#api-endpoints)
3. [External API Integration](#external-api-integration)
4. [Error Handling](#error-handling)
5. [Caching Strategy](#caching-strategy)
6. [Setup & Configuration](#setup--configuration)
7. [Code Examples](#code-examples)

---

## Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│   Express API (Node.js)             │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Card Integration Service    │  │
│  │  (Orchestrates both APIs)    │  │
│  └────┬─────────────────┬───────┘  │
│       │                 │           │
│  ┌────▼────────┐   ┌───▼────────┐  │
│  │ PSA Service │   │ TCG Service│  │
│  └────┬────────┘   └───┬────────┘  │
│       │                │           │
└───────┼────────────────┼───────────┘
        │                │
        ▼                ▼
┌──────────────┐  ┌─────────────────┐
│   PSA API    │  │ Pokemon TCG API │
│  (Grading)   │  │   (Pricing)     │
└──────────────┘  └─────────────────┘
```

---

## API Endpoints

### Base URL
```
http://localhost:3001/api/v2
```

### 1. List All Cards

**Endpoint:** `GET /cards`

**Query Parameters:**
- `limit` (optional): Number of results (default: 200, max: 500)
- `offset` (optional): Pagination offset (default: 0)
- `grade` (optional): Filter by PSA grade (7-10)
- `set` (optional): Filter by set name

**Response:**
```json
{
  "success": true,
  "count": 150,
  "data": [
    {
      "id": 1,
      "cert_number": "116230496",
      "card_name": "Eevee Holo",
      "set_name": "Eeveelution",
      "psa_grade": 10,
      "release_year": 2021,
      "pokemon_tcg_id": "swsh1",
      "series": "Sword & Shield",
      "image_url": "https://...",
      "last_known_price": 125.50
    }
  ]
}
```

---

### 2. Get Card Details

**Endpoint:** `GET /cards/:cert`

**Parameters:**
- `cert`: PSA certification number (e.g., "116230496")

**Response:**
```json
{
  "success": true,
  "data": {
    "certNumber": "116230496",
    "certificationStatus": "Certified",
    "dateGraded": "2023-01-15",
    
    "cardName": "Eevee Holo",
    "setName": "Eeveelution",
    "year": "2021",
    "brand": "Pokemon",
    "variety": "Holo",
    
    "grade": 10,
    "gradeDescription": "GEM MT",
    
    "population": {
      "higher": 0,
      "same": 150,
      "total": 1500
    },
    
    "images": {
      "gradedFront": "https://psa.../front.jpg",
      "gradedBack": "https://psa.../back.jpg",
      "labelFront": "https://psa.../label_front.jpg",
      "labelBack": "https://psa.../label_back.jpg",
      "rawCardSmall": "https://tcg.../small.png",
      "rawCardLarge": "https://tcg.../large.png",
      "displayImage": "https://psa.../front.jpg"
    },
    
    "pricing": {
      "currentMarketPrice": 125.50,
      "currency": "USD",
      "priceType": "holofoil",
      "priceRange": {
        "low": 100.00,
        "mid": 125.00,
        "high": 150.00
      },
      "lastUpdated": "2024-01-15T10:30:00Z",
      "tcgplayerUrl": "https://tcgplayer.com/...",
      "note": "PSA graded cards typically command a premium over raw card prices"
    },
    
    "tcgData": {
      "id": "swsh1-1",
      "number": "1",
      "rarity": "Rare Holo",
      "artist": "Mitsuhiro Arita",
      "hp": "60",
      "types": ["Colorless"],
      "set": {
        "id": "swsh1",
        "name": "Sword & Shield",
        "series": "Sword & Shield",
        "releaseDate": "2020/02/07"
      }
    },
    
    "apiStatus": {
      "psaSuccess": true,
      "tcgSuccess": true,
      "psaSource": "live",
      "tcgSource": "cache"
    },
    
    "fetchedAt": "2024-01-15T12:00:00Z"
  }
}
```

---

### 3. Price Comparison

**Endpoint:** `GET /cards/:cert/price-comparison`

**Response:**
```json
{
  "success": true,
  "data": {
    "available": true,
    "rawCardPrice": 125.50,
    "estimatedGradedPrice": 376.50,
    "premiumMultiplier": 3.0,
    "grade": 10,
    "currency": "USD",
    "note": "Graded prices are estimates based on typical market premiums",
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

---

### 4. Batch Fetch

**Endpoint:** `POST /cards/batch`

**Request Body:**
```json
{
  "certNumbers": ["116230496", "110761155", "114363745"]
}
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    { /* Full card data */ },
    { /* Full card data */ },
    { /* Full card data */ }
  ]
}
```

---

### 5. Health Check

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T12:00:00Z",
  "database": {
    "status": "connected",
    "cardCount": 150
  },
  "externalAPIs": {
    "psa": {
      "status": "healthy",
      "timestamp": "2024-01-15T12:00:00Z"
    },
    "pokemonTCG": {
      "status": "healthy",
      "timestamp": "2024-01-15T12:00:00Z",
      "rateLimit": {
        "remaining": "950",
        "limit": "1000"
      }
    }
  }
}
```

---

## External API Integration

### PSA Card API

**Base URL:** `https://api.psacard.com/publicapi/v1`

**Authentication:**
```javascript
headers: {
  'Authorization': `Bearer ${PSA_API_KEY}`,
  'X-API-Key': PSA_API_KEY
}
```

**Key Endpoints:**
- `GET /cert/{certNumber}` - Get certificate details
- `GET /health` - API health check

**Rate Limits:**
- Unknown (implement exponential backoff)
- Retry on 429 status

**Constraints:**
- May not have images for older cards
- Some certifications may be private
- API access may require special approval

---

### Pokemon TCG API

**Base URL:** `https://api.pokemontcg.io/v2`

**Authentication:**
```javascript
headers: {
  'X-Api-Key': POKEMON_TCG_API_KEY  // Optional but recommended
}
```

**Key Endpoints:**
- `GET /cards?q={query}` - Search cards
- Query syntax: `name:"Pikachu" set.name:"Base"`

**Rate Limits:**
- Without API key: 1000 requests/day
- With API key: 5000 requests/day
- Rate limit headers: `X-RateLimit-Remaining`, `X-RateLimit-Limit`

**Free API Key:**
Get your key at: https://dev.pokemontcg.io/

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error message"
}
```

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `CERT_NOT_FOUND` | 404 | PSA certification number not found |
| `RATE_LIMIT_EXCEEDED` | 429 | API rate limit exceeded, retry after delay |
| `AUTH_FAILED` | 401 | Invalid API key |
| `INVALID_REQUEST` | 400 | Malformed request |
| `BATCH_TOO_LARGE` | 400 | Batch request exceeds 50 items |
| `INTERNAL_ERROR` | 500 | Server error |
| `NETWORK_ERROR` | 500 | Failed to connect to external API |

### Retry Strategy

**Exponential Backoff:**
```javascript
// Attempt 1: Wait 1s
// Attempt 2: Wait 2s
// Attempt 3: Wait 4s
// Max retries: 3
```

**Retry Conditions:**
- 429 (Rate Limit)
- 500, 502, 503 (Server Errors)
- Network timeouts

**No Retry:**
- 400 (Bad Request)
- 401, 403 (Auth Errors)
- 404 (Not Found)

---

## Caching Strategy

### Cache Layers

1. **Database Cache** (SQLite `api_cache` table)
   - PSA data: 1 hour TTL
   - Pokemon TCG data: 30 minutes TTL
   - Integrated data: 5 minutes TTL

2. **In-Memory Cache** (Optional - Redis recommended for production)

### Cache Keys

```
psa:cert:{certNumber}
tcg:search:{name}:{set}:{year}:{variety}
integrated:{certNumber}
```

### Cache Invalidation

Manual cache clear:
```javascript
import { clearPSACache } from './services/psaService.js';

// Clear specific cert
clearPSACache('116230496');

// Clear all
clearPSACache();
```

---

## Setup & Configuration

### 1. Install Dependencies

```bash
cd backend
npm install axios better-sqlite3 dotenv express
```

### 2. Environment Variables

Create `backend/.env`:

```env
# Server
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database
DB_PATH=./data/cards.db

# PSA API
# Obtain from: https://www.psacard.com/publicapi/documentation
PSA_API_KEY=your_psa_api_key_here

# Pokemon TCG API  
# Obtain from: https://dev.pokemontcg.io/
POKEMON_TCG_API_KEY=your_pokemon_tcg_api_key_here
```

### 3. Update app.js

```javascript
import cardsV2Routes from './routes/cardsV2.js';

app.use('/api/v2/cards', cardsV2Routes);
```

### 4. Start Server

```bash
node src/app.js
```

---

## Code Examples

### Fetch Single Card (JavaScript/Node.js)

```javascript
import axios from 'axios';

async function getCard(certNumber) {
  try {
    const response = await axios.get(
      `http://localhost:3001/api/v2/cards/${certNumber}`
    );
    
    const card = response.data.data;
    console.log(`Card: ${card.cardName}`);
    console.log(`Grade: PSA ${card.grade}`);
    console.log(`Price: $${card.pricing.currentMarketPrice}`);
    console.log(`Image: ${card.images.displayImage}`);
    
    return card;
  } catch (error) {
    if (error.response?.status === 404) {
      console.error('Card not found');
    } else if (error.response?.status === 429) {
      console.error('Rate limited, retry after 60 seconds');
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Usage
getCard('116230496');
```

### Batch Fetch (JavaScript/Node.js)

```javascript
async function batchGetCards(certNumbers) {
  try {
    const response = await axios.post(
      'http://localhost:3001/api/v2/cards/batch',
      { certNumbers }
    );
    
    return response.data.data;
  } catch (error) {
    console.error('Batch fetch failed:', error.message);
    return [];
  }
}

// Usage
const cards = await batchGetCards([
  '116230496',
  '110761155',
  '114363745'
]);
```

### Frontend Integration (React/Vue)

```javascript
// React Hook
import { useState, useEffect } from 'react';

function useCard(certNumber) {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchCard() {
      try {
        const response = await fetch(
          `http://localhost:3001/api/v2/cards/${certNumber}`
        );
        const data = await response.json();
        
        if (data.success) {
          setCard(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCard();
  }, [certNumber]);
  
  return { card, loading, error };
}

// Usage in component
function CardDetail({ certNumber }) {
  const { card, loading, error } = useCard(certNumber);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <img src={card.images.displayImage} alt={card.cardName} />
      <h1>{card.cardName}</h1>
      <p>Grade: PSA {card.grade}</p>
      <p>Price: ${card.pricing.currentMarketPrice}</p>
    </div>
  );
}
```

---

## Production Considerations

### 1. Rate Limiting

Implement rate limiting on your API:

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/v2/', limiter);
```

### 2. Monitoring

Add logging and monitoring:

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 3. Database Migration

For production, migrate to PostgreSQL:

```javascript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
```

### 4. Caching (Redis)

```javascript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function getCache(key, ttl) {
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
}

export async function setCache(key, value, ttl = 300) {
  await redis.setex(key, ttl, JSON.stringify(value));
}
```

---

## License

MIT

---

## Support

For issues or questions:
- PSA API: https://www.psacard.com/publicapi/documentation
- Pokemon TCG API: https://dev.pokemontcg.io/
- GitHub Issues: [Your repo URL]
