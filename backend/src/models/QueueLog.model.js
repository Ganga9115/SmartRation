import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const QueueLog = sequelize.define('QueueLog', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },

  token_number: { type: DataTypes.INTEGER.UNSIGNED },

  called_at: { type: DataTypes.DATE },

  served_at: { type: DataTypes.DATE },

  wait_seconds: { type: DataTypes.INTEGER.UNSIGNED },

  log_date: { type: DataTypes.DATEONLY },

}, {
  tableName: 'queue_log',
  timestamps: false,
});

export default QueueLog;