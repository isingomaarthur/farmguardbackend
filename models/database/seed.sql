CREATE DATABASE IF NOT EXISTS farmguard;
USE farmguard;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE daily_reports;
TRUNCATE TABLE alerts;
TRUNCATE TABLE sensor_readings;
TRUNCATE TABLE sensors;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Every sample account uses the password: password123
INSERT INTO users (name, email, password, farm_name, role, is_active) VALUES
('FarmGuard Admin', 'farmguard@gmail.com', '$2b$10$L9fzOpqxx/m3Ulcowil3NeTk8/GnCHsj29oy.LKPlOToq67TH8EpS', 'FarmGuard Central', 'admin', 1),
('Asha Namutebi', 'farmer1@farmguard.test', '$2b$10$L9fzOpqxx/m3Ulcowil3NeTk8/GnCHsj29oy.LKPlOToq67TH8EpS', 'Namutebi Farm', 'farmer', 1),
('Benjamin Okello', 'farmer2@farmguard.test', '$2b$10$L9fzOpqxx/m3Ulcowil3NeTk8/GnCHsj29oy.LKPlOToq67TH8EpS', 'Okello Agro', 'farmer', 1),
('David Kato', 'technician1@farmguard.test', '$2b$10$L9fzOpqxx/m3Ulcowil3NeTk8/GnCHsj29oy.LKPlOToq67TH8EpS', NULL, 'technician', 1),
('Eunice Nandawula', 'agronomist1@farmguard.test', '$2b$10$L9fzOpqxx/m3Ulcowil3NeTk8/GnCHsj29oy.LKPlOToq67TH8EpS', NULL, 'agronomist', 1);

INSERT INTO sensors (node_id, zone, type, position_x, position_y, status, last_value, last_unit, last_timestamp, threshold_warning_min, threshold_warning_max, threshold_critical_min, threshold_critical_max, is_active, battery_level, signal_strength) VALUES
('N1', 'North Field', 'Soil Moisture', 22.00, 28.00, 'NORMAL', 44.2, '%', NOW(), 35.0, 65.0, 30.0, 70.0, 1, 85.0, 95.0),
('N2', 'East Field', 'Soil pH', 68.00, 22.00, 'WARNING', 6.3, 'pH', NOW(), 6.0, 8.0, 5.5, 8.5, 1, 72.0, 88.0),
('N3', 'South Field', 'Soil Moisture', 40.00, 62.00, 'CRITICAL', 35.0, '%', NOW(), 35.0, 65.0, 30.0, 70.0, 1, 45.0, 72.0),
('N4', 'West Field', 'Humidity', 78.00, 70.00, 'NORMAL', 62.0, '%', NOW(), 45.0, 90.0, 40.0, 95.0, 1, 90.0, 92.0),
('N5', 'Greenhouse', 'Humidity', 15.00, 75.00, 'NORMAL', 68.0, '%', NOW(), 45.0, 90.0, 40.0, 95.0, 1, 88.0, 94.0);

INSERT INTO sensor_readings (node_id, value, unit, sensor_type, status, timestamp) VALUES
('N1', 44.2, '%', 'moisture', 'NORMAL', NOW()),
('N2', 6.3, 'pH', 'ph', 'WARNING', NOW()),
('N3', 35.0, '%', 'moisture', 'CRITICAL', NOW()),
('N4', 62.0, '%', 'humidity', 'NORMAL', NOW()),
('N5', 68.0, '%', 'humidity', 'NORMAL', NOW());

INSERT INTO alerts (title, message, status, type, node_id, is_read, user_id, resolved_at, created_at, updated_at) VALUES
('Low Soil Moisture', 'Soil moisture has dropped below 40%. Immediate irrigation recommended.', 'CRITICAL', 'low_moisture', 'N3', 0, NULL, NULL, NOW(), NOW()),
('Soil pH Low', 'pH level is at 6.3. Consider adding lime to raise soil pH.', 'WARNING', 'low_ph', 'N2', 0, NULL, NULL, NOW(), NOW()),
('Low Humidity Alert', 'Humidity has dropped to 45%. Consider adjusting irrigation.', 'WARNING', 'low_humidity', 'N1', 0, NULL, NULL, NOW(), NOW()),
('Humidity Back to Normal', 'Humidity levels have returned to the optimal range.', 'INFO', 'humidity_alert', 'N4', 1, NULL, NOW(), NOW(), NOW());

INSERT INTO daily_reports (report_date, user_id, average_humidity, average_moisture, average_ph, temperature_min, temperature_max, alerts_critical, alerts_warning, alerts_info, alerts_total, readings_count, active_nodes, generated_at, created_at, updated_at) VALUES
(CURDATE(), 1, 62.0, 39.7, 6.4, 18.5, 29.8, 1, 2, 1, 4, 25, 5, NOW(), NOW(), NOW());
