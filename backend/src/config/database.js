require('dotenv').config();
const { Pool } = require('pg');

// Ensure PostgreSQL connection uses Indian Standard Time (Asia/Kolkata)
process.env.PGTZ = 'Asia/Kolkata';

// Create PostgreSQL Connection Pool using DATABASE_URL or individual env variables
const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, options: '-c timezone=Asia/Kolkata' }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      database: process.env.DB_NAME || 'postgres',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      options: '-c timezone=Asia/Kolkata',
    };

const pool = new Pool(poolConfig);



/**
 * Connect and test connection to PostgreSQL database
 */
const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL Database connected successfully!');
    const res = await client.query('SELECT NOW()');
    console.log(`🕒 Database Server Time: ${res.rows[0].now}`);
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('👉 Please make sure PostgreSQL service is running and DB_PASSWORD in .env is correct.');
  }
};

module.exports = {
  pool,
  connectDB,
};
