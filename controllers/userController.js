import User from '../models/User.js';
import { createUserPayload } from '../services/authService.js';

export const updateUser = async (req, res, next) => {
  try {
    const { name, farmName } = req.body;
    const updates = {};

    if (name) updates.name = name.trim();
    if (farmName) updates.farmName = farmName.trim();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided' });
    }

    const updatedUser = await User.update(req.user.id, updates);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        farmName: updatedUser.farm_name,
        role: updatedUser.role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    await User.delete(req.user.id);
    return res.status(200).json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    return res.status(200).json({
      success: true,
      users: users.map(createUserPayload)
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUserById = async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    if (req.user.id === userId) {
      return res.status(403).json({ success: false, message: 'You cannot delete your own admin account from this endpoint' });
    }

    await User.delete(userId);
    return res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};
