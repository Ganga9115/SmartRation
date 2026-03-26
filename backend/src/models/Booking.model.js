import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  ration_card_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  shop_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  booking_date: { type: DataTypes.DATEONLY, allowNull: false },
  slot_time: { type: DataTypes.TIME, allowNull: false },
  token_number: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  qr_code: { type: DataTypes.TEXT, allowNull: true },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no_show'),
    defaultValue: 'pending',
  },
  cycle_month: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false },
  cycle_year: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false },
  ai_slot_score: { type: DataTypes.DECIMAL(5, 4), allowNull: true },
}, {
  tableName: 'bookings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Booking;