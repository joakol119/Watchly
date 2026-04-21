const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001'], credentials: true }));
app.use(express.json());

db.init().then(() => {
  app.use('/auth', require('./routes/auth'));
  app.use('/watchlist', require('./routes/watchlist'));
  app.use('/tmdb', require('./routes/tmdb'));
  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
}).catch(err => {
  console.error('DB init failed:', err);
  process.exit(1);
});
