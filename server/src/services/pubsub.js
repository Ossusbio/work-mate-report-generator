const { PubSub } = require('@google-cloud/pubsub');
const { BigQuery } = require('@google-cloud/bigquery');
const path = require('path');
const fs = require('fs');

const PROJECT_ID = process.env.GCP_PROJECT_ID || 'grafana-494005';
const TOPIC_NAME = process.env.PUBSUB_METRAVI_TOPIC || 'metravi-commands';
const DATASET_ID = process.env.BIGQUERY_DATASET || 'Datas';
const TABLE_ID = 'metravi_power_data';

let pubsubClient = null;
let bqClient = null;

function initializeClients() {
  if (pubsubClient && bqClient) return;

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
      pubsubClient = new PubSub({ projectId: PROJECT_ID, credentials: sa });
      bqClient = new BigQuery({ projectId: PROJECT_ID, credentials: sa });
      console.log('✓ PubSub & BigQuery PowerSupply client initialized via Secret Manager JSON');
    } else if (keyFile) {
      pubsubClient = new PubSub({ projectId: PROJECT_ID, keyFilename: keyFile });
      bqClient = new BigQuery({ projectId: PROJECT_ID, keyFilename: keyFile });
      console.log(`✓ PubSub & BigQuery PowerSupply client initialized (key: ${path.basename(keyFile)})`);
    } else {
      pubsubClient = new PubSub({ projectId: PROJECT_ID });
      bqClient = new BigQuery({ projectId: PROJECT_ID });
      console.log(`✓ PubSub & BigQuery PowerSupply client initialized via ADC (project: ${PROJECT_ID})`);
    }
  } catch (err) {
    console.error('⚠️ Failed to initialize PubSub/BigQuery PowerSupply client:', err.message);
  }
}

const knownState = {
  PSU1: { output_on: false },
  PSU2: { output_on: false }
};

/**
 * Publish a command to the Metravi Cloud Pub/Sub topic
 * @param {string} device - 'PSU1' | 'PSU2' | 'ALL'
 * @param {string} action - 'set_voltage' | 'set_current' | 'set_output' | 'emergency_stop'
 * @param {number|boolean|null} value - Value for the action
 * @returns {Promise<string>} Message ID
 */
async function publishPowerSupplyCommand(device = 'PSU1', action, value = null) {
  initializeClients();
  if (!pubsubClient) {
    throw new Error('Pub/Sub client is not initialized');
  }

  const devKey = String(device).toUpperCase();
  const payload = {
    device: devKey,
    action,
  };

  if (value !== null && value !== undefined) {
    payload.value = value;
  }

  // Update in-memory state immediately
  if (action === 'set_output') {
    const isEnable = (value === 1 || value === true || value === '1');
    if (devKey === 'ALL') {
      knownState.PSU1.output_on = isEnable;
      knownState.PSU2.output_on = isEnable;
    } else if (knownState[devKey]) {
      knownState[devKey].output_on = isEnable;
    }
  } else if (action === 'emergency_stop') {
    if (devKey === 'ALL') {
      knownState.PSU1.output_on = false;
      knownState.PSU2.output_on = false;
    } else if (knownState[devKey]) {
      knownState[devKey].output_on = false;
    }
  }

  const topic = pubsubClient.topic(TOPIC_NAME);
  const dataBuffer = Buffer.from(JSON.stringify(payload));

  console.log(`[PubSub] Publishing command to ${TOPIC_NAME}:`, payload);
  const messageId = await topic.publishMessage({ data: dataBuffer });
  console.log(`[PubSub] Published message ID: ${messageId}`);
  return messageId;
}

/**
 * Fetch latest telemetry for PSU1 and PSU2 from BigQuery
 * @returns {Promise<object>} Latest telemetry per device and recent historical points
 */
