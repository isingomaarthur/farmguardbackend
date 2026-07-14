import { query } from '../config/db.js';

export const updateSensorStatus = async (req, res, next) => {
  try {
    const nodeId = req.params.nodeId;
    const { status, batteryLevel, signalStrength, position } = req.body;

    if (!nodeId) return res.status(400).json({ success: false, message: 'nodeId is required' });

    const rows = await query('SELECT * FROM sensors WHERE node_id = ? LIMIT 1', [nodeId]);
    const sensor = rows[0];
    if (!sensor) {
      return res.status(404).json({ success: false, message: 'Sensor not found' });
    }

    const updates = [];
    const params = [];
    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    if (batteryLevel !== undefined) {
      updates.push('battery_level = ?');
      params.push(batteryLevel);
    }
    if (signalStrength !== undefined) {
      updates.push('signal_strength = ?');
      params.push(signalStrength);
    }
    if (position && position.x !== undefined && position.y !== undefined) {
      updates.push('position_x = ?', 'position_y = ?');
      params.push(position.x, position.y);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    params.push(nodeId);
    await query(`UPDATE sensors SET ${updates.join(', ')}, last_timestamp = NOW() WHERE node_id = ?`, params);

    const [updated] = await query('SELECT node_id, status, battery_level, signal_strength, position_x, position_y, last_timestamp FROM sensors WHERE node_id = ? LIMIT 1', [nodeId]);

    try {
      const io = req.app.get('io');
      if (io) io.emit('sensor:status', updated);
    } catch (e) {
      console.error('Failed to emit sensor status', e.message);
    }

    return res.status(200).json({ success: true, sensor: updated });
  } catch (error) {
    next(error);
  }
};

export default { updateSensorStatus };
