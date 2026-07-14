import User from '../models/User.js';
import { createUserPayload, generateToken } from '../services/authService.js';
import { query } from '../config/db.js';

const roleNames = {
  farmer: 'Demo Farmer',
  technician: 'Demo Technician',
  agronomist: 'Demo Agronomist',
  admin: 'Demo Admin'
};

const demoSensorsByRole = {
  farmer: [
    {
      node_id: 'FARM-01',
      zone: 'Farmer Demo Field',
      sensor_type: 'Soil Moisture',
      position_x: 12.4,
      position_y: 22.9,
      status: 'NORMAL',
      last_value: 45,
      last_unit: '%',
      last_timestamp: new Date(),
      threshold_warning_min: 35,
      threshold_warning_max: 65,
      threshold_critical_min: 30,
      threshold_critical_max: 70,
      is_active: 1,
      battery_level: 91,
      signal_strength: 88
    },
    {
      node_id: 'FARM-02',
      zone: 'Farmer Demo Orchard',
      sensor_type: 'Soil pH',
      position_x: 18.8,
      position_y: 9.2,
      status: 'WARNING',
      last_value: 6.3,
      last_unit: 'pH',
      last_timestamp: new Date(),
      threshold_warning_min: 6.0,
      threshold_warning_max: 8.0,
      threshold_critical_min: 5.5,
      threshold_critical_max: 8.5,
      is_active: 1,
      battery_level: 78,
      signal_strength: 84
    }
  ],
  technician: [
    {
      node_id: 'TECH-01',
      zone: 'North Gate',
      sensor_type: 'Humidity',
      position_x: 5.1,
      position_y: 33.2,
      status: 'CRITICAL',
      last_value: 28,
      last_unit: '%',
      last_timestamp: new Date(),
      threshold_warning_min: 40,
      threshold_warning_max: 90,
      threshold_critical_min: 35,
      threshold_critical_max: 95,
      is_active: 1,
      battery_level: 55,
      signal_strength: 46
    },
    {
      node_id: 'TECH-02',
      zone: 'South Barn',
      sensor_type: 'Temperature',
      position_x: 11.6,
      position_y: 44.7,
      status: 'WARNING',
      last_value: 32,
      last_unit: '°C',
      last_timestamp: new Date(),
      threshold_warning_min: 18,
      threshold_warning_max: 30,
      threshold_critical_min: 15,
      threshold_critical_max: 35,
      is_active: 1,
      battery_level: 64,
      signal_strength: 76
    }
  ],
  agronomist: [
    {
      node_id: 'AGRO-01',
      zone: 'Research Plot',
      sensor_type: 'Soil pH',
      position_x: 23.5,
      position_y: 13.7,
      status: 'NORMAL',
      last_value: 6.8,
      last_unit: 'pH',
      last_timestamp: new Date(),
      threshold_warning_min: 6.0,
      threshold_warning_max: 7.2,
      threshold_critical_min: 5.5,
      threshold_critical_max: 7.8,
      is_active: 1,
      battery_level: 70,
      signal_strength: 82
    },
    {
      node_id: 'AGRO-02',
      zone: 'Crop Trial',
      sensor_type: 'Soil Moisture',
      position_x: 31.4,
      position_y: 28.1,
      status: 'WARNING',
      last_value: 39,
      last_unit: '%',
      last_timestamp: new Date(),
      threshold_warning_min: 40,
      threshold_warning_max: 70,
      threshold_critical_min: 30,
      threshold_critical_max: 75,
      is_active: 1,
      battery_level: 88,
      signal_strength: 90
    }
  ],
  admin: [
    {
      node_id: 'ADM-01',
      zone: 'Central Farm',
      sensor_type: 'Humidity',
      position_x: 45.2,
      position_y: 11.3,
      status: 'NORMAL',
      last_value: 62,
      last_unit: '%',
      last_timestamp: new Date(),
      threshold_warning_min: 40,
      threshold_warning_max: 95,
      threshold_critical_min: 35,
      threshold_critical_max: 98,
      is_active: 1,
      battery_level: 84,
      signal_strength: 90
    },
    {
      node_id: 'ADM-02',
      zone: 'East Facility',
      sensor_type: 'Soil Moisture',
      position_x: 14.0,
      position_y: 37.8,
      status: 'NORMAL',
      last_value: 49,
      last_unit: '%',
      last_timestamp: new Date(),
      threshold_warning_min: 35,
      threshold_warning_max: 65,
      threshold_critical_min: 30,
      threshold_critical_max: 70,
      is_active: 1,
      battery_level: 92,
      signal_strength: 89
    }
  ]
};

