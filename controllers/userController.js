import User from '../models/User.js';
import { createUserPayload } from '../services/authService.js';

export const updateUser = async (req, res, next) => {
  try {
    const { name, farmName, email, phone, address, profilePhoto, notificationPreferences } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name.toString().trim();
    if (farmName !== undefined) updates.farmName = farmName.toString().trim();
    if (email !== undefined) updates.email = email.toString().trim().toLowerCase();
    if (phone !== undefined) updates.phone = phone.toString().trim();
    if (address !== undefined) updates.address = address.toString().trim();
    if (profilePhoto !== undefined) updates.profilePhoto = profilePhoto || null;
    if (notificationPreferences !== undefined) updates.notificationPreferences = notificationPreferences;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided' });
    }

    // If email is being changed ensure it's not taken
    if (updates.email) {
      const existing = await User.findByEmail(updates.email);
      if (existing && existing.id !== req.user.id) {
        return res.status(409).json({ success: false, message: 'Email already in use' });
      }
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
        phone: updatedUser.phone || null,
        address: updatedUser.address || null,
        profilePhoto: updatedUser.profile_photo || null,
        notificationPreferences: updatedUser.notification_preferences ? JSON.parse(updatedUser.notification_preferences) : null,
        role: updatedUser.role
      }
    });
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

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, farmName, role } = req.body;
    const allowedRoles = ['farmer', 'technician', 'agronomist', 'admin'];
    const normalizedRole = (role || 'farmer').toString().trim().toLowerCase();
    const normalizedEmail = email?.toString().trim().toLowerCase();

    if (!name || !normalizedEmail || !password || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, password, and role are required' });
    }

    if (!allowedRoles.includes(normalizedRole)) {
      return res.status(400).json({ success: false, message: 'Invalid role selected' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const existing = await User.findByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({ success: false, message: 'A user with that email already exists' });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      farmName: farmName?.trim() || 'My Farm',
      role: normalizedRole
    });

    return res.status(201).json({ success: true, user: createUserPayload(user) });
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
