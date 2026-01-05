const bcrypt = require('bcrypt');
const pool = require('../src/config/db');

async function insertAdmin() {
  // ===== HARDCODE DATA ADMIN =====
  const username = 'zulfano';
  const password = 'zulfano123';
  const role = 'admin';
  // ==============================

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (username, password_hash, role)
       VALUES (?, ?, ?)`,
      [username, passwordHash, role]
    );

    console.log('✅ Admin user berhasil di-insert');
  } catch (err) {
    console.error('❌ Gagal insert admin:', err.message);
  } finally {
    process.exit();
  }
}

insertAdmin();