const sampleReadingsByRole = {
  farmer: [
    { node_id: 'FARM-01', value: 45, unit: '%', sensor_type: 'moisture', status: 'NORMAL' },
    { node_id: 'FARM-02', value: 6.3, unit: 'pH', sensor_type: 'ph', status: 'WARNING' }
  ],
  technician: [
    { node_id: 'TECH-01', value: 28, unit: '%', sensor_type: 'humidity', status: 'CRITICAL' },
    { node_id: 'TECH-02', value: 32, unit: '°C', sensor_type: 'temperature', status: 'WARNING' }
  ],
  agronomist: [
    { node_id: 'AGRO-01', value: 6.8, unit: 'pH', sensor_type: 'ph', status: 'NORMAL' },
    { node_id: 'AGRO-02', value: 39, unit: '%', sensor_type: 'moisture', status: 'WARNING' }
  ],
  admin: [
    { node_id: 'ADM-01', value: 62, unit: '%', sensor_type: 'humidity', status: 'NORMAL' },
    { node_id: 'ADM-02', value: 49, unit: '%', sensor_type: 'moisture', status: 'NORMAL' }
  ]
};

const roleAlerts = {
  farmer: [
    {
      title: 'Low Soil Moisture Alert',
      message: 'Soil moisture is slightly low in the demo field. Monitor irrigation closely.',
      status: 'WARNING',
      type: 'low_moisture',
      node_id: 'FARM-02'
    }
  ],
  technician: [
    {
      title: 'Device Battery Low',
      message: 'The sensor at South Barn has low battery and needs attention.',
      status: 'WARNING',
      type: 'battery_alert',
      node_id: 'TECH-02'
    },
    {
      title: 'Critical Humidity Sensor',
      message: 'North Gate humidity sensor is in critical range and needs maintenance.',
      status: 'CRITICAL',
      type: 'humidity_alert',
      node_id: 'TECH-01'
    }
  ],
  agronomist: [
    {
      title: 'Pest Pressure Rising',
      message: 'Pest pressure is increasing in the crop trial plot. Inspect the field for damage.',
      status: 'WARNING',
      type: 'pest_alert',
      node_id: 'AGRO-02'
    }
  ],
  admin: [
    {
      title: 'System Check Ready',
      message: 'Sensor network is healthy and ready for admin review.',
      status: 'INFO',
      type: 'system_alert',
      node_id: 'ADM-01'
    }
  ]
};

const ensureSensor = async (sensor) => {
  const [existing] = await query('SELECT id FROM sensors WHERE node_id = ? LIMIT 1', [sensor.node_id]);
  if (!existing) {
    await query(
      `INSERT INTO sensors
         (node_id, zone, sensor_type, position_x, position_y, status, last_value, last_unit, last_timestamp,
          threshold_warning_min, threshold_warning_max, threshold_critical_min, threshold_critical_max,
          is_active, battery_level, signal_strength)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sensor.node_id,
        sensor.zone,
        sensor.sensor_type,
        sensor.position_x,
        sensor.position_y,
        sensor.status,
        sensor.last_value,
        sensor.last_unit,
        sensor.last_timestamp,
        sensor.threshold_warning_min,
        sensor.threshold_warning_max,
        sensor.threshold_critical_min,
        sensor.threshold_critical_max,
        sensor.is_active,
        sensor.battery_level,
        sensor.signal_strength
      ]
    );
  }
};

const ensureReading = async (reading) => {
  const [existing] = await query('SELECT id FROM sensor_readings WHERE node_id = ? AND sensor_type = ? LIMIT 1', [reading.node_id, reading.sensor_type]);
  if (!existing) {
    await query(
      'INSERT INTO sensor_readings (node_id, value, unit, sensor_type, status, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
      [reading.node_id, reading.value, reading.unit, reading.sensor_type, reading.status, new Date()]
    );
  }
};

const ensureAlert = async (alert, userId) => {
  const [existing] = await query('SELECT id FROM alerts WHERE node_id = ? AND type = ? LIMIT 1', [alert.node_id, alert.type]);
  if (!existing) {
    await query(
      'INSERT INTO alerts (title, message, status, type, node_id, is_read, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [alert.title, alert.message, alert.status, alert.type, alert.node_id, 0, userId]
    );
  }
};

const createDemoDataForRole = async (role, userId) => {
  const sensors = demoSensorsByRole[role] || [];
  const readings = sampleReadingsByRole[role] || [];
  const alerts = roleAlerts[role] || [];

  for (const sensor of sensors) {
    await ensureSensor(sensor);
  }

  for (const reading of readings) {
    await ensureReading(reading);
  }

  for (const alert of alerts) {
    await ensureAlert(alert, userId);
  }
};

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

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findByEmail(email.trim().toLowerCase());
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.password) {
      return res.status(200).json({
        success: true,
        token: generateToken(user),
        user: createUserPayload(user)
      });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
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
      user = await User.create({
        name: roleNames[normalizedRole],
        email,
        password: null,
        farmName: `${normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1)} Demo Farm`,
        role: normalizedRole
      });
      await createDemoDataForRole(normalizedRole, user.id);
    } else {
      await createDemoDataForRole(normalizedRole, user.id);
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

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'New password and confirmation are required' });
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

    if (user.password) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required' });
      }

      const isValid = await User.comparePassword(currentPassword, user.password);
      if (!isValid) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect' });
      }
    }

    await User.updatePassword(req.user.id, newPassword);

    return res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};
