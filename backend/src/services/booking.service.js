import { Booking, RationCard, Shop, Stock, QueueLog } from '../models/index.js';
import { generateQRCode } from '../utils/qrGenerator.js';
import { detectFraud } from '../ai/fraudDetector.js';
import { Op } from 'sequelize';
import sequelize from '../config/db.js';

/**
 * Core booking creation logic extracted from the controller.
 * Returns the created booking or throws with a { status, message } error.
 */
export const processBooking = async ({ userId, shopId, bookingDate, slotTime }) => {
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
        status: 409,
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

    // ── 6. Stock check ───────────────────────────────────
    const stockItems = await Stock.findAll({ where: { shop_id: shopId } });
    for (const item of stockItems) {
      if (item.available_qty < item.per_family_qty) {
        await t.rollback();
        throw { status: 409, message: `Insufficient stock for ${item.item_name}` };
      }
    }

    // ── 7. Token number ──────────────────────────────────
    const lastToken  = await Booking.max('token_number', { where: { shop_id: shopId, booking_date: bookingDate } });
    const tokenNumber = (lastToken || 0) + 1;

    // ── 8. QR code ───────────────────────────────────────
    const qrData = {
      booking_id: null,
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

    // ── 10. Deduct stock ─────────────────────────────────
    for (const item of stockItems) {
      await Stock.update(
        { available_qty: sequelize.literal(`available_qty - ${item.per_family_qty}`) },
        { where: { id: item.id }, transaction: t }
      );
    }

    // ── 11. Queue log ────────────────────────────────────
    await QueueLog.create({
      shop_id:      shopId,
      booking_id:   booking.id,
      token_number: tokenNumber,
      log_date:     bookingDate,
    }, { transaction: t });

    await t.commit();

    return {
      booking,
      rationCard,
      shop,
      tokenNumber,
      qr_code,
      cycle: `${cycle_month}/${cycle_year}`,
    };
  } catch (err) {
    // Only rollback if transaction still active (not already rolled back)
    try { await t.rollback(); } catch (_) {}
    throw err;
  }
};

/**
 * Cancel a booking and restore stock.
 */
export const cancelBookingById = async (bookingId, userId) => {
  const t = await sequelize.transaction();

  try {
    const booking = await Booking.findOne({ where: { id: bookingId, user_id: userId } });
    if (!booking) throw { status: 404, message: 'Booking not found' };
    if (['cancelled', 'completed'].includes(booking.status))
      throw { status: 400, message: `Booking is already ${booking.status}` };

    const stockItems = await Stock.findAll({ where: { shop_id: booking.shop_id } });
    for (const item of stockItems) {
      await Stock.update(
        { available_qty: sequelize.literal(`LEAST(available_qty + ${item.per_family_qty}, total_qty)`) },
        { where: { id: item.id }, transaction: t }
      );
    }

    await booking.update({ status: 'cancelled' }, { transaction: t });
    await t.commit();

    return booking;
  } catch (err) {
    try { await t.rollback(); } catch (_) {}
    throw err;
  }
};