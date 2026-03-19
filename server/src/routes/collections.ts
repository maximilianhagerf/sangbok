import { Router } from 'express';
import db from '../db';

const router = Router();

// List all collections with song_count and cover_title preview
router.get('/', (_req, res) => {
  const cols = db
    .prepare(
      `SELECT c.*,
        (SELECT COUNT(*) FROM songs WHERE collection_id = c.id) AS song_count,
        (SELECT value FROM settings WHERE collection_id = c.id AND key = 'cover_title') AS cover_title
       FROM collections c ORDER BY c.position`,
    )
    .all();
  res.json(cols);
});

// Create collection
router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'name is required' });
  const maxPos = (db.prepare(`SELECT MAX(position) as m FROM collections`).get() as any).m ?? 0;
  const result = db.prepare(`INSERT INTO collections (name, position) VALUES (?, ?)`).run(name.trim(), maxPos + 1);
  res.status(201).json(db.prepare(`SELECT * FROM collections WHERE id = ?`).get(result.lastInsertRowid));
});

// Rename collection
router.put('/:id', (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'name is required' });
  db.prepare(`UPDATE collections SET name = ? WHERE id = ?`).run(name.trim(), req.params.id);
  const col = db.prepare(`SELECT * FROM collections WHERE id = ?`).get(req.params.id);
  if (!col) return res.status(404).json({ error: 'Not found' });
  res.json(col);
});

// Delete collection (only if more than one exists)
router.delete('/:id', (req, res) => {
  const count = (db.prepare(`SELECT COUNT(*) as c FROM collections`).get() as any).c;
  if (count <= 1) return res.status(400).json({ error: 'Cannot delete the last collection' });
  db.prepare(`DELETE FROM collections WHERE id = ?`).run(req.params.id);
  res.status(204).end();
});

export default router;
