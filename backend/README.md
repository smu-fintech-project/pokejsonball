# PokeJsonBall Backend

Production-quality Node.js/Express backend for Pokémon card marketplace with PSA and PokemonTCG API integration.

## Features

- **SQLite Database**: Relational schema with 150+ Eeveelution cards
- **PSA API Integration**: Fetch high-res images and certification data
- **PokemonTCG API Integration**: Real-time pricing and market data
- **Smart Caching**: 5-minute cache for API responses
- **Image Proxy**: Bypass CORS issues for external images
- **Error Handling**: Graceful fallbacks for missing/mismatched data

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
DB_PATH=./data/cards.db

# PSA API (obtain from https://www.psacard.com/publicapi/documentation)
# Register for API access and use the 'api_key' header
PSA_API_KEY=your_psa_api_key_here

# Pokemon TCG API (obtain from https://dev.pokemontcg.io/)
# Free tier available, use 'X-Api-Key' header
POKEMON_TCG_API_KEY=your_pokemon_tcg_api_key_here
```

### 3. Obtain API Keys

#### PSA API Key
1. Visit: https://www.psacard.com/publicapi/documentation
2. Register for API access
3. Copy your API key to `.env` as `PSA_API_KEY`
4. Header used: `api_key`

#### Pokemon TCG API Key
1. Visit: https://dev.pokemontcg.io/
2. Sign up for free API access
3. Copy your API key to `.env` as `POKEMON_TCG_API_KEY`
4. Header used: `X-Api-Key`

### 4. Initialize Database

```bash
npm run db:reset
```

This will:
- Create SQLite database at `./data/cards.db`
- Create `cards` and `api_cache` tables
- Seed 150 Eeveelution cards with placeholder data

### 5. Start Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

Server runs on `http://localhost:5000`

## API Endpoints

### `GET /api/cards`
List all cards in the marketplace.

**Response:**
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

### `GET /api/cards/:cert`
Fetch detailed card data by PSA certification number.

**Flow:**
1. Check cache (5-minute TTL)
2. If not cached, fetch from PSA API using `cert_number`
3. Extract card name and set from PSA response
4. Query PokemonTCG API for pricing data
5. Cache result and update database
6. Return combined data

**Response:**
```json
{
  "source": "live",
  "cert_number": "EEV-100001",
  "psa": {
    "cardName": "Eevee V",
    "setName": "Eeveelution",
    "imageUrl": "https://...",
    "series": "Sword & Shield",
    "raw": { /* full PSA response */ }
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
  },
  "last_known_price": 45.99,
  "image_url": "https://..."
}
```

### `GET /api/proxy-image?url=<encoded_url>`
Proxy external images to bypass CORS restrictions.

**Example:**
```
GET /api/proxy-image?url=https%3A%2F%2Fimages.pokemontcg.io%2Fbase1%2F4_hires.png
```

**Response:** Image binary with proper content-type headers

## Database Schema

### `cards` Table
```sql
CREATE TABLE cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cert_number TEXT UNIQUE NOT NULL,
  card_name TEXT NOT NULL,
  set_name TEXT NOT NULL,
  psa_grade INTEGER NOT NULL,
  release_year INTEGER NOT NULL,
  pokemon_tcg_id TEXT NOT NULL,
  series TEXT NOT NULL,
  image_url TEXT,
  last_known_price REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### `api_cache` Table
```sql
CREATE TABLE api_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  payload TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Error Handling

- **404**: Card not found for certification number
- **500**: API failures (logged server-side)
- **Timeouts**: 10-second timeout on image proxy
- **Fallbacks**: Graceful degradation when APIs are unavailable

## Scaling to New Sets

To add new card sets:

1. Update seed script (`src/seed/seedCards.js`)
2. Change `set_name` and `series` values
3. Run `npm run db:reset`
4. No code changes needed - API routes are set-agnostic

## Production Considerations

- **Database**: Migrate to PostgreSQL for production
- **Caching**: Consider Redis for distributed caching
- **Rate Limiting**: Add rate limiting middleware
- **Monitoring**: Implement logging (Winston, Pino)
- **Security**: Add helmet.js, validate inputs
- **Environment**: Use proper secrets management

## Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────┐      ┌──────────────┐
│   Express   │─────▶│   SQLite     │
│   Server    │      │   Database   │
└──────┬──────┘      └──────────────┘
       │
       ├──────────────┐
       │              │
       ▼              ▼
┌──────────┐   ┌─────────────┐
│ PSA API  │   │ Pokemon TCG │
│          │   │     API     │
└──────────┘   └─────────────┘
```

## License

MIT
