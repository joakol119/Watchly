const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM watchlist WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  const { tmdb_id, media_type, title, poster_path, status } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO watchlist (user_id, tmdb_id, media_type, title, poster_path, status) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (user_id, tmdb_id, media_type) DO UPDATE SET status = $6 RETURNING *',
      [req.user.id, tmdb_id, media_type, title, poster_path, status || 'want_to_watch']
    );
    res.status(201).json(result.rows[0]);
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
