const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET all whitelist
router.get('/', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT whitelist_id, name, no_whatsapp, status, created_at FROM whitelist ORDER BY created_at DESC'
  );
  res.json(rows);
});

// CREATE whitelist
router.post('/', async (req, res) => {
  const { name, no_whatsapp } = req.body;

  if (!no_whatsapp) {
    return res.status(400).json({ message: 'no_whatsapp is required' });
  }

  await pool.query(
    'INSERT INTO whitelist (name, no_whatsapp, status) VALUES (?, ?, "ACTIVE")',
    [name || null, no_whatsapp]
  );

  res.json({ message: 'Whitelist added' });
});

// UPDATE status
router.put('/:id', async (req, res) => {
  const { status } = req.body;

  if (!['ACTIVE', 'INACTIVE'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  await pool.query(
    'UPDATE whitelist SET status = ? WHERE whitelist_id = ?',
    [status, req.params.id]
  );

  res.json({ message: 'Whitelist updated' });
});

// DELETE whitelist
router.delete('/:id', async (req, res) => {
  await pool.query(
    'DELETE FROM whitelist WHERE whitelist_id = ?',
    [req.params.id]
  );

  res.json({ message: 'Whitelist deleted' });
});

module.exports = router;
