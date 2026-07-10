import express from 'express';
import { updateUser, deleteUser, getAllUsers, deleteUserById } from '../controllers/userController.js';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, authorizeAdmin, getAllUsers);
router.put('/update', authenticateToken, updateUser);
router.delete('/delete', authenticateToken, deleteUser);
router.delete('/:id', authenticateToken, authorizeAdmin, deleteUserById);

export default router;
