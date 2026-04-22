const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

const TMDB_BASE = 'https://api.themoviedb.org/3';
const KEY = process.env.TMDB_API_KEY;

async function tmdbGet(path) {
  const res = await fetch(`${TMDB_BASE}${path}?api_key=${KEY}&language=es-ES`);
  return res.json();
}

router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM watchlist WHERE user_id = $1',
      [req.user.id]
    );
    const watchlist = result.rows;

    if (!watchlist.length) return res.json({ empty: true });

    // Fetch details for watched/watching items to get runtime and genres
    const detailedItems = await Promise.allSettled(
      watchlist.map(async item => {
        try {
          const data = await tmdbGet(`/${item.media_type}/${item.tmdb_id}`);
          return {
            ...item,
            runtime: item.media_type === 'movie'
              ? (data.runtime || 0)
              : (data.episode_run_time?.[0] || 30) * (data.number_of_episodes || 1),
            genres: data.genres || [],
          };
        } catch {
          return { ...item, runtime: 0, genres: [] };
        }
      })
    );

    const items = detailedItems
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);

    // Stats
    const watched = items.filter(i => i.status === 'watched');
    const watching = items.filter(i => i.status === 'watching');
    const wantToWatch = items.filter(i => i.status === 'want_to_watch');
    const movies = items.filter(i => i.media_type === 'movie');
    const tvShows = items.filter(i => i.media_type === 'tv');

    const totalMinutesWatched = watched.reduce((acc, i) => acc + (i.runtime || 0), 0);

    // Genre frequency
    const genreCount = {};
    items.forEach(item => {
      item.genres.forEach(g => {
        genreCount[g.name] = (genreCount[g.name] || 0) + 1;
      });
    });
    const topGenres = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));

    res.json({
      total: items.length,
      watched: watched.length,
      watching: watching.length,
      wantToWatch: wantToWatch.length,
      movies: movies.length,
      tvShows: tvShows.length,
      totalMinutesWatched,
      topGenres,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
