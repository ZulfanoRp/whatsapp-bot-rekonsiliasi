const ExcelJS = require('exceljs');
const path = require('path');

async function generateCekExcel({ rows, contentId, startDate, endDate }) {
  try {
    // [ERROR HANDLING] rows harus array dan tidak kosong
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error('No traffic data to generate Excel');
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Traffic');

    // Header
    sheet.columns = [
      { header: 'Event Date', key: 'event_date', width: 15 },
      { header: 'Content ID', key: 'content_id', width: 25 },
      { header: 'Traffic', key: 'traffic_value', width: 15 }
    ];

    // Data
    rows.forEach((r, index) => {
      // [ERROR HANDLING] validasi kolom wajib
      if (!r.event_date || !r.content_id || r.traffic_value === undefined) {
        throw new Error(`Invalid row data at index ${index}`);
      }

      sheet.addRow({
        event_date: new Date(r.event_date).toISOString().split('T')[0],
        content_id: r.content_id,
        traffic_value: r.traffic_value
      });
    });

    // Simple formatting
    sheet.getRow(1).font = { bold: true };
    sheet.columns.forEach(col => {
      col.alignment = { vertical: 'middle', horizontal: 'left' };
    });

    const filename = `cek_traffic_${contentId}_${startDate}_${endDate}.xlsx`;
    const filepath = path.join(__dirname, '../../output/cek', filename);

    await workbook.xlsx.writeFile(filepath);
    return { filename, filepath };

  } catch (err) {
    // [ERROR HANDLING] lempar error ke webhook.js
    throw err;
  }
}

module.exports = { generateCekExcel };
