const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const path = require('path');
const fs = require('fs');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        recon_id,
        total_internal,
        total_partner,
        total_selisih,
        total_cid,
        result_file_path,
        created_at
      FROM recon_history
      ORDER BY created_at DESC
      LIMIT 100
    `);

    return res.json(rows);
  } catch (err) {
    console.error('Recon History API Error:', err);
    return res.status(500).json({
      message: 'Failed to load recon history'
    });
  }
});

router.get('/download/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      'SELECT result_file_path FROM recon_history WHERE recon_id = ? LIMIT 1',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }

    const filePath = path.resolve(rows[0].result_file_path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File does not exist on server' });
    }

    return res.download(filePath);
  } catch (err) {
    console.error('Download recon file error:', err);
    return res.status(500).json({ message: 'Download failed' });
  }
});

module.exports = router;
