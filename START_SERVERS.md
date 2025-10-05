#  How to Start Your Servers

##  IMPORTANT: You Must `cd` Into Each Directory First!

Your project structure is:
```
pokejsonball/           ← Root directory
├── backend/            ← Backend code is HERE
│   ├── .env
│   ├── src/
│   │   └── app.js
│   └── package.json
└── frontend/           ← Frontend code is HERE
    ├── .env
    ├── src/
    └── package.json
```

---

##  Step-by-Step Instructions

### Step 1: Reset Database with Real PSA Cert Numbers

Open a terminal and run:

```bash
cd /Users/tayelroy/Desktop/SMU/Y2S1/WAD2_IS216/WAD2_project/pokejsonball/backend
npm run db:reset
```

**Expected output:**
```
 Seeded 150 Eeveelution cards
 Total cards in database: 150
```

This will:
- Delete old database
- Create new database with your 19 real PSA cert numbers
- Add 131 placeholder cards to reach 150 total

---

### Step 2: Start Backend Server

**Keep the same terminal** (you're already in `backend/`):

```bash
node src/app.js
```

**Expected output:**
```
 Server running on port 3001
```

**Leave this terminal running!** Don't close it.

---

### Step 3: Start Frontend Server

**Open a NEW terminal** and run:

```bash
cd /Users/tayelroy/Desktop/SMU/Y2S1/WAD2_IS216/WAD2_project/pokejsonball/frontend
npm run dev
```

**Expected output:**
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

**Leave this terminal running too!**

---

## 🌐 Open Your App

Open your browser and go to:
```
http://localhost:5173
```

(Or whatever port Vite shows - usually 5173 or 3000)

---

##  What You Should See

1. **Homepage loads** with featured Eeveelution cards
2. **Dark mode toggle** works (sun/moon icon)
3. **Click any card** → goes to detail page
4. **No CORS errors** in browser console (F12)
5. **Real PSA cert numbers** like `116230496`, `110761155`, etc.

---

## 🐛 If Something Goes Wrong

### "Cannot find module" error
**Problem:** You're in the wrong directory

**Solution:** Make sure you `cd` into `backend/` or `frontend/` first!

```bash
#  WRONG - from root
cd pokejsonball
node src/app.js

#  CORRECT - cd into backend first
cd pokejsonball/backend
node src/app.js
```

### Port 3001 already in use
**Problem:** Backend already running or port conflict

**Solution:**
```bash
# Kill existing process
pkill -f "node.*app.js"

# Then restart
cd backend
node src/app.js
```

### Frontend can't connect to backend
**Problem:** Backend not running or wrong URL

**Solution:**
1. Check backend is running: `curl http://localhost:3001/`
2. Check frontend `.env` file has: `VITE_API_BASE=http://localhost:3001`
3. Restart frontend after changing `.env`

---

##  Your Real PSA Cards

These 19 real PSA certification numbers are now in your database:

1. `116230496` - Eevee Holo (PSA 10)
2. `110761155` - Vaporeon Holo (PSA 9)
3. `114363745` - Jolteon Holo (PSA 10)
4. `113699124` - Flareon Holo (PSA 9)
5. `113699123` - Espeon Holo (PSA 8)
6. `118630975` - Umbreon Holo (PSA 10)
7. `111515802` - Leafeon Holo (PSA 9)
8. `111144117` - Glaceon Holo (PSA 10)
9. `113550042` - Sylveon Holo (PSA 8)
10. `112196225` - Eevee Holo (PSA 9)
11. `116676192` - Vaporeon Holo (PSA 10)
12. `116676191` - Jolteon Holo (PSA 9)
13. `106930395` - Flareon Holo (PSA 8)
14. `118761371` - Espeon Holo (PSA 10)
15. `122817911` - Umbreon Holo (PSA 9)
16. `120432127` - Leafeon Holo (PSA 8)
17. `116496112` - Glaceon Holo (PSA 10)
18. `128414325` - Sylveon Holo (PSA 9)
19. `112593899` - Eevee Holo (PSA 8)

---

## 🎯 Quick Commands Reference

```bash
# Backend (Terminal 1)
cd pokejsonball/backend
npm run db:reset          # Reset database
node src/app.js           # Start server

# Frontend (Terminal 2)
cd pokejsonball/frontend
npm run dev              # Start dev server

# Test Backend API
curl http://localhost:3001/
curl http://localhost:3001/api/cards
curl http://localhost:3001/api/cards/116230496
```

---

##  You're All Set!

Both servers should now be running with your real PSA certification numbers integrated into the database!
