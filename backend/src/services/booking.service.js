import { Booking, RationCard, Shop, Stock, QueueLog, BookingItem } from '../models/index.js';
import { generateQRCode } from '../utils/qrGenerator.js';
import { detectFraud } from '../ai/fraudDetector.js';
import { notifyBookingConfirmed } from '../utils/notificationService.js';
import { autoResolveAlerts } from './welfare.service.js';
import { Op } from 'sequelize';
import sequelize from '../config/db.js';

/**
 * Core booking creation logic extracted from the controller.
 * Returns the created booking or throws with a { status, message } error.
 */
export const processBooking = async ({ userId, shopId, bookingDate, slotTime, selectedItems = [] }) => {
  const t = await sequelize.transaction();

  try {
    // ── 1. Ration card check ─────────────────────────────
    const rationCard = await RationCard.findOne({ where: { user_id: userId, is_active: true } });
    if (!rationCard) {
      await t.rollback();
      throw { status: 404, message: 'No active ration card found. Please register your card first' };
    }

    // ── 2. Fraud check ───────────────────────────────────
    const fraud = await detectFraud(userId, rationCard.id);
    if (fraud.isFraud) {
      await t.rollback();
      throw {
        status:  403,
        message: 'Booking blocked due to suspicious activity. Please contact your local office.',
        fraud,
      };
    }

    // ── 3. Duplicate cycle check ─────────────────────────
    const now         = new Date();
    const cycle_month = now.getMonth() + 1;
    const cycle_year  = now.getFullYear();

    const existing = await Booking.findOne({
      where: { ration_card_id: rationCard.id, cycle_month, cycle_year },
    });
    if (existing) {
      await t.rollback();
      throw {
        status:  409,
        message: `You have already booked for ${cycle_month}/${cycle_year}`,
        existing_booking: { id: existing.id, status: existing.status },
      };
    }

    // ── 4. Shop check ────────────────────────────────────
    const shop = await Shop.findByPk(shopId);
    if (!shop || !shop.is_active) {
      await t.rollback();
      throw { status: 404, message: 'Shop not found or inactive' };
    }

    // ── 5. Slot capacity check ───────────────────────────
    const slotCount = await Booking.count({
      where: {
        shop_id:      shopId,
        booking_date: bookingDate,
        slot_time:    slotTime,
        status:       { [Op.notIn]: ['cancelled'] },
      },
    });
    if (slotCount >= 10) {
      await t.rollback();
      throw { status: 409, message: 'This slot is full. Please choose another slot' };
    }

    // ── 6. Stock check & item resolution ─────────────────
    // If selectedItems provided, use those; otherwise fall back to all stock items
    const stockItems = await Stock.findAll({ where: { shop_id: shopId } });

    // Build a map of item_name -> stock record for quick lookup
    const stockMap = {};
    for (const s of stockItems) {
      stockMap[s.item_name] = s;
    }

    // Determine which items to actually deduct (non-skipped selected items)
    const itemsToProcess = selectedItems.length > 0 ? selectedItems : stockItems.map(s => ({
      item_name:     s.item_name,
      unit:          s.unit,
      allocated_qty: s.per_family_qty,
      selected_qty:  s.per_family_qty,
      is_skipped:    false,
    }));

    // Validate stock for non-skipped items
    for (const item of itemsToProcess) {
      if (item.is_skipped) continue;
      const stock = stockMap[item.item_name];
      if (!stock) continue;
      if (parseFloat(stock.available_qty) < parseFloat(item.selected_qty)) {
        await t.rollback();
        throw { status: 409, message: `Insufficient stock for ${item.item_name}` };
      }
    }

    // ── 7. Token number ──────────────────────────────────
    const lastToken   = await Booking.max('token_number', { where: { shop_id: shopId, booking_date: bookingDate } });
    const tokenNumber = (lastToken || 0) + 1;

    // ── 8. QR code ───────────────────────────────────────
    const qrData = {
      booking_id:   null,   // filled after creation
      token_number: tokenNumber,
      card_number:  rationCard.card_number,
      shop_id:      shopId,
      booking_date: bookingDate,
      slot_time:    slotTime,
      cycle:        `${cycle_month}/${cycle_year}`,
    };
    const qr_code = await generateQRCode(qrData);

    // ── 9. Create booking ────────────────────────────────
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
      ai_slot_score:  null,
    }, { transaction: t });

    // ── 10. Create BookingItems ──────────────────────────
    for (const item of itemsToProcess) {
      await BookingItem.create({
        booking_id:    booking.id,
        item_name:     item.item_name,
        unit:          item.unit,
        allocated_qty: item.allocated_qty,
        selected_qty:  item.is_skipped ? 0 : item.selected_qty,
        is_skipped:    item.is_skipped || false,
      }, { transaction: t });
    }

    // ── 11. Deduct stock for non-skipped items ────────────
    for (const item of itemsToProcess) {
      if (item.is_skipped) continue;
      const stock = stockMap[item.item_name];
      if (!stock) continue;
      await Stock.update(
        { available_qty: sequelize.literal(`available_qty - ${parseFloat(item.selected_qty)}`) },
        { where: { id: stock.id }, transaction: t }
      );
    }

    // ── 12. Queue log ────────────────────────────────────
    await QueueLog.create({
      shop_id:      shopId,
      booking_id:   booking.id,
      token_number: tokenNumber,
      log_date:     bookingDate,
    }, { transaction: t });

    await t.commit();

    // ── 13. Auto-resolve any open missed_collection alerts ─
    try {
      await autoResolveAlerts(userId, rationCard.id, 'missed_collection');
    } catch (_) {}

    // ── 14. Send booking confirmation notification ────────
    try {
      await notifyBookingConfirmed(userId, rationCard.id, tokenNumber, bookingDate, slotTime);
    } catch (_) {}

    return {
      booking,
      rationCard,
      shop,
      tokenNumber,
      qr_code,
      cycle: `${cycle_month}/${cycle_year}`,
    };
  } catch (err) {
    // Only rollback if transaction is still active
    try { await t.rollback(); } catch (_) {}
    throw err;
  }
};

