# Pokemon Trading Card Marketplace

A modern, full-stack web application for buying, selling, and trading PSA-certified Pokemon cards. Built with Vue.js, Express, and Firebase, featuring real-time PSA API integration for authentic card data and images.

## Features

- **19 Real PSA Certified Eeveelution Cards** - All cards verified with actual PSA certification numbers
- **Live PSA Image Integration** - High-resolution card images fetched directly from PSA's CloudFront CDN
- **Dark Mode Support** - Toggle between light and dark themes with persistent user preferences
- **Responsive Design** - Mobile-first design using Tailwind CSS
- **RESTful API** - Clean backend architecture with modular service layers
- **Image Proxy** - Built-in CORS bypass for external image loading
- **Firebase Authentication** - Secure user authentication and authorization
- **Real-time Price Data** - Integration with Pokemon TCG API for current market prices

## Tech Stack

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **Vue Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Next-generation frontend build tool

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **Firebase Firestore** - Cloud NoSQL database
- **Axios** - HTTP client for API calls
- **Firebase Admin SDK** - Backend database and authentication
- **JWT** - JSON Web Tokens for secure authentication

### External APIs
- **PSA API** - Card certification and high-resolution images
- **Pokemon TCG API** - Card data and pricing information

## Project Structure

```
pokejsonball/
├── frontend/                # Vue.js frontend application
│   ├── src/
│   │   ├── components/     # Reusable Vue components
│   │   ├── pages/          # Page components
│   │   ├── router/         # Vue Router configuration
│   │   ├── utils/          # Utility functions (image proxy, etc.)
│   │   └── App.vue         # Root component
│   └── package.json
│
├── backend/                 # Express backend application
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic (PSA, TCG APIs)
│   │   ├── middleware/     # Authentication middleware
│   │   ├── seed/           # Database seeding scripts
│   │   ├── db.js           # Database configuration
│   │   └── app.js          # Express app entry point
│   ├── data/               # SQLite database files
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pokejsonball
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure environment variables**

   Create `backend/.env`:
   ```env
   PORT=3001
   FRONTEND_URL=http://localhost:3000
   DB_PATH=./data/cards.db
   PSA_API_KEY=your_psa_api_key_here
   POKEMON_TCG_API_KEY=your_pokemon_tcg_api_key_here
   ```

   Create `frontend/.env`:
   ```env
   VITE_API_BASE=http://localhost:3001
   ```

5. **Setup the database**
   ```bash
   cd backend
   npm run db:setup
   ```
   This will:
   - Create the SQLite database
   - Seed 19 real PSA certified Eeveelution cards
   - Fetch all card images from PSA API

### Running the Application

#### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on http://localhost:3000

#### Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Endpoints

#### Get All Cards
```http
GET /api/cards
```
Returns all 19 PSA certified cards with basic information.

**Response:**
```json
[
  {
    "id": 1,
    "cert_number": "116230496",
    "card_name": "Eevee Holo",
    "set_name": "Eeveelution",
    "psa_grade": 10,
    "release_year": 2021,
    "image_url": "https://d1htnxwo4o0jhw.cloudfront.net/cert/...",
    "last_known_price": null
  }
]
```

#### Get Card Details
```http
GET /api/cards/:cert_number
```
Returns detailed card information including PSA and Pokemon TCG data.

**Response:**
```json
{
  "cert_number": "116230496",
  "psa": {
    "cardName": "Eevee Holo",
    "setName": "Eeveelution",
    "imageUrl": "https://...",
    "raw": [...]
  },
  "tcg": {
    "name": "Eevee",
    "rarity": "Holo Rare",
    "set": {...},
    "tcgplayer": {...}
  },
  "image_url": "https://...",
  "last_known_price": 120.00
}
```

#### Image Proxy
```http
GET /api/proxy-image?url=<encoded_image_url>
```
Proxies external images to bypass CORS restrictions.

## Database Schema

### Cards Table
```sql
CREATE TABLE cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cert_number TEXT UNIQUE NOT NULL,
  card_name TEXT NOT NULL,
  set_name TEXT NOT NULL,
  psa_grade INTEGER,
  release_year INTEGER,
  pokemon_tcg_id TEXT,
  series TEXT,
  image_url TEXT,
  last_known_price REAL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### API Cache Table
