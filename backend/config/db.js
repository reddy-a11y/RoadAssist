const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3307', 10),
  user: process.env.DB_USER || 'roadassist',
  password: process.env.DB_PASSWORD || 'roadassist123',
  database: process.env.DB_NAME || 'roadassist',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

// Test connection
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log(`[Database] Successfully connected to MySQL at ${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || '3307'}`);
    conn.release();
  } catch (error) {
    console.error('[Database] Connection failed:', error.message);
  }
}

testConnection();

module.exports = pool;
