/**
 * Normalizes time strings to strict 24-hour HH:MM:SS format.
 * Supports: '08:00', '8:00', '8:00 AM', '08:00 PM', '20:30', etc.
 */
function normalizeTimeTo24Hr(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return '';
  const clean = timeStr.trim();
  
  // Check 12-hour AM/PM format
  const ampmMatch = clean.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = ampmMatch[2];
    const seconds = ampmMatch[3] || '00';
    const ampm = ampmMatch[4] ? ampmMatch[4].toUpperCase() : null;

    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    const strHours = String(hours).padStart(2, '0');
    return `${strHours}:${minutes}:${seconds}`;
  }

  // Check 24-hour HH:MM or HH:MM:SS
  const match24 = clean.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (match24) {
    const hours = String(match24[1]).padStart(2, '0');
    const minutes = match24[2];
    const seconds = match24[3] || '00';
    return `${hours}:${minutes}:${seconds}`;
  }

  return clean;
}

/**
 * Gets current Indian Standard Time (IST) date string: YYYY-MM-DD
 */
function getTodayIST() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(new Date());
}

const { BigQuery } = require('@google-cloud/bigquery');
const path = require('path');
const fs   = require('fs');

let bigquery = null;

if (process.env.GCP_PROJECT_ID) {
  try {
    const candidatePaths = [
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH
        ? path.resolve(__dirname, '../../', process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
        : null,
      path.join(__dirname, '../../firebase_service.json'),
      path.join(__dirname, '../../firebase-service-account.json'),
    ].filter(Boolean);

    const keyFile = candidatePaths.find(p => fs.existsSync(p));

    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const sa = typeof process.env.FIREBASE_SERVICE_ACCOUNT_JSON === 'string'
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
        : process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
      bigquery = new BigQuery({
        projectId: process.env.GCP_PROJECT_ID || 'grafana-494005',
        credentials: sa
      });
      console.log('✓ BigQuery client initialized via Secret Manager JSON');
    } else if (keyFile) {
      bigquery = new BigQuery({
        projectId: process.env.GCP_PROJECT_ID,
        keyFilename: keyFile,
      });
      console.log(`✓ BigQuery client initialized (project: ${process.env.GCP_PROJECT_ID}, key: ${path.basename(keyFile)})`);
    } else {
      bigquery = new BigQuery({ projectId: process.env.GCP_PROJECT_ID });
      console.log(`✓ BigQuery client initialized via ADC (project: ${process.env.GCP_PROJECT_ID})`);
    }
  } catch (err) {
    console.warn('⚠️ BigQuery SDK initialization warning:', err.message);
  }
}

const SITE_TABLE_MAP = {
  'UCS':         process.env.UCS_TABLE        || 'UCS',
  'SMP_3RX_SKID': process.env.SMP_TABLE       || 'SMP_3RX_SKID',
  'SMP':         process.env.SMP_TABLE        || 'SMP_3RX_SKID',
  'SDR':         process.env.SDR_TABLE        || 'SDR',
};

function getTableNameForSite(site) {
  if (!site) return SITE_TABLE_MAP['UCS'];
  const clean = site.trim().toUpperCase();
  if (SITE_TABLE_MAP[clean]) return SITE_TABLE_MAP[clean];
  if (clean.includes('SMP')) return SITE_TABLE_MAP['SMP_3RX_SKID'];
  if (clean.includes('SDR')) return SITE_TABLE_MAP['SDR'];
  return SITE_TABLE_MAP['UCS'];
}

function isInBreakWindow(timestamp, breakStartTime, breakEndTime) {
  if (!breakStartTime || !breakEndTime) return false;
  const today = new Date(timestamp).toISOString().slice(0, 10);
  const breakStart = new Date(`${today}T${breakStartTime}:00`);
  const breakEnd = new Date(`${today}T${breakEndTime}:00`);
  const ts = new Date(timestamp);
  return ts >= breakStart && ts <= breakEnd;
}

