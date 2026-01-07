const pool = require('../config/db');

async function isWhitelisted(number) {
  const [rows] = await pool.query(
    `SELECT whitelist_id
     FROM whitelist
     WHERE no_whatsapp = ?
       AND status = 'ACTIVE'
     LIMIT 1`,
    [number]
  );

  return rows.length > 0 ? rows[0] : null;
}

module.exports = { isWhitelisted };