async function getLatestPowerSupplyTelemetry() {
  initializeClients();
  if (!bqClient) {
    throw new Error('BigQuery client is not initialized');
  }

  const query = `
    SELECT 
      timestamp,
      COALESCE(device, 'PSU1') as device,
      vout,
      iout,
      mode,
      COALESCE(output_on, false) as output_on
    FROM \`${PROJECT_ID}.${DATASET_ID}.${TABLE_ID}\`
    ORDER BY timestamp DESC
    LIMIT 40
  `;

  const [rows] = await bqClient.query({ query });

  const devices = {
    PSU1: { device: 'PSU1', vout: 0, iout: 0, power: 0, mode: '--', output_on: knownState.PSU1.output_on, timestamp: null, isOnline: false },
    PSU2: { device: 'PSU2', vout: 0, iout: 0, power: 0, mode: '--', output_on: knownState.PSU2.output_on, timestamp: null, isOnline: false },
  };

  const now = new Date();

  // Find latest record for each device
  for (const row of rows) {
    const dev = row.device || 'PSU1';
    if (devices[dev] && !devices[dev].timestamp) {
      const rowTime = new Date(row.timestamp.value || row.timestamp);
      const diffSeconds = (now - rowTime) / 1000;
      devices[dev] = {
        device: dev,
        vout: Number(row.vout || 0),
        iout: Number(row.iout || 0),
        power: Math.round((Number(row.vout || 0) * Number(row.iout || 0)) * 10) / 10,
        mode: row.mode || 'CV',
        output_on: row.output_on !== undefined && row.output_on !== null ? Boolean(row.output_on) : Boolean(knownState[dev]?.output_on),
        timestamp: rowTime.toISOString(),
        isOnline: diffSeconds < 30, // active if polled within last 30 seconds
      };
      if (row.output_on !== undefined && row.output_on !== null) {
        knownState[dev].output_on = Boolean(row.output_on);
      }
    }
  }

  return {
    devices,
    history: rows.slice(0, 20).map(r => ({
      timestamp: (r.timestamp?.value || r.timestamp),
      device: r.device || 'PSU1',
      vout: Number(r.vout || 0),
      iout: Number(r.iout || 0),
      mode: r.mode || 'CV',
      output_on: Boolean(r.output_on)
    }))
  };
}

/**
 * Fetch historical telemetry records for PSU1 and/or PSU2 from BigQuery
 * @param {string} startDate - Start timestamp ISO or YYYY-MM-DD HH:mm:ss
 * @param {string} endDate - End timestamp ISO or YYYY-MM-DD HH:mm:ss
 * @param {string} device - 'PSU1' | 'PSU2' | 'ALL'
 * @param {number} limit - Maximum rows to fetch
 * @returns {Promise<Array>} Array of historical records
 */
async function getPowerSupplyHistory(startDate, endDate, device = 'ALL', limit = 2000) {
  initializeClients();
  if (!bqClient) {
    throw new Error('BigQuery client is not initialized');
  }

  let whereClauses = [];
  const params = {};

  if (startDate) {
    whereClauses.push('timestamp >= @start');
    params.start = new Date(startDate).toISOString();
  } else {
    // Default to last 2 hours
    whereClauses.push('timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 2 HOUR)');
  }

  if (endDate) {
    whereClauses.push('timestamp <= @end');
    params.end = new Date(endDate).toISOString();
  }

  const devKey = String(device).toUpperCase();
  if (devKey !== 'ALL') {
    whereClauses.push("COALESCE(device, 'PSU1') = @device");
    params.device = devKey;
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const safeLimit = Math.min(Math.max(1, parseInt(limit, 10) || 1000), 5000);

  const query = `
    SELECT 
      timestamp,
      COALESCE(device, 'PSU1') as device,
      vout,
      iout,
      ROUND(vout * iout, 2) as power,
      mode,
      COALESCE(output_on, false) as output_on
    FROM \`${PROJECT_ID}.${DATASET_ID}.${TABLE_ID}\`
    ${whereSql}
    ORDER BY timestamp ASC
    LIMIT ${safeLimit}
  `;

  console.log(`[BigQuery History] Querying range [${params.start || '2h ago'} to ${params.end || 'now'}], dev: ${devKey}, limit: ${safeLimit}`);
  const [rows] = await bqClient.query({ query, params });

  return rows.map(r => ({
    timestamp: r.timestamp?.value || r.timestamp,
    device: r.device || 'PSU1',
    vout: Number(r.vout || 0),
    iout: Number(r.iout || 0),
    power: Number(r.power || 0),
    mode: r.mode || 'CV',
    output_on: Boolean(r.output_on),
  }));
}

module.exports = {
  publishPowerSupplyCommand,
  getLatestPowerSupplyTelemetry,
  getPowerSupplyHistory,
};
