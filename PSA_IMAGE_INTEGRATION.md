# ✅ PSA Image Integration - Complete!

## 🎉 What's Been Integrated

Your PSA image fetching code has been successfully integrated into the backend!

### **Correct PSA API Endpoint:**
```
GET https://api.psacard.com/publicapi/cert/GetImagesByCertNumber/{certNumber}
```

### **Response Format:**
```json
[
  {
    "ImageURL": "https://...",
    "IsFrontImage": true
  },
  {
    "ImageURL": "https://...",
    "IsFrontImage": false
  }
]
```

---

## 📁 Files Updated

### 1. **`backend/src/services/psaService.js`**
- ✅ Updated to use correct endpoint: `/cert/GetImagesByCertNumber/{certNumber}`
- ✅ Parses array response format
- ✅ Extracts front and back images
- ✅ Handles `IsFrontImage` boolean flag
- ✅ Comprehensive logging

### 2. **`backend/src/routes/cards.js`**
- ✅ Updated V1 API to use correct PSA endpoint
- ✅ Extracts front/back images from array
- ✅ Falls back gracefully if images missing

---

## 🚀 How to Test

### Test with Your Real PSA Token

The backend now uses your PSA token from `.env`:

```bash
# backend/.env
PSA_API_KEY=nTAUojp6b-miy_WhU0rES95iQNpS9yv1MNzBEc3NMDRSyZoFOJmvE5aEOjuw0u_Ve8sTNCOUEXd78joqEqqeHqCzbQNhMYMU8AW83gCYBvu43v8iTPGDHMOa6cFB0c13VUtRxGRxQ6C0tIZ1qSIs7spOO-QlLnNoZF75VfYu6ipFFSp646u1dNxlRJGbFHNm8nqOYqMlFLgWOhuVkLAACIpIKXuxyaeOBhqyLpXawOexWRjMxqhf0s_bnLjSfc5Jz19ljQujK-Q7wQim4xxv-AS9E6WzMzAvZx22j1DZ3fNj8Pxr
```

### Test API Calls

```bash
# Test with one of your database certs
curl http://localhost:3001/api/cards/116230496 | jq '.image_url'

# Test with the cert from your HTML (if you add it to DB)
curl http://localhost:3001/api/cards/117953926 | jq '.image_url'

# Test V2 API
curl http://localhost:3001/api/v2/cards/116230496 | jq '.data.images'
```

---

## 📊 Expected Log Output

When PSA images are fetched successfully:

```
📡 Fetching PSA images for cert: 116230496
✅ PSA API success, received 2 images
✅ Front image: Found
✅ Back image: Found
```

---

## 🔧 How It Works

### 1. **Request Flow**

```
Client Request
    ↓
Backend API (/api/cards/:cert)
    ↓
Check Database (cert exists?)
    ↓
Fetch PSA Images (with your token)
    ↓
Parse Array Response
    ↓
Extract Front/Back Images
    ↓
Return to Client
```

### 2. **Image Extraction**

```javascript
// PSA returns array
const images = [
  { ImageURL: "https://...", IsFrontImage: true },
  { ImageURL: "https://...", IsFrontImage: false }
];

// Extract images
const frontImage = images.find(img => img.IsFrontImage === true);
const backImage = images.find(img => img.IsFrontImage === false);

// Use in response
response.image_url = frontImage?.ImageURL;
```

### 3. **Fallback Strategy**

```
1. Try PSA API with token
2. If PSA fails → use database value
3. If no database value → use placeholder
4. If no placeholder → return null
```

---

## 🎨 Frontend Integration

### Display PSA Images in Vue

```vue
<template>
  <div v-if="card">
    <!-- Front Image -->
    <img 
      :src="getProxiedImageUrl(card.image_url)" 
      alt="Card Front"
      class="w-full rounded-lg"
    />
    
    <!-- If you have back image -->
    <img 
      v-if="card.back_image_url"
      :src="getProxiedImageUrl(card.back_image_url)" 
      alt="Card Back"
      class="w-full rounded-lg mt-4"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getProxiedImageUrl } from '../utils/imageProxy.js';

const card = ref(null);

async function loadCard(certNumber) {
  const response = await fetch(
    `http://localhost:3001/api/cards/${certNumber}`
  );
  const data = await response.json();
  card.value = data;
}

onMounted(() => loadCard('116230496'));
</script>
```

---

## 🧪 Testing Checklist

- [ ] Backend server running
- [ ] PSA_API_KEY set in `.env`
- [ ] Test with database cert: `curl http://localhost:3001/api/cards/116230496`
- [ ] Check logs for PSA API success
- [ ] Verify image URL in response
- [ ] Test image proxy: `curl "http://localhost:3001/api/proxy-image?url=IMAGE_URL"`
- [ ] Frontend displays images correctly

---

## 📝 API Response Example

### Request:
```bash
GET /api/cards/116230496
```

### Response:
```json
{
  "source": "live",
  "cert_number": "116230496",
  "cardName": "Eevee Holo",
  "setName": "Eeveelution",
  "image_url": "https://images.psacard.com/...",
  "psa": [
    {
      "ImageURL": "https://images.psacard.com/.../front.jpg",
      "IsFrontImage": true
    },
    {
      "ImageURL": "https://images.psacard.com/.../back.jpg",
      "IsFrontImage": false
    }
  ],
  "pricing": {
    "currentMarketPrice": 125.50
  }
}
```

---

## 🚨 Troubleshooting

### Issue: "PSA API unavailable"

**Check:**
1. Is `PSA_API_KEY` set in `.env`?
2. Is the token still valid?
3. Check server logs for exact error

### Issue: "Card not found in database"

**Solution:**
```bash
# The cert needs to be in your database first
# Add it to the seed script or use one of your existing certs:
# 116230496, 110761155, 114363745, etc.
```

### Issue: Images not displaying

**Check:**
1. Image URL is valid (check response)
2. Image proxy is working
3. CORS is configured
4. Frontend is using `getProxiedImageUrl()`

---

## ✅ Summary

Your PSA image integration is now:

✅ **Using correct endpoint** (`/cert/GetImagesByCertNumber/{certNumber}`)  
✅ **Parsing array response** with `IsFrontImage` flag  
✅ **Extracting front/back images** automatically  
✅ **Integrated into both V1 and V2 APIs**  
✅ **Comprehensive logging** for debugging  
✅ **Graceful fallbacks** when PSA unavailable  
✅ **Ready for frontend** integration  

---

## 🎯 Next Steps

1. **Restart backend**: `node src/app.js`
2. **Test with your certs**: Use certs from your database
3. **Check logs**: Watch for PSA API success messages
4. **Update frontend**: Display the images
5. **Add more certs**: Update seed script with cert `117953926` if needed

---

**Your PSA image integration is complete and ready to use!** 🎉📸
