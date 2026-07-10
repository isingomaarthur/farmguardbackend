import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'farmguard-secret',
    { expiresIn: '7d' }
  );
};

export const hashPassword = async (password) => bcrypt.hash(password, 10);

export const comparePassword = async (inputPassword, storedPassword) =>
  bcrypt.compare(inputPassword, storedPassword);

export const createUserPayload = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  farmName: user.farm_name,
  role: user.role,
  createdAt: user.created_at || user.createdAt || null
});
