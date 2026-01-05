const pool = require('../config/db');

async function isWhitelisted(noWhatsapp) {
  const [rows] = await pool.query(
    `SELECT 1 FROM whitelist WHERE no_whatsapp = ? AND status = 'ACTIVE' LIMIT 1`,
    [noWhatsapp]
  );
  return rows.length > 0;
}

module.exports = { isWhitelisted };
