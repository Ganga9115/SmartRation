import { Booking, RationCard, Shop, Stock, QueueLog, BookingItem } from '../models/index.js';
import { getRecommendedSlots } from '../ai/slotRecommender.js';
import { processBooking, cancelBookingById, calculateEntitlements } from '../services/booking.service.js';
import { Op } from 'sequelize';

// ── Slots per time window — max families per 30-min slot
const MAX_PER_SLOT = 5;

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
// Returns bookings sorted by SLOT TIME first, then token number
// This is the correct queue order — people with earlier slots are truly ahead
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
      // ✅ Sort by slot_time first, then token_number within same slot
      order: [
        ['slot_time',    'ASC'],
        ['token_number', 'ASC'],
      ],
    });

    // Build slot-aware position map
    // Position = how many non-cancelled, non-completed people are before you in slot+token order
    const activeQueue = bookings.filter(b =>
      b.status !== 'completed' && b.status !== 'no_show'
    );

    const summary = {
      total:     bookings.length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      no_show:   bookings.filter(b => b.status === 'no_show').length,
      // Group by slot for the frontend
      by_slot:   {},
    };

    // Build slot summary
    for (const b of bookings) {
      const slot = b.slot_time;
      if (!summary.by_slot[slot]) {
        summary.by_slot[slot] = { total: 0, completed: 0, waiting: 0 };
      }
      summary.by_slot[slot].total++;
      if (b.status === 'completed') summary.by_slot[slot].completed++;
      else summary.by_slot[slot].waiting++;
    }

    return res.json({
      success:  true,
      date,
      shop_id,
      summary,
      bookings,       // sorted by slot_time ASC, token ASC
      active_queue:   activeQueue,  // only waiting people, same order
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/booking/my-position?shop_id=1&date=2025-01-01&token=5
// Returns this user's exact position in the slot-aware queue
export const getMyQueuePosition = async (req, res) => {
  try {
    const { shop_id, date, token } = req.query;
    if (!shop_id || !date || !token)
      return res.status(400).json({ success: false, message: 'shop_id, date and token required' });

    // Get this booking to know its slot_time
    const myBooking = await Booking.findOne({
      where: { shop_id, booking_date: date, token_number: token },
      attributes: ['id', 'token_number', 'slot_time', 'status'],
    });
    if (!myBooking)
      return res.status(404).json({ success: false, message: 'Booking not found' });

    // Count people truly ahead:
    // 1. People in EARLIER slots who are still waiting
    // 2. People in the SAME slot with a lower token number who are still waiting
    const peopleAhead = await Booking.count({
      where: {
        shop_id,
        booking_date: date,
        status:       { [Op.notIn]: ['cancelled', 'completed', 'no_show'] },
        [Op.or]: [
          // Earlier slot time
          { slot_time: { [Op.lt]: myBooking.slot_time } },
          // Same slot, lower token
          {
            slot_time:    myBooking.slot_time,
            token_number: { [Op.lt]: parseInt(token) },
          },
        ],
      },
    });

    // Count people in same slot (for slot context)
    const sameSlotTotal = await Booking.count({
      where: {
        shop_id,
        booking_date: date,
        slot_time:    myBooking.slot_time,
        status:       { [Op.notIn]: ['cancelled'] },
      },
    });

    const sameSlotCompleted = await Booking.count({
      where: {
        shop_id,
        booking_date: date,
        slot_time:    myBooking.slot_time,
        status:       'completed',
      },
    });

    return res.json({
      success:            true,
      token_number:       parseInt(token),
      slot_time:          myBooking.slot_time,
      people_ahead:       peopleAhead,
      same_slot_total:    sameSlotTotal,
      same_slot_completed: sameSlotCompleted,
      same_slot_waiting:  sameSlotTotal - sameSlotCompleted,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};