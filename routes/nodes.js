import express from 'express';
import { query } from '../config/db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

const formatSensorRow = (row) => ({
  id: row.node_id,
  zone: row.zone,
  type: row.sensor_type,
  x: row.position_x || 0,
  y: row.position_y || 0,
  status: row.status,
  currentValue: row.last_value,
  unit: row.last_unit,
  batteryLevel: row.battery_level,
  signalStrength: row.signal_strength,
  isActive: Boolean(row.is_active)
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const rows = await query('SELECT * FROM sensors WHERE is_active = 1');
    return res.json(rows.map(formatSensorRow));
  } catch (error) {
    console.error('GET /nodes error', error);
    return res.status(500).json({ success: false, message: 'Unable to load nodes' });
  }
});

// Get node by ID
router.get('/:nodeId', authenticateToken, async (req, res) => {
  try {
    const [row] = await query('SELECT * FROM sensors WHERE node_id = ? LIMIT 1', [req.params.nodeId]);
    if (!row) {
      return res.status(404).json({ success: false, message: 'Node not found' });
    }
    return res.json(formatSensorRow(row));
  } catch (error) {
    console.error('GET /nodes/:nodeId error', error);
    return res.status(500).json({ success: false, message: 'Unable to load node' });
  }
});

// Create new node
router.post('/', authenticateToken, authorizeRoles('technician', 'admin'), async (req, res) => {
  try {
    const { nodeId, zone, type, x, y, thresholds } = req.body;
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
        x || 0,
        y || 0,
        thresholds?.warning?.min || null,
        thresholds?.warning?.max || null,
        thresholds?.critical?.min || null,
        thresholds?.critical?.max || null,
        1
      ]
    );

    const [created] = await query('SELECT * FROM sensors WHERE node_id = ? LIMIT 1', [nodeId]);
    return res.status(201).json(formatSensorRow(created));
  } catch (error) {
    console.error('POST /nodes error', error);
    return res.status(500).json({ success: false, message: 'Unable to create node' });
  }
});

// Update node position
router.patch('/:nodeId/position', authenticateToken, authorizeRoles('technician', 'admin'), async (req, res) => {
  try {
    const { x, y } = req.body;
    if (x === undefined || y === undefined) {
      return res.status(400).json({ success: false, message: 'x and y are required' });
    }

    await query(
      'UPDATE sensors SET position_x = ?, position_y = ?, updated_at = CURRENT_TIMESTAMP WHERE node_id = ?',
      [x, y, req.params.nodeId]
    );

    const [updated] = await query('SELECT * FROM sensors WHERE node_id = ? LIMIT 1', [req.params.nodeId]);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Node not found' });
    }
    return res.json(formatSensorRow(updated));
  } catch (error) {
    console.error('PATCH /nodes/:nodeId/position error', error);
    return res.status(500).json({ success: false, message: 'Unable to update node position' });
  }
});

// Update node status
router.patch('/:nodeId/status', authenticateToken, authorizeRoles('technician', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'status is required' });
    }

    await query(
      'UPDATE sensors SET status = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE node_id = ?',
      [status, status !== 'INACTIVE' ? 1 : 0, req.params.nodeId]
    );

    const [updated] = await query('SELECT * FROM sensors WHERE node_id = ? LIMIT 1', [req.params.nodeId]);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Node not found' });
    }
    return res.json(formatSensorRow(updated));
  } catch (error) {
    console.error('PATCH /nodes/:nodeId/status error', error);
    return res.status(500).json({ success: false, message: 'Unable to update node status' });
  }
});

export default router;
