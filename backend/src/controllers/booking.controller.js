import { Booking, RationCard, Shop, Stock, QueueLog } from '../models/index.js';
import { generateQRCode } from '../utils/qrGenerator.js';
import { getRecommendedSlots } from '../ai/slotRecommender.js';
import { Op } from 'sequelize';
import sequelize from '../config/db.js';

// ── GET /api/booking/slots?shop_id=1 ─────────────────────
export const getSlots = async (req, res) => {
  try {
    const { shop_id } = req.query;
    if (!shop_id) return res.status(400).json({ success: false, message: 'shop_id is required' });

    const shop = await Shop.findByPk(shop_id);
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });

    const slots = await getRecommendedSlots(shop_id, shop);

    return res.json({
      success: true,
      shop: { id: shop.id, name: shop.name },
      total_slots: slots.length,
      slots,
    });
  } catch (err) {
    console.error('getSlots error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/booking/book ────────────────────────────────
export const createBooking = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { shop_id, booking_date, slot_time } = req.body;
    const user_id = req.user.id;

    // 1. Validate inputs
    if (!shop_id || !booking_date || !slot_time) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'shop_id, booking_date and slot_time are required' });
    }

    // 2. Check ration card exists
    const rationCard = await RationCard.findOne({ where: { user_id, is_active: true } });
    if (!rationCard) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'No active ration card found. Please register your card first' });
    }

    // 3. Fraud check — already booked this cycle?
    const now = new Date();
    const cycle_month = now.getMonth() + 1;
    const cycle_year = now.getFullYear();

    const existingBooking = await Booking.findOne({
      where: { ration_card_id: rationCard.id, cycle_month, cycle_year },
    });
    if (existingBooking) {
      await t.rollback();
      return res.status(409).json({
        success: false,
        message: `You have already booked for ${cycle_month}/${cycle_year}`,
        existing_booking: { id: existingBooking.id, status: existingBooking.status },
      });
    }

    // 4. Check shop exists
    const shop = await Shop.findByPk(shop_id);
    if (!shop || !shop.is_active) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Shop not found or inactive' });
    }

    // 5. Check slot still has capacity
    const slotCount = await Booking.count({
      where: {
        shop_id,
        booking_date,
        slot_time,
        status: { [Op.notIn]: ['cancelled'] },
      },
    });
    if (slotCount >= 10) {
      await t.rollback();
      return res.status(409).json({ success: false, message: 'This slot is full. Please choose another slot' });
    }

    // 6. Check stock availability
    const stockItems = await Stock.findAll({ where: { shop_id } });
    for (const item of stockItems) {
      if (item.available_qty < item.per_family_qty) {
        await t.rollback();
        return res.status(409).json({
          success: false,
          message: `Insufficient stock for ${item.item_name}. Please check another date`,
        });
      }
    }

    // 7. Get next token number
    const lastToken = await Booking.max('token_number', {
      where: { shop_id, booking_date },
    });
    const token_number = (lastToken || 0) + 1;

    // 8. Generate QR code
    const qrData = {
      booking_id: null, // will update after insert
      token_number,
      card_number: rationCard.card_number,
      shop_id,
      booking_date,
      slot_time,
      cycle: `${cycle_month}/${cycle_year}`,
    };
    const qr_code = await generateQRCode(qrData);

    // 9. Create booking
    const booking = await Booking.create({
      user_id,
      ration_card_id: rationCard.id,
      shop_id,
      booking_date,
      slot_time,
      token_number,
      qr_code,
      status: 'confirmed',
      cycle_month,
      cycle_year,
      ai_slot_score: null,
    }, { transaction: t });

    // 10. Deduct stock (within transaction)
    for (const item of stockItems) {
      await Stock.update(
        { available_qty: sequelize.literal(`available_qty - ${item.per_family_qty}`) },
        { where: { id: item.id }, transaction: t }
      );
    }

    // 11. Create queue log entry
    await QueueLog.create({
      shop_id,
      booking_id: booking.id,
      token_number,
      log_date: booking_date,
    }, { transaction: t });

    await t.commit();

    console.log(`🎫 Booking created | Token: ${token_number} | User: ${user_id} | Date: ${booking_date}`);

    return res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully',
      booking: {
        id:           booking.id,
        token_number,
        booking_date,
        slot_time,
        status:       'confirmed',
        qr_code,
        shop:         { id: shop.id, name: shop.name, address: shop.address },
        ration_card:  { card_number: rationCard.card_number, card_type: rationCard.card_type },
        cycle:        `${cycle_month}/${cycle_year}`,
      },
    });
  } catch (err) {
    await t.rollback();
    console.error('createBooking error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/booking/my-bookings ──────────────────────────
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: Shop, attributes: ['id', 'name', 'address', 'phone'] },
        { model: RationCard, attributes: ['card_number', 'card_type'] },
      ],
      order: [['booking_date', 'DESC']],
    });
    return res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/booking/:id ──────────────────────────────────
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [
        { model: Shop, attributes: ['id', 'name', 'address', 'phone'] },
        { model: RationCard, attributes: ['card_number', 'card_type', 'family_members'] },
      ],
    });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    return res.json({ success: true, booking });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/booking/:id/cancel ───────────────────────────
export const cancelBooking = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const booking = await Booking.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!booking) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (['cancelled', 'completed'].includes(booking.status)) {
      await t.rollback();
      return res.status(400).json({ success: false, message: `Booking is already ${booking.status}` });
    }

    // Restore stock
    const stockItems = await Stock.findAll({ where: { shop_id: booking.shop_id } });
    for (const item of stockItems) {
      await Stock.update(
        { available_qty: sequelize.literal(`LEAST(available_qty + ${item.per_family_qty}, total_qty)`) },
        { where: { id: item.id }, transaction: t }
      );
    }

    await booking.update({ status: 'cancelled' }, { transaction: t });
    await t.commit();

    console.log(`❌ Booking ${booking.id} cancelled | Stock restored`);
    return res.json({ success: true, message: 'Booking cancelled and stock restored' });
  } catch (err) {
    await t.rollback();
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/booking/verify/:token_number?shop_id=1&date=2024-01-01
// For shop owner to verify at counter ─────────────────────
export const verifyBookingToken = async (req, res) => {
  try {
    const { token_number } = req.params;
    const { shop_id, date } = req.query;

    const booking = await Booking.findOne({
      where: {
        token_number,
        shop_id,
        booking_date: date,
        status: 'confirmed',
      },
      include: [
        { model: RationCard, attributes: ['card_number', 'card_type', 'family_members'] },
        { model: Shop, attributes: ['name'] },
      ],
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Invalid token or already collected' });
    }

    return res.json({
      success: true,
      valid: true,
      booking: {
        id:            booking.id,
        token_number:  booking.token_number,
        slot_time:     booking.slot_time,
        card_number:   booking.RationCard.card_number,
        card_type:     booking.RationCard.card_type,
        family_members: booking.RationCard.family_members,
        shop:          booking.Shop.name,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};