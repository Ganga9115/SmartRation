import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const BookingItem = sequelize.define('BookingItem', {
  id:            { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  booking_id:    { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  item_name:     { type: DataTypes.STRING(100),      allowNull: false },
  unit:          { type: DataTypes.STRING(20),        allowNull: false },
  allocated_qty: { type: DataTypes.DECIMAL(10,2),    allowNull: false },
  selected_qty:  { type: DataTypes.DECIMAL(10,2),    allowNull: false },
  is_skipped:    { type: DataTypes.BOOLEAN,           defaultValue: false },
}, {
  tableName:  'booking_items',
  timestamps: false,
});

export default BookingItem;