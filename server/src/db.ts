import path from 'node:path';
import Database from 'better-sqlite3';

const DB_PATH = path.join(__dirname, '../data/sangbok.db');

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.prepare(`CREATE TABLE IF NOT EXISTS songs (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  position  INTEGER NOT NULL DEFAULT 0,
  title     TEXT    NOT NULL,
  credit    TEXT,
  original  TEXT,
  columns   INTEGER NOT NULL DEFAULT 2
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS sections (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  song_id   INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  position  INTEGER NOT NULL DEFAULT 0,
  label     TEXT,
  content   TEXT    NOT NULL DEFAULT '',
  chords    TEXT
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT
)`).run();

// Seed defaults (only if not already set)
const insertDefault = db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`);
insertDefault.run('cover_title', 'Våra Sånger');
insertDefault.run('cover_subtitle', 'En samling sånger');
insertDefault.run('cover_credit', 'Disney & Camp Glöd 2025');

db.prepare(`CREATE INDEX IF NOT EXISTS idx_sections_song ON sections(song_id)`).run();
db.prepare(`CREATE INDEX IF NOT EXISTS idx_songs_position ON songs(position)`).run();

export default db;
