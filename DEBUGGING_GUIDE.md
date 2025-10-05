# 🐛 Debugging Guide - Console Logs & Error Testing

## Overview

Comprehensive console logging has been added throughout the backend to help debug and monitor API calls, database operations, and external API integrations.

---

## 🎯 What's Been Added

### 1. **Request Logging**
Every incoming request is logged with:
- Timestamp
- HTTP method and URL
- Request headers
- Request body (if present)

### 2. **Database Logging**
- Connection status
- Cache hits/misses
- Cache expiration
- Query execution

### 3. **API Call Logging**
- PSA API attempts and results
- Pokemon TCG API queries
- Retry attempts with delays
- Error responses

### 4. **Image Proxy Logging**
- Image fetch requests
- Success/failure status
- Content types

### 5. **Error Logging**
- Detailed error messages
- Stack traces
- Request context

---

##  Log Format

### Emoji Legend

| Emoji | Meaning |
|-------|---------|
|  | Success |
|  | Error/Failure |
|   | Warning |
|  | Search/Query |
|  | API Call |
|  | Database/Cache |
|   | Image Operation |
| 🧪 | Test |
|  | Configuration |
|  | List Operation |
|  | Data Operation |
|  | Timing/Expiration |

---

##  Starting the Server

When you start the server, you'll see:

```
 Environment Configuration:
PORT: 3001
FRONTEND_URL: http://localhost:3000
DB_PATH: ./data/cards.db
PSA_API_KEY:  Configured
POKEMON_TCG_API_KEY:  Configured

 Database Initialization:
Path: /Users/.../data/cards.db
 Database connected successfully

==================================================
 Server running on port 3001
 API Base: http://localhost:3001
 API V1: http://localhost:3001/api/cards
 API V2: http://localhost:3001/api/v2/cards
 Health: http://localhost:3001/api/v2/health
==================================================
```

---

## 🧪 Testing the API

### Method 1: Using the Test Script

```bash
cd backend
npm test
```

This runs a comprehensive test suite that checks:
- Root endpoint
- Health check
- List cards (V1 & V2)
- Get card details (V1 & V2)
- Price comparison
- Batch fetch
- Error handling (404)
- Image proxy

**Example Output:**
```
============================================================
🧪 Testing: Get Card Details (V2) - Real Cert
   GET /api/v2/cards/116230496
 Success (1234ms)
   Status: 200
   Response: {
     "success": true,
     "data": {
       "certNumber": "116230496",
       "cardName": "Eevee Holo",
       ...
     }
   }
============================================================
```

### Method 2: Manual cURL Testing

```bash
# Test root endpoint
curl http://localhost:3001/

# Test health check
curl http://localhost:3001/api/v2/health | jq .

# Test list cards
curl http://localhost:3001/api/cards | jq '.[0:3]'

# Test specific card
curl http://localhost:3001/api/v2/cards/116230496 | jq .

# Test price comparison
curl http://localhost:3001/api/v2/cards/116230496/price-comparison | jq .

# Test batch fetch
curl -X POST http://localhost:3001/api/v2/cards/batch \
  -H "Content-Type: application/json" \
  -d '{"certNumbers": ["116230496", "110761155"]}' | jq .
```

---

##  Example Log Output

### Successful Card Fetch

```
[2024-01-15T12:00:00.000Z] GET /api/v2/cards/116230496
Headers: {
  "host": "localhost:3001",
  "user-agent": "curl/8.1.2",
  "accept": "*/*"
}

 Fetching card details for cert: 116230496
 Checking database for cert: 116230496
 Found card in database: Eevee Holo
 Cache miss: card:116230496

 Fetching PSA data for cert: 116230496
  PSA API unavailable, using database values: Request failed with status code 429

 Fetching Pokemon TCG data for: Eevee Holo
 Pokemon TCG API query: name:"Eevee"
 Pokemon TCG API success with query: name:"Eevee"
 Pokemon TCG API success: Eevee (Sword & Shield)

 Cache stored: card:116230496
 Complete card info assembled for cert: 116230496
```

### Cache Hit

```
[2024-01-15T12:01:00.000Z] GET /api/v2/cards/116230496

 Fetching card details for cert: 116230496
 Cache hit: card:116230496 (age: 45s)
 Returning cached data for cert: 116230496
```

### Error Handling

```
[2024-01-15T12:02:00.000Z] GET /api/v2/cards/99999999

 Fetching card details for cert: 99999999
 Checking database for cert: 99999999
  Card not found in database: 99999999
```

### Image Proxy

