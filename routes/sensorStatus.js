import express from 'express';
import { updateSensorStatus } from '../controllers/sensorController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Technicians or admin can update sensor status
router.post('/:nodeId/status', authenticateToken, authorizeRoles('technician','admin'), updateSensorStatus);

export default router;
