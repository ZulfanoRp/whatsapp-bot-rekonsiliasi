const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function uploadDocument(filePath) {
  const url = `https://graph.facebook.com/${process.env.API_VERSION}/${process.env.PHONE_NUMBER_ID}/media`;
  const form = new FormData();
  form.append('messaging_product', 'whatsapp');
  form.append('file', fs.createReadStream(filePath));

  const res = await axios.post(url, form, {
    headers: {
      Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      ...form.getHeaders()
    }
  });

  return res.data.id; // media_id
}

async function sendDocument(to, mediaId, filename) {
  const url = `https://graph.facebook.com/${process.env.API_VERSION}/${process.env.PHONE_NUMBER_ID}/messages`;
  await axios.post(
    url,
    {
      messaging_product: 'whatsapp',
      to,
      type: 'document',
      document: {
        id: mediaId,
        filename
      }
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );
}

module.exports = { uploadDocument, sendDocument };