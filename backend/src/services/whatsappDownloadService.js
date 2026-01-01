const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function downloadMedia(mediaId) {
  const metaUrl = `https://graph.facebook.com/${process.env.API_VERSION}/${mediaId}`;
  const meta = await axios.get(metaUrl, {
    headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN}` }
  });

  const fileUrl = meta.data.url;

  const res = await axios.get(fileUrl, {
    headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN}` },
    responseType: 'stream'
  });

  const filePath = path.join(__dirname, '../../output/recon/partner.xlsx');
  const writer = fs.createWriteStream(filePath);
  res.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(filePath));
    writer.on('error', reject);
  });
}

module.exports = { downloadMedia };
