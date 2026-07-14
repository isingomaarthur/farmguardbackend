import express from 'express';
import { updateUser, deleteUser, getAllUsers, deleteUserById, createUser } from '../controllers/userController.js';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, authorizeAdmin, getAllUsers);
router.post('/', authenticateToken, authorizeAdmin, createUser);
router.put('/update', authenticateToken, updateUser);
router.delete('/delete', authenticateToken, deleteUser);
router.delete('/:id', authenticateToken, authorizeAdmin, deleteUserById);

export default router;
