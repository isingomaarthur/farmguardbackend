import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();
(async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'farmguard',
    waitForConnections: true,
    connectionLimit: 1,
    queueLimit: 0,
    timezone: 'Z'
  });

  const sql = "CREATE TABLE IF NOT EXISTS sensors (\n" +
    "  id INT AUTO_INCREMENT PRIMARY KEY,\n" +
    "  node_id VARCHAR(100) NOT NULL UNIQUE,\n" +
    "  zone VARCHAR(150) NOT NULL,\n" +
    "  sensor_type VARCHAR(100) NOT NULL,\n" +
    "  position_x DECIMAL(10,4) DEFAULT NULL,\n" +
    "  position_y DECIMAL(10,4) DEFAULT NULL,\n" +
    "  status ENUM('NORMAL', 'WARNING', 'CRITICAL') NOT NULL DEFAULT 'NORMAL',\n" +
    "  last_value DECIMAL(12,4) DEFAULT NULL,\n" +
    "  last_unit VARCHAR(50) DEFAULT NULL,\n" +
    "  last_timestamp DATETIME DEFAULT NULL,\n" +
    "  threshold_warning_min DECIMAL(12,4) DEFAULT NULL,\n" +
    "  threshold_warning_max DECIMAL(12,4) DEFAULT NULL,\n" +
    "  threshold_critical_min DECIMAL(12,4) DEFAULT NULL,\n" +
    "  threshold_critical_max DECIMAL(12,4) DEFAULT NULL,\n" +
    "  is_active TINYINT(1) NOT NULL DEFAULT 1,\n" +
    "  battery_level DECIMAL(5,2) DEFAULT NULL,\n" +
    "  signal_strength DECIMAL(5,2) DEFAULT NULL,\n" +
    "  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n" +
    "  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n" +
    ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

  console.log(sql);
  try {
    const conn = await pool.getConnection();
    await conn.execute(sql);
    console.log('CREATE TABLE succeeded');
    conn.release();
  } catch (err) {
    console.error('CREATE TABLE failed', err.message);
    console.error(err.sql);
  } finally {
    await pool.end();
  }
})();
