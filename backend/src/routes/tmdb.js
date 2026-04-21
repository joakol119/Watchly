const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const TMDB_BASE = 'https://api.themoviedb.org/3';
const KEY = process.env.TMDB_API_KEY;

async function tmdb(path) {
  const res = await fetch(`${TMDB_BASE}${path}&api_key=${KEY}&language=es-ES`);
  return res.json();
}

router.get('/trending', auth, async (req, res) => {
  try {
    const data = await tmdb('/trending/all/week?');
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/search', auth, async (req, res) => {
  const { q } = req.query;
  try {
    const data = await tmdb(`/search/multi?query=${encodeURIComponent(q)}&`);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/movie/:id', auth, async (req, res) => {
  try {
    const [details, credits, videos] = await Promise.all([
      tmdb(`/movie/${req.params.id}?`),
      tmdb(`/movie/${req.params.id}/credits?`),
      tmdb(`/movie/${req.params.id}/videos?`),
    ]);
    res.json({ ...details, credits, videos });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/tv/:id', auth, async (req, res) => {
  try {
    const [details, credits, videos] = await Promise.all([
      tmdb(`/tv/${req.params.id}?`),
      tmdb(`/tv/${req.params.id}/credits?`),
      tmdb(`/tv/${req.params.id}/videos?`),
    ]);
    res.json({ ...details, credits, videos });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
