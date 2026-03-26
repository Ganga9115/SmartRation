import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const RationCard = sequelize.define('RationCard', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  card_number: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  card_type: { type: DataTypes.ENUM('APL', 'BPL', 'AAY'), allowNull: false },
  family_members: { type: DataTypes.TINYINT.UNSIGNED, defaultValue: 1 },
  address: { type: DataTypes.TEXT, allowNull: false },
  shop_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  last_collected: { type: DataTypes.DATEONLY, allowNull: true },
}, {
  tableName: 'ration_cards',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default RationCard;