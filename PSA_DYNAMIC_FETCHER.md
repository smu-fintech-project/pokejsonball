# PSA Dynamic Certificate Fetcher

## Overview

This implementation replaces **hardcoded certificate fields** (names, grades, years) with **API-derived values**, ensuring data is always accurate and up-to-date.

## What Changed

### Before (Hardcoded) 
```javascript
const names = ['Eevee', 'Vaporeon', 'Jolteon', ...];
const grades = [10, 9, 10, 9, 8, ...];
const years = [2021, 2020, 2021, ...];
```

### After (API-Driven) 
```javascript
const psaData = await getPSACardDetails(certNumber);
const cardName = psaData.cardName || "Unknown";
const grade = psaData.grade || "Unknown";
const year = psaData.year || "Unknown";
```

---

## Files Created/Modified

###  New Files

#### 1. `frontend/src/utils/psaCertFetcher.js`
Production-ready browser-side utility for fetching and rendering certificate metadata.

**Key Features:**
-  No external dependencies
-  Defensive coding with safe fallbacks
-  Multiple API response structure support
-  Comprehensive error handling
-  Styled rendering with "Unknown" fallbacks

**Main Function:**
```javascript
import { fetchAndRenderCert } from './utils/psaCertFetcher.js';

const container = document.getElementById('cert-metadata');
const result = await fetchAndRenderCert(
  'https://api.psacard.com/publicapi/v1/cert/12345678',
  'YOUR_PSA_TOKEN',
  container
);

// Result:
// { 
//   success: true, 
//   fields: { name: "Charizard", grade: "GEM MT 10", year: 1999 },
//   raw: {...}
// }
```

#### 2. `frontend/src/utils/psaCertFetcher.example.html`
Interactive demo showing usage examples with live testing interface.

### 🔧 Modified Files

#### `backend/src/seed/seedCards.js`
Refactored to fetch card data from PSA API instead of using hardcoded arrays.

**Changes:**
- Made `generateSeedCards()` and `seed()` async
- Integrated `getPSACardDetails()` service
- Added rate limiting (500ms between API calls)
- Improved error handling and logging
- Better statistics reporting

---

## API Response Handling

The implementation safely handles multiple PSA API response structures:

### Structure 1: Nested Card Object
```json
{
  "card": {
    "name": "Charizard",
    "year": 1999,
    "grade": "GEM MT 10"
  },
  "cert": {
    "id": "12345678"
  }
}
```

### Structure 2: Flat Structure
```json
{
  "name": "Charizard",
  "year": 1999,
  "grade": "10"
}
```

### Structure 3: PSA Standard (Capitalized)
```json
{
  "CertNumber": "12345678",
  "CardName": "Charizard",
  "Year": "1999",
  "Grade": "10",
  "GradeDescription": "GEM MT"
}
```

### Field Resolution Logic
```javascript
// Safe field resolver with multiple fallback paths
const name = data.card?.name 
  ?? data.card?.Name 
  ?? data.name 
  ?? data.Name 
  ?? data.CardName 
  ?? null;
```

---

## Usage Examples

### 1. Frontend - Single Certificate

```javascript
import { fetchAndRenderCert } from './utils/psaCertFetcher.js';

// Fetch and render
const container = document.getElementById('cert-container');
const PSA_TOKEN = import.meta.env.VITE_PSA_TOKEN;

const result = await fetchAndRenderCert(
  'https://api.psacard.com/publicapi/v1/cert/116230496',
  PSA_TOKEN,
  container
);

if (result.success) {
  console.log('Name:', result.fields.name);
  console.log('Grade:', result.fields.grade);
  console.log('Year:', result.fields.year);
}
```

### 2. Frontend - Batch Fetch

```javascript
import { batchFetchCerts } from './utils/psaCertFetcher.js';

const certRequests = [
  { metaUrl: 'https://api.psacard.com/publicapi/v1/cert/116230496' },
  { metaUrl: 'https://api.psacard.com/publicapi/v1/cert/110761155' },
];

const results = await batchFetchCerts(certRequests, PSA_TOKEN);

results.forEach(({ certNumber, success, data, error }) => {
  if (success) {
    console.log(`${certNumber}: ${data.name} - ${data.grade}`);
  } else {
    console.error(`${certNumber}: ${error}`);
  }
});
```

### 3. Backend - Seed Database

```bash
cd backend
node src/seed/seedCards.js
```

