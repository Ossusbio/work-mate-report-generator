const ExcelJS = require('exceljs');

/**
 * Generates formatted Excel workbook buffer from report data
 * Includes: parameter summary, GC sample log, water sample log, data stream telemetry
 */
async function generateExcelReport(report) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Operator Web Console';
  workbook.created = new Date();

  const params = report.parameters || {};

  // ============ SHEET 1: Report Summary ============
  const summarySheet = workbook.addWorksheet('Report Summary', { views: [{ showGridLines: true }] });
  summarySheet.columns = [{ width: 25 }, { width: 35 }, { width: 25 }, { width: 35 }];

  // Title Banner
  summarySheet.mergeCells('A1:D2');
  const titleCell = summarySheet.getCell('A1');
  titleCell.value = 'OPERATOR RUN REPORT';
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E293B' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  summarySheet.mergeCells('A3:D3');
  const subCell = summarySheet.getCell('A3');
  subCell.value = `Generated: ${new Date().toLocaleString()} | Run ID: ${report.runId || params.runId}`;
  subCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: '64748B' } };
  subCell.alignment = { horizontal: 'center' };

  let row = 5;

  function addHeader(title) {
    summarySheet.mergeCells(`A${row}:D${row}`);
    const c = summarySheet.getCell(`A${row}`);
    c.value = title.toUpperCase();
    c.font = { name: 'Arial', size: 11, bold: true, color: { argb: '0F172A' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2E8F0' } };
    row++;
  }

  function addKV(k1, v1, k2 = '', v2 = '') {
    const r = summarySheet.getRow(row);
    r.getCell(1).value = k1; r.getCell(1).font = { bold: true };
    r.getCell(2).value = v1 || '-';
    if (k2) { r.getCell(3).value = k2; r.getCell(3).font = { bold: true }; r.getCell(4).value = v2 || '-'; }
    row++;
  }

  // General Info
  addHeader('1. General Run Metadata');
  addKV('Run ID:', report.runId || params.runId, 'Date & Time:', params.dateTime || report.createdAt);
  addKV('Location / Site:', params.site, 'Run Name:', params.runName);
  addKV('Run Duration:', params.runDuration, 'Effluent:', params.effluent);
  if (params.totalMixedGasProduction || params.totalH2Production) {
    addKV('Total Mixed Gas Prod:', params.totalMixedGasProduction ? `${params.totalMixedGasProduction} L` : '-', 'Total H2 Production:', params.totalH2Production ? `${params.totalH2Production} L` : '-');
  }
  if (params.runDescription) {
    const descRow = summarySheet.getRow(row);
    descRow.getCell(1).value = 'Description:';
    descRow.getCell(1).font = { bold: true };
    summarySheet.mergeCells(`B${row}:D${row}`);
    const descCell = descRow.getCell(2);
    descCell.value = params.runDescription;
    descCell.alignment = { wrapText: true, vertical: 'top' };
    row++;
  }
  row++;

  // Timings
  addHeader('2. Initial Run Timings');
  const init = params.initialRunParams || {};
  addKV('Start Time:', init.startTime, 'End Time:', init.endTime);
  addKV('Break Start Time:', init.breakStartTime || 'None', 'Break End Time:', init.breakEndTime || 'None');
  row++;

  // Selected Data Streams
  addHeader('3. Selected BigQuery Data Streams');
  const streams = params.selectedStreams || {};
  ['PT', 'EPU', 'Production'].forEach(cat => {
    const ids = streams[cat] || [];
    if (ids.length > 0) {
      addKV(`${cat} Streams:`, ids.join(', '));
    }
  });
  row++;

  // Reference Document
  const doc = params.uploadedDoc || {};
  if (doc.name || doc.filename) {
    addHeader('4. Reference Document');
    addKV('Filename:', doc.name || doc.filename);
    if (doc.note || doc.description || params.docNote) {
      addKV('Document Note:', doc.note || doc.description || params.docNote);
    }
    row++;
  }

  // Reference Image
  addHeader('4. Reference Image');
  const img = params.referenceImage || {};
  addKV('Description:', img.description || 'No image attached');
  if (img.url) {
    const r2 = summarySheet.getRow(row);
    r2.getCell(1).value = 'Image Link:';
    r2.getCell(1).font = { bold: true };
    r2.getCell(2).value = { text: 'Open Photo', hyperlink: img.url };
    r2.getCell(2).font = { color: { argb: '2563EB' }, underline: true };
    row++;
  }

  // ============ SHEET 2: GC Samples Log ============
  const gcEntries = params.gcEntries || [];
  if (gcEntries.length > 0) {
    const gcSheet = workbook.addWorksheet('GC Samples');
    gcSheet.columns = [
      { header: 'SAMPLE #', key: 'label', width: 12 },
      { header: 'TIME TAKEN', key: 'sampleTime', width: 15 },
      { header: 'H₂ (%)', key: 'h2Pct', width: 12 },
      { header: 'CO₂ (%)', key: 'co2Pct', width: 12 },
      { header: 'SAMPLE NAME', key: 'sampleName', width: 25 },
    ];

    // Style header
    const hRow = gcSheet.getRow(1);
    hRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    hRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0891B2' } };

    gcEntries.forEach(entry => {
      gcSheet.addRow({
        label: entry.label,
        sampleTime: entry.sampleTime || '-',
        h2Pct: entry.h2Pct || '-',
        co2Pct: entry.co2Pct || '-',
        sampleName: entry.sampleName || '-',
      });
    });
  }

  // ============ SHEET 3: Water Samples Log ============
  const waterEntries = params.waterEntries || [];
  if (waterEntries.length > 0) {
    const waterSheet = workbook.addWorksheet('Water Samples');
    waterSheet.columns = [
      { header: 'SAMPLE #', key: 'label', width: 12 },
      { header: 'TIME TAKEN', key: 'sampleTime', width: 15 },
      { header: 'pH', key: 'ph', width: 10 },
      { header: 'TDS (ppm)', key: 'tds', width: 14 },
      { header: 'EC (µS/cm)', key: 'ec', width: 14 },
      { header: 'SAMPLE NAME', key: 'sampleName', width: 25 },
    ];

    const hRow = waterSheet.getRow(1);
    hRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    hRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '059669' } };

    waterEntries.forEach(entry => {
      waterSheet.addRow({
        label: entry.label,
        sampleTime: entry.sampleTime || '-',
        ph: entry.ph || '-',
        tds: entry.tds || '-',
        ec: entry.ec || '-',
        sampleName: entry.sampleName || '-',
      });
    });
  }

  // ============ SHEET 4: BigQuery Telemetry Data ============
  const bqData = report.editedData || report.bigqueryData || [];
  if (bqData.length > 0) {
    const dataSheet = workbook.addWorksheet('BigQuery Telemetry');
    const cols = Object.keys(bqData[0]);

    dataSheet.columns = cols.map(c => ({
      header: c.replace(/_/g, ' ').toUpperCase(),
      key: c,
      width: 18
    }));

    const hRow = dataSheet.getRow(1);
    hRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    hRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };

    bqData.forEach(r => dataSheet.addRow(r));

    // Alternate row shading
    for (let i = 2; i <= bqData.length + 1; i++) {
      if (i % 2 === 0) {
        dataSheet.getRow(i).fill = {
          type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' }
        };
      }
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

module.exports = { generateExcelReport };
