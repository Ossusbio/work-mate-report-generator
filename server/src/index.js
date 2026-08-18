const fs = require('fs');
const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request log buffer (last 50 requests)
const requestLog = [];

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    requestLog.push({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`
    });
    if (requestLog.length > 50) requestLog.shift();
  });
  next();
});

// Serve uploaded images locally during dev
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve static frontend in production
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// API Routes
const reportsRouter = require('./routes/reports');
app.use('/api/reports', reportsRouter);

const rolesRouter = require('./routes/roles');
app.use('/api/roles', rolesRouter);

// Basic Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV || 'development' });
});

// Detailed Health check for Developer Panel
app.get('/api/health/detailed', async (req, res) => {
  const results = { firestore: {}, bigquery: {}, gcs: {}, auth: {}, environment: {}, recentRequests: [] };

  // Firestore check
  try {
    const { getReportById } = require('./services/firestore');
    await getReportById('health-check-probe');
    results.firestore = { connected: true, details: 'Firestore connection active' };
  } catch (err) {
    // If error is "not found" that's actually fine - connection works
    if (err.message?.includes('not found') || err.code === 5) {
      results.firestore = { connected: true, details: 'Firestore connection active' };
    } else {
      results.firestore = { connected: false, details: err.message };
    }
  }

  const keyFile = path.join(__dirname, '../firebase_service.json');
  const hasKeyFile = fs.existsSync(keyFile);

  // BigQuery check
  try {
    const { BigQuery } = require('@google-cloud/bigquery');
    let bqClient;
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const sa = typeof process.env.FIREBASE_SERVICE_ACCOUNT_JSON === 'string'
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
        : process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
      bqClient = new BigQuery({ projectId: process.env.GCP_PROJECT_ID || 'grafana-494005', credentials: sa });
    } else if (hasKeyFile) {
      bqClient = new BigQuery({ projectId: process.env.GCP_PROJECT_ID || 'grafana-494005', keyFilename: keyFile });
    } else {
      bqClient = new BigQuery({ projectId: process.env.GCP_PROJECT_ID || 'grafana-494005' });
    }
    const [datasets] = await bqClient.getDatasets({ maxResults: 1 });
    results.bigquery = { connected: true, details: `BigQuery dataset connected (${datasets.length} dataset active)` };
  } catch (err) {
    results.bigquery = { connected: false, details: err.message };
  }

  // GCS check
  try {
    const { Storage } = require('@google-cloud/storage');
    let gcsClient;
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const sa = typeof process.env.FIREBASE_SERVICE_ACCOUNT_JSON === 'string'
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
        : process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
      gcsClient = new Storage({ projectId: process.env.GCP_PROJECT_ID || 'grafana-494005', credentials: sa });
    } else if (hasKeyFile) {
      gcsClient = new Storage({ projectId: process.env.GCP_PROJECT_ID || 'grafana-494005', keyFilename: keyFile });
    } else {
      gcsClient = new Storage({ projectId: process.env.GCP_PROJECT_ID || 'grafana-494005' });
    }
    const [exists] = await gcsClient.bucket('ossusbio-monthly-reports').exists();
    results.gcs = { connected: exists, details: exists ? 'Bucket ossusbio-monthly-reports accessible' : 'Bucket not found' };
  } catch (err) {
    results.gcs = { connected: false, details: err.message };
  }

  // Auth check
  try {
    const admin = require('firebase-admin');
    if (admin.apps.length > 0) {
      results.auth = { connected: true, details: 'Firebase Admin SDK initialized' };
    } else {
      results.auth = { connected: false, details: 'Firebase Admin not initialized' };
    }
  } catch (err) {
    results.auth = { connected: false, details: err.message };
  }

  // Environment info (masked)
  results.environment = {
    'Node.js': process.version,
    'Project ID': process.env.GCP_PROJECT_ID || 'grafana-494005',
    'Region': process.env.CLOUD_RUN_REGION || process.env.K_SERVICE ? 'asia-south1' : 'local',
    'Service': process.env.K_SERVICE || 'local-dev',
    'Revision': process.env.K_REVISION || 'local',
    'Environment': process.env.NODE_ENV || 'development',
    'Secret Loaded': process.env.FIREBASE_SERVICE_ACCOUNT_JSON ? 'Yes' : 'No'
  };

  results.recentRequests = [...requestLog].reverse();

  res.json(results);
});

// Fallback to React index.html for SPA routes in production
app.get('*', (req, res) => {
  const indexPath = path.join(publicPath, 'index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({ message: 'Operator Report API Server running. Client build not found in /public.' });
  }
});

app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🚀 Report Generator API running on port ${PORT}`);
  console.log(`=================================`);
});
