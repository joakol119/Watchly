const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function query(text, params) {
  const res = await pool.query(text, params);
  return res;
}

async function init() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS watchlist (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      tmdb_id INTEGER NOT NULL,
      media_type TEXT NOT NULL,
      title TEXT NOT NULL,
      poster_path TEXT,
      status TEXT DEFAULT 'want_to_watch',
      position INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, tmdb_id, media_type)
    )
  `);

  // Migración: agregar columna position si no existe
  await query(`
    ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0
  `);

  console.log('Database initialized');
}

module.exports = { query, init };