/**
 * Cancel a booking and restore stock for non-skipped items.
 */
export const cancelBookingById = async (bookingId, userId) => {
  const t = await sequelize.transaction();

  try {
    const booking = await Booking.findOne({
      where:   { id: bookingId, user_id: userId },
      include: [{ model: BookingItem }],
    });
    if (!booking) throw { status: 404, message: 'Booking not found' };
    if (['cancelled', 'completed'].includes(booking.status))
      throw { status: 400, message: `Booking is already ${booking.status}` };

    // Restore stock for each non-skipped item
    const items = booking.BookingItems || [];
    for (const item of items) {
      if (item.is_skipped) continue;
      await Stock.update(
        { available_qty: sequelize.literal(`LEAST(available_qty + ${parseFloat(item.selected_qty)}, total_qty)`) },
        { where: { shop_id: booking.shop_id, item_name: item.item_name }, transaction: t }
      );
    }

    // Fallback: if no BookingItems, restore using per_family_qty (legacy)
    if (items.length === 0) {
      const stockItems = await Stock.findAll({ where: { shop_id: booking.shop_id } });
      for (const s of stockItems) {
        await Stock.update(
          { available_qty: sequelize.literal(`LEAST(available_qty + ${s.per_family_qty}, total_qty)`) },
          { where: { id: s.id }, transaction: t }
        );
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

export const calculateEntitlements = async (shopId, familyMembers) => {
  const stockItems = await Stock.findAll({ where: { shop_id: shopId } });

  return stockItems.map(item => ({
    item_name:      item.item_name,
    unit:           item.unit,
    per_family_qty: parseFloat(item.per_family_qty),
    allocated_qty:  parseFloat(item.per_family_qty),   // alias for frontend
    total_quantity: parseFloat(item.per_family_qty) * familyMembers,
    is_optional:    item.is_optional,
    category:       item.category,
  }));
};