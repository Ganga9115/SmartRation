import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Shop = sequelize.define('Shop', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  address: { type: DataTypes.TEXT, allowNull: false },
  owner_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  phone: { type: DataTypes.STRING(15), allowNull: true },
  open_time: { type: DataTypes.TIME, defaultValue: '09:00:00' },
  close_time: { type: DataTypes.TIME, defaultValue: '17:00:00' },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'shops',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

export default Shop;