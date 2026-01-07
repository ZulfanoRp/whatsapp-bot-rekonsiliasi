const express = require('express');
const router = express.Router();
const axios = require('axios');
const pool = require('../config/db');
const { generateCekExcel } = require('../utils/excelCekGenerator');
const { uploadDocument, sendDocument } = require('../services/whatsappMediaService');
const reconSession = new Map();
const { isWhitelisted } = require('../utils/whitelistChecker');


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

async function insertLog(whitelist_id, command, response_result) {
  try {
    await pool.query(
      `INSERT INTO log_activity (whitelist_id, command, response_result, timestamp)
       VALUES (?, ?, ?, NOW())`,
      [whitelist_id, command, response_result]
    );
  } catch (e) {
    console.error('Log error:', e.message);
    // jangan throw
  }
}

router.post('/whatsapp', async (req, res) => {
  console.log('=== WEBHOOK HIT ===');

  try {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    // [ERROR HANDLING] event non-message dari Meta
    if (!value || !Array.isArray(value.messages)) {
      return res.sendStatus(200);
    }

    if (!value || !value.messages) return res.sendStatus(200);

    const message = value.messages[0];

    // [ERROR HANDLING] message tanpa sender
    if (!message.from) {
      return res.sendStatus(200);
    }


    // ✅ WAJIB: deklarasi from di awal
    const from = message.from.replace(/\D/g, '');

    // ===== WHITELIST GUARD =====
    let whitelist;
    try {
      whitelist = await isWhitelisted(from);
    } catch (e) {
      console.error('Whitelist DB error:', e.message);
      return res.sendStatus(200);
    }

    if (!whitelist) {
      return res.sendStatus(200);
    }

    const whitelist_id = whitelist.whitelist_id;


    /* =====================================================
       HANDLE FILE EXCEL (RECON)
    ===================================================== */
    if (message.type === 'document') {
      const session = reconSession.get(from);
      if (!session || session.status !== 'WAIT_FILE') {
        return res.sendStatus(200);
      }

      const mediaId = message.document.id;

      const { downloadMedia } = require('../services/whatsappDownloadService');
      const partnerFilePath = await downloadMedia(mediaId);

      const { processRecon } = require('../utils/excelReconGenerator');
      const { resultPath, filename, summary } = await processRecon(
        partnerFilePath
      );

      await insertLog(
        whitelist_id,
        'UPLOAD_EXCEL',
        message.document.filename
      );

      await pool.query(
        `INSERT INTO recon_history
        (total_internal, total_partner, total_selisih, total_cid, result_file_path)
        VALUES (?, ?, ?, ?, ?)`,
        [
          summary.total_internal,
          summary.total_partner,
          summary.total_selisih,
          summary.total_cid,
          `output/recon/${filename}`
        ]
      );

      await insertLog(
        whitelist_id,
        'RECON_SUCCESS',
        `output/recon/${filename}`
      );

      const mediaResultId = await uploadDocument(resultPath);
      await sendDocument(from, mediaResultId, 'hasil_rekonsiliasi.xlsx');

      reconSession.delete(from);
      return res.sendStatus(200);
    }

    /* =====================================================
       HANDLE TEXT
    ===================================================== */
    if (message.type !== 'text') return res.sendStatus(200);

    const text = message.text.body.trim();

    console.log('From:', from);
    console.log('Text:', text);

    if (!text.startsWith('!')) return res.sendStatus(200);

    const command = text.split(' ')[0].toLowerCase();

    /* ================= !ASKBOT ================= */
    if (command === '!askbot') {
      await insertLog(
        whitelist_id,
        'ASKBOT',
        'show command list'
      );
      await axios.post(
        `https://graph.facebook.com/${process.env.API_VERSION}/${process.env.PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: from,
          text: {
            body:
              'Saya dapat membantu:\n\n' +
              '1️⃣ !cek\n' +
              'Format:\n!cek <CID> <tanggal_awal> <tanggal_akhir>\n\n' +
              'Contoh:\n!cek cid_video_82055 2025-08-01 2025-08-31\n\n' +
              '2️⃣ !recon\n' +
              'Rekonsiliasi data dengan file Excel partner.'
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

    /* ================= !CEK ================= */
    if (command === '!cek') {
      const parts = text.split(' ');
      if (parts.length !== 4) {

        await insertLog(
          whitelist_id,
          'CEK_FAILED',
          text
        );
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

      const [[sumRow]] = await pool.query(
        `SELECT COALESCE(SUM(traffic_value),0) AS total_traffic
         FROM traffic_data
         WHERE content_id = ? AND event_date BETWEEN ? AND ?`,
        [contentId, startDate, endDate]
      );

      const [detailRows] = await pool.query(
        `SELECT DATE_FORMAT(event_date,'%Y-%m-%d') AS event_date,
                content_id, traffic_value
         FROM traffic_data
         WHERE content_id = ? AND event_date BETWEEN ? AND ?
         ORDER BY event_date`,
        [contentId, startDate, endDate]
      );

      // [ERROR HANDLING] data traffic kosong
      if (detailRows.length === 0) {
        await insertLog(
          whitelist_id,
          'CEK_EMPTY',
          text
        );

        await axios.post(
          `https://graph.facebook.com/${process.env.API_VERSION}/${process.env.PHONE_NUMBER_ID}/messages`,
          {
            messaging_product: 'whatsapp',
            to: from,
            text: { body: '❌ Data tidak ditemukan untuk CID dan periode tersebut.' }
          },
          { headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN}` } }
        );

        return res.sendStatus(200);
      }

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

      const { filename, filepath } = await generateCekExcel({
        rows: detailRows,
        contentId,
        startDate,
        endDate
      });

      const mediaId = await uploadDocument(filepath);
      await sendDocument(from, mediaId, filename);

      await insertLog(
        whitelist_id,
        'CEK_SUCCESS',
        text
      );

      return res.sendStatus(200);
    }

    /* ================= !RECON ================= */
    if (command === '!recon') {
      reconSession.set(from, { status: 'WAIT_FILE' });
      await insertLog(
        whitelist_id,
        'RECON',
        'waiting for excel'
      );
      await axios.post(
        `https://graph.facebook.com/${process.env.API_VERSION}/${process.env.PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: from,
          text: {
            body:
              '📥 *Rekonsiliasi Data*\n\n' +
              'Silakan kirim file Excel partner.\n\n' +
              'Kolom wajib:\n' +
              '- event_date\n- content_id\n- traffic'
          }
        },
        { headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN}` } }
      );

      return res.sendStatus(200);
    }

    /* ================= DEFAULT ================= */
    await axios.post(
      `https://graph.facebook.com/${process.env.API_VERSION}/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: from,
        text: { body: '❓ Command tidak dikenal. Ketik *!askbot*.' }
      },
      { headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN}` } }
    );

    return res.sendStatus(200);

  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.sendStatus(200);
  }
});




module.exports = router;
