const { Sequelize } = require('sequelize');

let sequelize;
const logQuery = process.env.NODE_ENV === 'development' ? console.log : false;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    timezone: '+05:30', // India Timezone
    logging: logQuery,
    dialectOptions: {
      useUTC: false,
    },
  });
} else {
  sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    database: process.env.DB_NAME || 'postgres',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    timezone: '+05:30',
    logging: logQuery,
    dialectOptions: {
      useUTC: false,
    },
  });
}

module.exports = sequelize;
