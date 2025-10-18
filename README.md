# PokeJsonBall - Pokemon Card Marketplace

A modern web application for trading PSA-certified Pokemon cards. Built with Vue 3, Express, and Firebase.

## 🌟 Key Features

- **19 PSA-Certified Eeveelution Cards** - Real certification numbers and high-res images
- **Real-time Chat System** - Socket.IO powered messaging between buyers and sellers
- **Admin-Protected Cert Gallery** - Email whitelist authentication for sensitive features
- **Database-Driven Content** - All cards fetched from Firebase Firestore
- **JWT Authentication** - Secure user signup and login
- **Live Notifications** - Real-time message alerts with unread badges
- **Dark Mode** - Toggle between light and dark themes
- **Responsive Design** - Mobile-first UI with Tailwind CSS
- **PSA API Integration** - Real-time card metadata and images
- **Smart Caching** - API response caching with TTL
- **Image Proxy** - Bypass CORS issues for external images

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- Firebase account
- PSA API key (from https://www.psacard.com/publicapi/documentation)
- Pokemon TCG API key (from https://dev.pokemontcg.io/)

### Installation

```bash
# 1. Clone repository
git clone <repository-url>
cd pokejsonball

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install

# 4. Setup environment variables (see below)

# 5. Sync cards to database
cd backend
npm run seed:users
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
| `/api/auth/signup` | POST | None | Create new user account |
| `/api/auth/login` | POST | None | Login existing user |

### Cards
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/cards` | GET | None | List all cards in marketplace |
| `/api/cards/:cert` | GET | None | Get card details by cert number |
| `/api/certs?ids=...` | GET | Admin | Get PSA cert details (admin only) |

### Image Proxy
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/proxy-image?url=<url>` | GET | None | Proxy external images (CORS bypass) |

### Example Response: `/api/cards`
```json
[
  {
    "id": 1,
    "cert_number": "EEV-100001",
    "card_name": "Eevee Holo",
    "set_name": "Eeveelution",
    "psa_grade": 8,
    "release_year": 2021,
    "pokemon_tcg_id": "swsh1",
    "series": "Sword & Shield",
    "image_url": "https://...",
    "last_known_price": 45.99
  }
]
```

### Example Response: `/api/cards/:cert`
```json
{
  "source": "live",
  "cert_number": "EEV-100001",
  "psa": {
    "cardName": "Eevee V",
    "setName": "Eeveelution",
    "imageUrl": "https://...",
    "series": "Sword & Shield"
  },
  "tcg": {
    "id": "swsh1-1",
    "name": "Eevee V",
    "rarity": "Ultra Rare",
    "tcgplayer": {
      "prices": {
        "holofoil": { "market": 45.99 }
      }
    }
  }
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

## 🛠️ Available Scripts

### Backend
```bash
npm run dev            # Start dev server with nodemon
npm start              # Start production server
npm run seed:users     # Sync all PSA cards to Firebase
npm run update:prices  # Update card prices from Pokemon TCG API
```

### Frontend
```bash
npm run dev      # Start dev server with Vite
npm run build    # Build for production
npm run preview  # Preview production build
```

## 💰 Update Card Prices Script

This script automatically updates all cards in your database with current market pricing data from the Pokémon TCG API.

### What It Does

1. Fetches all cards from your Firebase database
2. Maps PSA `set_name` to Pokémon TCG API `setId` using hardcoded conversions
3. Removes leading zeros from card numbers (e.g., "014" → "14")
4. Constructs a card ID in the format `{setId}-{cardNumber}` (e.g., `sv8pt5-14`)
5. Fetches card data from API endpoint: `/cards/{cardId}`
6. Extracts `tcgplayer.prices.*.market` price (tries holofoil, reverseHolofoil, normal, etc.)
7. Updates each card with `average_sell_price` field
8. Displays real-time progress indicator and summary statistics

### Usage

```bash
# From the backend directory
cd backend
npm run update:prices
```

Or run directly:
```bash
node src/scripts/updateCardPrices.js
```

### Set Name Mappings

The script includes hardcoded mappings from PSA set names to Pokémon TCG API set IDs:

```javascript
{
  'POKEMON PRE EN-PRISMATIC EVOLUTIONS': 'sv8pt5',
  'PRISMATIC EVOLUTIONS': 'sv8pt5',
  'POKEMON SVP EN-SV BLACK STAR PROMO': 'svp',
  'BLACK STAR PROMOS': 'svp',
  'BLACK STAR PROMO': 'svp',
}
```

**Important:** Cards with unmapped set names will be skipped. Add mappings in `backend/src/scripts/updateCardPrices.js`:

```javascript
const SET_NAME_TO_ID = {
  // Existing mappings...
  'YOUR PSA SET NAME': 'tcg-api-set-id',
};
```

### Output Fields

The script adds/updates these fields on each card:

- **`average_sell_price`** - Market price from TCGPlayer in USD, or `null` if unavailable
- **`price_updated_at`** - ISO timestamp of when the price was last updated

The script tries multiple price types in priority order:
1. `holofoil` - For holographic cards
2. `reverseHolofoil` - For reverse holo cards
3. `normal` - For normal/non-holo cards
4. `unlimitedHolofoil` - For unlimited edition holos
5. `1stEditionHolofoil` - For 1st edition holos

### Example Output

```
🚀 Starting Card Price Update Script

============================================================

📚 Fetching all cards from database...
✅ Found 50 cards

============================================================

[1/50] (2.0%)

📇 Processing: FLAREON EX (Cert: 114363745)
   Set: POKEMON PRE EN-PRISMATIC EVOLUTIONS | Number: 014
   Set ID: sv8pt5
Fetching card: sv8pt5-14
Found price (holofoil): $281.86
  💾 Updated in database

[2/50] (4.0%)
...

============================================================
📊 SUMMARY
============================================================
Total cards:           50
Processed:             50
✅ Success (w/ price): 45
⚠️  Success (no price): 2
⚠️  Missing data:       1
⚠️  No set mapping:     1
❌ Failed:             1
============================================================

✨ Script completed!
```

### Error Handling

| Issue | Behavior |
|-------|----------|
| Missing `set_name` or `card_number` | Card skipped, counted in "Missing data" |
| No set mapping found | Card skipped, counted in "No set mapping" |
| Card not found (404) | Price set to `null`, logged as warning |
| No price available | Price set to `null`, counted in "Success (no price)" |
| API errors | Price set to `null`, error logged to console |
| Database errors | Logged and counted in "Failed" |

### Notes

- Script processes cards sequentially (no rate limiting)
- Progress is displayed in real-time
- Uses existing `upsertCard` function to preserve all other card data
- Prices are in USD ($) from TCGPlayer
- Leading zeros are automatically removed from card numbers
- Optional: Set `POKEMON_TCG_API_KEY` in `.env` for higher API rate limits

## 📂 Project Structure

```
pokejsonball/
├── backend/                    # Express API Server
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
│   │   ├── services/          # Business logic
│   │   │   ├── firebase.js    # Firebase client
│   │   │   ├── firebaseDb.js  # Firestore operations
│   │   │   ├── pokemonTCGService.js  # Pokemon TCG API
│   │   │   ├── psaService.js  # PSA API integration
│   │   │   └── cardIntegrationService.js  # Combined service
│   │   ├── middleware/        # Express middleware
│   │   │   ├── auth.js        # JWT & Socket.IO authentication
│   │   │   └── adminAuth.js   # Admin authorization
│   │   ├── config/            # Configuration
│   │   │   ├── admins.js      # Admin email whitelist
│   │   │   └── certs.js       # PSA cert numbers
│   │   ├── seed/              # Database seeding
│   │   │   └── seedUsers.js   # Sync cards to Firebase
│   │   ├── scripts/           # Utility scripts
│   │   │   └── updateCardPrices.js  # Update card prices from TCG API
│   │   ├── socketRefactored.js  # Socket.IO real-time chat server
│   │   ├── app.js             # Express app setup
│   │   └── db.js              # Database connection
│   └── package.json
│
├── frontend/                   # Vue 3 Frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── CardGrid.vue   # Grid layout for cards
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
│   │   │   ├── Login.vue      # Login page
│   │   │   ├── Messages.vue   # Chat/messaging page
│   │   │   ├── SignUp.vue     # Signup page
│   │   │   ├── Portfolio.vue  # User portfolio
│   │   │   └── Profile.vue    # User profile
│   │   ├── composables/       # Vue composables
│   │   │   ├── useChatRefactored.js  # Chat logic and Socket.IO
│   │   │   ├── useGlobalNotifications.js  # Message notifications
│   │   │   └── usePSADetails.js  # PSA data fetching
│   │   ├── utils/             # Helper functions
│   │   │   ├── api.js         # API client
│   │   │   ├── auth.js        # Auth helpers (getCurrentUser, getAuthToken)
│   │   │   └── imageProxy.js  # Image proxy helper
│   │   ├── router/            # Vue Router config
│   │   │   └── index.js
│   │   ├── assets/            # Static assets
│   │   │   └── main.css       # Global styles
│   │   ├── App.vue            # Root component
│   │   └── main.js            # App entry point
│   ├── public/                # Public assets
│   │   └── favicon.ico
│   ├── index.html             # HTML template
│   ├── tailwind.config.js     # Tailwind configuration
│   ├── vite.config.js         # Vite configuration
│   ├── postcss.config.js      # PostCSS configuration
│   ├── jsconfig.json          # JavaScript config
│   └── package.json
│
├── .gitignore
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

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
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

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt rounds
- **Admin Whitelist** - Email-based admin authorization
- **CORS Protection** - Configured for specific origins
- **Environment Variables** - Sensitive data in `.env` files

## 🚀 Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Use a process manager (PM2, forever)
3. Consider PostgreSQL for scaling
4. Implement Redis for caching
5. Add rate limiting middleware
6. Enable logging (Winston, Pino)
7. Use helmet.js for security headers

### Frontend
1. Build: `npm run build`
2. Deploy `dist/` folder to static hosting
3. Configure environment variables
4. Set up CDN for assets
5. Enable HTTPS

### Recommended Platforms
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Heroku, Railway, DigitalOcean, AWS
- **Database**: Firebase (Firestore), MongoDB Atlas, PostgreSQL

## 🤝 Contributing

### Commit Conventions
All commits should follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

**Format:**
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Examples:**
```bash
feat(auth): add JWT token refresh
fix(cards): resolve image loading issue
docs(readme): update installation instructions
chore(deps): upgrade Vue to 3.5.13
```

**Common types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## 💡 Git Branch Naming Conventions

Using clear, descriptive branch names is essential for teamwork and clarity. Follow the $\text{type/description}$ pattern and stick to **lowercase** with **hyphens** as separators.

### 🏷️ Recommended Structure: `type/ticket-id-short-description`

| Type Prefix | Purpose | Example |
| :--- | :--- | :--- |
| **`feature/`** | New functionality or user story. | `feature/login-with-google` |
| **`fix/`** | Fixing a bug in existing code. | `fix/navbar-alignment` |
| **`hotfix/`** | Urgent, critical fix for production. | `hotfix/payment-gateway-failure` |
| **`refactor/`** | Restructuring code without changing behavior. | `refactor/simplify-api-calls` |
| **`chore/`** | Build system, configuration, or dependency updates. | `chore/update-react-deps` |
| **`docs/`** | Changes to documentation (READMEs, comments). | `docs/add-contributing-guide` |
| **`release/`** | Preparing for a new version release. | `release/v2.0.0` |

### ✅ Best Practices

1.  **Use Ticket IDs:** If you use a project tracker (Jira, GitHub Issues), prefix the description with the ticket ID for easy tracing.
    * *Example:* `feature/JIRA-101-add-user-avatar`
2.  **Keep it Concise:** Avoid overly long branch names.
    * *Bad:* `feature/implementing-the-new-checkout-process-for-logged-in-users`
    * *Good:* `feature/new-checkout-flow`
3.  **Use Hyphens:** Always use hyphens (`-`) for spacing. **Avoid** spaces and underscores (`_`).


## 📝 License

MIT License

---

**Need Help?** 
- Check the troubleshooting section above
- Review the API documentation
- Open an issue on GitHub
