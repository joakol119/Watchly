const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT l.*, COUNT(li.id)::int AS item_count
       FROM lists l
       LEFT JOIN list_items li ON li.list_id = l.id
       WHERE l.user_id = $1
       GROUP BY l.id
       ORDER BY l.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  const { name, emoji = '📋' } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'El nombre es requerido' });
  try {
    const result = await db.query(
      'INSERT INTO lists (user_id, name, emoji) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, name.trim(), emoji]
    );
    res.status(201).json({ ...result.rows[0], item_count: 0 });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM lists WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const list = await db.query('SELECT * FROM lists WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (!list.rows.length) return res.status(404).json({ error: 'Lista no encontrada' });
    const items = await db.query(
      'SELECT * FROM list_items WHERE list_id = $1 ORDER BY added_at DESC',
      [req.params.id]
    );
    res.json({ ...list.rows[0], items: items.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/items', auth, async (req, res) => {
  const { tmdb_id, media_type, title, poster_path } = req.body;
  try {
    const owns = await db.query('SELECT id FROM lists WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (!owns.rows.length) return res.status(403).json({ error: 'Sin acceso' });
    const result = await db.query(
      'INSERT INTO list_items (list_id, tmdb_id, media_type, title, poster_path) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING RETURNING *',
      [req.params.id, tmdb_id, media_type, title, poster_path]
    );
    res.status(201).json(result.rows[0] || {});
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id/items/:itemId', auth, async (req, res) => {
  try {
    const owns = await db.query('SELECT id FROM lists WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (!owns.rows.length) return res.status(403).json({ error: 'Sin acceso' });
    await db.query('DELETE FROM list_items WHERE id = $1 AND list_id = $2', [req.params.itemId, req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
