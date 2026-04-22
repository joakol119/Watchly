const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM watchlist WHERE user_id = $1 ORDER BY position ASC, created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  const { tmdb_id, media_type, title, poster_path, status } = req.body;
  try {
    // Obtener la posición máxima actual para poner el nuevo item al final
    const maxPos = await db.query(
      'SELECT COALESCE(MAX(position), -1) as max_pos FROM watchlist WHERE user_id = $1',
      [req.user.id]
    );
    const newPosition = maxPos.rows[0].max_pos + 1;

    const result = await db.query(
      'INSERT INTO watchlist (user_id, tmdb_id, media_type, title, poster_path, status, position) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (user_id, tmdb_id, media_type) DO UPDATE SET status = $6 RETURNING *',
      [req.user.id, tmdb_id, media_type, title, poster_path, status || 'want_to_watch', newPosition]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/reorder', auth, async (req, res) => {
  const { items } = req.body; // [{ id, position }]
  if (!Array.isArray(items)) return res.status(400).json({ error: 'items debe ser un array' });
  try {
    await Promise.all(
      items.map(({ id, position }) =>
        db.query(
          'UPDATE watchlist SET position = $1 WHERE id = $2 AND user_id = $3',
          [position, id, req.user.id]
        )
      )
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id', auth, async (req, res) => {
  const { status } = req.body;
  try {
    const result = await db.query(
      'UPDATE watchlist SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [status, req.params.id, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM watchlist WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
