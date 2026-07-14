import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';

class User {
  static async create({ name, email, password, farmName, role = 'farmer' }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO users (name, email, password, farm_name, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, farmName, role]
    );

    return {
      id: result.insertId,
      name,
      email,
      farm_name: farmName,
      role,
      password: hashedPassword
    };
  }

  static async findByEmail(email) {
    const rows = await query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    return rows[0] || null;
  }

  static async findById(id) {
    const rows = await query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  }

  static async findAll() {
    const rows = await query(
      'SELECT id, name, email, farm_name, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    return rows;
  }

  static async comparePassword(inputPassword, hashedPassword) {
    return bcrypt.compare(inputPassword, hashedPassword);
  }

  static async update(id, updates) {
    const fields = [];
    const values = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }

    if (updates.farmName !== undefined) {
      fields.push('farm_name = ?');
      values.push(updates.farmName);
    }

    if (updates.email !== undefined) {
      fields.push('email = ?');
      values.push(updates.email);
    }

    if (updates.phone !== undefined) {
      fields.push('phone = ?');
      values.push(updates.phone);
    }

    if (updates.address !== undefined) {
      fields.push('address = ?');
      values.push(updates.address);
    }

    if (updates.profilePhoto !== undefined) {
      fields.push('profile_photo = ?');
      values.push(updates.profilePhoto);
    }

    if (updates.notificationPreferences !== undefined) {
      fields.push('notification_preferences = ?');
      values.push(JSON.stringify(updates.notificationPreferences));
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    await query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  }

  static async updatePassword(id, newPassword) {
    const hashed = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password = ? WHERE id = ?', [hashed, id]);
    return true;
  }

  static async delete(id) {
    await query('DELETE FROM users WHERE id = ?', [id]);
  }
}

export default User;
