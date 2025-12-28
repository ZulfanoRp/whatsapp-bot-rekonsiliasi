const express = require('express');
const router = express.Router();
const axios = require('axios');

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

    if (!value || !value.messages) {
      console.log('No message event');
      return res.sendStatus(200);
    }

    const message = value.messages[0];

    if (message.type !== 'text') {
      console.log('Not text message');
      return res.sendStatus(200);
    }

    const from = message.from.replace(/\D/g, '');
    const text = message.text.body;

    console.log('From:', from);
    console.log('Text:', text);

    const response = await axios.post(
      `https://graph.facebook.com/${process.env.API_VERSION}/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: from,
        text: { body: '✅ Bot WhatsApp Official aktif.' }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // ⬇️ INI KUNCI LANGKAH 3
    console.log('WHATSAPP API RESPONSE:', response.data);

    return res.sendStatus(200);

  } catch (err) {
    // ⬇️ INI KUNCI LANGKAH 3
    console.error(
      'WHATSAPP API ERROR:',
      err.response?.data || err.message
    );
    return res.sendStatus(200);
  }
});


module.exports = router;