```sql
CREATE TABLE api_cache (
  key TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Available Scripts

### Backend Scripts

```bash
npm start              # Start production server
npm run dev            # Start development server with nodemon
npm run db:reset       # Reset database and seed cards
npm run db:fetch-images # Fetch PSA images for all cards
npm run db:setup       # Reset DB + fetch images (recommended)
npm test               # Run API endpoint tests
npm run test:watch     # Run tests in watch mode
```

### Frontend Scripts

```bash
npm run dev            # Start development server
npm run build          # Build for production
npm run preview        # Preview production build
```

## PSA Certified Cards

The marketplace includes 19 real PSA certified Eeveelution cards:

| Cert Number | Card Name | PSA Grade | Year |
|-------------|-----------|-----------|------|
| 116230496 | Eevee Holo | 10 | 2021 |
| 110761155 | Vaporeon Holo | 9 | 2020 |
| 114363745 | Jolteon Holo | 10 | 2021 |
| 113699124 | Flareon Holo | 9 | 2021 |
| 113699123 | Espeon Holo | 8 | 2020 |
| 118630975 | Umbreon Holo | 10 | 2022 |
| 111515802 | Leafeon Holo | 9 | 2021 |
| 111144117 | Glaceon Holo | 10 | 2021 |
| 113550042 | Sylveon Holo | 8 | 2020 |
| 112196225 | Eevee Holo | 9 | 2021 |
| 116676192 | Vaporeon Holo | 10 | 2022 |
| 116676191 | Jolteon Holo | 9 | 2022 |
| 106930395 | Flareon Holo | 8 | 2020 |
| 118761371 | Espeon Holo | 10 | 2022 |
| 122817911 | Umbreon Holo | 9 | 2023 |
| 120432127 | Leafeon Holo | 8 | 2022 |
| 116496112 | Glaceon Holo | 10 | 2021 |
| 128414325 | Sylveon Holo | 9 | 2023 |
| 112593899 | Eevee Holo | 8 | 2021 |

## Key Features Implementation

### PSA API Integration
- Fetches high-resolution card images from PSA's CloudFront CDN
- Validates card authenticity using PSA certification numbers
- Implements rate limiting and exponential backoff
- Caches API responses to minimize external requests

### Image Proxy
- Solves CORS issues with external image sources
- Caches images for improved performance
- Supports all major image formats (JPEG, PNG, WebP)

### Dark Mode
- Class-based dark mode using Tailwind CSS
- Persists user preference in localStorage
- Smooth transitions between themes
- Maintains readability in both modes

### Responsive Design
- Mobile-first approach
- Breakpoints for tablet and desktop
- Touch-friendly UI elements
- Optimized images for different screen sizes

## Troubleshooting

### Backend won't start
- Check if port 3001 is available
- Verify `.env` file exists with correct values
- Run `npm install` to ensure all dependencies are installed

### Frontend can't connect to backend
- Ensure backend is running on port 3001
- Check `VITE_API_BASE` in `frontend/.env`
- Verify CORS settings in `backend/src/app.js`

### Images not loading
- Verify PSA_API_KEY is valid in `backend/.env`
- Check if image proxy endpoint is working: http://localhost:3001/api/proxy-image
- Run `npm run db:fetch-images` to re-fetch images

### Database issues
- Delete `backend/data/cards.db*` files
- Run `npm run db:setup` to recreate database
- Check write permissions in `backend/data/` directory

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- PSA (Professional Sports Authenticator) for card certification data
- Pokemon TCG API for card and pricing information
- Vue.js and Express communities for excellent documentation
- Tailwind CSS for the utility-first CSS framework

## Contact

For questions or support, please open an issue on GitHub.