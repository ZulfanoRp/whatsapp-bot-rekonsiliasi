const ExcelJS = require('exceljs');
const pool = require('../config/db');
const path = require('path');

async function processRecon(partnerFilePath) {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(partnerFilePath);

    // [ERROR HANDLING] sheet wajib ada
    const sheet = workbook.worksheets[0];
    if (!sheet) {
      throw new Error('Partner Excel sheet not found');
    }

    // [ERROR HANDLING] validasi header
    const header = sheet.getRow(1).values.map(v =>
      typeof v === 'string' ? v.toLowerCase().trim() : ''
    );

    const requiredHeaders = ['event date', 'content id', 'traffic'];
    requiredHeaders.forEach(h => {
      if (!header.some(col => col.includes(h))) {
        throw new Error(`Invalid partner Excel header: missing ${h}`);
      }
    });

    const partnerRows = [];

    sheet.eachRow((row, i) => {
      if (i === 1) return;

      const event_date = row.getCell(1).text;
      const content_id = row.getCell(2).text;
      const traffic = Number(row.getCell(3).value || 0);

      // [ERROR HANDLING] baris tidak valid
      if (!event_date || !content_id) {
        throw new Error(`Invalid partner row at line ${i}`);
      }

      partnerRows.push({
        event_date,
        content_id,
        traffic
      });
    });

    // [ERROR HANDLING] file partner kosong
    if (partnerRows.length === 0) {
      throw new Error('Partner Excel has no data rows');
    }

    // === DETAIL MAP ===
    const detailMap = {};
    partnerRows.forEach(r => {
      const key = `${r.event_date}|${r.content_id}`;
      detailMap[key] = {
        event_date: r.event_date,
        content_id: r.content_id,
        partner: r.traffic,
        tsel: 0
      };
    });

    const contentIds = [...new Set(partnerRows.map(r => r.content_id))];
    const dates = [...new Set(partnerRows.map(r => r.event_date))];

    const [tselRows] = await pool.query(
      `
      SELECT 
        DATE_FORMAT(event_date,'%Y-%m-%d') AS event_date,
        content_id,
        traffic_value
      FROM traffic_data
      WHERE content_id IN (?)
        AND event_date IN (?)
      `,
      [contentIds, dates]
    );

    tselRows.forEach(r => {
      const key = `${r.event_date}|${r.content_id}`;
      if (!detailMap[key]) {
        detailMap[key] = {
          event_date: r.event_date,
          content_id: r.content_id,
          partner: 0,
          tsel: r.traffic_value
        };
      } else {
        detailMap[key].tsel = r.traffic_value;
      }
    });

    // === SUMMARY PER CONTENT ID ===
    const summaryMap = {};
    Object.values(detailMap).forEach(r => {
      if (!summaryMap[r.content_id]) {
        summaryMap[r.content_id] = { tsel: 0, partner: 0 };
      }
      summaryMap[r.content_id].tsel += r.tsel;
      summaryMap[r.content_id].partner += r.partner;
    });

    // === TOTAL SUMMARY (UNTUK DB) ===
    let total_internal = 0;
    let total_partner = 0;

    Object.values(summaryMap).forEach(v => {
      total_internal += v.tsel;
      total_partner += v.partner;
    });

    const total_selisih = total_internal - total_partner;
    const total_cid = Object.keys(summaryMap).length;

    // === OUTPUT EXCEL ===
    const outWb = new ExcelJS.Workbook();

    // SUMMARY SHEET
    const s1 = outWb.addWorksheet('Summary');
    s1.columns = [
      { header: 'Content ID', key: 'cid', width: 25 },
      { header: 'Traffic (Tsel)', key: 'tsel', width: 18 },
      { header: 'Traffic (Partner)', key: 'partner', width: 18 },
      { header: 'Selisih jumlah', key: 'diff', width: 18 },
      { header: 'Selisih %', key: 'pct', width: 15 }
    ];

    Object.entries(summaryMap).forEach(([cid, v]) => {
      const diff = v.tsel - v.partner;
      const pct = v.partner ? ((diff / v.partner) * 100).toFixed(2) : 0;
      s1.addRow({
        cid,
        tsel: v.tsel,
        partner: v.partner,
        diff,
        pct: `${pct}%`
      });
    });

    // DETAIL SHEET
    const s2 = outWb.addWorksheet('Detail');
    s2.columns = [
      { header: 'Event Date', key: 'date', width: 15 },
      { header: 'Content ID', key: 'cid', width: 25 },
      { header: 'Traffic (Tsel)', key: 'tsel', width: 18 },
      { header: 'Traffic (Partner)', key: 'partner', width: 18 },
      { header: 'Selisih jumlah', key: 'diff', width: 18 },
      { header: 'Selisih %', key: 'pct', width: 15 }
    ];

    Object.values(detailMap).forEach(r => {
      const diff = r.tsel - r.partner;
      const pct = r.partner ? ((diff / r.partner) * 100).toFixed(2) : 0;
      s2.addRow({
        date: r.event_date,
        cid: r.content_id,
        tsel: r.tsel,
        partner: r.partner,
        diff,
        pct: `${pct}%`
      });
    });

    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T.Z]/g, '')
      .slice(0, 14);

    const filename = `recon_${timestamp}.xlsx`;
    const resultPath = path.join(__dirname, '../../output/recon', filename);

    await outWb.xlsx.writeFile(resultPath);

    return {
      resultPath,
      filename,
      summary: {
        total_internal,
        total_partner,
        total_selisih,
        total_cid
      }
    };

  } catch (err) {
    // [ERROR HANDLING] lempar ke webhook.js
    throw err;
  }
}

module.exports = { processRecon };
