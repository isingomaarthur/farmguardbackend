import express from 'express';
import { getPreferences, updatePreferences, getNotifications, markAsRead, deleteNotification, unreadCount } from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/preferences', authenticateToken, getPreferences);
router.put('/preferences', authenticateToken, updatePreferences);

router.get('/', authenticateToken, getNotifications);
router.post('/:id/read', authenticateToken, markAsRead);
router.delete('/:id', authenticateToken, deleteNotification);
router.get('/unread-count', authenticateToken, unreadCount);

export default router;
