require('dotenv').config(); // WAJIB

const express = require('express');
const app = express();
const pool = require('./config/db');
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173'
}));

app.use(express.json());

const webhookRoutes = require('./routes/webhook');
app.use('/webhook', webhookRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.get('/db-test', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS test');
    res.json({ db: 'connected', result: rows });
  } catch (error) {
    res.status(500).json({ db: 'error', error: error.message });
  }
});

const whitelistRoutes = require('./routes/whitelist');
app.use('/api/whitelist', whitelistRoutes);

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const logRoutes = require('./routes/logs');
app.use('/api/logs', logRoutes);

const reconHistoryRoutes = require('./routes/reconHistory');
app.use('/api/recon-history', reconHistoryRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
