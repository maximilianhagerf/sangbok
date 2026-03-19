import { Router } from 'express';
import db from '../db';

const router = Router();

const KEYS = ['cover_title', 'cover_subtitle', 'cover_credit'] as const;

const DEFAULTS: Record<string, string> = {
  cover_title: 'Våra Sånger',
  cover_subtitle: 'En samling sånger',
  cover_credit: '',
};

router.get('/', (req, res) => {
  const collectionId = req.query.c;
  if (!collectionId) return res.status(400).json({ error: 'collection id (c) is required' });

  const rows = db.prepare(`SELECT key, value FROM settings WHERE collection_id = ? AND key IN (${KEYS.map(() => '?').join(',')})`)
    .all(collectionId, ...KEYS) as { key: string; value: string }[];
  const result: Record<string, string> = { ...DEFAULTS };
  for (const row of rows) result[row.key] = row.value;
  res.json(result);
});

router.put('/', (req, res) => {
  const collectionId = req.query.c;
  if (!collectionId) return res.status(400).json({ error: 'collection id (c) is required' });

  const { cover_title, cover_subtitle, cover_credit } = req.body;
  if (!cover_title?.trim()) return res.status(400).json({ error: 'cover_title is required' });

  const upsert = db.prepare(`INSERT OR REPLACE INTO settings (collection_id, key, value) VALUES (?, ?, ?)`);
  const run = db.transaction(() => {
    upsert.run(collectionId, 'cover_title', cover_title.trim());
    upsert.run(collectionId, 'cover_subtitle', cover_subtitle?.trim() ?? '');
    upsert.run(collectionId, 'cover_credit', cover_credit?.trim() ?? '');
  });
  run();
  res.json({ cover_title: cover_title.trim(), cover_subtitle: cover_subtitle?.trim() ?? '', cover_credit: cover_credit?.trim() ?? '' });
});

export default router;
