const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'aspatrans',
});

const query = async (text, params) => {
  return pool.query(text, params);
};

// Test connection
if (require.main === module) {
  (async () => {
    try {
      const res = await query('SELECT NOW() as now');
      console.log('DB connected. NOW =', res.rows[0].now);
      process.exit(0);
    } catch (e) {
      console.error('DB connection failed:', e);
      process.exit(1);
    }
  })();
}

module.exports = { query };
