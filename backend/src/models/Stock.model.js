import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Stock = sequelize.define('Stock', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  shop_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  item_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  unit: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  total_qty: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  available_qty: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  per_family_qty: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  min_qty_per_member: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  max_qty_per_family: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  is_optional: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  category: {
    type: DataTypes.STRING(50),
    defaultValue: 'other',
  },
}, {
  tableName:  'stock',
  timestamps: true,
  createdAt:  'created_at',
  updatedAt:  false,
});

export default Stock;