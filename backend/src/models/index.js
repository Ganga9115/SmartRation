import sequelize from '../config/db.js';
import User from './User.model.js';
import RationCard from './RationCard.model.js';
import Shop from './Shop.model.js';
import Stock from './Stock.model.js';
import Booking from './Booking.model.js';
import QueueLog from './QueueLog.model.js';
import WelfareAlert from './WelfareAlert.model.js';
import BookingItem from './BookingItem.model.js';
// ── Relationships ─────────────────────────────────────────
User.hasOne(RationCard, { foreignKey: 'user_id' });
RationCard.belongsTo(User, { foreignKey: 'user_id' });

Shop.hasMany(Stock, { foreignKey: 'shop_id' });
Stock.belongsTo(Shop, { foreignKey: 'shop_id' });

// ── Shop ↔ RationCard  ✅ THIS WAS MISSING ────
Shop.hasMany(RationCard, { foreignKey: 'shop_id' });
RationCard.belongsTo(Shop, { foreignKey: 'shop_id' });

Booking.hasMany(BookingItem, { foreignKey: 'booking_id' });
BookingItem.belongsTo(Booking, { foreignKey: 'booking_id' });

User.hasMany(Booking, { foreignKey: 'user_id' });
Booking.belongsTo(User, { foreignKey: 'user_id' });

Shop.hasMany(Booking, { foreignKey: 'shop_id' });
Booking.belongsTo(Shop, { foreignKey: 'shop_id' });

RationCard.hasMany(Booking, { foreignKey: 'ration_card_id' });
Booking.belongsTo(RationCard, { foreignKey: 'ration_card_id' });

Booking.hasOne(QueueLog, { foreignKey: 'booking_id' });
QueueLog.belongsTo(Booking, { foreignKey: 'booking_id' });

User.hasMany(WelfareAlert, { foreignKey: 'user_id' });
WelfareAlert.belongsTo(User, { foreignKey: 'user_id' });

RationCard.hasMany(WelfareAlert, { foreignKey: 'ration_card_id' });
WelfareAlert.belongsTo(RationCard, { foreignKey: 'ration_card_id' });

export {
  sequelize,
  User,
  RationCard,
  Shop,
  Stock,
  Booking,
  BookingItem,
  QueueLog,
  WelfareAlert,
};