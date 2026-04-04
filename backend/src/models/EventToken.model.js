// src/models/EventToken.model.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const EventToken = sequelize.define('EventToken', {
  id:              { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  event_id:        { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  user_id:         { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  ration_card_id:  { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  token_number:    { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  assigned_date:   { type: DataTypes.DATEONLY, allowNull: false },
  slot_time:       { type: DataTypes.TIME, allowNull: false },
  qr_code:         { type: DataTypes.TEXT, allowNull: true },
  status: {
    type: DataTypes.ENUM('active', 'used', 'cancelled', 'no_show'),
    defaultValue: 'active',
  },
}, {
  tableName:  'event_tokens',
  timestamps: true,
  createdAt:  'created_at',
  updatedAt:  'updated_at',
});

export default EventToken;