import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },

  name: { type: DataTypes.STRING(100), allowNull: false },

  phone: { type: DataTypes.STRING(15), allowNull: false, unique: true },

  email: { type: DataTypes.STRING(150), allowNull: true, unique: true },

  password_hash: { type: DataTypes.STRING, allowNull: false },

  role: {
    type: DataTypes.ENUM('user','admin','shop_owner'),
    defaultValue: 'user'
  },

  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },

}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default User;