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
npm run db:sync-certs
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

## 🗃️ Firebase Collections

- **`cards`** - Card data (cert_number, images, PSA grade, etc.)
- **`api_cache`** - Cached PSA API responses (30min TTL)
- **`users`** - User accounts (email, hashed password)

## 🛠️ Available Scripts

### Backend
```bash
npm run dev            # Start dev server with nodemon
npm start              # Start production server
npm run db:sync-certs  # Sync all PSA cards to Firebase
```

### Frontend
```bash
npm run dev      # Start dev server with Vite
npm run build    # Build for production
npm run preview  # Preview production build
```

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
│   │   │   └── users.js       # User routes
│   │   ├── services/          # Business logic
│   │   │   ├── firebase.js    # Firebase client
│   │   │   ├── firebaseDb.js  # Firestore operations
│   │   │   ├── pokemonTCGService.js  # Pokemon TCG API
│   │   │   ├── psaService.js  # PSA API integration
│   │   │   └── cardIntegrationService.js  # Combined service
│   │   ├── middleware/        # Express middleware
│   │   │   ├── auth.js        # JWT authentication
│   │   │   └── adminAuth.js   # Admin authorization
│   │   ├── config/            # Configuration
│   │   │   ├── admins.js      # Admin email whitelist
│   │   │   └── certs.js       # PSA cert numbers
│   │   ├── seed/              # Database seeding
│   │   │   └── syncCerts.js   # Sync cards to Firebase
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
│   │   │   ├── ListingCard.vue  # Card listing item
│   │   │   └── Navbar.vue     # Navigation bar
│   │   ├── pages/             # Page components
│   │   │   ├── LandingPage.vue   # Home page
│   │   │   ├── About.vue      # About page
│   │   │   ├── CardDetail.vue # Card detail view
│   │   │   ├── Certs.vue      # Admin cert gallery
│   │   │   ├── Community.vue  # Community page
│   │   │   ├── Login.vue      # Login page
│   │   │   ├── SignUp.vue     # Signup page
│   │   │   ├── Portfolio.vue  # User portfolio
│   │   │   └── Profile.vue    # User profile
│   │   ├── composables/       # Vue composables
│   │   │   └── usePSADetails.js  # PSA data fetching
│   │   ├── utils/             # Helper functions
│   │   │   ├── api.js         # API client
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
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Firebase Firestore
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **External APIs**: PSA API, Pokemon TCG API

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3001 already in use | Kill the process: `lsof -ti:3001 \| xargs kill -9` |
| JWT_SECRET error | Add `JWT_SECRET=...` to `backend/.env` |
| No cards showing up | Run `npm run db:sync-certs` in backend folder |
| Admin access denied | Add your email to `backend/src/config/admins.js` |
| Firebase error | Verify Firebase credentials in `backend/.env` |
| CORS errors on images | Images are proxied through `/api/proxy-image` |
| API rate limits | Cached responses reduce API calls (30min TTL) |

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

## 📝 License

MIT License

---

**Need Help?** 
- Check the troubleshooting section above
- Review the API documentation
- Open an issue on GitHub
