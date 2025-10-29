# PokeJsonBall - Pokemon Card Marketplace

A modern web application for trading PSA-certified Pokemon cards with real-time chat and portfolio tracking. Built with Vue 3, Express, and Firebase.

## 🌟 Key Features

- **19 PSA-Certified Eeveelution Cards** - Real certification numbers and high-res images
- **Real-time Chat System** - Socket.IO powered messaging between buyers and sellers
- **Portfolio Growth Charts** - TradingView Lightweight Charts with historical data tracking
- **Real-time Chat System** - Socket.IO powered messaging between buyers and sellers
- **Price Updates** - Automatic card pricing from Pokemon TCG API
- **Admin-Protected Cert Gallery** - Email whitelist authentication for sensitive features
- **Database-Driven Content** - All cards fetched from Firebase Firestore
- **JWT Authentication** - Secure user signup and login
- **Live Notifications** - Real-time message alerts with unread badges
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

Copy the example files (`backend/.env.example`, `frontend/.env.example`) to real `.env` files before running locally or deploying.

**Backend `.env`** (in `backend/` directory):
```env
# Server
PORT=3001
FRONTEND_URL=http://localhost:3000
# Optional: allow multiple origins (comma separated)
# FRONTEND_URLS=http://localhost:3000,https://preview-your-app.vercel.app

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

When deploying, swap these values for your production Railway and Vercel domains.

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

## 🚢 Deployment (Railway + Vercel)

### Backend on Railway
1. Push the repository to GitHub (or connect the repo you already have).
2. In Railway, create a **New Project → Deploy from GitHub** and select this repo's `backend/` folder.
3. Set the build and start commands:
   - Build: `npm install`
   - Start: `npm start`
4. In **Variables**, add every key from `backend/.env.example`. Remember to:
   - Paste the Firebase private key with escaped newlines (`\n`).
   - Point `FRONTEND_URL` (and optional `FRONTEND_URLS`) to your production Vercel domain once it exists.
   - Keep a strong, unique `JWT_SECRET`.
5. Deploy. Railway will expose a public URL like `https://pokejsonball-production.up.railway.app`.

### Frontend on Vercel
1. In Vercel, create a new project and import the same GitHub repo.
2. When prompted, set:
   - Framework Preset: **Vite**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Add environment variable `VITE_API_BASE` and set it to the Railway URL from the backend deploy.
4. Trigger the deploy. Once live, update the backend `FRONTEND_URL` (and `FRONTEND_URLS` if you want to allow preview domains) and redeploy the backend so CORS and Socket.IO allow the new origin.

### Post-Deploy Checklist
- Run the seeding scripts against Railway (`npm run seed:users`, `npm run seed:history`) either locally with the production env vars exported or via Railway one-off jobs.
- Test login, chat, portfolio charts, and image proxy in production.
- Configure custom domains/SSL in Railway and Vercel when ready.

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

## 💬 Real-Time Chat & Messaging

### Overview

PokeJsonBall features a fully-functional real-time chat system that allows buyers and sellers to communicate about specific card listings. Built with Socket.IO and Firebase Firestore, the system provides instant messaging, message persistence, and live notifications.

### Key Features

- **Real-time Messaging** - Instant bidirectional communication using WebSockets
- **Persistent Storage** - All messages saved to Firestore for message history
- **Conversation Management** - Organized by buyer, seller, and card listing
- **Live Notifications** - Red badge alerts for unread messages
- **Auto-Discovery** - Finds or creates conversations automatically
- **JWT Authentication** - Secure Socket.IO connections with token-based auth
- **Two-Column Layout** - Conversation list (left) and active chat (right)
- **Message Status** - Read receipts and unread message counts
- **Typing Indicators** - See when the other user is typing

### Architecture

```
Frontend (Vue.js)              Backend (Express + Socket.IO)        Database (Firestore)
┌─────────────────┐           ┌──────────────────────┐             ┌─────────────────┐
│  Messages.vue   │◄─Socket───┤  socketRefactored.js │◄───CRUD────┤  conversations  │
│  (Conversation  │  (Real-   │  - JWT Auth          │             │  - participants │
│   List)         │   time)   │  - Personal Rooms    │             │  - lastMessage  │
└────────┬────────┘           │  - Broadcast Events  │             └─────────────────┘
         │                     └──────────────────────┘                      │
         │                                                          ┌─────────────────┐
         └─────────────────────REST API (HTTP)──────────────────►  │    messages     │
                               GET /api/chat/my-conversations      │  - text         │
                               GET /api/chat/:id/messages          │  - senderId     │
                               POST /api/chat/find-or-create       │  - read status  │
                                                                    └─────────────────┘
```

### API Endpoints

#### Chat REST APIs

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/chat/find-or-create` | POST | JWT | Find or create a conversation for buyer/seller/card |
| `/api/chat/my-conversations` | GET | JWT | Get all conversations for logged-in user |
| `/api/chat/:conversationId/messages` | GET | JWT | Get message history with pagination |

**Example: Find or Create Conversation**
```bash
POST /api/chat/find-or-create
Authorization: Bearer <jwt_token>

