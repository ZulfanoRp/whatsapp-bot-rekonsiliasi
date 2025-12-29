const express = require('express');
const router = express.Router();
const axios = require('axios');
const pool = require('../config/db');
const { generateCekExcel } = require('../utils/excelCekGenerator');
const { uploadDocument, sendDocument } = require('../services/whatsappMediaService');

/**
 * GET webhook verification (WAJIB untuk Meta)
 */
router.get('/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    console.log('Webhook verified');
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

/**
 * POST webhook receive message (BOT HEALTH CHECK)
 */
router.post('/whatsapp', async (req, res) => {
    console.log('=== WEBHOOK HIT ===');
  try {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    // Abaikan event selain message
    if (!value || !value.messages) return res.sendStatus(200);

    const message = value.messages[0];

    // Abaikan non-text
    if (message.type !== 'text') return res.sendStatus(200);

    const from = message.from.replace(/\D/g, '');
    const text = message.text.body.trim();

    console.log('From:', from);
    console.log('Text:', text);

    // 🔹 PARSING PREFIX
    if (!text.startsWith('!')) {
      // pesan biasa → diabaikan
      return res.sendStatus(200);
    }

    // Ambil command (tanpa parameter)
    const [rawCommand] = text.split(' ');
    const command = rawCommand.toLowerCase();

    // 🔹 ROUTING COMMAND
    if (command === '!askbot') {
      await axios.post(
        `https://graph.facebook.com/${process.env.API_VERSION}/${process.env.PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: from,
          text: {
            body:
              'Saya dapat membantu: \n\n' +
              '1️⃣ !cek\n' +
              'Digunakan untuk mengecek data traffic berdasarkan CID dan periode tanggal. \n\n' +
              'Gunakan format: \n' +
              '!cek <CID> <tanggal_awal> <tanggal_akhir> \n\n' +

              'Contoh: \n' +
              '!cek cid_video_82055 2025-08-01 2025-08-31 \n\n'+
              '2️⃣ !recon – cek data traffic\n' +
              'Digunakan untuk melakukan rekonsiliasi data tsel dengan data partner (Excel). \n\n' +
              'Silakan ketik command yang ingin digunakan.'
          }
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return res.sendStatus(200);
    }

    // 🔹 COMMAND !cek
    if (command === '!cek') {
  const parts = text.split(' ');
  if (parts.length !== 4) {
    await axios.post(
      `https://graph.facebook.com/${process.env.API_VERSION}/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: from,
        text: { body: 'Format salah.\nContoh:\n!cek cid_video_82055 2025-01-01 2025-01-30' }
      },
      { headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN}` } }
    );
    return res.sendStatus(200);
  }

  const [, contentId, startDate, endDate] = parts;

  try {
    // Ringkasan
    const [[sumRow]] = await pool.query(
      `SELECT COALESCE(SUM(traffic_value),0) AS total_traffic
       FROM traffic_data
       WHERE content_id = ? AND event_date BETWEEN ? AND ?`,
      [contentId, startDate, endDate]
    );

    // Detail untuk Excel
    const [detailRows] = await pool.query(
      // `SELECT event_date, content_id, traffic_value
      //  FROM traffic_data
      //  WHERE content_id = ? AND event_date BETWEEN ? AND ?
      //  ORDER BY event_date`,

      `SELECT 
      DATE_FORMAT(event_date, '%Y-%m-%d') AS event_date,
      content_id,
      traffic_value
      FROM traffic_data
      WHERE content_id = ?
      AND event_date BETWEEN ? AND ?
      ORDER BY event_date`,
      [contentId, startDate, endDate]
    );

    // Kirim ringkasan teks
    const reply =
      `📊 *Hasil Cek Traffic*\n\n` +
      `CID: ${contentId}\n` +
      `Periode: ${startDate} s.d ${endDate}\n\n` +
      `Total Traffic: ${sumRow.total_traffic}`;

    await axios.post(
      `https://graph.facebook.com/${process.env.API_VERSION}/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: from,
        text: { body: reply }
      },
      { headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN}` } }
    );

    // Generate & kirim Excel
    const { filename, filepath } = await generateCekExcel({
      rows: detailRows,
      contentId,
      startDate,
      endDate
    });

    const mediaId = await uploadDocument(filepath);
    await sendDocument(from, mediaId, filename);

    return res.sendStatus(200);
  } catch (err) {
    console.error('CEK error:', err.message);
    await axios.post(
      `https://graph.facebook.com/${process.env.API_VERSION}/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: from,
        text: { body: 'Terjadi kesalahan saat memproses data.' }
      },
      { headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN}` } }
    );
    return res.sendStatus(200);
  }
}

    // 🔹 COMMAND TIDAK DIKENAL
    await axios.post(
      `https://graph.facebook.com/${process.env.API_VERSION}/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: from,
        text: {
          body: '❓ Command tidak dikenal. Ketik *!askbot* untuk melihat daftar perintah.'
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return res.sendStatus(200);

  } catch (err) {
    console.error('Webhook error:', err.response?.data || err.message);
    return res.sendStatus(200);
  }
});



module.exports = router;