Output:
```
✓ Clearing existing data...
✓ Database cleared

↻ Fetching card data from PSA API...
↻ Fetching cert 1/19: 116230496
  ✓ Success: Eevee VMAX - Grade 10 - Year 2021
↻ Fetching cert 2/19: 110761155
  ✓ Success: Vaporeon V - Grade 9 - Year 2021

✓ Seeded 19 cards with API-derived data
  Total cards in database: 19
  Cards with grades: 19
  Cards with images: 19
```

---

## Error Handling

### Client-Side (Browser)

```javascript
const result = await fetchAndRenderCert(metaUrl, token, container);

if (!result.success) {
  console.error('Error:', result.error);
  // Container will display: "Failed to fetch certificate meta: <error>"
}

// Invalid JSON response
// Container will display: "Cert metadata response is not JSON."
```

### Server-Side (Node.js)

```javascript
try {
  const psaData = await getPSACardDetails(certNumber);
  
  if (!psaData.success) {
    console.warn('Fallback data used:', psaData.message);
  }
} catch (error) {
  console.error('Failed to fetch:', error);
  // Falls back to "Unknown" values
}
```

---

## Defensive Features

### 1. Safe Field Access
```javascript
// All field access uses optional chaining and nullish coalescing
const name = data.card?.name ?? data.name ?? null;
```

### 2. Type Coercion
```javascript
// Safe parsing of numeric values
const grade = psaData.grade ? parseInt(psaData.grade) : null;
const year = psaData.year ? parseInt(psaData.year) : null;
```

### 3. Fallback Values
```javascript
// All fields default to "Unknown" if missing
{ label: 'Name', value: fields.name ?? 'Unknown' }
```

### 4. Rate Limiting
```javascript
// Prevent API rate limiting
await new Promise(resolve => setTimeout(resolve, 500));
```

---

## Testing

### Test the Frontend Utility

1. Open `frontend/src/utils/psaCertFetcher.example.html` in a browser
2. Enter a certificate number (e.g., `116230496`)
3. Enter your PSA API token
4. Click "Fetch Certificate Data"

### Test the Backend Seeder

```bash
# Ensure PSA_API_KEY is set in .env
cd backend
node src/seed/seedCards.js

# Check results
sqlite3 data/cards.db "SELECT cert_number, card_name, psa_grade, release_year FROM cards LIMIT 5;"
```

---

## Configuration

### Environment Variables

```bash
# .env
PSA_API_KEY=your_psa_api_key_here

# frontend/.env (for browser usage)
VITE_PSA_TOKEN=your_psa_api_key_here
```

### API Endpoints

```javascript
// Certificate details (full metadata)
GET https://api.psacard.com/publicapi/v1/cert/GetByCertNumber/{certNumber}

// Certificate images only
GET https://api.psacard.com/publicapi/v1/cert/GetImagesByCertNumber/{certNumber}
```

---

## Benefits

### **Accuracy**
- Data always matches PSA's official records
- No manual updates needed

### **Maintainability**
- Single source of truth (PSA API)
- No hardcoded data to maintain

### **Scalability**
- Automatically works for any certificate number
- Easy to add new cards

### **Reliability**
- Comprehensive error handling
- Graceful fallbacks for missing data
- Caching support (backend)

---

## Migration Checklist

- [x] Create `psaCertFetcher.js` utility
- [x] Update `seedCards.js` to use API
- [x] Add comprehensive error handling
- [x] Add rate limiting
- [x] Create usage examples
- [x] Document API structures
- [x] Test with real certificate numbers

---

## Next Steps

### Recommended Enhancements

1. **Add caching to frontend utility**
   ```javascript
   // Cache API responses in localStorage
   const cacheKey = `psa:cert:${certNumber}`;
   const cached = localStorage.getItem(cacheKey);
   ```

2. **Implement retry logic**
   ```javascript
   // Retry failed requests with exponential backoff
   const maxRetries = 3;
   let attempt = 0;
   ```

3. **Add progress indicators**
   ```javascript
   // Show progress during batch operations
   onProgress={(current, total) => {
     console.log(`${current}/${total} certificates fetched`);
   }}
   ```

4. **Create Vue/React components**
   ```vue
   <PSACertificateCard :certNumber="116230496" />
   ```

---

## Support

For issues or questions:
1. Check API response structure in browser console
2. Verify PSA API token is valid
3. Review error messages in console
4. Check rate limiting (500ms delay between calls)

---

## License

MIT - Use freely in your projects!