```
[2024-01-15T12:03:00.000Z] GET /api/proxy-image?url=https://...

  Image Proxy Request: https://images.pokemontcg.io/base1/4_hires.png
 Fetching image from: https://images.pokemontcg.io/base1/4_hires.png
 Image fetched successfully (image/png)
```

---

##  Common Issues & Solutions

### Issue 1: PSA API Rate Limited

**Log Output:**
```
  PSA rate limit hit, retrying in 1000ms (attempt 1/3)
  PSA rate limit hit, retrying in 2000ms (attempt 2/3)
 PSA rate limit exceeded after 3 retries
```

**Solution:**
- Wait a few minutes before retrying
- Check if your API key is valid
- Verify API key has proper permissions

### Issue 2: Pokemon TCG API Timeout

**Log Output:**
```
  Pokemon TCG API unavailable, using database values: timeout of 10000ms exceeded
```

**Solution:**
- Check your internet connection
- Verify POKEMON_TCG_API_KEY is set
- Try again (may be temporary API issue)

### Issue 3: Database Connection Failed

**Log Output:**
```
 Database Initialization:
Path: ./data/cards.db
 Database connection failed: SQLITE_CANTOPEN
```

**Solution:**
```bash
# Create data directory
mkdir -p backend/data

# Reset database
npm run db:reset
```

### Issue 4: Cache Parse Error

**Log Output:**
```
 Cache parse error for card:123: Unexpected token
```

**Solution:**
```bash
# Clear corrupted cache
rm backend/data/cards.db
npm run db:reset
```

---

## 🛠️ Debugging Workflow

### Step 1: Check Server Startup

```bash
cd backend
node src/app.js
```

Look for:
-  Database connected successfully
-  Server running on port 3001
-  API keys configured

### Step 2: Run Test Suite

```bash
npm test
```

Check which tests pass/fail.

### Step 3: Test Specific Endpoint

```bash
curl http://localhost:3001/api/v2/cards/116230496 | jq .
```

Watch the server logs for detailed flow.

### Step 4: Check Database

```bash
# List all cards
curl http://localhost:3001/api/cards | jq '.[0:5]'

# Check specific cert exists
curl http://localhost:3001/api/cards | jq '.[] | select(.cert_number=="116230496")'
```

### Step 5: Test External APIs Directly

```bash
# Test Pokemon TCG API
curl "https://api.pokemontcg.io/v2/cards?q=name:Eevee&pageSize=1" \
  -H "X-Api-Key: YOUR_KEY" | jq .

# Test PSA API (adjust endpoint as needed)
curl "https://api.psacard.com/publicapi/v1/cert/116230496" \
  -H "Authorization: Bearer YOUR_KEY" | jq .
```

---

##  Performance Monitoring

### Check Cache Hit Rate

Watch logs for:
```
 Cache hit: card:116230496 (age: 45s)  ← Good!
 Cache miss: card:116230496             ← Needs caching
 Cache expired: card:116230496          ← Normal
```

**Good cache hit rate:** 70-80% of requests

### Check Response Times

From test output:
```
 Success (234ms)   ← Fast (cached)
 Success (2341ms)  ← Slow (external APIs)
```

**Target times:**
- Cached: < 100ms
- Database only: < 500ms
- With external APIs: < 5000ms

---

## 🚨 Error Codes Reference

| Code | Status | Meaning | Action |
|------|--------|---------|--------|
| `CERT_NOT_FOUND` | 404 | Card not in database | Check cert number |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many API calls | Wait and retry |
| `AUTH_FAILED` | 401 | Invalid API key | Check .env file |
| `INTERNAL_ERROR` | 500 | Server error | Check logs |
| `NETWORK_ERROR` | 500 | Can't reach API | Check internet |

---

##  Log Files

Currently logs go to console. For production, consider:

### Option 1: Redirect to File

```bash
node src/app.js > logs/server.log 2>&1
```

### Option 2: Use Winston Logger

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console()
  ]
});
```

---

## 🎯 Quick Reference

### Start Server with Logs
```bash
cd backend
node src/app.js
```

### Run Tests
```bash
npm test
```

### Watch Logs in Real-Time
```bash
# Terminal 1: Start server
node src/app.js

# Terminal 2: Make requests
curl http://localhost:3001/api/v2/cards/116230496
```

### Filter Logs
```bash
# Only show errors
node src/app.js 2>&1 | grep ""

# Only show cache operations
node src/app.js 2>&1 | grep ""

# Only show API calls
node src/app.js 2>&1 | grep ""
```

---

##  Summary

You now have:
-  Comprehensive console logging
-  Automated test suite
-  Error tracking
-  Performance monitoring
-  Debugging workflow

**To test everything:**
```bash
cd backend
npm test
```

Watch the colorful output and detailed logs! 
