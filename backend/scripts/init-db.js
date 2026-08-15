require('dotenv').config();
const { initDatabase } = require('../src/database/init');
const { pool } = require('../src/config/database');

const run = async () => {
  try {
    await initDatabase();
    process.exit(0);
  } catch (err) {
    console.error('Database migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

run();