{
  "sellerId": "user123",
  "cardId": "113699124"
}

Response:
{
  "success": true,
  "conversationId": "Ttm7GBkwCjkQCl9hxOcR",
  "isNew": false
}
```

**Example: Get Conversations**
```bash
GET /api/chat/my-conversations
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "conversations": [
    {
      "id": "Ttm7GBkwCjkQCl9hxOcR",
      "participants": ["buyer123", "seller456"],
      "cardId": "113699124",
      "lastMessage": "Is this card still available?",
      "lastMessageAt": "2025-10-17T12:34:56.789Z",
      "unreadCount": 2,
      "otherUser": {
        "id": "seller456",
        "name": "Dave",
        "email": "dave@example.com"
      },
      "card": {
        "name": "ESPEON EX",
        "imageUrl": "https://...",
        "price": 140
      }
    }
  ]
}
```

#### Socket.IO Events

**Client → Server:**

| Event | Payload | Description |
|-------|---------|-------------|
| `connect` | `{ auth: { token } }` | Authenticate with JWT token |
| `join_conversation` | `{ conversationId }` | Join a conversation room |
| `send_message` | `{ conversationId, text }` | Send a message |
| `typing_start` | `{ conversationId }` | Notify typing started |
| `typing_stop` | `{ conversationId }` | Notify typing stopped |

**Server → Client:**

| Event | Payload | Description |
|-------|---------|-------------|
| `conversation_joined` | `{ conversationId, roomId }` | Successfully joined room |
| `new_message` | `{ id, text, senderId, createdAt, read }` | New message in active conversation |
| `conversation_updated` | `{ ...conversationObject }` | Conversation list update |
| `new_message_notification` | `{ conversationId, senderName, messageText }` | Global notification for new messages |
| `user_typing` | `{ userId, conversationId }` | Other user is typing |
| `user_stopped_typing` | `{ userId, conversationId }` | Other user stopped typing |
| `message_sent` | `{ success: true, messageId }` | Message send confirmation |

### Frontend Components

**1. Messages.vue** - Main chat page with two-column layout
- Left pane: Conversation list with search and sorting
- Right pane: Active chat window
- Real-time conversation updates via Socket.IO
- Auto-selects conversation from URL query parameter

**2. ChatWindow.vue** - Reusable chat interface
- Message history with infinite scroll
- Real-time message reception
- Send message with Enter key support
- Automatic scroll to bottom
- Read receipts and timestamps

**3. Composables:**
- **`useChatRefactored.js`** - Chat logic and Socket.IO connection management
- **`useGlobalNotifications.js`** - Global notification system for unread messages

### Usage Flow

1. **User clicks "Message Seller" on a card**
   ```javascript
   // Frontend calls API to find/create conversation
   POST /api/chat/find-or-create { sellerId, cardId }
   // Redirects to /messages?conversation=<id>
   ```

2. **Messages page loads**
   ```javascript
   // Fetch all conversations
   GET /api/chat/my-conversations
   
   // Connect to Socket.IO with JWT
   socket = io(API_URL, { auth: { token } })
   
   // Join personal room for notifications
   socket.on('connect', () => {
     // Server auto-joins user_<userId> room
   })
   ```

3. **User selects a conversation**
   ```javascript
   // Load message history
   GET /api/chat/:conversationId/messages
   
   // Join conversation room
   socket.emit('join_conversation', { conversationId })
   ```

4. **User sends a message**
   ```javascript
   // Send via Socket.IO
   socket.emit('send_message', { 
     conversationId, 
     text: 'Is this card still available?' 
   })
   
   // Backend:
   // 1. Saves to Firestore 'messages' collection
   // 2. Updates 'lastMessage' in conversation
   // 3. Broadcasts to conversation room: emit('new_message')
   // 4. Notifies both users' personal rooms: emit('conversation_updated')
   ```

5. **Recipient receives notification**
   ```javascript
   // Real-time updates:
   socket.on('new_message', (message) => {
     // Updates chat window if conversation is open
   })
   
   socket.on('conversation_updated', (conversation) => {
     // Updates conversation list (left pane)
   })
   
   socket.on('new_message_notification', (notif) => {
     // Shows red badge in navbar
   })
   ```

### Database Schema

**Conversations Collection:**
```javascript
{
  id: "Ttm7GBkwCjkQCl9hxOcR",
  participants: ["buyer123", "seller456"],
  buyerId: "buyer123",
  sellerId: "seller456",
  cardId: "113699124",
  lastMessage: "Is this card still available?",
  lastMessageAt: Timestamp,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Messages Collection:**
```javascript
{
  id: "msg789",
  conversationId: "Ttm7GBkwCjkQCl9hxOcR",
  senderId: "buyer123",
  text: "Is this card still available?",
  read: false,
  createdAt: Timestamp
}
```

### Security Features

- **JWT Authentication** - All Socket.IO connections require valid JWT token
- **Authorization Checks** - Users can only access their own conversations
- **Input Validation** - Server validates all message content
- **Rate Limiting** - Built-in Socket.IO connection limits
- **XSS Protection** - Vue automatically escapes message content

### Testing

**Test Users:**
```javascript
// Seed users with cards
npm run seed:users

// Test accounts:
alice@gmail.com / password123
dave@gmail.com / password123
carol@gmail.com / password123
```

**Manual Test Flow:**
1. Log in as Alice
2. Click "Message Seller" on a card owned by Dave
3. Send a message to Dave
4. Log in as Dave (in another browser/incognito)
5. Check `/messages` - should see Alice's message in real-time
6. Reply to Alice
7. Both users should see messages instantly

## 🗃️ Firebase Collections

- **`cards`** - Card data (cert_number, images, PSA grade, etc.)
- **`api_cache`** - Cached PSA API responses (30min TTL)
- **`users`** - User accounts (email, hashed password)
- **`conversations`** - Chat conversations between buyers and sellers
- **`messages`** - Individual chat messages with read status
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
│   │   │   ├── cardsV2.js     # Alternative card routes
│   │   │   ├── certs.js       # Admin cert routes
│   │   │   ├── chat.js        # Chat/messaging routes
│   │   │   └── users.js       # User routes
│   │   ├── models/            # Database models
│   │   │   ├── Conversation.js  # Conversation Firestore operations
│   │   │   └── Message.js     # Message Firestore operations
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
│   │   │   ├── auth.js        # JWT & Socket.IO authentication
│   │   │   └── adminAuth.js   # Admin authorization
│   │   ├── scripts/           # Utility scripts
│   │   │   ├── updateCardPrices.js      # Price updates + snapshots
│   │   │   └── seedPortfolioHistory.js  # Backfill historical data
│   │   ├── seed/              # Database seeding
│   │   │   └── seedUsers.js   # Sync cards to Firebase
│   │   ├── scripts/           # Utility scripts
│   │   │   └── updateCardPrices.js  # Update card prices from TCG API
│   │   ├── socketRefactored.js  # Socket.IO real-time chat server
│   │   ├── app.js             # Express app setup
│   │   └── db.js              # Database connection
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
│   │   │   ├── ChatWindow.vue # Real-time chat window
│   │   │   ├── ListingCard.vue  # Card listing item
│   │   │   └── Navbar.vue     # Navigation bar (with notification badge)
│   │   ├── pages/             # Page components
│   │   │   ├── LandingPage.vue   # Home page (with "Message Seller")
│   │   │   ├── About.vue      # About page
│   │   │   ├── CardDetail.vue # Card detail view
│   │   │   ├── Certs.vue      # Admin cert gallery
│   │   │   ├── Community.vue  # Community page
│   │   │   ├── Messages.vue   # Chat messages page
│   │   │   ├── Login.vue      # Login page
│   │   │   ├── Messages.vue   # Chat/messaging page
│   │   │   ├── SignUp.vue     # Signup page
│   │   │   ├── Portfolio.vue  # User portfolio
│   │   │   └── Profile.vue    # User profile with portfolio chart
│   │   ├── composables/       # Vue composables
│   │   │   ├── useChatRefactored.js  # Chat logic and Socket.IO
│   │   │   ├── useGlobalNotifications.js  # Message notifications
│   │   │   └── usePSADetails.js  # PSA data fetching
│   │   │   ├── usePSADetails.js  # PSA data fetching
│   │   │   ├── useChatRefactored.js
│   │   │   └── useGlobalNotifications.js
│   │   ├── utils/             # Helper functions
│   │   │   ├── api.js         # API client
│   │   │   ├── auth.js        # Auth helpers (getCurrentUser, getAuthToken)
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
- **HTTP Client**: Fetch API
- **Real-time**: Socket.IO Client
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **Charts**: TradingView Lightweight Charts

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Real-time**: Socket.IO
- **Database**: Firebase Firestore
- **Real-time**: Socket.IO (WebSockets)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **External APIs**: PSA API, Pokemon TCG API

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3001 already in use | Kill the process: `lsof -ti:3001 \| xargs kill -9` |
| JWT_SECRET error | Add `JWT_SECRET=...` to `backend/.env` |
| No cards showing up | Run `npm run seed:users` in backend folder |
| Admin access denied | Add your email to `backend/src/config/admins.js` |
| Firebase error | Verify Firebase credentials in `backend/.env` |
| CORS errors on images | Images are proxied through `/api/proxy-image` |
| API rate limits | Cached responses reduce API calls (30min TTL) |
| **Chat messages not appearing** | Check Socket.IO connection in browser console; ensure JWT token is valid |
| **"Invalid Date" in messages** | Clear browser cache and refresh; timestamps are now ISO strings |
| **Duplicate conversations** | Log out and log back in to refresh user ID after running `seed:users` |
| **WebSocket connection fails** | Ensure backend is running on port 3001; check `FRONTEND_URL` in `.env` |
| **Firestore index error** | Click the Firebase Console link in the error message to create index |

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



hehe xd redeploy test: