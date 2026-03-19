import { Router } from 'express';
import db from '../db';

const router = Router();

// List all songs with their sections
router.get('/', (req, res) => {
  const collectionId = req.query.c;
  if (!collectionId) return res.status(400).json({ error: 'collection id (c) is required' });

  const songs = db.prepare(`SELECT * FROM songs WHERE collection_id = ? ORDER BY position`).all(collectionId) as any[];
  const sections = db.prepare(`SELECT * FROM sections ORDER BY song_id, position`).all() as any[];

  const sectionsBySong: Record<number, any[]> = {};
  for (const s of sections) {
    if (!sectionsBySong[s.song_id]) sectionsBySong[s.song_id] = [];
    sectionsBySong[s.song_id].push({ ...s, chords: s.chords ? JSON.parse(s.chords) : [] });
  }

  res.json(songs.map((s) => ({ ...s, sections: sectionsBySong[s.id] ?? [] })));
});

// Get single song with sections
router.get('/:id', (req, res) => {
  const song = db.prepare(`SELECT * FROM songs WHERE id = ?`).get(req.params.id) as any;
  if (!song) return res.status(404).json({ error: 'Not found' });

  const sections = db
    .prepare(`SELECT * FROM sections WHERE song_id = ? ORDER BY position`)
    .all(req.params.id) as any[];
  res.json({
    ...song,
    sections: sections.map((s) => ({ ...s, chords: s.chords ? JSON.parse(s.chords) : [] })),
  });
});

// Create song
router.post('/', (req, res) => {
  const { title, credit, original, columns = 2, collection_id } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });
  if (!collection_id) return res.status(400).json({ error: 'collection_id is required' });

  const maxPos = (db.prepare(`SELECT MAX(position) as m FROM songs WHERE collection_id = ?`).get(collection_id) as any).m ?? 0;
  const result = db
    .prepare(
      `INSERT INTO songs (title, credit, original, columns, position, collection_id) VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(title, credit ?? null, original ?? null, columns, maxPos + 1, collection_id);

  const song = db.prepare(`SELECT * FROM songs WHERE id = ?`).get(result.lastInsertRowid) as any;
  res.status(201).json({ ...song, sections: [] });
});

// Update song metadata
router.put('/:id', (req, res) => {
  const { title, credit, original, columns } = req.body;
  db.prepare(
    `UPDATE songs SET title = COALESCE(?, title), credit = ?, original = ?, columns = COALESCE(?, columns) WHERE id = ?`,
  ).run(title ?? null, credit ?? null, original ?? null, columns ?? null, req.params.id);

  const song = db.prepare(`SELECT * FROM songs WHERE id = ?`).get(req.params.id) as any;
  if (!song) return res.status(404).json({ error: 'Not found' });
  const sections = db
    .prepare(`SELECT * FROM sections WHERE song_id = ? ORDER BY position`)
    .all(req.params.id) as any[];
  res.json({
    ...song,
    sections: sections.map((s) => ({ ...s, chords: s.chords ? JSON.parse(s.chords) : [] })),
  });
});

// Delete song
router.delete('/:id', (req, res) => {
  db.prepare(`DELETE FROM songs WHERE id = ?`).run(req.params.id);
  res.status(204).end();
});

// Reorder songs — body: { ids: number[] }
router.patch('/reorder', (req, res) => {
  const { ids } = req.body as { ids: number[] };
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids must be an array' });

  const update = db.prepare(`UPDATE songs SET position = ? WHERE id = ?`);
  const reorder = db.transaction((orderedIds: number[]) => {
    for (let idx = 0; idx < orderedIds.length; idx++) update.run(idx + 1, orderedIds[idx]);
  });
  reorder(ids);
  res.status(204).end();
});

// Add section to song
router.post('/:songId/sections', (req, res) => {
  const { label, content = '', chords } = req.body;
  const maxPos =
    (
      db
        .prepare(`SELECT MAX(position) as m FROM sections WHERE song_id = ?`)
        .get(req.params.songId) as any
    ).m ?? 0;
  const result = db
    .prepare(
      `INSERT INTO sections (song_id, label, content, chords, position) VALUES (?, ?, ?, ?, ?)`,
    )
    .run(
      req.params.songId,
      label ?? null,
      content,
      chords ? JSON.stringify(chords) : null,
      maxPos + 1,
    );

  const section = db
    .prepare(`SELECT * FROM sections WHERE id = ?`)
    .get(result.lastInsertRowid) as any;
  res.status(201).json({ ...section, chords: section.chords ? JSON.parse(section.chords) : [] });
});

// Reorder sections within a song
router.patch('/:songId/sections/reorder', (req, res) => {
  const { ids } = req.body as { ids: number[] };
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids must be an array' });

  const update = db.prepare(`UPDATE sections SET position = ? WHERE id = ? AND song_id = ?`);
  const songId = req.params.songId;
  const reorder = db.transaction((orderedIds: number[]) => {
    for (let idx = 0; idx < orderedIds.length; idx++) update.run(idx + 1, orderedIds[idx], songId);
  });
  reorder(ids);
  res.status(204).end();
});

export default router;