/**
 * Fetches process telemetry from BigQuery for selected streams & exact operator time ranges
 */
async function fetchBigQueryData(params = {}) {
  const {
    site = 'UCS',
    initialRunParams = {},
    selectedStreams = {},
    reportDate = null,
    dataFrequency = 0,
  } = params;

  const {
    startDate,
    startTime,
    endDate,
    endTime,
    breakStartDate,
    breakStartTime,
    breakEndDate,
    breakEndTime
  } = initialRunParams;

  const tableName = getTableNameForSite(site);
  const datasetName = process.env.BQ_DATASET || 'Datas';
  const projectId   = process.env.GCP_PROJECT_ID || 'grafana-494005';

  const selectedColumns = Object.values(selectedStreams)
    .flatMap(colVal => Array.isArray(colVal) ? colVal : [colVal])
    .filter(col => col && typeof col === 'string' && col.trim().length > 0);

  if (bigquery && projectId && datasetName) {
    try {
      const selectColsSQL = selectedColumns.length > 0
        ? ['timestamp', ...selectedColumns.map(c => `\`${c}\``)].join(', ')
        : '*';

      const dateStr = reportDate
        ? new Date(reportDate).toISOString().slice(0, 10)
        : getTodayIST();

      const finalStartDate = startDate || dateStr;
      const finalEndDate = endDate || dateStr;
      const finalBreakStartDate = breakStartDate || finalStartDate;
      const finalBreakEndDate = breakEndDate || finalEndDate;

      const conditions = [];
      const queryParams = {};

      if (startTime && startTime.trim()) {
        queryParams.startTs = `${finalStartDate}T${normalizeTimeTo24Hr(startTime)}+05:30`;
        conditions.push('timestamp >= TIMESTAMP(@startTs)');
      }
      if (endTime && endTime.trim()) {
        queryParams.endTs = `${finalEndDate}T${normalizeTimeTo24Hr(endTime)}+05:30`;
        conditions.push('timestamp <= TIMESTAMP(@endTs)');
      }
      if (breakStartTime && breakEndTime) {
        queryParams.breakStartTs = `${finalBreakStartDate}T${normalizeTimeTo24Hr(breakStartTime)}+05:30`;
        queryParams.breakEndTs   = `${finalBreakEndDate}T${normalizeTimeTo24Hr(breakEndTime)}+05:30`;
        conditions.push(
          `NOT (timestamp >= TIMESTAMP(@breakStartTs) AND timestamp <= TIMESTAMP(@breakEndTs))`
        );
      }

      const freqMinutes = parseInt(dataFrequency) || 0;
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      let query;
      if (freqMinutes > 0 && queryParams.startTs) {
        query = `
          WITH base AS (
            SELECT ${selectColsSQL},
              TIMESTAMP_DIFF(timestamp, TIMESTAMP(@startTs), MINUTE) AS mins_from_start
            FROM \`${projectId}.${datasetName}.${tableName}\`
            ${whereClause}
          )
          SELECT * EXCEPT(mins_from_start, bucket_row)
          FROM (
            SELECT *, ROW_NUMBER() OVER(PARTITION BY DIV(mins_from_start, ${freqMinutes}) ORDER BY timestamp ASC) AS bucket_row
            FROM base
          )
          WHERE bucket_row = 1
          ORDER BY timestamp ASC
        `;
      } else {
        query = `
          SELECT ${selectColsSQL}
          FROM \`${projectId}.${datasetName}.${tableName}\`
          ${whereClause}
          ORDER BY timestamp ASC
        `;
      }

      console.log(`[BigQuery] Querying ${projectId}.${datasetName}.${tableName} (Range: ${startTime || 'any'} to ${endTime || 'any'}, Freq: ${freqMinutes || 'all'}min)`);
      const [rows] = await bigquery.query({ query, params: queryParams });
      console.log(`[BigQuery] Returned ${rows.length} rows for exact time window`);

      // Format output timestamps to IST
      return rows.map(r => {
        const rowObj = { ...r };
        if (rowObj.timestamp) {
          const rawVal = rowObj.timestamp.value || rowObj.timestamp;
          try {
            const dateObj = new Date(rawVal);
            const formatter = new Intl.DateTimeFormat('en-IN', {
              timeZone: 'Asia/Kolkata',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            });
            const parts = formatter.formatToParts(dateObj);
            const partMap = {};
            parts.forEach(p => partMap[p.type] = p.value);
            rowObj.timestamp = `${partMap.year}-${partMap.month}-${partMap.day} ${partMap.hour}:${partMap.minute}:${partMap.second}`;
          } catch (e) {
            rowObj.timestamp = typeof rawVal === 'string' ? rawVal.replace('T', ' ').substring(0, 19) : String(rawVal);
          }
        }
        return rowObj;
      });
    } catch (err) {
      console.warn('[BigQuery] Query error:', err.message);
      throw err;
    }
  }

  // Simulated Telemetry (Local Dev / Fallback when no GCP credentials available)
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const mockRows = [];

  const runStart = startTime
    ? new Date(`${today}T${startTime}:00`)
    : new Date(now.getTime() - 4 * 60 * 60 * 1000);
  const runEnd = endTime
    ? new Date(`${today}T${endTime}:00`)
    : now;

  const intervalMs = 15 * 60 * 1000;
  let timeSlot = new Date(runStart);
  let rowIndex = 0;

  const colsToRender = selectedColumns.length > 0
    ? selectedColumns
    : ['TEMP_1', 'VOUT_1', 'Total_Production'];

  while (timeSlot <= runEnd && mockRows.length < 500) {
    if (breakStartTime && breakEndTime) {
      if (isInBreakWindow(timeSlot, breakStartTime, breakEndTime)) {
        timeSlot = new Date(timeSlot.getTime() + intervalMs);
        continue;
      }
    }

    rowIndex++;
    let tsStr = '';
    try {
      const formatter = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      const parts = formatter.formatToParts(timeSlot);
      const partMap = {};
      parts.forEach(p => partMap[p.type] = p.value);
      tsStr = `${partMap.year}-${partMap.month}-${partMap.day} ${partMap.hour}:${partMap.minute}:${partMap.second}`;
    } catch (e) {
      tsStr = timeSlot.toISOString().replace('T', ' ').substring(0, 19);
    }

    const rowObj = {
      timestamp: tsStr,
      table_source: tableName,
    };

    colsToRender.forEach((col, idx) => {
      const c = col.toUpperCase();
      if (c.includes('TEMP') || c.includes('_T') || c.includes('TT')) {
        rowObj[col] = parseFloat((25.5 + Math.sin(rowIndex * 0.4 + idx) * 4.2).toFixed(2));
      } else if (c.includes('VOLTAGE') || c.includes('_V') || c.includes('VOUT')) {
        rowObj[col] = parseFloat((480.0 + Math.sin(rowIndex * 0.2) * 12.0).toFixed(1));
      } else if (c.includes('CURRENT') || c.includes('_C') || c.includes('IOUT')) {
        rowObj[col] = parseFloat((125.0 + Math.cos(rowIndex * 0.3) * 15.0).toFixed(1));
      } else if (c.includes('CONC') || c.includes('H2') || c.includes('CO2')) {
        rowObj[col] = parseFloat((65.0 + Math.sin(rowIndex * 0.1) * 5.0).toFixed(2));
      } else if (c.includes('PRESSURE') || c.includes('PT') || c.includes('DPT') || c.includes('POV')) {
        rowObj[col] = parseFloat((8.5 + Math.sin(rowIndex * 0.15) * 0.8).toFixed(3));
      } else if (c.includes('POWER') || c.includes('ENERGY') || c.includes('PRODUCTION') || c.includes('STORAGE')) {
        rowObj[col] = parseFloat((1500.0 + rowIndex * 25.5).toFixed(1));
      } else if (c.includes('FACTOR') || c.includes('PF')) {
        rowObj[col] = parseFloat((0.95 + Math.sin(rowIndex * 0.05) * 0.03).toFixed(3));
      } else if (c.includes('FREQ')) {
        rowObj[col] = parseFloat((50.0 + Math.sin(rowIndex * 0.02) * 0.1).toFixed(2));
      } else {
        rowObj[col] = parseFloat((42.0 + Math.sin(rowIndex * 0.5) * 3.5).toFixed(2));
      }
    });

    mockRows.push(rowObj);
    timeSlot = new Date(timeSlot.getTime() + intervalMs);
  }

  return mockRows;
}

