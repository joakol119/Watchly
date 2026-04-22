const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const auth = require('../middleware/auth');

const VALID_AVATARS = ['cool', 'nerd', 'ninja', 'wizard', 'explorer', 'chef', 'alien', 'pirate'];

router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, avatar_key, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/name', auth, async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
  try {
    const result = await db.query(
      'UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email, avatar_key',
      [name.trim(), req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/avatar', auth, async (req, res) => {
  const { avatar_key } = req.body;
  if (!VALID_AVATARS.includes(avatar_key)) return res.status(400).json({ error: 'Avatar inválido' });
  try {
    const result = await db.query(
      'UPDATE users SET avatar_key = $1 WHERE id = $2 RETURNING id, name, email, avatar_key',
      [avatar_key, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, req.user.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
