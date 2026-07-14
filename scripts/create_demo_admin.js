import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';

dotenv.config();

const email = process.env.DEMO_ADMIN_EMAIL || 'admin@demo.local';
const password = process.env.DEMO_ADMIN_PASSWORD || 'DemoAdmin123!';
const name = process.env.DEMO_ADMIN_NAME || 'Demo Admin';
const role = process.env.DEMO_ADMIN_ROLE || 'admin';

const createAdmin = async () => {
  try {
    // check if user exists
    const users = await query('SELECT id, email FROM users WHERE email = ?', [email]);
    if (users && users.length > 0) {
      console.log(`User already exists: ${email}`);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    await query(
      `INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [name, email, hashed, role]
    );

    console.log('Demo admin created:');
    console.log(`  email: ${email}`);
    console.log('  password: (hidden) — provide via DEMO_ADMIN_PASSWORD env var');
  } catch (err) {
    console.error('Error creating demo admin:', err);
    process.exit(1);
  }
};

createAdmin();
