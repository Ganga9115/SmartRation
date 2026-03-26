import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Stock = sequelize.define('Stock', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },

  item_name: { type: DataTypes.STRING, allowNull: false },

  unit: { type: DataTypes.STRING, allowNull: false },

  total_qty: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },

  available_qty: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },

  per_family_qty: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },

}, {
  tableName: 'stock',
  timestamps: true,
  updatedAt: 'updated_at',
  createdAt: false,
});

export default Stock;