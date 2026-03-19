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

db.prepare(`CREATE TABLE IF NOT EXISTS collections (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  name      TEXT    NOT NULL,
  position  INTEGER NOT NULL DEFAULT 0
)`).run();

// Migration: add collection_id to songs if missing
const songsCols = db.prepare(`PRAGMA table_info(songs)`).all() as { name: string }[];
if (!songsCols.some((c) => c.name === 'collection_id')) {
  const result = db.prepare(`INSERT INTO collections (name, position) VALUES (?, ?)`).run('Sångbok', 1);
  const defaultId = result.lastInsertRowid;
  db.prepare(`ALTER TABLE songs ADD COLUMN collection_id INTEGER REFERENCES collections(id)`).run();
  db.prepare(`UPDATE songs SET collection_id = ?`).run(defaultId);
}

// Migration: rebuild settings table with collection_id if missing
const settingsCols = db.prepare(`PRAGMA table_info(settings)`).all() as { name: string }[];
if (!settingsCols.some((c) => c.name === 'collection_id')) {
  // Check if settings table exists at all first
  const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='settings'`).all() as { name: string }[];
  const oldRows: { key: string; value: string }[] = tables.length > 0
    ? (db.prepare(`SELECT key, value FROM settings`).all() as { key: string; value: string }[])
    : [];

  // Get default collection (first one by position)
  const defaultCol = db.prepare(`SELECT id FROM collections ORDER BY position LIMIT 1`).get() as { id: number } | undefined;
  const defaultId = defaultCol?.id ?? 1;

  if (tables.length > 0) {
    db.prepare(`DROP TABLE settings`).run();
  }

  db.prepare(`CREATE TABLE IF NOT EXISTS settings (
    collection_id INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    key           TEXT    NOT NULL,
    value         TEXT,
    PRIMARY KEY (collection_id, key)
  )`).run();

  for (const row of oldRows) {
    db.prepare(`INSERT OR IGNORE INTO settings (collection_id, key, value) VALUES (?, ?, ?)`).run(defaultId, row.key, row.value);
  }
}

db.prepare(`CREATE INDEX IF NOT EXISTS idx_sections_song ON sections(song_id)`).run();
db.prepare(`CREATE INDEX IF NOT EXISTS idx_songs_position ON songs(position)`).run();

export default db;
