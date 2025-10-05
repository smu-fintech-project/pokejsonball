import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db;

export function getDb() {
  if (!db) {
    const dbPath = process.env.DB_PATH || join(__dirname, '../data/cards.db');
    const dbDir = dirname(dbPath);
    
    console.log('\n💾 Database Initialization:');
    console.log(`Path: ${dbPath}`);
    
    // Ensure data directory exists
    if (!existsSync(dbDir)) {
      console.log(`📁 Creating directory: ${dbDir}`);
      mkdirSync(dbDir, { recursive: true });
    }
    
    try {
      db = new Database(dbPath);
      db.pragma('journal_mode = WAL');
      db.pragma('foreign_keys = ON');
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      throw error;
    }
    
    // Create tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS cards (
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
      CREATE TABLE IF NOT EXISTS api_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        payload TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }
  return db;
}

export function getCache(key, maxAgeSeconds = 300) {
  const db = getDb();
  const row = db.prepare('SELECT payload, updated_at FROM api_cache WHERE key = ?').get(key);
  
  if (!row) {
    console.log(`🔍 Cache miss: ${key}`);
    return null;
  }
  
  const age = (Date.now() - new Date(row.updated_at).getTime()) / 1000;
  if (age > maxAgeSeconds) {
    console.log(`⏰ Cache expired: ${key} (age: ${age.toFixed(0)}s, max: ${maxAgeSeconds}s)`);
    return null;
  }
  
  try { 
    console.log(`✅ Cache hit: ${key} (age: ${age.toFixed(0)}s)`);
    return JSON.parse(row.payload); 
  } catch (error) {
    console.error(`❌ Cache parse error for ${key}:`, error.message);
    return null; 
  }
}

export function setCache(key, payload) {
  const db = getDb();
  const json = JSON.stringify(payload);
  
  try {
    db.prepare(`
      INSERT INTO api_cache (key, payload, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET payload=excluded.payload, updated_at=CURRENT_TIMESTAMP
    `).run(key, json);
    console.log(`💾 Cache stored: ${key}`);
  } catch (error) {
    console.error(`❌ Cache store error for ${key}:`, error.message);
  }
}