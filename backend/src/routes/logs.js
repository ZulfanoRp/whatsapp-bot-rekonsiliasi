const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET Log Activity + Search + Pagination
router.get('/', async (req, res) => {
  try {
    const search = req.query.search ? `%${req.query.search}%` : `%%`;
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(`
      SELECT
        la.log_id,
        w.name,
        w.no_whatsapp,
        la.command,
        la.response_result,
        DATE_FORMAT(la.timestamp, '%Y-%m-%d %H:%i:%s') AS timestamp
      FROM log_activity la
      LEFT JOIN whitelist w
        ON la.whitelist_id = w.whitelist_id
      WHERE 
        w.name LIKE ? OR
        w.no_whatsapp LIKE ? OR
        la.command LIKE ? OR
        la.response_result LIKE ?
      ORDER BY la.timestamp DESC
      LIMIT ? OFFSET ?
    `, [search, search, search, search, limit, offset]);

    const [countRows] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM log_activity la
      LEFT JOIN whitelist w
        ON la.whitelist_id = w.whitelist_id
      WHERE 
        w.name LIKE ? OR
        w.no_whatsapp LIKE ? OR
        la.command LIKE ? OR
        la.response_result LIKE ?
    `, [search, search, search, search]);

    return res.json({
      total: countRows[0].total,
      page,
      limit,
      list: rows
    });

  } catch (err) {
    console.error('Log Activity API Error:', err);
    return res.status(500).json({
      message: 'Failed to load log activity'
    });
  }
});

module.exports = router;
