import { Booking, RationCard, Shop, Stock, QueueLog, BookingItem } from '../models/index.js';
import { generateQRCode } from '../utils/qrGenerator.js';
import { detectFraud } from '../ai/fraudDetector.js';
import { notifyBookingConfirmed } from '../utils/notificationService.js';
import { Op } from 'sequelize';
import sequelize from '../config/db.js';

/**
 * Calculate entitlement for each stock item based on family size.
 * Returns array of { item, allocated_qty } pairs.
 */
export const calculateEntitlements = async (shopId, familyMembers) => {
  const items = await Stock.findAll({ where: { shop_id: shopId } });

  return items.map(item => {
    const base      = parseFloat(item.min_qty_per_member) * familyMembers;
    const capped    = Math.min(base, parseFloat(item.max_qty_per_family || item.per_family_qty));
    const allocated = Math.round(capped * 4) / 4; // round to nearest 0.25

    return {
      id:            item.id,
      item_name:     item.item_name,
      unit:          item.unit,
      allocated_qty: allocated,
      is_optional:   item.is_optional,
      category:      item.category,
      available_qty: parseFloat(item.available_qty),
    };
  });
};

/**
 * Full booking creation with item selection.
 */
export const processBooking = async ({ userId, shopId, bookingDate, slotTime, selectedItems }) => {
  const t = await sequelize.transaction();

  try {
    // 1. Ration card check
    const rationCard = await RationCard.findOne({ where: { user_id: userId, is_active: true } });
    if (!rationCard) throw { status: 404, message: 'No active ration card found' };

    // 2. Fraud check
    const fraud = await detectFraud(userId, rationCard.id);
    if (fraud.isFraud) throw { status: 403, message: 'Booking blocked — suspicious activity detected', fraud };

    // 3. Duplicate cycle check
    const now         = new Date();
    const cycle_month = now.getMonth() + 1;
    const cycle_year  = now.getFullYear();

    const existing = await Booking.findOne({
      where: { ration_card_id: rationCard.id, cycle_month, cycle_year },
    });
    if (existing) throw {
      status: 409,
      message: `Already booked for ${cycle_month}/${cycle_year}`,
      existing_booking: { id: existing.id, status: existing.status },
    };

    // 4. Shop check
    const shop = await Shop.findByPk(shopId);
    if (!shop || !shop.is_active) throw { status: 404, message: 'Shop not found or inactive' };

    // 5. Slot capacity check
    const slotCount = await Booking.count({
      where: { shop_id: shopId, booking_date: bookingDate,
        slot_time: slotTime, status: { [Op.notIn]: ['cancelled'] } },
    });
    if (slotCount >= 10) throw { status: 409, message: 'Slot is full. Choose another slot' };

    // 6. Validate and check selected items stock
    const activeItems = selectedItems.filter(i => !i.is_skipped);
    for (const item of activeItems) {
      const stockItem = await Stock.findOne({ where: { shop_id: shopId, item_name: item.item_name } });
      if (!stockItem || parseFloat(stockItem.available_qty) < parseFloat(item.selected_qty)) {
        throw { status: 409, message: `Insufficient stock for ${item.item_name}` };
      }
    }

    // 7. Token number
    const lastToken   = await Booking.max('token_number', { where: { shop_id: shopId, booking_date: bookingDate } });
    const tokenNumber = (lastToken || 0) + 1;

    // 8. QR code
    const qr_code = await generateQRCode({
      token_number: tokenNumber,
      card_number:  rationCard.card_number,
      shop_id:      shopId,
      booking_date: bookingDate,
      slot_time:    slotTime,
      cycle:        `${cycle_month}/${cycle_year}`,
    });

    // 9. Create booking
    const booking = await Booking.create({
      user_id:        userId,
      ration_card_id: rationCard.id,
      shop_id:        shopId,
      booking_date:   bookingDate,
      slot_time:      slotTime,
      token_number:   tokenNumber,
      qr_code,
      status:         'confirmed',
      cycle_month,
      cycle_year,
    }, { transaction: t });

    // 10. Save booking items
    for (const item of selectedItems) {
      await BookingItem.create({
        booking_id:    booking.id,
        item_name:     item.item_name,
        unit:          item.unit,
        allocated_qty: item.allocated_qty,
        selected_qty:  item.is_skipped ? 0 : item.selected_qty,
        is_skipped:    item.is_skipped || false,
      }, { transaction: t });
    }

    // 11. Deduct stock only for selected (non-skipped) items
    for (const item of activeItems) {
      await Stock.decrement('available_qty', {
        by:    parseFloat(item.selected_qty),
        where: { shop_id: shopId, item_name: item.item_name },
        transaction: t,
      });
    }

    // 12. Queue log
    await QueueLog.create({
      shop_id: shopId, booking_id: booking.id,
      token_number: tokenNumber, log_date: bookingDate,
    }, { transaction: t });

    await t.commit();

    // 13. Send booking confirmed notification (outside transaction)
    await notifyBookingConfirmed(
      userId, rationCard.id, tokenNumber, bookingDate, slotTime
    );

    console.log(`🎫 Booking #${booking.id} | Token: ${tokenNumber} | Items: ${activeItems.length}`);

    return { booking, rationCard, shop, tokenNumber, qr_code, cycle: `${cycle_month}/${cycle_year}` };
  } catch (err) {
    try { await t.rollback(); } catch (_) {}
    throw err;
  }
};

/**
 * Cancel booking and restore stock.
 */
export const cancelBookingById = async (bookingId, userId) => {
  const t = await sequelize.transaction();
  try {
    const booking = await Booking.findOne({
      where: { id: bookingId, user_id: userId },
      include: [{ model: BookingItem }],
    });
    if (!booking) throw { status: 404, message: 'Booking not found' };
    if (['cancelled', 'completed'].includes(booking.status))
      throw { status: 400, message: `Booking already ${booking.status}` };

    // Restore stock only for non-skipped items
    for (const item of booking.BookingItems || []) {
      if (!item.is_skipped) {
        await Stock.increment('available_qty', {
          by:    parseFloat(item.selected_qty),
          where: { shop_id: booking.shop_id, item_name: item.item_name },
          transaction: t,
        });
      }
    }

    await booking.update({ status: 'cancelled' }, { transaction: t });
    await t.commit();
    return booking;
  } catch (err) {
    try { await t.rollback(); } catch (_) {}
    throw err;
  }
};