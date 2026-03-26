import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const QueueLog = sequelize.define('QueueLog', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  shop_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  booking_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  token_number: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  called_at: { type: DataTypes.DATE, allowNull: true },
  served_at: { type: DataTypes.DATE, allowNull: true },
  wait_seconds: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  log_date: { type: DataTypes.DATEONLY, allowNull: false },
}, {
  tableName: 'queue_log',
  timestamps: false,
});

export default QueueLog;