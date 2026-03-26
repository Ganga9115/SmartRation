import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const WelfareAlert = sequelize.define('WelfareAlert', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  ration_card_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  alert_type: {
    type: DataTypes.ENUM('missed_collection', 'inactivity_warning', 'fraud_flag', 'stock_low'),
    allowNull: false,
  },
  message: { type: DataTypes.TEXT, allowNull: false },
  is_resolved: { type: DataTypes.BOOLEAN, defaultValue: false },
  resolved_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'welfare_alerts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

export default WelfareAlert;