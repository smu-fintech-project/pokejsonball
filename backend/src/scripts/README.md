# Backend Scripts

## Update Card Prices Script

This script updates all cards in the database with current pricing data from the Pokémon TCG API.

### What It Does

1. Fetches all cards from your Firebase database
2. For each card, maps the `set_name` to a `setId` using hardcoded conversions
3. Removes leading zeros from card numbers (e.g., "014" becomes "14")
4. Constructs a card ID in the format `{setId}-{cardNumber}` (e.g., `sv8pt5-14`)
5. Fetches the card directly from the API endpoint: `/cards/{cardId}`
6. Extracts the `tcgplayer.prices.*.market` price (tries holofoil, reverseHolofoil, normal, etc.)
7. Updates the card with a new `average_sell_price` field
8. Displays a progress indicator and summary statistics

### Usage

```bash
# From the backend directory
npm run update:prices
```

Or run directly:

```bash
node src/scripts/updateCardPrices.js
```

### Requirements

- Your Firebase credentials must be configured (via environment variables or service account)
- Optional: `POKEMON_TCG_API_KEY` environment variable for higher API rate limits

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

**Important:** Cards with set names that don't have a mapping will be skipped. You'll see a warning in the console and the "No set mapping" count in the summary.

### Adding New Set Mappings

To add more set name conversions, edit the `SET_NAME_TO_ID` object in `updateCardPrices.js`:

```javascript
const SET_NAME_TO_ID = {
  // Existing mappings...
  'YOUR PSA SET NAME': 'tcg-api-set-id',
};
```

### Output Fields

The script adds/updates these fields on each card:

- `average_sell_price` - Market price from TCGPlayer (in USD), or `null` if not available
- `price_updated_at` - ISO timestamp of when the price was last updated

**Note:** The script tries multiple price types in this priority order:
1. `holofoil` - For holographic cards
2. `reverseHolofoil` - For reverse holo cards
3. `normal` - For normal/non-holo cards
4. `unlimitedHolofoil` - For unlimited edition holos
5. `1stEditionHolofoil` - For 1st edition holos

### Error Handling

- **Missing data**: Cards without `set_name` or `card_number` are skipped
- **No set mapping**: Cards with unmapped set names are skipped (add mapping to fix)
- **Card not found (404)**: When the API can't find the card ID, price is set to `null`
- **No price available**: Cards found but without pricing data are updated with `average_sell_price: null`
- **API errors**: Logged to console, card is updated with `null` price
- **Database errors**: Logged and counted in final statistics

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

### Notes

- The script processes cards sequentially (no rate limiting applied)
- Progress is displayed in real-time
- The script uses the existing `upsertCard` function to preserve all other card data
- Prices are in USD ($) from TCGPlayer
- Leading zeros are automatically removed from card numbers (e.g., "014" → "14")
- The script tries multiple price types to find the best available market price

