import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

console.log('Database configuration:', process.env.DB_PASSWORD, process.env.DB_NAME);
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'farmguard',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: 'Z'
});

export const initializeDatabase = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) DEFAULT NULL,
        phone VARCHAR(50) DEFAULT NULL,
        address VARCHAR(500) DEFAULT NULL,
        profile_photo VARCHAR(500) DEFAULT NULL,
        farm_name VARCHAR(255) DEFAULT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'farmer',
        notification_preferences JSON DEFAULT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await connection.execute(`
      ALTER TABLE users
      MODIFY COLUMN role VARCHAR(50) NOT NULL DEFAULT 'farmer'
    `);

    const addUserColumn = async (columnSql) => {
      try {
        await connection.execute(columnSql);
      } catch (error) {
        if (error.code !== 'ER_DUP_FIELDNAME' && error.code !== 'ER_DUP_KEYNAME' && error.code !== 'ER_TABLE_EXISTS_ERROR') {
          throw error;
        }
      }
    };

    await addUserColumn("ALTER TABLE users ADD COLUMN phone VARCHAR(50) DEFAULT NULL");
    await addUserColumn("ALTER TABLE users ADD COLUMN address VARCHAR(500) DEFAULT NULL");
    await addUserColumn("ALTER TABLE users ADD COLUMN profile_photo VARCHAR(500) DEFAULT NULL");
    await addUserColumn("ALTER TABLE users ADD COLUMN notification_preferences JSON DEFAULT NULL");
    await connection.execute(`ALTER TABLE users MODIFY COLUMN password VARCHAR(255) DEFAULT NULL`);

    await connection.execute(
      "CREATE TABLE IF NOT EXISTS sensors (\n" +
      "  id INT AUTO_INCREMENT PRIMARY KEY,\n" +
      "  node_id VARCHAR(100) NOT NULL UNIQUE,\n" +
      "  zone VARCHAR(150) NOT NULL,\n" +
      "  sensor_type VARCHAR(100) NOT NULL,\n" +
      "  position_x DECIMAL(10,4) DEFAULT NULL,\n" +
      "  position_y DECIMAL(10,4) DEFAULT NULL,\n" +
      "  status VARCHAR(50) NOT NULL DEFAULT 'NORMAL',\n" +
      "  `last_value` DECIMAL(12,4) DEFAULT NULL,\n" +
      "  `last_unit` VARCHAR(50) DEFAULT NULL,\n" +
      "  `last_timestamp` DATETIME DEFAULT NULL,\n" +
      "  threshold_warning_min DECIMAL(12,4) DEFAULT NULL,\n" +
      "  threshold_warning_max DECIMAL(12,4) DEFAULT NULL,\n" +
      "  threshold_critical_min DECIMAL(12,4) DEFAULT NULL,\n" +
      "  threshold_critical_max DECIMAL(12,4) DEFAULT NULL,\n" +
      "  is_active TINYINT(1) NOT NULL DEFAULT 1,\n" +
      "  battery_level DECIMAL(5,2) DEFAULT NULL,\n" +
      "  signal_strength DECIMAL(5,2) DEFAULT NULL,\n" +
      "  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n" +
      "  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n" +
      ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    );

    await connection.execute(
      "CREATE TABLE IF NOT EXISTS sensor_readings (\n" +
      "  id INT AUTO_INCREMENT PRIMARY KEY,\n" +
      "  node_id VARCHAR(100) NOT NULL,\n" +
      "  value DECIMAL(12,4) NOT NULL,\n" +
      "  unit VARCHAR(50) DEFAULT NULL,\n" +
      "  sensor_type VARCHAR(100) NOT NULL,\n" +
      "  status VARCHAR(50) NOT NULL DEFAULT 'NORMAL',\n" +
      "  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n" +
      "  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n" +
      "  INDEX idx_sensor_readings_node_id (node_id),\n" +
      "  INDEX idx_sensor_readings_timestamp (timestamp)\n" +
      ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    );

    await connection.execute(
      "CREATE TABLE IF NOT EXISTS alerts (\n" +
      "  id INT AUTO_INCREMENT PRIMARY KEY,\n" +
      "  title VARCHAR(255) NOT NULL,\n" +
      "  message TEXT NOT NULL,\n" +
      "  status VARCHAR(50) NOT NULL DEFAULT 'NORMAL',\n" +
      "  type VARCHAR(50) NOT NULL,\n" +
      "  node_id VARCHAR(100) DEFAULT NULL,\n" +
      "  is_read TINYINT(1) NOT NULL DEFAULT 0,\n" +
      "  user_id INT DEFAULT NULL,\n" +
      "  resolved_at DATETIME DEFAULT NULL,\n" +
      "  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n" +
      "  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n" +
      "  INDEX idx_alerts_node_id (node_id),\n" +
      "  INDEX idx_alerts_status (status)\n" +
      ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    );

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS daily_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        report_date DATE NOT NULL,
        user_id INT DEFAULT NULL,
        average_humidity DECIMAL(10,4) DEFAULT NULL,
        average_moisture DECIMAL(10,4) DEFAULT NULL,
        average_ph DECIMAL(10,4) DEFAULT NULL,
        temperature_min DECIMAL(10,4) DEFAULT NULL,
        temperature_max DECIMAL(10,4) DEFAULT NULL,
        alerts_critical INT DEFAULT 0,
        alerts_warning INT DEFAULT 0,
        alerts_info INT DEFAULT 0,
        alerts_total INT DEFAULT 0,
        readings_count INT DEFAULT 0,
        active_nodes INT DEFAULT 0,
        generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  } finally {
    connection.release();
  }
};

export const query = async (text, params = []) => {
  const [rows] = await pool.execute(text, params);
  return rows;
};

export default pool;
