import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const WelfareAlert = sequelize.define('WelfareAlert', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },

  alert_type: {
    type: DataTypes.ENUM('missed_collection','inactivity_warning','fraud_flag','stock_low')
  },

  message: { type: DataTypes.TEXT },

  is_resolved: { type: DataTypes.BOOLEAN, defaultValue: false },

  resolved_at: { type: DataTypes.DATE },

}, {
  tableName: 'welfare_alerts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

export default WelfareAlert;