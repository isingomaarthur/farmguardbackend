import User from '../models/User.js';
import { query } from '../config/db.js';

export const getPreferences = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    return res.status(200).json({ success: true, notificationPreferences: user.notification_preferences ? JSON.parse(user.notification_preferences) : null });
  } catch (error) {
    next(error);
  }
};

export const updatePreferences = async (req, res, next) => {
  try {
    const prefs = req.body;
    await User.update(req.user.id, { notificationPreferences: prefs });
    return res.status(200).json({ success: true, message: 'Preferences saved', notificationPreferences: prefs });
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const alerts = await query('SELECT * FROM alerts WHERE (user_id = ? OR user_id IS NULL) ORDER BY created_at DESC LIMIT 100', [req.user.id]);
    return res.status(200).json({ success: true, notifications: alerts });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: 'Notification ID is required' });
    await query('UPDATE alerts SET is_read = 1 WHERE id = ? AND (user_id = ? OR user_id IS NULL)', [id, req.user.id]);
    return res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: 'Notification ID is required' });
    await query('DELETE FROM alerts WHERE id = ? AND (user_id = ? OR user_id IS NULL)', [id, req.user.id]);
    return res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const unreadCount = async (req, res, next) => {
  try {
    const [row] = await query('SELECT COUNT(*) AS unread FROM alerts WHERE is_read = 0 AND (user_id = ? OR user_id IS NULL)', [req.user.id]);
    return res.status(200).json({ success: true, unread: row.unread || 0 });
  } catch (error) {
    next(error);
  }
};

export default {
  getPreferences,
  updatePreferences,
  getNotifications,
  markAsRead,
  deleteNotification,
  unreadCount
};
