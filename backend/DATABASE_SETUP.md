# 🎴 Database Setup Guide

## Overview
Your marketplace now shows **19 real PSA certified Eeveelution cards** with actual PSA images!

---

## ✅ What Was Done

1. **Removed 131 placeholder cards** - Only real PSA certs remain
2. **Fetched all 19 PSA images** - Stored directly in database
3. **Created automated setup script** - One command to reset everything

---

## 🚀 Quick Commands

### Full Database Setup (Recommended)
```bash
npm run db:setup
```
This will:
1. Clear the database
2. Seed 19 real Eeveelution cards
3. Fetch all PSA images from PSA API
4. Store images in database

### Individual Commands
```bash
# Reset database only (no images)
npm run db:reset

# Fetch PSA images only (requires cards in DB)
npm run db:fetch-images
```

---

## 📊 Current Database Stats

- **Total Cards**: 19
- **Real PSA Certs**: 19
- **Placeholder Cards**: 0
- **Cards with Images**: 19/19 ✅

---

## 🎴 Your 19 Eeveelution Cards

| # | Cert Number | Card Name | PSA Grade | Year |
|---|-------------|-----------|-----------|------|
| 1 | 116230496 | Eevee Holo | 10 | 2021 |
| 2 | 110761155 | Vaporeon Holo | 9 | 2020 |
| 3 | 114363745 | Jolteon Holo | 10 | 2021 |
| 4 | 113699124 | Flareon Holo | 9 | 2021 |
| 5 | 113699123 | Espeon Holo | 8 | 2020 |
| 6 | 118630975 | Umbreon Holo | 10 | 2022 |
| 7 | 111515802 | Leafeon Holo | 9 | 2021 |
| 8 | 111144117 | Glaceon Holo | 10 | 2021 |
| 9 | 113550042 | Sylveon Holo | 8 | 2020 |
| 10 | 112196225 | Eevee Holo | 9 | 2021 |
| 11 | 116676192 | Vaporeon Holo | 10 | 2022 |
| 12 | 116676191 | Jolteon Holo | 9 | 2022 |
| 13 | 106930395 | Flareon Holo | 8 | 2020 |
| 14 | 118761371 | Espeon Holo | 10 | 2022 |
| 15 | 122817911 | Umbreon Holo | 9 | 2023 |
| 16 | 120432127 | Leafeon Holo | 8 | 2022 |
| 17 | 116496112 | Glaceon Holo | 10 | 2021 |
| 18 | 128414325 | Sylveon Holo | 9 | 2023 |
| 19 | 112593899 | Eevee Holo | 8 | 2021 |

---

## 🖼️ Image Fetching

### How It Works
1. Script calls PSA API: `GET /cert/GetImagesByCertNumber/{cert}`
2. PSA returns array of images (front & back)
3. Script extracts front image URL
4. URL is stored in database `image_url` field

### Example Image URL
```
https://d1htnxwo4o0jhw.cloudfront.net/cert/180289654/cwrwxaRlpUak7SGrFn5lJw.jpg
```

### Rate Limiting
- 500ms delay between requests
- Automatic retry on 429 (rate limit)
- Total fetch time: ~10-15 seconds for 19 cards

---

## 🔧 Adding More Cards

To add more PSA certified cards:

1. **Edit `src/seed/seedCards.js`**
   ```javascript
   const realCerts = [
     '116230496',
     '110761155',
     // ... add your new cert numbers here
     '999999999', // New card
   ];
   ```

2. **Run setup**
   ```bash
   npm run db:setup
   ```

3. **Restart backend**
   ```bash
   npm start
   ```

---

## ✅ Verification

Check your database:
```bash
# Count total cards
curl -s http://localhost:3001/api/cards | jq 'length'

# Check first card has image
curl -s http://localhost:3001/api/cards | jq '.[0] | {cert, name, has_image: (.image_url != null)}'

# View all cert numbers
curl -s http://localhost:3001/api/cards | jq '[.[] | .cert_number]'
```

---

## 🎉 Result

Your frontend marketplace will now display all 19 real Eeveelution cards with beautiful PSA images! 🖼️✨
