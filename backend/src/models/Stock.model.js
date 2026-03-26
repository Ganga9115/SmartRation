import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Stock = sequelize.define('Stock', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  shop_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  item_name: { type: DataTypes.STRING(100), allowNull: false },
  unit: { type: DataTypes.STRING(20), allowNull: false },
  total_qty: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  available_qty: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  per_family_qty: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
}, {
  tableName: 'stock',
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at',
});

export default Stock;