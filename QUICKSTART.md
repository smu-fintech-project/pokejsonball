# PokeJsonBall - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ installed
- npm or yarn

### Backend Setup (5 minutes)

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```bash
   # Create backend/.env with:
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   DB_PATH=./data/cards.db
   PSA_API_KEY=your_key_here
   POKEMON_TCG_API_KEY=your_key_here
   ```

4. **Get API Keys** (Optional for testing)
   - **PSA API**: https://www.psacard.com/publicapi/documentation
   - **Pokemon TCG API**: https://dev.pokemontcg.io/
   
   *Note: The app will work without API keys, but external data fetching will fail gracefully*

5. **Initialize database**
   ```bash
   npm run db:reset
   ```

6. **Start backend server**
   ```bash
   npm run dev
   ```
   
   ✅ Backend running at `http://localhost:5000`

### Frontend Setup (3 minutes)

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** (optional)
   ```bash
   # Create frontend/.env with:
   VITE_API_BASE=http://localhost:5000
   ```

4. **Start frontend dev server**
   ```bash
   npm run dev
   ```
   
   ✅ Frontend running at `http://localhost:3000` (or the port Vite assigns)

### Test the App

1. Open `http://localhost:3000` in your browser
2. You should see:
   - ✅ Modern homepage with dark mode toggle
   - ✅ Navigation tabs (Marketplace, Portfolio, Community, About, Login)
   - ✅ Featured holographic cards grid
   - ✅ Click any card to see detail page

## 🐛 CORS Issues Fixed

The following CORS issues have been resolved:

### Issue 1: Backend CORS
**Problem**: Frontend couldn't fetch from backend API

**Solution**: Configured CORS middleware in `backend/src/app.js`
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

### Issue 2: External Image CORS
**Problem**: PokemonTCG images blocked by CORS policy

**Solution**: Created image proxy endpoint
- Backend route: `GET /api/proxy-image?url=<encoded_url>`
- Frontend utility: `src/utils/imageProxy.js`
- All external images now proxied through backend

## 📁 Project Structure

```
pokejsonball/
├── backend/
│   ├── src/
│   │   ├── app.js              # Express server + CORS + image proxy
│   │   ├── db.js               # SQLite setup + caching
│   │   ├── routes/
│   │   │   ├── cards.js        # Card API + PSA/TCG integration
│   │   │   ├── auth.js         # Authentication routes
│   │   │   └── users.js        # User routes
│   │   └── seed/
│   │       └── seedCards.js    # Database seeding script
│   ├── data/
│   │   └── cards.db            # SQLite database (auto-created)
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── App.vue             # Root component + dark mode
    │   ├── components/
    │   │   ├── Navbar.vue      # Navigation + theme toggle
    │   │   ├── CardGrid.vue    # Responsive grid layout
    │   │   └── ListingCard.vue # Card preview component
    │   ├── pages/
    │   │   ├── LandingPage.vue # Homepage
    │   │   ├── CardDetail.vue  # Card detail + chart + filters
    │   │   ├── Portfolio.vue   # User portfolio
    │   │   ├── Community.vue   # Community page
    │   │   ├── About.vue       # About page
    │   │   ├── Login.vue       # Login page
    │   │   └── Profile.vue     # User profile
    │   ├── utils/
    │   │   └── imageProxy.js   # Image proxy utility
    │   └── router/
    │       └── index.js        # Vue Router config
    └── package.json
```

## 🎨 Features Implemented

### Frontend
- ✅ Modern, minimalist UI with Tailwind CSS
- ✅ Dark mode toggle (persisted to localStorage)
- ✅ Navigation: Login, Marketplace, Portfolio, Community, About
- ✅ Responsive grid layout for card listings
- ✅ Card detail page with:
  - Large card image
  - Pricing history chart (mock data)
  - Condition filters
  - Seller ratings
  - Buy/Sell/Trade buttons
- ✅ Mobile responsive design
- ✅ Clean color scheme (light: white/blue, dark: slate/purple)

### Backend
- ✅ SQLite database with 150 Eeveelution cards
- ✅ PSA API integration for card images/metadata
- ✅ PokemonTCG API integration for pricing
- ✅ Smart caching (5-minute TTL)
- ✅ Image proxy to bypass CORS
- ✅ Error handling and fallbacks
- ✅ RESTful API design

## 🔧 Troubleshooting

### Backend won't start
- Check if port 5000 is available
- Verify `.env` file exists in `backend/` directory
- Run `npm install` again

### Frontend can't fetch data
- Verify backend is running on port 5000
- Check browser console for CORS errors
- Ensure `VITE_API_BASE` matches backend URL

### Images not loading
- All images should now proxy through backend
- Check backend logs for proxy errors
- Verify external image URLs are valid

### Database errors
- Delete `backend/data/cards.db` and run `npm run db:reset`
- Check file permissions on `data/` directory

## 📝 Next Steps

1. **Get Real API Keys**: Register for PSA and PokemonTCG APIs
2. **Add Real Data**: Update seed script with actual card data
3. **Implement Auth**: Connect login/signup to Firebase
4. **Add Features**: 
   - Real-time pricing updates
   - User portfolios
   - Trading system
   - Community features

## 🎯 Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads at localhost:3000
- [ ] Dark mode toggle works
- [ ] All navigation tabs accessible
- [ ] Cards display on homepage
- [ ] Click card → navigate to detail page
- [ ] No CORS errors in browser console
- [ ] Images load correctly

## 📚 API Documentation

See `backend/README.md` for detailed API documentation.

## 🤝 Support

If you encounter issues:
1. Check browser console for errors
2. Check backend terminal for logs
3. Verify all dependencies installed
4. Ensure both servers running

Happy trading! 🎴✨
