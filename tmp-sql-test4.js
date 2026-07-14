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

  const sql = `CREATE TABLE IF NOT EXISTS tmp_test (
    id INT PRIMARY KEY,
    last_value DECIMAL(12,4) DEFAULT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`;

  console.log('SQL:');
  console.log(sql);
  console.log('---');
  try {
    await conn.execute(sql);
    console.log('success');
    await conn.execute('DROP TABLE IF EXISTS tmp_test');
  } catch (err) {
    console.error('failed', err.message);
    console.error(err.sql);
  } finally {
    conn.release();
    await pool.end();
  }
})();
