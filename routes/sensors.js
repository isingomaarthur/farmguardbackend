import express from 'express';
import { query } from '../config/db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

const formatReading = (row) => ({
  sensorType: row.sensor_type,
  value: row.value,
  unit: row.unit,
  timestamp: row.timestamp,
  status: row.status,
  nodeId: row.node_id
});

router.get('/readings', async (req, res) => {
  try {
    const rows = await query(
      `SELECT sr.sensor_type, sr.value, sr.unit, sr.status, sr.timestamp, sr.node_id
       FROM sensor_readings sr
       INNER JOIN (
         SELECT sensor_type, MAX(timestamp) AS latest_ts
         FROM sensor_readings
         GROUP BY sensor_type
       ) latest ON latest.sensor_type = sr.sensor_type AND latest.latest_ts = sr.timestamp`
    );

    const formatted = rows.reduce((acc, row) => {
      acc[row.sensor_type] = formatReading(row);
      return acc;
    }, {});

    return res.json(formatted);
  } catch (error) {
    console.error('GET /sensors/readings error', error);
    return res.status(500).json({ success: false, message: 'Unable to load sensor readings' });
  }
});

router.get('/readings/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate } = req.query;
    const conditions = ['sensor_type = ?'];
    const params = [type];

    if (startDate) {
      conditions.push('timestamp >= ?');
      params.push(new Date(startDate));
    }
    if (endDate) {
      conditions.push('timestamp <= ?');
      params.push(new Date(endDate));
    }

    const rows = await query(
      `SELECT * FROM sensor_readings WHERE ${conditions.join(' AND ')} ORDER BY timestamp ASC LIMIT 1000`,
      params
    );

    return res.json(rows.map(formatReading));
  } catch (error) {
    console.error('GET /sensors/readings/:type error', error);
    return res.status(500).json({ success: false, message: 'Unable to load sensor readings' });
  }
});

router.post('/reading', async (req, res) => {
  try {
    const { nodeId, value, unit, sensorType } = req.body;
    if (!nodeId || value === undefined || !sensorType) {
      return res.status(400).json({ success: false, message: 'nodeId, value and sensorType are required' });
    }

    const [sensor] = await query('SELECT * FROM sensors WHERE node_id = ? LIMIT 1', [nodeId]);
    if (!sensor) {
      return res.status(404).json({ success: false, message: 'Sensor node not found' });
    }

    let status = 'NORMAL';
    const warningMin = sensor.threshold_warning_min;
    const warningMax = sensor.threshold_warning_max;
    const criticalMin = sensor.threshold_critical_min;
    const criticalMax = sensor.threshold_critical_max;

    if (criticalMin !== null && criticalMax !== null && (value > criticalMax || value < criticalMin)) {
      status = 'CRITICAL';
    } else if (warningMin !== null && warningMax !== null && (value > warningMax || value < warningMin)) {
      status = 'WARNING';
    }

    await query(
      'INSERT INTO sensor_readings (node_id, value, unit, sensor_type, status, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
      [nodeId, value, unit || null, sensorType, status, new Date()]
    );

    await query(
      'UPDATE sensors SET `last_value` = ?, `last_unit` = ?, `last_timestamp` = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE node_id = ?',
      [value, unit || null, new Date(), status, nodeId]
    );

    if (status !== 'NORMAL') {
      const alertMessageMap = {
        moisture: {
          CRITICAL: 'Soil moisture is critically low or high',
          WARNING: 'Soil moisture is outside the ideal range'
        },
        humidity: {
          CRITICAL: 'Humidity is critically low or high',
          WARNING: 'Humidity is outside the ideal range'
        },
        ph: {
          CRITICAL: 'Soil pH is critically out of range',
          WARNING: 'Soil pH is outside the ideal range'
        }
      };

      const message = alertMessageMap[sensorType]?.[status] || `${sensorType} alert`;
      const title = `${sensorType.charAt(0).toUpperCase() + sensorType.slice(1)} ${status}`;

      await query(
        'INSERT INTO alerts (title, message, status, type, node_id) VALUES (?, ?, ?, ?, ?)',
        [title, message, status, `${sensorType}_alert`, nodeId]
      );
    }

    return res.status(201).json({ success: true, message: 'Reading recorded successfully', status });
  } catch (error) {
    console.error('POST /sensors/reading error', error);
    return res.status(500).json({ success: false, message: 'Unable to save sensor reading' });
  }
});

router.get('/', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM sensors WHERE is_active = 1');
    return res.json(rows.map((row) => ({
      nodeId: row.node_id,
      zone: row.zone,
      type: row.sensor_type,
      position: { x: row.position_x, y: row.position_y },
      status: row.status,
      lastValue: row.last_value,
      unit: row.last_unit,
      lastTimestamp: row.last_timestamp,
      batteryLevel: row.battery_level,
      signalStrength: row.signal_strength,
      isActive: Boolean(row.is_active)
    })));
  } catch (error) {
    console.error('GET /sensors error', error);
    return res.status(500).json({ success: false, message: 'Unable to load sensors' });
  }
});

router.get('/:nodeId', async (req, res) => {
  try {
    const [row] = await query('SELECT * FROM sensors WHERE node_id = ? LIMIT 1', [req.params.nodeId]);
    if (!row) {
      return res.status(404).json({ success: false, message: 'Sensor not found' });
    }
    return res.json({
      nodeId: row.node_id,
      zone: row.zone,
      type: row.sensor_type,
      position: { x: row.position_x, y: row.position_y },
      status: row.status,
      lastValue: row.last_value,
      unit: row.last_unit,
      lastTimestamp: row.last_timestamp,
      batteryLevel: row.battery_level,
      signalStrength: row.signal_strength,
      isActive: Boolean(row.is_active)
    });
  } catch (error) {
    console.error('GET /sensors/:nodeId error', error);
    return res.status(500).json({ success: false, message: 'Unable to load sensor' });
  }
});

router.post('/', authenticateToken, authorizeRoles('technician', 'admin'), async (req, res) => {
  try {
    const { nodeId, zone, type, position, thresholds } = req.body;
    if (!nodeId || !zone || !type) {
      return res.status(400).json({ success: false, message: 'nodeId, zone, and type are required' });
    }

    await query(
      `INSERT INTO sensors
         (node_id, zone, sensor_type, position_x, position_y, threshold_warning_min, threshold_warning_max, threshold_critical_min, threshold_critical_max, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nodeId,
        zone,
        type,
        position?.x || 0,
        position?.y || 0,
        thresholds?.warning?.min || null,
        thresholds?.warning?.max || null,
        thresholds?.critical?.min || null,
        thresholds?.critical?.max || null,
        1
      ]
    );

    const [created] = await query('SELECT * FROM sensors WHERE node_id = ? LIMIT 1', [nodeId]);
    return res.status(201).json(created);
  } catch (error) {
    console.error('POST /sensors error', error);
    return res.status(500).json({ success: false, message: 'Unable to create sensor' });
  }
});

export default router;
