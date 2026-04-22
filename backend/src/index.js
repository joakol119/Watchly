require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 4001;

const originsEnv = process.env.ALLOWED_ORIGINS;
const corsOrigin = originsEnv === '*'
  ? '*'
  : originsEnv
    ? originsEnv.split(',')
    : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());

db.init().then(() => {
  app.use('/auth', require('./routes/auth'));
  app.use('/watchlist', require('./routes/watchlist'));
  app.use('/tmdb', require('./routes/tmdb'));
  app.use('/profile', require('./routes/profile'));
  app.use('/stats', require('./routes/stats'));
  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
}).catch(err => {
  console.error('DB init failed:', err);
  process.exit(1);
});
