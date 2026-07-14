import User from '../models/User.js';
import { createUserPayload, generateToken } from '../services/authService.js';

export const register = async (req, res, next) => {
  try {
    return res.status(403).json({
      success: false,
      message: 'Self-registration is disabled. Please request an account from your administrator.'
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

export const demoLogin = async (req, res, next) => {
  try {
    const allowedRoles = ['farmer', 'technician', 'agronomist', 'admin'];
    const normalizedRole = (req.body.role || 'farmer').toString().trim().toLowerCase();

    if (!allowedRoles.includes(normalizedRole)) {
      return res.status(400).json({ success: false, message: 'Invalid demo role selected' });
    }

    const email = `demo+${normalizedRole}@farmguard.com`;
    let user = await User.findByEmail(email);

    if (!user) {
      const roleNames = {
        farmer: 'Demo Farmer',
        technician: 'Demo Technician',
        agronomist: 'Demo Agronomist',
        admin: 'Demo Admin'
      };

      user = await User.create({
        name: roleNames[normalizedRole],
        email,
        password: 'Demo@1234',
        farmName: `${normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1)} Demo Farm`,
        role: normalizedRole
      });
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

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    await User.findByEmail(normalizedEmail);

    return res.status(200).json({
      success: true,
      message: 'If an account exists for that email, a password reset link has been sent.'
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
