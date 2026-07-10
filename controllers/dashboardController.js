import { query } from '../config/db.js';

export const getDashboard = async (req, res, next) => {
  try {
    const [userCountResult] = await query('SELECT COUNT(*) AS totalUsers FROM users');
    const [activeUsersResult] = await query('SELECT COUNT(*) AS activeUsers FROM users WHERE is_active = 1');
    const [recentUsersResult] = await query(
      'SELECT COUNT(*) AS recentUsers FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
    );

    return res.status(200).json({
      success: true,
      dashboard: {
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          farmName: req.user.farm_name,
          role: req.user.role
        },
        stats: {
          totalUsers: userCountResult.totalUsers,
          activeUsers: activeUsersResult.activeUsers,
          recentUsers: recentUsersResult.recentUsers
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
