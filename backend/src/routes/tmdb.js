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

router.get('/random', auth, async (req, res) => {
  const { type = 'movie', genre_id, min_rating = 0 } = req.query;
  try {
    const randomPage = Math.floor(Math.random() * 10) + 1;
    const genreParam = genre_id ? `&with_genres=${genre_id}` : '';
    const ratingParam = min_rating > 0 ? `&vote_average.gte=${min_rating}&vote_count.gte=100` : '';
    const data = await tmdb(`/discover/${type}?sort_by=popularity.desc&page=${randomPage}${genreParam}${ratingParam}&`);
    const results = (data.results || []).filter(r => r.poster_path);
    if (!results.length) return res.status(404).json({ error: 'No se encontraron resultados' });
    const random = results[Math.floor(Math.random() * results.length)];
    res.json({ ...random, media_type: type });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/movie/:id', auth, async (req, res) => {
  try {
    const [details, credits, videos, similar] = await Promise.all([
      tmdb(`/movie/${req.params.id}?`),
      tmdb(`/movie/${req.params.id}/credits?`),
      tmdb(`/movie/${req.params.id}/videos?`),
      tmdb(`/movie/${req.params.id}/similar?`),
    ]);
    res.json({ ...details, credits, videos, similar });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/tv/:id', auth, async (req, res) => {
  try {
    const [details, credits, videos, similar] = await Promise.all([
      tmdb(`/tv/${req.params.id}?`),
      tmdb(`/tv/${req.params.id}/credits?`),
      tmdb(`/tv/${req.params.id}/videos?`),
      tmdb(`/tv/${req.params.id}/similar?`),
    ]);
    res.json({ ...details, credits, videos, similar });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