/**
 * Returns column schema & descriptions from BigQuery table metadata
 */
async function getTableSchemaMetadata(site = 'UCS') {
  const tableName = getTableNameForSite(site);
  const datasetName = process.env.BQ_DATASET || 'Datas';
  const projectId   = process.env.GCP_PROJECT_ID || 'grafana-494005';

  if (!bigquery || !projectId || !datasetName) {
    return {};
  }

  try {
    const dataset = bigquery.dataset(datasetName);
    const table = dataset.table(tableName);
    const [metadata] = await table.getMetadata();

    const fields = metadata.schema?.fields || [];
    const result = {};

    fields.forEach(field => {
      let unit = '';
      const desc = field.description || '';
      const name = field.name;

      if (desc) {
        const unitMatch = desc.match(/\[([^\]]+)\]/) || desc.match(/\(([^)]+)\)/);
        if (unitMatch) {
          unit = unitMatch[1];
        }
      }

      if (!unit) {
        const n = name.toUpperCase();
        if (n.includes('TEMP') || n.includes('_T')) unit = '°C';
        else if (n.includes('VOLT') || n.includes('_V') || n.includes('VOUT')) unit = 'V';
        else if (n.includes('CURR') || n.includes('_C') || n.includes('IOUT')) unit = 'A';
        else if (n.includes('PRESS') || n.includes('PT') || n.includes('DPT') || n.includes('POV')) unit = 'bar';
        else if (n.includes('H2') || n.includes('CO2') || n.includes('CONC') || n.includes('PCT') || n.includes('FE')) unit = '%';
        else if (n.includes('PROD') || n.includes('FLOW') || n.includes('STORAGE') || n.includes('GAS')) unit = 'L';
        else if (n.includes('TDS')) unit = 'ppm';
        else if (n.includes('EC')) unit = 'µS/cm';
        else if (n.includes('KWHR') || n.includes('ENERGY')) unit = 'kWh';
        else if (n.includes('POWER')) unit = 'W';
      }

      result[name] = {
        name,
        type: field.type,
        mode: field.mode,
        description: desc,
        unit
      };
    });

    return result;
  } catch (err) {
    console.warn(`[BigQuery] Could not fetch schema metadata for ${tableName}:`, err.message);
    return {};
  }
}

/**
 * Logs report deletion audit event
 */
async function logReportDeletion(runId, runName, userEmail) {
  try {
    const datasetName = process.env.BQ_DATASET || 'Datas';
    const projectId = process.env.GCP_PROJECT_ID || 'grafana-494005';
    console.log(`[Audit] Report Deleted: RunID=${runId}, RunName=${runName}, DeletedBy=${userEmail}`);
    if (bigquery && projectId && datasetName) {
      try {
        const row = [{
          timestamp: new Date().toISOString(),
          runId: runId || '',
          runName: runName || '',
          userEmail: userEmail || '',
          action: 'DELETE'
        }];
        await bigquery.dataset(datasetName).table('report_deletions_log').insert(row);
      } catch (insertErr) {
        // Table might not exist, console audit is preserved
      }
    }
  } catch (err) {
    console.warn('[Audit] Could not log deletion to BigQuery:', err.message);
  }
}

module.exports = {
  fetchBigQueryData,
  getTableSchemaMetadata,
  logReportDeletion,
  SITE_TABLE_MAP,
  getTableNameForSite,
};
