# PokeJsonBall - Pokemon Card Marketplace

A modern web application for trading PSA-certified Pokemon cards. Built with Vue 3, Express, and Firebase.

## 🌟 Key Features

- **19 PSA-Certified Eeveelution Cards** - Real certification numbers and high-res images
- **Admin-Protected Cert Gallery** - Email whitelist authentication for sensitive features
- **Database-Driven Content** - All cards fetched from Firebase Firestore
- **JWT Authentication** - Secure user signup and login
- **Dark Mode** - Toggle between light and dark themes
- **Responsive Design** - Mobile-first UI with Tailwind CSS
- **PSA API Integration** - Real-time card metadata and images

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- Firebase account
- PSA API key

### Installation

```bash
# 1. Clone and install
git clone <repository-url>
cd pokejsonball

# 2. Install backend
cd backend && npm install

# 3. Install frontend
cd ../frontend && npm install

# 4. Setup environment variables (see below)

# 5. Sync cards to database
cd backend && npm run db:sync-certs
```

### Environment Setup

**Backend `.env`:**
```env
PORT=3001
FRONTEND_URL=http://localhost:3000

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# API Keys
PSA_API_KEY=your_psa_api_key
POKEMON_TCG_API_KEY=your_pokemon_tcg_api_key

# Auth
JWT_SECRET=your-super-secret-jwt-key
```

**Frontend `.env`:**
```env
VITE_API_BASE=http://localhost:3001
```

### Running the App

**Terminal 1 - Backend:**
```bash
cd backend && npm run dev
```
Server runs on http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend && npm run dev
```
App runs on http://localhost:3000

## 🔐 Admin Access

Add your email to `backend/src/config/admins.js`:
```javascript
const ADMIN_EMAILS = [
  'admin@pokejsonball.com',
  'youremail@example.com',  // Add here
];
```

Only whitelisted emails can access the Cert Gallery (`/certs` page).

## 📡 API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/cards` | GET | None | Get all cards |
| `/api/certs?ids=...` | GET | Admin | Get PSA cert details |
| `/api/auth/signup` | POST | None | Create account |
| `/api/auth/login` | POST | None | Login user |

## 🗃️ Firebase Collections

- **`cards`** - Card data (cert_number, images, PSA grade, etc.)
- **`api_cache`** - Cached PSA API responses (30min TTL)
- **`users`** - User accounts (email, hashed password)

## 🛠️ Available Scripts

**Backend:**
```bash
npm run dev            # Start dev server with nodemon
npm run db:sync-certs  # Sync all 19 PSA cards to database
```

**Frontend:**
```bash
npm run dev      # Start dev server
npm run build    # Build for production
```

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| Port 3001 in use | `lsof -ti:3001 \| xargs kill -9` |
| JWT_SECRET error | Add `JWT_SECRET=...` to `backend/.env` |
| No cards showing | Run `npm run db:sync-certs` in backend |
| Admin access denied | Add your email to `backend/src/config/admins.js` |
| Firebase error | Check Firebase credentials in `.env` |

## 📂 Project Structure

```
pokejsonball/
├── frontend/               # Vue 3 app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   └── utils/         # Helper functions
│   └── package.json
│
├── backend/                # Express API
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Auth middleware
│   │   └── config/        # Configuration
│   └── package.json
│
└── README.md
```

## 🎯 Tech Stack

**Frontend:** Vue 3, Vue Router, Tailwind CSS, Vite  
**Backend:** Node.js, Express, Firebase Firestore, JWT  
**APIs:** PSA Card API, Pokemon TCG API

## 📝 License

MIT License

---

**Need help?** Open an issue on GitHub or check the troubleshooting section above.