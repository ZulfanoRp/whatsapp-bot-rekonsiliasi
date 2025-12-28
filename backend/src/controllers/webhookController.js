const { sendTextMessage } = require('../services/whatsappService');

async function handleWebhook(req, res) {
  try {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    // Abaikan event non-text / non-message
    if (!message || message.type !== 'text') {
      return res.sendStatus(200);
    }

    const from = message.from;

    // Health check response (default)
    await sendTextMessage(from, '✅ Bot WhatsApp Official aktif.');

    return res.sendStatus(200);
  } catch (err) {
    console.error(err);
    return res.sendStatus(200);
  }
}

module.exports = { handleWebhook };
