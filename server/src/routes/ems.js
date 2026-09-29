const express = require('express');
const router = express.Router();
const { getLatestEmsTelemetry, getEmsHistory } = require('../services/emsTelemetry');

/**
 * GET /api/ems/telemetry
 * Fetches the latest real-time battery telemetry from BigQuery
 */
router.get('/telemetry', async (req, res) => {
  try {
    const data = await getLatestEmsTelemetry();
    res.json({ success: true, ...data });
  } catch (err) {
    console.error('Error fetching EMS telemetry:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/ems/history
 * Fetches historical EMS battery readings
 * Query params: startDate, endDate, limit
 */
router.get('/history', async (req, res) => {
  try {
    const { startDate, endDate, limit = 500 } = req.query;
    const records = await getEmsHistory(startDate, endDate, limit);
    res.json({ success: true, count: records.length, records });
  } catch (err) {
    console.error('Error fetching EMS history:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
