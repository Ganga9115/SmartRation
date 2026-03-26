import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const RationCard = sequelize.define('RationCard', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },

  card_number: { type: DataTypes.STRING(20), unique: true },

  card_type: {
    type: DataTypes.ENUM('APL','BPL','AAY'),
    allowNull: false
  },

  family_members: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 1 },

  address: { type: DataTypes.TEXT, allowNull: false },

  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },

  last_collected: { type: DataTypes.DATEONLY },

}, {
  tableName: 'ration_cards',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default RationCard;