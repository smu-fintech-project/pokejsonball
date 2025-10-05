import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let dbPromise;

export async function getDb() {
  if (!dbPromise) {
    dbPromise = open({ filename: process.env.DB_PATH || './data/cards.db', driver: sqlite3.Database });
  }
  const db = await dbPromise;
  await db.exec(`
    PRAGMA foreign_keys = ON;
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
  return db;
}

export async function getCache(db, key, maxAgeSeconds = 300) {
  const row = await db.get('SELECT payload, updated_at FROM api_cache WHERE key = ?', key);
  if (!row) return null;
  const age = (Date.now() - new Date(row.updated_at).getTime()) / 1000;
  if (age > maxAgeSeconds) return null;
  try { return JSON.parse(row.payload); } catch { return null; }
}

export async function setCache(db, key, payload) {
  const json = JSON.stringify(payload);
  await db.run(`INSERT INTO api_cache (key, payload, updated_at)
               VALUES (?, ?, CURRENT_TIMESTAMP)
               ON CONFLICT(key) DO UPDATE SET payload=excluded.payload, updated_at=CURRENT_TIMESTAMP`, key, json);
}

