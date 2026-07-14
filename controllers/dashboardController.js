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

      return res.status(200).json({
        success: true,
        dashboard: {
          user: userPayload,
          stats: {
            totalUsers: userCountResult.totalUsers,
            activeUsers: activeUsersResult.activeUsers,
            recentUsers: recentUsersResult.recentUsers
          }
        }
      });
    }

    if (role === 'farmer') {
      // Sensor counts by status
      const sensorsByStatus = await query(
        "SELECT status, COUNT(*) AS count FROM sensors GROUP BY status"
      );

      // Current alerts for this user (unresolved)
      const alerts = await query(
        'SELECT id, title, message, status, type, node_id, is_read, created_at FROM alerts WHERE (user_id = ? OR user_id IS NULL) ORDER BY created_at DESC LIMIT 20',
        [req.user.id]
      );

      // Latest sensor readings (sample)
      const recentReadings = await query(
        "SELECT node_id, sensor_type, value, unit, status, timestamp FROM sensor_readings ORDER BY timestamp DESC LIMIT 20"
      );

      return res.status(200).json({
        success: true,
        dashboard: {
          user: userPayload,
          farmOverview: {
            sensorsByStatus,
            currentAlerts: alerts,
            recentReadings
          },
          features: {
            weather: {},
            soilConditions: {},
            cropHealth: {},
            waterUsage: {}
          }
        }
      });
    }

    if (role === 'agronomist') {
      // Simple soil analysis aggregates
      const soilPh = await query(
        "SELECT AVG(value) AS avgPh FROM sensor_readings WHERE sensor_type = 'ph'"
      );
      const moisture = await query(
        "SELECT AVG(value) AS avgMoisture FROM sensor_readings WHERE sensor_type = 'moisture'"
      );

      // Recent pest alerts
      const pestAlerts = await query("SELECT id, title, message, created_at FROM alerts WHERE type LIKE '%pest%' ORDER BY created_at DESC LIMIT 50");

      return res.status(200).json({
        success: true,
        dashboard: {
          user: userPayload,
          soilAnalysis: {
            avgPh: soilPh[0]?.avgPh || null,
            avgMoisture: moisture[0]?.avgMoisture || null,
            pestAlerts
          },
          cropManagement: {},
          pestManagement: {}
        }
      });
    }

    if (role === 'technician') {
      const deviceStatus = await query(
        "SELECT status, COUNT(*) AS count FROM sensors GROUP BY status"
      );

      const offlineDevices = await query("SELECT node_id, zone, status, battery_level FROM sensors WHERE is_active = 1 AND status != 'NORMAL' ORDER BY updated_at DESC LIMIT 100");

      return res.status(200).json({
        success: true,
        dashboard: {
          user: userPayload,
          deviceStatus: {
            deviceStatus,
            offlineDevices
          },
          maintenanceJobs: {}
        }
      });
    }

    // Default fallback: limited info
    return res.status(200).json({ success: true, dashboard: { user: userPayload } });
  } catch (error) {
    next(error);
  }
};
