// src/models/SpecialEvent.model.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const SpecialEvent = sequelize.define('SpecialEvent', {
  id:               { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  name:             { type: DataTypes.STRING(200), allowNull: false },
  description:      { type: DataTypes.TEXT, allowNull: true },
  shop_id:          { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  start_date:       { type: DataTypes.DATEONLY, allowNull: false },
  end_date:         { type: DataTypes.DATEONLY, allowNull: false },
  open_time:        { type: DataTypes.TIME, defaultValue: '09:00:00' },
  close_time:       { type: DataTypes.TIME, defaultValue: '17:00:00' },
  tokens_per_day:   { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 50 },
  slot_duration_mins: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 30 },
  is_active:        { type: DataTypes.BOOLEAN, defaultValue: true },
  created_by:       { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
}, {
  tableName:  'special_events',
  timestamps: true,
  createdAt:  'created_at',
  updatedAt:  'updated_at',
});

export default SpecialEvent;