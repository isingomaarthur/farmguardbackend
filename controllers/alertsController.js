import { query } from '../config/db.js';

export const createAlert = async (req, res, next) => {
  try {
    const { title, message, status = 'INFO', type = 'system_alert', nodeId = null, userId = null } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    const result = await query(
      'INSERT INTO alerts (title, message, status, type, node_id, user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [title, message, status, type, nodeId, userId]
    );

    const [alert] = await query('SELECT * FROM alerts WHERE id = ? LIMIT 1', [result.insertId]);

    // emit via websocket
    try {
      const io = req.app.get('io');
      if (io) io.emit('alert:new', alert);
    } catch (e) {
      console.error('Failed to emit alert via socket', e.message);
    }

    return res.status(201).json({ success: true, alert });
  } catch (error) {
    next(error);
  }
};

export const getAlerts = async (req, res, next) => {
  try {
    const { type, since, limit = 100 } = req.query;
    let sql = 'SELECT * FROM alerts WHERE 1=1';
    const params = [];

    // only show alerts intended for the user or global
    sql += ' AND (user_id = ? OR user_id IS NULL)';
    params.push(req.user.id);

    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }

    if (since) {
      sql += ' AND created_at >= ?';
      params.push(since);
    }

    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(Number(limit));

    const alerts = await query(sql, params);
    return res.status(200).json({ success: true, alerts });
  } catch (error) {
    next(error);
  }
};

export const markAlertRead = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: 'Alert ID is required' });

    await query('UPDATE alerts SET is_read = 1 WHERE id = ? AND (user_id = ? OR user_id IS NULL)', [id, req.user.id]);
    return res.status(200).json({ success: true, message: 'Marked as read' });
  } catch (error) {
    next(error);
  }
};

export const resolveAlert = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: 'Alert ID is required' });

    await query('UPDATE alerts SET resolved_at = NOW() WHERE id = ?', [id]);

    try {
      const [alert] = await query('SELECT * FROM alerts WHERE id = ? LIMIT 1', [id]);
      const io = req.app.get('io');
      if (io) io.emit('alert:resolved', alert);
    } catch (e) {}

    return res.status(200).json({ success: true, message: 'Alert resolved' });
  } catch (error) {
    next(error);
  }
};

export const deleteAlert = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: 'Alert ID is required' });

    await query('DELETE FROM alerts WHERE id = ?', [id]);
    return res.status(200).json({ success: true, message: 'Alert deleted' });
  } catch (error) {
    next(error);
  }
};

export default {
  createAlert,
  getAlerts,
  markAlertRead,
  resolveAlert,
  deleteAlert
};
