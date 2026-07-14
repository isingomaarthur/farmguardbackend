import { query } from '../config/db.js';

export const getDashboard = async (req, res, next) => {
  try {
    const role = req.user.role;

    // Common user payload
    const userPayload = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      farmName: req.user.farm_name,
      role: req.user.role
    };

    if (role === 'admin') {
      const [userCountResult] = await query('SELECT COUNT(*) AS totalUsers FROM users');
      const [activeUsersResult] = await query('SELECT COUNT(*) AS activeUsers FROM users WHERE is_active = 1');
      const [recentUsersResult] = await query(
        'SELECT COUNT(*) AS recentUsers FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
      );
      const [sensorCountResult] = await query('SELECT COUNT(*) AS totalSensors FROM sensors');
      const [activeSensorCountResult] = await query(
        "SELECT COUNT(*) AS activeSensors FROM sensors WHERE is_active = 1"
      );
      const [openAlertsResult] = await query(
        "SELECT COUNT(*) AS activeAlerts FROM alerts WHERE status != 'NORMAL'"
      );
      const [recentAlertsResult] = await query(
        'SELECT COUNT(*) AS recentAlerts FROM alerts WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
      );
      const recentNotifications = await query(
        'SELECT id, title, message, status, created_at FROM alerts ORDER BY created_at DESC LIMIT 5'
      );

      return res.status(200).json({
        success: true,
        dashboard: {
          user: userPayload,
          stats: {
            totalUsers: userCountResult.totalUsers,
            activeUsers: activeUsersResult.activeUsers,
            recentUsers: recentUsersResult.recentUsers
          },
          adminOverview: {
            totalSensors: sensorCountResult.totalSensors,
            activeSensors: activeSensorCountResult.activeSensors,
            activeAlerts: openAlertsResult.activeAlerts,
            recentAlerts: recentAlertsResult.recentAlerts,
            recentNotifications
          }
        }
      });
    }

    if (role === 'farmer') {
      // Sensor counts for the demo farmer account
      const sensorsByStatus = await query(
        "SELECT status, COUNT(*) AS count FROM sensors WHERE node_id LIKE 'FARM-%' GROUP BY status"
      );

      const totalSensors = await query(
        "SELECT COUNT(*) AS total FROM sensors WHERE node_id LIKE 'FARM-%'"
      );

      const activeSensors = await query(
        "SELECT COUNT(*) AS active FROM sensors WHERE node_id LIKE 'FARM-%' AND is_active = 1"
      );

      // Current alerts for this user and farmer demo sensors
      const alerts = await query(
        'SELECT id, title, message, status, type, node_id, is_read, created_at FROM alerts WHERE (user_id = ? OR user_id IS NULL) AND node_id LIKE \'FARM-%\' ORDER BY created_at DESC LIMIT 20',
        [req.user.id]
      );

      // Latest sensor readings from farmer demo sensors
      const recentReadings = await query(
        "SELECT node_id, sensor_type, value, unit, status, timestamp FROM sensor_readings WHERE node_id LIKE 'FARM-%' ORDER BY timestamp DESC LIMIT 20"
      );

      return res.status(200).json({
        success: true,
        dashboard: {
          user: userPayload,
          stats: {
            totalSensors: totalSensors[0]?.total || 0,
            activeSensors: activeSensors[0]?.active || 0,
            alertCount: alerts.length
          },
          farmOverview: {
            sensorsByStatus,
            currentAlerts: alerts,
            recentReadings
          }
        }
      });
    }

    if (role === 'agronomist') {
      // Soil analysis aggregates for agronomist sensors
      const soilPh = await query(
        "SELECT AVG(value) AS avgPh FROM sensor_readings WHERE sensor_type = 'ph' AND node_id LIKE 'AGRO-%'"
      );
      const moisture = await query(
        "SELECT AVG(value) AS avgMoisture FROM sensor_readings WHERE sensor_type = 'moisture' AND node_id LIKE 'AGRO-%'"
      );

      const pestAlerts = await query(
        "SELECT id, title, message, created_at FROM alerts WHERE type LIKE '%pest%' AND node_id LIKE 'AGRO-%' ORDER BY created_at DESC LIMIT 50"
      );

      const totalSensors = await query(
        "SELECT COUNT(*) AS total FROM sensors WHERE node_id LIKE 'AGRO-%'"
      );

      return res.status(200).json({
        success: true,
        dashboard: {
          user: userPayload,
          stats: {
            totalSensors: totalSensors[0]?.total || 0,
            avgPh: soilPh[0]?.avgPh || null,
            avgMoisture: moisture[0]?.avgMoisture || null,
            pestAlertsCount: pestAlerts.length
          },
          soilAnalysis: {
            avgPh: soilPh[0]?.avgPh || null,
            avgMoisture: moisture[0]?.avgMoisture || null,
            pestAlerts
          }
        }
      });
    }

    if (role === 'technician') {
      const deviceStatus = await query(
        "SELECT status, COUNT(*) AS count FROM sensors WHERE node_id LIKE 'TECH-%' GROUP BY status"
      );

      const offlineDevices = await query(
        "SELECT node_id, zone, status, battery_level FROM sensors WHERE node_id LIKE 'TECH-%' AND is_active = 1 AND status != 'NORMAL' ORDER BY updated_at DESC LIMIT 100"
      );

      const totalDevices = await query(
        "SELECT COUNT(*) AS total FROM sensors WHERE node_id LIKE 'TECH-%'"
      );

      return res.status(200).json({
        success: true,
        dashboard: {
          user: userPayload,
          stats: {
            totalDevices: totalDevices[0]?.total || 0,
            warningDevices: deviceStatus.find((item) => item.status === 'WARNING')?.count || 0,
            criticalDevices: deviceStatus.find((item) => item.status === 'CRITICAL')?.count || 0
          },
          deviceStatus: {
            deviceStatus,
            offlineDevices
          }
        }
      });
    }

    // Default fallback: limited info
    return res.status(200).json({ success: true, dashboard: { user: userPayload } });
  } catch (error) {
    next(error);
  }
};
