import User from '../models/User.js';
import { createUserPayload, generateToken } from '../services/authService.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, farmName, role } = req.body;
    const allowedRoles = ['farmer', 'technician', 'agronomist'];
    const normalizedRole = (role || 'farmer').toString().trim().toLowerCase();

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    if (normalizedRole === 'admin') {
      return res.status(403).json({ success: false, message: 'Admin registration is not permitted. Please contact an administrator.' });
    }

    if (!allowedRoles.includes(normalizedRole)) {
      return res.status(400).json({ success: false, message: 'Invalid role selected' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'A user with that email already exists' });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      farmName: farmName?.trim() || 'My Farm',
      role: normalizedRole
    });
    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      token,
      user: createUserPayload(user)
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findByEmail(email.trim().toLowerCase());
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isValidPassword = await User.comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      token,
      user: createUserPayload(user)
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: createUserPayload(req.user)
  });
};

export const logout = async (req, res) => {
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All password fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New passwords do not match' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isValid = await User.comparePassword(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    await User.updatePassword(req.user.id, newPassword);

    return res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};
