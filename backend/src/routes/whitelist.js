const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ==========================
// GET ALL WHITELIST
// ==========================
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT whitelist_id, name, no_whatsapp, status, created_at FROM whitelist ORDER BY created_at DESC'
    );
    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});


// ==========================
// CREATE NEW WHITELIST
// ==========================
router.post('/', async (req, res) => {
  try {
    const { name, no_whatsapp } = req.body;

    if (!no_whatsapp) {
      return res.status(400).json({ message: 'No WhatsApp is required' });
    }

    await pool.query(
      'INSERT INTO whitelist (name, no_whatsapp, status) VALUES (?, ?, "ACTIVE")',
      [name || null, no_whatsapp]
    );

    res.json({ message: 'Whitelist added' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});


// ==========================
// UPDATE STATUS (TOGGLE)
// PUT /api/whitelist/status/:id
// ==========================
router.put('/status/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["ACTIVE", "INACTIVE"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    await pool.query(
      "UPDATE whitelist SET status = ? WHERE whitelist_id = ?",
      [status, id]
    );

    res.json({ message: "Status updated" });

  } catch (err) {
    console.error("STATUS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ==========================
// UPDATE NAME & NUMBER
// PUT /api/whitelist/:id
// ==========================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, no_whatsapp } = req.body;

    await pool.query(
      `UPDATE whitelist SET name = ?, no_whatsapp = ? WHERE whitelist_id = ?`,
      [name, no_whatsapp, id]
    );

    res.json({ message: "Whitelist updated" });

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ==========================
// DELETE WHITELIST
// ==========================
router.delete('/:id', async (req, res) => {
  try {
    await pool.query("DELETE FROM whitelist WHERE whitelist_id = ?", [req.params.id]);
    res.json({ message: "Whitelist deleted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
