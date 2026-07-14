const sql = "CREATE TABLE IF NOT EXISTS test_sensor (id INT AUTO_INCREMENT PRIMARY KEY, status ENUM('NORMAL', 'WARNING', 'CRITICAL') NOT NULL DEFAULT 'NORMAL', last_value DECIMAL(12,4) DEFAULT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
const idx = sql.indexOf("last_value");
console.log('sql:', sql);
console.log('slice:', sql.slice(idx-40, idx+40));
console.log('codes:', sql.slice(idx-40, idx+40).split('').map(c => c.charCodeAt(0)).join(','));
