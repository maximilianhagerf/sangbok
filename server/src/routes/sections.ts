import { Router } from 'express';
import db from '../db';

const router = Router();

// Update a section
router.put('/:id', (req, res) => {
  const { label, content, chords } = req.body;
  db.prepare(
    `UPDATE sections SET label = ?, content = COALESCE(?, content), chords = ? WHERE id = ?`,
  ).run(
    label ?? null,
    content ?? null,
    chords !== undefined ? JSON.stringify(chords) : null,
    req.params.id,
  );

  const section = db.prepare(`SELECT * FROM sections WHERE id = ?`).get(req.params.id) as any;
  if (!section) return res.status(404).json({ error: 'Not found' });
  res.json({ ...section, chords: section.chords ? JSON.parse(section.chords) : [] });
});

// Delete a section
router.delete('/:id', (req, res) => {
  db.prepare(`DELETE FROM sections WHERE id = ?`).run(req.params.id);
  res.status(204).end();
});

export default router;
