const sql = [
  'CREATE TABLE IF NOT EXISTS test_sensor (',
  '  id INT AUTO_INCREMENT PRIMARY KEY,',
  '  status ENUM(\'NORMAL\', \'WARNING\', \'CRITICAL\') NOT NULL DEFAULT \'NORMAL\',',
  '  last_value DECIMAL(12,4) DEFAULT NULL,',
  '  last_unit VARCHAR(50) DEFAULT NULL,',
  '  last_timestamp DATETIME DEFAULT NULL,',
  '  threshold_warning_min DECIMAL(12,4) DEFAULT NULL,',
  '  threshold_warning_max DECIMAL(12,4) DEFAULT NULL,',
  '  threshold_critical_min DECIMAL(12,4) DEFAULT NULL,',
  '  threshold_critical_max DECIMAL(12,4) DEFAULT NULL,',
  '  is_active TINYINT(1) NOT NULL DEFAULT 1,',
  '  battery_level DECIMAL(5,2) DEFAULT NULL,',
  '  signal_strength DECIMAL(5,2) DEFAULT NULL,',
  '  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,',
  '  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
  ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
].join('\n');
console.log(JSON.stringify(sql));
console.log(sql.split('').map((c, i) => [i, c, c.charCodeAt(0)]).slice(0, 140));
