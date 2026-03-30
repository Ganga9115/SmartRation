import { Booking, RationCard, Shop, Stock, QueueLog, BookingItem } from '../models/index.js';
import { getRecommendedSlots } from '../ai/slotRecommender.js';
import { processBooking, cancelBookingById, calculateEntitlements } from '../services/booking.service.js';
import { Op } from 'sequelize';

// ── GET /api/booking/slots?shop_id=1 ──────────────────────
export const getSlots = async (req, res) => {
  try {
    const { shop_id } = req.query;
    if (!shop_id) return res.status(400).json({ success: false, message: 'shop_id is required' });
    const shop = await Shop.findByPk(shop_id);
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });
    const slots = await getRecommendedSlots(shop_id, shop);
    return res.json({ success: true, shop: { id: shop.id, name: shop.name }, slots });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/booking/entitlements?shop_id=1 ───────────────
// Returns what items a user is entitled to based on family size
export const getEntitlements = async (req, res) => {
  try {
    const { shop_id } = req.query;
    if (!shop_id) return res.status(400).json({ success: false, message: 'shop_id is required' });

    const rationCard = await RationCard.findOne({ where: { user_id: req.user.id, is_active: true } });
    if (!rationCard) return res.status(404).json({ success: false, message: 'No active ration card' });

    const entitlements = await calculateEntitlements(shop_id, rationCard.family_members);
    return res.json({ success: true, family_members: rationCard.family_members, entitlements });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/booking/book ────────────────────────────────
export const createBooking = async (req, res) => {
  try {
    const { shop_id, booking_date, slot_time, selected_items } = req.body;

    if (!shop_id || !booking_date || !slot_time)
      return res.status(400).json({ success: false, message: 'shop_id, booking_date and slot_time are required' });

    if (!selected_items || selected_items.length === 0)
      return res.status(400).json({ success: false, message: 'Please select at least one item' });

    const result = await processBooking({
      userId:        req.user.id,
      shopId:        shop_id,
      bookingDate:   booking_date,
      slotTime:      slot_time,
      selectedItems: selected_items,
    });

    return res.status(201).json({
      success: true,
      message: 'Booking confirmed',
      booking: {
        id:           result.booking.id,
        token_number: result.tokenNumber,
        booking_date,
        slot_time,
        status:       'confirmed',
        qr_code:      result.qr_code,
        shop:         { id: result.shop.id, name: result.shop.name, address: result.shop.address },
        items:        selected_items,
        cycle:        result.cycle,
      },
    });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message, ...err });
  }
};

// ── GET /api/booking/my-bookings ──────────────────────────
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where:   { user_id: req.user.id },
      include: [
        { model: Shop,        attributes: ['id', 'name', 'address', 'phone'] },
        { model: RationCard,  attributes: ['card_number', 'card_type'] },
        { model: BookingItem },
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
      where:   { id: req.params.id, user_id: req.user.id },
      include: [
        { model: Shop,        attributes: ['id', 'name', 'address', 'phone'] },
        { model: RationCard,  attributes: ['card_number', 'card_type', 'family_members'] },
        { model: BookingItem },
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
  try {
    await cancelBookingById(req.params.id, req.user.id);
    return res.json({ success: true, message: 'Booking cancelled and stock restored' });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

// ── GET /api/booking/verify/:token_number ─────────────────
export const verifyBookingToken = async (req, res) => {
  try {
    const { token_number } = req.params;
    const { shop_id, date } = req.query;
    const booking = await Booking.findOne({
      where:   { token_number, shop_id, booking_date: date, status: 'confirmed' },
      include: [
        { model: RationCard,  attributes: ['card_number', 'card_type', 'family_members'] },
        { model: Shop,        attributes: ['name'] },
        { model: BookingItem },
      ],
    });
    if (!booking) return res.status(404).json({ success: false, message: 'Invalid token or already collected' });
    return res.json({ success: true, valid: true, booking });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/booking/queue-today?shop_id=1&date=2025-01-01 ─
// Public endpoint — all users can see today's queue
export const getQueueToday = async (req, res) => {
  try {
    const { shop_id, date } = req.query;
    if (!shop_id || !date)
      return res.status(400).json({ success: false, message: 'shop_id and date required' });

    const bookings = await Booking.findAll({
      where: {
        shop_id,
        booking_date: date,
        status:       { [Op.notIn]: ['cancelled'] },
      },
      attributes: ['id', 'token_number', 'slot_time', 'status'],
      order:       [['token_number', 'ASC']],
    });

    const summary = {
      total:     bookings.length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      no_show:   bookings.filter(b => b.status === 'no_show').length,
    };

    return res.json({ success: true, date, shop_id, summary, bookings });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};