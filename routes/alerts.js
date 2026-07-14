import express from 'express';
import { createAlert, getAlerts, markAlertRead, resolveAlert, deleteAlert } from '../controllers/alertsController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, authorizeRoles('admin','technician','agronomist'), createAlert);
router.get('/', authenticateToken, getAlerts);
router.post('/:id/read', authenticateToken, markAlertRead);
router.post('/:id/resolve', authenticateToken, authorizeRoles('admin','technician'), resolveAlert);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteAlert);

export default router;
