const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        la.log_id,
        w.no_whatsapp,
        la.command,
        la.response_result,
        la.timestamp
      FROM log_activity la
      LEFT JOIN whitelist w
        ON la.whitelist_id = w.whitelist_id
      ORDER BY la.timestamp DESC
      LIMIT 100
    `);

    // PENTING: return [] kalau kosong
    return res.json(rows);
  } catch (err) {
    console.error('Log Activity API Error:', err);
    return res.status(500).json({
      message: 'Failed to load log activity'
    });
  }
});

module.exports = router;
