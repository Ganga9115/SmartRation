import sequelize from '../config/db.js';
import User         from './User.model.js';
import RationCard   from './RationCard.model.js';
import Shop         from './Shop.model.js';
import Stock        from './Stock.model.js';
import Booking      from './Booking.model.js';
import QueueLog     from './QueueLog.model.js';
import WelfareAlert from './WelfareAlert.model.js';
import BookingItem  from './BookingItem.model.js';
import SpecialEvent from './SpecialEvent.model.js';
import EventToken   from './EventToken.model.js';

// ── User ↔ RationCard ─────────────────────────────────────
User.hasOne(RationCard, { foreignKey: 'user_id' });
RationCard.belongsTo(User, { foreignKey: 'user_id' });

// ── Shop ↔ Stock ──────────────────────────────────────────
Shop.hasMany(Stock, { foreignKey: 'shop_id' });
Stock.belongsTo(Shop, { foreignKey: 'shop_id' });

// ── Shop ↔ RationCard ─────────────────────────────────────
Shop.hasMany(RationCard, { foreignKey: 'shop_id' });
RationCard.belongsTo(Shop, { foreignKey: 'shop_id' });

// ── Booking ↔ BookingItem ─────────────────────────────────
Booking.hasMany(BookingItem, { foreignKey: 'booking_id' });
BookingItem.belongsTo(Booking, { foreignKey: 'booking_id' });

// ── User ↔ Booking ────────────────────────────────────────
User.hasMany(Booking, { foreignKey: 'user_id' });
Booking.belongsTo(User, { foreignKey: 'user_id' });

// ── Shop ↔ Booking ────────────────────────────────────────
Shop.hasMany(Booking, { foreignKey: 'shop_id' });
Booking.belongsTo(Shop, { foreignKey: 'shop_id' });

// ── RationCard ↔ Booking ──────────────────────────────────
RationCard.hasMany(Booking, { foreignKey: 'ration_card_id' });
Booking.belongsTo(RationCard, { foreignKey: 'ration_card_id' });

// ── Booking ↔ QueueLog ────────────────────────────────────
Booking.hasOne(QueueLog, { foreignKey: 'booking_id' });
QueueLog.belongsTo(Booking, { foreignKey: 'booking_id' });

// ── User ↔ WelfareAlert ───────────────────────────────────
User.hasMany(WelfareAlert, { foreignKey: 'user_id' });
WelfareAlert.belongsTo(User, { foreignKey: 'user_id' });

// ── RationCard ↔ WelfareAlert ─────────────────────────────
RationCard.hasMany(WelfareAlert, { foreignKey: 'ration_card_id' });
WelfareAlert.belongsTo(RationCard, { foreignKey: 'ration_card_id' });

// ── Shop ↔ SpecialEvent ───────────────────────────────────
Shop.hasMany(SpecialEvent, { foreignKey: 'shop_id' });
SpecialEvent.belongsTo(Shop, { foreignKey: 'shop_id' });

// ── SpecialEvent ↔ EventToken ─────────────────────────────
SpecialEvent.hasMany(EventToken, { foreignKey: 'event_id' });
EventToken.belongsTo(SpecialEvent, { foreignKey: 'event_id' });

// ── User ↔ EventToken ─────────────────────────────────────
User.hasMany(EventToken, { foreignKey: 'user_id' });
EventToken.belongsTo(User, { foreignKey: 'user_id' });

// ── RationCard ↔ EventToken ───────────────────────────────
RationCard.hasMany(EventToken, { foreignKey: 'ration_card_id' });
EventToken.belongsTo(RationCard, { foreignKey: 'ration_card_id' });

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
  SpecialEvent,
  EventToken,
};