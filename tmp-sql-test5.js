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
  const conn = await pool.getConnection();
  const tests = [
    "CREATE TABLE IF NOT EXISTS tmp_test1 (id INT PRIMARY KEY, last_value DECIMAL(12,4) DEFAULT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
    "CREATE TABLE IF NOT EXISTS tmp_test2 (id INT PRIMARY KEY, `last_value` DECIMAL(12,4) DEFAULT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
    "CREATE TABLE IF NOT EXISTS tmp_test3 (id INT PRIMARY KEY, `last_value` INT DEFAULT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
    "CREATE TABLE IF NOT EXISTS tmp_test4 (id INT PRIMARY KEY, `status` ENUM('NORMAL','WARNING','CRITICAL') NOT NULL DEFAULT 'NORMAL') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
    "CREATE TABLE IF NOT EXISTS tmp_test5 (id INT PRIMARY KEY, last_value INT DEFAULT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
  ];

  for (const sql of tests) {
    console.log('---');
    console.log(sql);
    try {
      await conn.execute(sql);
      console.log('SUCCESS');
      const tableName = sql.match(/CREATE TABLE IF NOT EXISTS `(\w+)`/i)?.[1] || sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/i)?.[1];
      if (tableName) await conn.execute(`DROP TABLE IF EXISTS ${tableName}`);
    } catch (err) {
      console.error('FAIL', err.message);
      console.error(err.sql);
    }
  }

  conn.release();
  await pool.end();
})();
