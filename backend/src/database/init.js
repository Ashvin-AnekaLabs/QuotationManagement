const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');
const { sequelize } = require('../models');

/**
 * Reads schema.sql and executes table setup queries against PostgreSQL
 * Also syncs Sequelize models
 */
const initDatabase = async () => {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('🔄 Initializing Database tables...');
    await pool.query(sql);
    console.log('✅ Database tables initialized successfully!');

    console.log('🔄 Authenticating Sequelize connection...');
    await sequelize.authenticate();
    console.log('✅ Sequelize connection established successfully.');

    console.log('🔄 Syncing Sequelize models...');
    await sequelize.sync({ alter: true });
    console.log('✅ Sequelize models synced successfully!');
  } catch (error) {
    console.error('❌ Failed to initialize database tables:', error.message);
    throw error;
  }
};

module.exports = {
  initDatabase,
};
