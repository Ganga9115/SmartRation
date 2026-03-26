import { Sequelize } from 'sequelize';
import { config } from './env.js';

const sequelize = new Sequelize(
  config.db.name,
  config.db.user,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: 'mysql',

    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },

    timezone: '+05:30', // IST
    logging: false,
  }
);

// 🔹 Test connection (same like your function)
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Sequelize MySQL connected successfully');
  } catch (err) {
    console.error('❌ Sequelize connection failed:', err.message);
    process.exit(1);
  }
};

export default sequelize;