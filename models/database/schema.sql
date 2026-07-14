CREATE DATABASE IF NOT EXISTS farmguard;
USE farmguard;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS daily_reports;
DROP TABLE IF EXISTS alerts;
DROP TABLE IF EXISTS sensor_readings;
DROP TABLE IF EXISTS sensors;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  address VARCHAR(500) DEFAULT NULL,
  profile_photo VARCHAR(500) DEFAULT NULL,
  farm_name VARCHAR(255) DEFAULT NULL,
  role ENUM('admin', 'farmer', 'technician', 'agronomist') NOT NULL DEFAULT 'farmer',
  notification_preferences JSON DEFAULT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE sensors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  node_id VARCHAR(100) NOT NULL UNIQUE,
  zone VARCHAR(150) NOT NULL,
  type ENUM('Soil Moisture', 'Soil pH', 'Humidity', 'Temperature', 'Pressure') NOT NULL,
  position_x DECIMAL(10,4) DEFAULT NULL,
  position_y DECIMAL(10,4) DEFAULT NULL,
  status ENUM('NORMAL', 'WARNING', 'CRITICAL') NOT NULL DEFAULT 'NORMAL',
  last_value DECIMAL(12,4) DEFAULT NULL,
  last_unit VARCHAR(50) DEFAULT NULL,
  last_timestamp DATETIME DEFAULT NULL,
  threshold_warning_min DECIMAL(12,4) DEFAULT NULL,
  threshold_warning_max DECIMAL(12,4) DEFAULT NULL,
  threshold_critical_min DECIMAL(12,4) DEFAULT NULL,
  threshold_critical_max DECIMAL(12,4) DEFAULT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  battery_level DECIMAL(5,2) DEFAULT NULL,
  signal_strength DECIMAL(5,2) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE sensor_readings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  node_id VARCHAR(100) NOT NULL,
  value DECIMAL(12,4) NOT NULL,
  unit VARCHAR(50) DEFAULT NULL,
  sensor_type ENUM('humidity', 'moisture', 'ph', 'temperature', 'pressure') NOT NULL,
  status ENUM('NORMAL', 'WARNING', 'CRITICAL') NOT NULL DEFAULT 'NORMAL',
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sensor_readings_node_id (node_id),
  INDEX idx_sensor_readings_timestamp (timestamp),
  CONSTRAINT fk_sensor_readings_sensor FOREIGN KEY (node_id) REFERENCES sensors(node_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('CRITICAL', 'WARNING', 'INFO', 'NORMAL') NOT NULL DEFAULT 'NORMAL',
  type ENUM('low_moisture', 'high_moisture', 'low_ph', 'high_ph', 'low_humidity', 'high_humidity', 'temperature_alert', 'system_alert', 'humidity_alert', 'moisture_alert', 'ph_alert') NOT NULL,
  node_id VARCHAR(100) DEFAULT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  user_id INT DEFAULT NULL,
  resolved_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_alerts_node_id (node_id),
  INDEX idx_alerts_status (status),
  CONSTRAINT fk_alerts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE daily_reports (
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_daily_reports_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
