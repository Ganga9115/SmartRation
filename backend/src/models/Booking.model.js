import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },

  booking_date: { type: DataTypes.DATEONLY },

  slot_time: { type: DataTypes.TIME },

  token_number: { type: DataTypes.INTEGER.UNSIGNED },

  qr_code: { type: DataTypes.TEXT },

  status: {
    type: DataTypes.ENUM('pending','confirmed','completed','cancelled','no_show'),
    defaultValue: 'pending'
  },

  cycle_month: { type: DataTypes.INTEGER.UNSIGNED },

  cycle_year: { type: DataTypes.INTEGER.UNSIGNED },

  ai_slot_score: { type: DataTypes.DECIMAL(5,4) },

}, {
  tableName: 'bookings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Booking;