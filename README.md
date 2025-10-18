# PokeJsonBall - Pokemon Card Marketplace

A modern web application for trading PSA-certified Pokemon cards with real-time chat and portfolio tracking. Built with Vue 3, Express, and Firebase.

## 🌟 Key Features

- **19 PSA-Certified Eeveelution Cards** - Real certification numbers and high-res images
- **Portfolio Growth Charts** - TradingView Lightweight Charts with historical data tracking
- **Real-time Chat System** - Socket.IO powered messaging between buyers and sellers
- **Price Updates** - Automatic card pricing from Pokemon TCG API
- **Admin-Protected Cert Gallery** - Email whitelist authentication for sensitive features
- **Database-Driven Content** - All cards fetched from Firebase Firestore
- **JWT Authentication** - Secure user signup and login
- **Dark Mode** - Toggle between light and dark themes
- **Admin Protection** - Email whitelist for sensitive features
- **Smart Caching** - API response caching with TTL

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- Firebase account
- PSA API key (from https://www.psacard.com/publicapi/documentation)
- Pokemon TCG API key (from https://dev.pokemontcg.io/)

### Installation

```bash
# Clone and install
git clone <repository-url>
cd pokejsonball

cd backend && npm install
cd ../frontend && npm install

# Setup environment variables (see below)

# Seed database
cd backend
npm run seed:users
npm run seed:history    # Backfill 100 days of portfolio data
```

### Environment Setup

**Backend `.env`** (in `backend/` directory):
```env
# Server
PORT=3001
FRONTEND_URL=http://localhost:3000

# Firebase Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# API Keys
PSA_API_KEY=your_psa_api_key
POKEMON_TCG_API_KEY=your_pokemon_tcg_api_key

# Authentication
JWT_SECRET=your-super-secret-jwt-key
```

**Frontend `.env`** (in `frontend/` directory):
```env
VITE_API_BASE=http://localhost:3001
```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Server runs on http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
App runs on http://localhost:3000

## 🔐 Admin Access

Add your email to `backend/src/config/admins.js`:
```javascript
const ADMIN_EMAILS = [
  'admin@pokejsonball.com',
  'youremail@example.com',  // Add your email here
];
```

Only whitelisted emails can access the Cert Gallery (`/certs` page).

## 📡 API Endpoints

### Authentication
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/signup` | POST | None | Create user account |
| `/api/auth/login` | POST | None | Login user |

### Cards & Portfolio
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/cards` | GET | None | List all marketplace cards |
| `/api/cards/:cert` | GET | None | Get card details |
| `/api/portfolio/history` | GET | JWT | Get portfolio time-series data |
| `/api/portfolio/stats` | GET | JWT | Get portfolio statistics |

### Chat
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/chat/find-or-create` | POST | JWT | Find/create conversation |
| `/api/chat/my-conversations` | GET | JWT | Get user's conversations |
| `/api/chat/:id/messages` | GET | JWT | Get message history |

## 💬 Real-Time Chat System

### Features
- Socket.IO powered instant messaging
- JWT-authenticated connections
- Persistent message history in Firestore
- Live notifications with unread badges
- Typing indicators
- Two-column layout (conversations + active chat)

### Socket.IO Events
**Client → Server:** `join_conversation`, `send_message`, `typing_start/stop`  
**Server → Client:** `new_message`, `conversation_updated`, `new_message_notification`

### Database Schema
```javascript
// conversations collection
{
  participants: ["buyer123", "seller456"],
  cardId: "113699124",
  lastMessage: "Is this available?",
  lastMessageAt: Timestamp
}

// messages collection
{
  conversationId: "conv123",
  senderId: "buyer123",
  text: "Is this available?",
  read: false,
  createdAt: Timestamp
}
```

## 📊 Portfolio Growth Charts

### Features
- **TradingView Lightweight Charts** - Professional financial charting library
- **100 Days Historical Data** - Backfilled with random walk algorithm
- **Timeframe Filters** - 1M, 6M, 1Y, All Time views
- **Real-time Updates** - Daily snapshots via `updateCardPrices` script
- **Beautiful Stats Cards** - Current value, change %, all-time high
- **Dark Mode Support** - Automatically adapts to theme

### Setup
```bash
# 1. Backfill historical data (one-time)
cd backend
npm run seed:history

# 2. Update prices daily (creates new snapshot)
npm run update:prices
```

### Data Structure
```javascript
// users/{userId}/portfolio_history/{date}
{
  time: "2025-10-17",  // YYYY-MM-DD
  value: 1234.56       // Total portfolio value in JSB
}
```

Portfolio value = sum of `average_sell_price` for all user's active listings.

## 🗃️ Firebase Collections

- **`cards`** - Card metadata, PSA grades, prices
- **`users`** - User accounts with JWT auth
- **`users/{id}/listings`** - User's card listings
- **`users/{id}/portfolio_history`** - Daily portfolio snapshots
- **`conversations`** - Chat conversations
- **`messages`** - Chat messages
- **`api_cache`** - Cached API responses (30min TTL)

## 🛠️ Available Scripts

### Backend
```bash
npm run dev             # Start dev server with nodemon
npm start               # Start production server
npm run seed:users      # Sync cards to Firebase
npm run seed:history    # Backfill 100 days portfolio data
npm run update:prices   # Update prices + create daily snapshot
```

### Frontend
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview build
```

## 💰 Update Card Prices

Automatically updates card prices from Pokemon TCG API and creates daily portfolio snapshots.

### What It Does
1. Fetches all cards from Firebase
2. Maps PSA set names to TCG API set IDs
3. Fetches market prices (holofoil → reverseHolo → normal)
4. Updates `average_sell_price` on each card
5. **Creates daily portfolio snapshot** for all users

### Usage
```bash
cd backend
npm run update:prices
```

### Set Mappings
Add mappings in `backend/src/scripts/updateCardPrices.js`:
```javascript
const SET_NAME_TO_ID = {
  'PRISMATIC EVOLUTIONS': 'sv8pt5',
  'BLACK STAR PROMO': 'svp',
  'YOUR SET NAME': 'set-id',
};
```

## 📂 Project Structure

```
pokejsonball/
├── backend/
│   ├── src/
│   │   ├── routes/            # API endpoints
│   │   │   ├── auth.js        # Authentication routes
│   │   │   ├── cardsFirebase.js  # Card routes
│   │   │   ├── chat.js        # Chat system routes
│   │   │   ├── portfolio.js   # Portfolio history API
│   │   │   ├── users.js       # User routes
│   │   │   └── wallet.js      # Wallet routes
│   │   ├── models/            # Data models
│   │   │   ├── Conversation.js
│   │   │   └── Message.js
│   │   ├── services/          # Business logic
│   │   │   ├── firebase.js    # Firebase client
│   │   │   ├── firebaseDb.js  # Firestore operations
│   │   │   ├── pokemonTCGService.js  # Pokemon TCG API
│   │   │   └── psaService.js  # PSA API integration
│   │   ├── middleware/        # Express middleware
│   │   │   ├── auth.js        # JWT authentication
│   │   │   └── adminAuth.js   # Admin authorization
│   │   ├── scripts/           # Utility scripts
│   │   │   ├── updateCardPrices.js      # Price updates + snapshots
│   │   │   └── seedPortfolioHistory.js  # Backfill historical data
│   │   ├── seed/              # Database seeding
│   │   │   └── seedUsers.js   # Sync cards to Firebase
│   │   ├── socketRefactored.js
│   │   └── app.js             # Express app setup
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── CardGrid.vue   # Grid layout for cards
│   │   │   ├── ChatWindow.vue # Chat interface
│   │   │   ├── PortfolioChart.vue   # TradingView chart
│   │   │   ├── CertCard.vue   # Individual cert card
│   │   │   ├── CertGrid.vue   # Grid for certs
│   │   │   ├── ListingCard.vue  # Card listing item
│   │   │   └── Navbar.vue     # Navigation bar
│   │   ├── pages/             # Page components
│   │   │   ├── LandingPage.vue   # Home page
│   │   │   ├── About.vue      # About page
│   │   │   ├── CardDetail.vue # Card detail view
│   │   │   ├── Certs.vue      # Admin cert gallery
│   │   │   ├── Community.vue  # Community page
│   │   │   ├── Messages.vue   # Chat messages page
│   │   │   ├── Login.vue      # Login page
│   │   │   ├── SignUp.vue     # Signup page
│   │   │   ├── Portfolio.vue  # User portfolio
│   │   │   └── Profile.vue    # User profile with portfolio chart
│   │   ├── composables/       # Vue composables
│   │   │   ├── usePSADetails.js  # PSA data fetching
│   │   │   ├── useChatRefactored.js
│   │   │   └── useGlobalNotifications.js
│   │   ├── utils/             # Helper functions
│   │   │   ├── api.js         # API client
│   │   │   └── imageProxy.js  # Image proxy helper
│   │   ├── router/            # Vue Router config
│   │   │   └── index.js
│   │   └── main.js
│   └── package.json
│
└── README.md
```

## 🎯 Tech Stack

### Frontend
- **Framework**: Vue 3 (Composition API)
- **Routing**: Vue Router 4
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **Charts**: TradingView Lightweight Charts

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Real-time**: Socket.IO
- **Database**: Firebase Firestore
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **External APIs**: PSA API, Pokemon TCG API

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|

| Port 3001 in use | `lsof -ti:3001 \| xargs kill -9` |
| JWT_SECRET error | Add to `backend/.env` |
| No cards | Run `npm run seed:users` |
| No portfolio data | Run `npm run seed:history` |
| Admin denied | Add email to `backend/src/config/admins.js` |
| Firebase error | Check credentials in `backend/.env` |
| Chat not working | Check Socket.IO connection; verify JWT token |
| WebSocket fails | Ensure backend on port 3001; check `FRONTEND_URL` |
| Firestore index error | Click Firebase Console link to create index |
| Chart not showing | Install `lightweight-charts`: `npm i lightweight-charts` |

## 🔒 Security

- JWT authentication with bcrypt password hashing
- Admin email whitelist
- CORS protection
- Socket.IO authentication
- Input validation

## 🚀 Deployment

**Frontend:** `npm run build` → Deploy `dist/` to Vercel/Netlify  
**Backend:** PM2 process manager → Deploy to Heroku/Railway  
**Database:** Firebase Firestore (already cloud-hosted)

## 🤝 Contributing

Follow [Conventional Commits](https://www.conventionalcommits.org/):
```bash
feat(portfolio): add chart filters
fix(chat): resolve notification bug
docs(readme): update setup guide
```

**Branch naming:** `type/description` (e.g., `feature/portfolio-charts`, `fix/chat-bug`)

## 📝 License

MIT License

---

**Questions?** Check troubleshooting or open a GitHub issue.
