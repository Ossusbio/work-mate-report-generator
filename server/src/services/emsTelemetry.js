const { BigQuery } = require('@google-cloud/bigquery');
const path = require('path');
const fs = require('fs');

const PROJECT_ID = process.env.GCP_PROJECT_ID || 'grafana-494005';
const DATASET_ID = process.env.BIGQUERY_DATASET || 'Datas';
const TABLE_ID = 'ems_battery_data';

let bqClient = null;

function initializeBq() {
  if (bqClient) return;

  try {
    const candidatePaths = [
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH
        ? path.resolve(__dirname, '../../', process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
        : null,
      path.join(__dirname, '../../firebase_service.json'),
      path.join(__dirname, '../../firebase-service-account.json'),
      path.join(__dirname, '../firebase_service.json'),
    ].filter(Boolean);

    const keyFile = candidatePaths.find(p => fs.existsSync(p));

    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const sa = typeof process.env.FIREBASE_SERVICE_ACCOUNT_JSON === 'string'
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
        : process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
      bqClient = new BigQuery({ projectId: PROJECT_ID, credentials: sa });
      console.log('✓ BigQuery EMS client initialized via Secret Manager JSON');
    } else if (keyFile) {
      bqClient = new BigQuery({ projectId: PROJECT_ID, keyFilename: keyFile });
      console.log(`✓ BigQuery EMS client initialized (key: ${path.basename(keyFile)})`);
    } else {
      bqClient = new BigQuery({ projectId: PROJECT_ID });
      console.log(`✓ BigQuery EMS client initialized via ADC (project: ${PROJECT_ID})`);
    }
  } catch (err) {
    console.error('⚠️ Failed to initialize BigQuery EMS client:', err.message);
  }
}

/**
 * Format a BigQuery row into a structured EMS telemetry object
 */
function formatTelemetryRow(row) {
  if (!row) return null;

  const rawTime = row.timestamp?.value || row.timestamp;
  const timeObj = rawTime ? new Date(rawTime) : new Date();

  const cells = [];
  let calculatedStack = 0;
  let activeCellCount = 0;
  let maxCell = { id: 1, voltage: 0 };
  let minCell = { id: 1, voltage: 999 };

  for (let i = 1; i <= 12; i++) {
    const v = Number(row[`cell_${i}`] || 0);
    cells.push({ id: i, voltage: v, isActive: v > 0.1 });
    if (v > 0.1) {
      calculatedStack += v;
      activeCellCount++;
      if (v > maxCell.voltage) maxCell = { id: i, voltage: v };
      if (v < minCell.voltage) minCell = { id: i, voltage: v };
    }
  }

  if (activeCellCount === 0) {
    minCell = { id: 1, voltage: 0 };
  }

  const deltaV = activeCellCount > 1 ? Math.max(0, maxCell.voltage - minCell.voltage) : 0;

  return {
    timestamp: timeObj.toISOString(),
    deviceId: row.device_id || 'EMS_01',
    cells,
    activeCellCount,
    stackVoltage: Number(row.stack_voltage || calculatedStack || 0),
    sumOfCells: Number(row.sum_of_cells || calculatedStack || 0),
    maxCell,
    minCell,
    deltaV: Math.round(deltaV * 10000) / 10000,
    internalTemp: row.internal_temp !== null && row.internal_temp !== undefined ? Number(row.internal_temp) : null,
    analogSupply: Number(row.analog_supply || 0),
    digitalSupply: Number(row.digital_supply || 0),
    ref2Voltage: Number(row.ref2_voltage || 0),
    gpio1Voltage: Number(row.gpio1_voltage || 0),
    ntcTemp: row.ntc_temp !== null && row.ntc_temp !== undefined ? Number(row.ntc_temp) : null,
    statusFlags: row.status_flags || 'NORMAL',
  };
}

/**
 * Fetch the latest EMS telemetry reading and recent history for quick charts
 */
async function getLatestEmsTelemetry() {
  initializeBq();
  if (!bqClient) {
    throw new Error('BigQuery client is not initialized');
  }

  const query = `
    SELECT *
    FROM \`${PROJECT_ID}.${DATASET_ID}.${TABLE_ID}\`
    ORDER BY timestamp DESC
    LIMIT 30
  `;

  const [rows] = await bqClient.query({ query });

  if (!rows || rows.length === 0) {
    return {
      telemetry: null,
      isOnline: false,
      history: []
    };
  }

  const latest = formatTelemetryRow(rows[0]);
  const now = new Date();
  const rowTime = new Date(latest.timestamp);
  const diffSeconds = Math.max(0, (now - rowTime) / 1000);
  const isOnline = diffSeconds < 90; // Active if updated within 90 seconds

  const history = rows.map(r => formatTelemetryRow(r)).reverse();

  return {
    telemetry: latest,
    isOnline,
    lastSeenSeconds: Math.round(diffSeconds),
    history
  };
}

/**
 * Fetch historical EMS readings for trend analysis
 */
async function getEmsHistory(startDate, endDate, limit = 1000) {
  initializeBq();
  if (!bqClient) {
    throw new Error('BigQuery client is not initialized');
  }

  const whereClauses = [];
  const params = {};

  if (startDate) {
    whereClauses.push('timestamp >= @start');
    params.start = new Date(startDate).toISOString();
  } else {
    // Default to last 4 hours
    whereClauses.push('timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 4 HOUR)');
  }

  if (endDate) {
    whereClauses.push('timestamp <= @end');
    params.end = new Date(endDate).toISOString();
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const safeLimit = Math.min(Math.max(1, parseInt(limit, 10) || 500), 5000);

  const query = `
    SELECT *
    FROM \`${PROJECT_ID}.${DATASET_ID}.${TABLE_ID}\`
    ${whereSql}
    ORDER BY timestamp ASC
    LIMIT ${safeLimit}
  `;

  const [rows] = await bqClient.query({ query, params });
  return rows.map(r => formatTelemetryRow(r));
}

module.exports = {
  getLatestEmsTelemetry,
  getEmsHistory,
};
