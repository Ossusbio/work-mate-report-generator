const express = require('express');
const router = express.Router();
const { publishPowerSupplyCommand, getLatestPowerSupplyTelemetry, getPowerSupplyHistory } = require('../services/pubsub');

/**
 * GET /api/power-supply/telemetry
 * Fetches real-time telemetry from BigQuery for PSU1 & PSU2
 */
router.get('/telemetry', async (req, res) => {
  try {
    const data = await getLatestPowerSupplyTelemetry();
    res.json({ success: true, ...data });
  } catch (err) {
    console.error('Error fetching power supply telemetry:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/power-supply/history
 * Query historical telemetry records according to user selected date/time
 * Query params: startDate, endDate, device, limit
 */
router.get('/history', async (req, res) => {
  try {
    const { startDate, endDate, device = 'ALL', limit = 1500 } = req.query;
    const records = await getPowerSupplyHistory(startDate, endDate, device, limit);
    res.json({ success: true, count: records.length, records });
  } catch (err) {
    console.error('Error querying power supply history:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/power-supply/command
 * Sends remote control commands to Cloud Pub/Sub
 * Body: { device: 'PSU1' | 'PSU2' | 'ALL', action: string, value: any }
 */
router.post('/command', async (req, res) => {
  try {
    const { device = 'PSU1', action, value } = req.body;

    if (!action) {
      return res.status(400).json({ success: false, error: 'Missing required field: action' });
    }

    const validActions = ['set_voltage', 'set_current', 'set_output', 'emergency_stop'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ success: false, error: `Invalid action. Must be one of: ${validActions.join(', ')}` });
    }

    let parsedVal = value;

    if (action === 'set_voltage') {
      const v = parseFloat(value);
      if (isNaN(v) || v < 0 || v > 30) {
        return res.status(400).json({ success: false, error: 'Voltage must be between 0.0 and 30.0 V' });
      }
      parsedVal = Math.round(v * 100) / 100;
    } else if (action === 'set_current') {
      const i = parseFloat(value);
      if (isNaN(i) || i < 0 || i > 5) {
        return res.status(400).json({ success: false, error: 'Current must be between 0.00 and 5.00 A' });
      }
      parsedVal = Math.round(i * 1000) / 1000;
    } else if (action === 'set_output') {
      parsedVal = (value === 1 || value === true || value === '1') ? 1 : 0;
    }

    const messageId = await publishPowerSupplyCommand(device, action, parsedVal);

    res.json({
      success: true,
      messageId,
      device: String(device).toUpperCase(),
      action,
      value: parsedVal,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error publishing power supply command:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
