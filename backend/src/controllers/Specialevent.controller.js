// src/controllers/Specialevent.controller.js
import { SpecialEvent, EventToken, RationCard, Shop, User } from '../models/index.js';
import { Op }           from 'sequelize';
import sequelize        from '../config/db.js';
import QRCode           from 'qrcode';

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────

/** Generate all 30-min (or custom) time slots between open and close */
const generateSlots = (openTime, closeTime, durationMins = 30) => {
  const slots = [];
  const [oh, om] = openTime.split(':').map(Number);
  const [ch, cm] = closeTime.split(':').map(Number);
  let cur = oh * 60 + om;
  const end = ch * 60 + cm;
  while (cur + durationMins <= end) {
    const h = String(Math.floor(cur / 60)).padStart(2, '0');
    const m = String(cur % 60).padStart(2, '0');
    slots.push(`${h}:${m}:00`);
    cur += durationMins;
  }
  return slots;
};

/** Count non-cancelled tokens for a specific event + date */
const tokensOnDate = async (eventId, date) =>
  EventToken.count({
    where: {
      event_id:      eventId,
      assigned_date: date,
      status:        { [Op.notIn]: ['cancelled'] },
    },
  });

/** Pick the best available date within the event window (round-robin day fill) */
const pickAssignedDate = async (event) => {
  const today  = new Date().toISOString().split('T')[0];
  const start  = today > event.start_date ? today : event.start_date;
  const end    = event.end_date;

  const cur = new Date(start);
  const endDate = new Date(end);

  while (cur <= endDate) {
    const dateStr = cur.toISOString().split('T')[0];
    if (cur.getDay() !== 0) {            // skip Sundays
      const count = await tokensOnDate(event.id, dateStr);
      if (count < event.tokens_per_day) return dateStr;
    }
    cur.setDate(cur.getDate() + 1);
  }
  return null; // fully booked
};

/** Assign a slot time for the user within a date (fills slots evenly) */
const pickSlotTime = async (event, assignedDate) => {
  const slots = generateSlots(
    event.open_time  || '09:00',
    event.close_time || '17:00',
    event.slot_duration_mins || 30
  );
  const perSlot = Math.ceil(event.tokens_per_day / slots.length);

  for (const slot of slots) {
    const count = await EventToken.count({
      where: {
        event_id:      event.id,
        assigned_date: assignedDate,
        slot_time:     slot,
        status:        { [Op.notIn]: ['cancelled'] },
      },
    });
    if (count < perSlot) return slot;
  }
  return slots[0]; // fallback
};

/** Get next token number for an event (sequential global counter) */
const nextTokenNumber = async (eventId) => {
  const max = await EventToken.max('token_number', { where: { event_id: eventId } });
  return (max || 0) + 1;
};

// ─────────────────────────────────────────────────────────
// ADMIN CONTROLLERS
// ─────────────────────────────────────────────────────────

