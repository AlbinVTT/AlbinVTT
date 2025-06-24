const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.PGHOST || 'postgres',
  database: process.env.PGDATABASE || 'emartdb',
  user: process.env.PGUSER || 'emartuser',
  password: process.env.PGPASSWORD || 'emartpass',
  port: 5432,
});
module.exports = pool;