// GET /api/events  (admin)
export const getAllEvents = async (req, res) => {
  try {
    const events = await SpecialEvent.findAll({
      include: [
        { model: Shop, attributes: ['id', 'name', 'address'] },
      ],
      order: [['start_date', 'DESC']],
    });

    // Enrich with token counts
    const enriched = await Promise.all(events.map(async (e) => {
      const token_count = await EventToken.count({
        where: { event_id: e.id, status: { [Op.notIn]: ['cancelled'] } },
      });

      const today = new Date().toISOString().split('T')[0];
      let status_label = 'ended';
      if (today < e.start_date) status_label = 'upcoming';
      else if (today <= e.end_date && e.is_active) status_label = 'active';

      return { ...e.toJSON(), token_count, status_label };
    }));

    return res.json({ success: true, events: enriched });
  } catch (err) {
    console.error('getAllEvents error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/events  (admin)
export const createEvent = async (req, res) => {
  try {
    const {
      name, description, shop_id,
      start_date, end_date,
      open_time, close_time,
      tokens_per_day, slot_duration_mins,
    } = req.body;

    if (!name || !shop_id || !start_date || !end_date)
      return res.status(400).json({ success: false, message: 'name, shop_id, start_date and end_date are required' });

    if (end_date < start_date)
      return res.status(400).json({ success: false, message: 'end_date must be after start_date' });

    const shop = await Shop.findByPk(shop_id);
    if (!shop)
      return res.status(404).json({ success: false, message: 'Shop not found' });

    const event = await SpecialEvent.create({
      name,
      description:        description || null,
      shop_id:            parseInt(shop_id),
      start_date,
      end_date,
      open_time:          open_time  || '09:00:00',
      close_time:         close_time || '17:00:00',
      tokens_per_day:     parseInt(tokens_per_day)     || 50,
      slot_duration_mins: parseInt(slot_duration_mins) || 30,
      is_active:          true,
      created_by:         req.user.id,
    });

    return res.status(201).json({ success: true, message: 'Event created', event });
  } catch (err) {
    console.error('createEvent error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/events/:id  (admin)
export const updateEvent = async (req, res) => {
  try {
    const event = await SpecialEvent.findByPk(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const {
      name, description, shop_id,
      start_date, end_date,
      open_time, close_time,
      tokens_per_day, slot_duration_mins, is_active,
    } = req.body;

    await event.update({
      ...(name               !== undefined && { name }),
      ...(description        !== undefined && { description }),
      ...(shop_id            !== undefined && { shop_id: parseInt(shop_id) }),
      ...(start_date         !== undefined && { start_date }),
      ...(end_date           !== undefined && { end_date }),
      ...(open_time          !== undefined && { open_time }),
      ...(close_time         !== undefined && { close_time }),
      ...(tokens_per_day     !== undefined && { tokens_per_day: parseInt(tokens_per_day) }),
      ...(slot_duration_mins !== undefined && { slot_duration_mins: parseInt(slot_duration_mins) }),
      ...(is_active          !== undefined && { is_active }),
    });

    return res.json({ success: true, message: 'Event updated', event });
  } catch (err) {
    console.error('updateEvent error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/events/:id  (admin)
export const deleteEvent = async (req, res) => {
  try {
    const event = await SpecialEvent.findByPk(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    await EventToken.destroy({ where: { event_id: event.id } });
    await event.destroy();

    return res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    console.error('deleteEvent error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/events/:id/tokens  (admin)
export const getEventTokens = async (req, res) => {
  try {
    const { date } = req.query;
    const where = { event_id: req.params.id };
    if (date) where.assigned_date = date;

    const tokens = await EventToken.findAll({
      where,
      include: [
        { model: User,       attributes: ['id', 'name', 'phone'] },
        { model: RationCard, attributes: ['id', 'card_number', 'card_type'] },
      ],
      order: [['assigned_date', 'ASC'], ['token_number', 'ASC']],
    });

    return res.json({ success: true, count: tokens.length, tokens });
  } catch (err) {
    console.error('getEventTokens error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/events/:id/tokens/:tokenId/mark-used  (admin)
export const markTokenUsed = async (req, res) => {
  try {
    const token = await EventToken.findOne({
      where: { id: req.params.tokenId, event_id: req.params.id },
    });
    if (!token) return res.status(404).json({ success: false, message: 'Token not found' });
    if (token.status !== 'active')
      return res.status(400).json({ success: false, message: `Token is already ${token.status}` });

    await token.update({ status: 'used' });
    return res.json({ success: true, message: 'Token marked as used', token });
  } catch (err) {
    console.error('markTokenUsed error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────
// USER CONTROLLERS
// ─────────────────────────────────────────────────────────

// GET /api/events/upcoming  (user) — all active + upcoming events
export const getUpcomingEvents = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get user's shop from their ration card
    const rationCard = await RationCard.findOne({
      where: { user_id: req.user.id, is_active: true },
    });

    const where = {
      end_date:  { [Op.gte]: today },
      is_active: true,
    };
    // If user has a registered shop, show only that shop's events + global events
    // (no shop filter = show all, which is fine for a govt system)

    const events = await SpecialEvent.findAll({
      where,
      include: [{ model: Shop, attributes: ['id', 'name', 'address', 'phone'] }],
      order: [['start_date', 'ASC']],
    });

    const enriched = await Promise.all(events.map(async (e) => {
      const today2 = new Date().toISOString().split('T')[0];

      // Count total capacity (tokens_per_day × working days)
      let workingDays = 0;
      const cur = new Date(e.start_date);
      const endD = new Date(e.end_date);
      while (cur <= endD) {
        if (cur.getDay() !== 0) workingDays++;
        cur.setDate(cur.getDate() + 1);
      }
      const totalCapacity = e.tokens_per_day * (workingDays || 1);

      const tokens_issued = await EventToken.count({
        where: { event_id: e.id, status: { [Op.notIn]: ['cancelled'] } },
      });

      const is_fully_booked = tokens_issued >= totalCapacity;
      const slots_remaining = Math.max(0, totalCapacity - tokens_issued);

      let status_label = 'ended';
      if (today2 < e.start_date) status_label = 'upcoming';
      else if (today2 <= e.end_date) status_label = 'active';

      return {
        ...e.toJSON(),
        tokens_issued,
        is_fully_booked,
        slots_remaining,
        status_label,
      };
    }));

    return res.json({ success: true, events: enriched });
  } catch (err) {
    console.error('getUpcomingEvents error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/events/active  (user)
export const getActiveEvents = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const events = await SpecialEvent.findAll({
      where: {
        start_date: { [Op.lte]: today },
        end_date:   { [Op.gte]: today },
        is_active:  true,
      },
      include: [{ model: Shop, attributes: ['id', 'name'] }],
    });
    return res.json({ success: true, events });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/events/my-tokens  (user)
export const getMyTokens = async (req, res) => {
  try {
    const tokens = await EventToken.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: SpecialEvent,
          include: [{ model: Shop, attributes: ['id', 'name', 'address'] }],
        },
      ],
      order: [['created_at', 'DESC']],
    });
    return res.json({ success: true, tokens });
  } catch (err) {
    console.error('getMyTokens error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/events/:id/generate-token  (user)
export const generateToken = async (req, res) => {
  try {
    const event = await SpecialEvent.findByPk(req.params.id, {
      include: [{ model: Shop, attributes: ['id', 'name'] }],
    });
    if (!event)
      return res.status(404).json({ success: false, message: 'Event not found' });
    if (!event.is_active)
      return res.status(400).json({ success: false, message: 'Event is not active' });

    const today = new Date().toISOString().split('T')[0];
    if (today > event.end_date)
      return res.status(400).json({ success: false, message: 'Event has ended' });

    // Must have active ration card
    const rationCard = await RationCard.findOne({
      where: { user_id: req.user.id, is_active: true },
    });
    if (!rationCard)
      return res.status(404).json({ success: false, message: 'No active ration card found' });

    // One token per user per event
    const existing = await EventToken.findOne({
      where: { event_id: event.id, user_id: req.user.id, status: { [Op.notIn]: ['cancelled'] } },
    });
    if (existing)
      return res.status(409).json({
        success: false,
        message: 'You already have a token for this event',
        token: existing,
      });

    // Pick date + slot
    const assignedDate = await pickAssignedDate(event);
    if (!assignedDate)
      return res.status(409).json({ success: false, message: 'All slots are fully booked for this event' });

    const slotTime    = await pickSlotTime(event, assignedDate);
    const tokenNumber = await nextTokenNumber(event.id);

    // Generate QR
    const qrData = {
      event_id:     event.id,
      event_name:   event.name,
      token_number: tokenNumber,
      user_id:      req.user.id,
      card_number:  rationCard.card_number,
      assigned_date: assignedDate,
      slot_time:    slotTime,
      shop:         event.Shop?.name,
    };
    let qr_code = null;
    try {
      qr_code = await QRCode.toDataURL(JSON.stringify(qrData), {
        errorCorrectionLevel: 'H', margin: 2, width: 300,
      });
    } catch (_) {}

    const token = await EventToken.create({
      event_id:       event.id,
      user_id:        req.user.id,
      ration_card_id: rationCard.id,
      token_number:   tokenNumber,
      assigned_date:  assignedDate,
      slot_time:      slotTime,
      qr_code,
      status:         'active',
    });

    return res.status(201).json({
      success: true,
      message: `Token #${tokenNumber} generated for ${assignedDate}`,
      token: { ...token.toJSON(), SpecialEvent: event },
    });
  } catch (err) {
    console.error('generateToken error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/events/tokens/:tokenId/cancel  (user)
export const cancelMyToken = async (req, res) => {
  try {
    const token = await EventToken.findOne({
      where: { id: req.params.tokenId, user_id: req.user.id },
    });
    if (!token) return res.status(404).json({ success: false, message: 'Token not found' });
    if (token.status !== 'active')
      return res.status(400).json({ success: false, message: `Token is already ${token.status}` });

    await token.update({ status: 'cancelled' });
    return res.json({ success: true, message: 'Token cancelled' });
  } catch (err) {
    console.error('cancelMyToken error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};