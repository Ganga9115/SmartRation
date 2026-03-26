/**
 * booking.controller.js
 *
 * Handles:
 *  - GET  /api/booking/slots?shop_id=&date=     → ranked slot list
 *  - POST /api/booking/create                   → create booking + token + QR
 *  - GET  /api/booking/status/:token            → live token status + wait estimate
 *  - DELETE /api/booking/cancel/:id             → cancel a booking
 *  - GET  /api/booking/my                       → user's bookings
 */

import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import {
  Booking,
  RationCard,
  Shop,
  QueueLog,
  WelfareAlert,
} from '../models/index.js';
import { config } from '../config/env.js';
import { getAvailableSlots, getBestSlot } from '../services/slotEngine.service.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Generate a QR code payload as a signed JWT.
 * The shop scanner verifies this to confirm identity + booking.
 */
function generateQRPayload(booking) {
  return jwt.sign(
    {
      booking_id:   booking.id,
      user_id:      booking.user_id,
      token_number: booking.token_number,
      shop_id:      booking.shop_id,
      booking_date: booking.booking_date,
    },
    config.jwt.secret,
    { expiresIn: '24h' }
  );
}

/**
 * Get the next token number for a shop on a given date.
 * Tokens auto-increment per shop per day starting at 1.
 */
async function getNextToken(shopId, date) {
  const last = await Booking.findOne({
    where: {
      shop_id:      shopId,
      booking_date: date,
      status:       { [Op.notIn]: ['cancelled'] },
    },
    order: [['token_number', 'DESC']],
  });
  return last ? last.token_number + 1 : 1;
}

/**
 * Current cycle month/year based on today's date.
 */
function getCurrentCycle() {
  const now = new Date();
  return {
    cycle_month: now.getMonth() + 1, // 1-indexed
    cycle_year:  now.getFullYear(),
  };
}

// ── Fraud Detection ───────────────────────────────────────────────────────────

/**
 * Returns true if the ration card already has an active booking
 * in the current monthly cycle.
 */
async function hasDuplicateBooking(rationCardId) {
  const { cycle_month, cycle_year } = getCurrentCycle();
  const existing = await Booking.findOne({
    where: {
      ration_card_id: rationCardId,
      cycle_month,
      cycle_year,
      status: { [Op.notIn]: ['cancelled'] },
    },
  });
  return !!existing;
}

// ── Welfare ───────────────────────────────────────────────────────────────────

/**
 * Checks if the ration card missed last month's collection.
 * Creates a welfare alert if so (idempotent — won't double-insert).
 */
async function checkAndAlertMissedCollection(userId, rationCardId) {
  const now         = new Date();
  const lastMonth   = now.getMonth() === 0 ? 12 : now.getMonth();     // 1-indexed
  const lastYear    = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

  const lastCollection = await Booking.findOne({
    where: {
      ration_card_id: rationCardId,
      cycle_month:    lastMonth,
      cycle_year:     lastYear,
      status:         'completed',
    },
  });

  if (!lastCollection) {
    // Check we haven't already raised this alert
    const alreadyAlerted = await WelfareAlert.findOne({
      where: {
        ration_card_id: rationCardId,
        alert_type:     'missed_collection',
        is_resolved:    false,
      },
    });
    if (!alreadyAlerted) {
      await WelfareAlert.create({
        user_id:        userId,
        ration_card_id: rationCardId,
        alert_type:     'missed_collection',
        message: `Your ration card did not have a completed collection in ${lastMonth}/${lastYear}. Please ensure you collect your entitled ration this month.`,
      });
    }
  }
}

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * GET /api/booking/slots?shop_id=&date=
 * Returns AI-ranked slot list for a shop on a date.
 */
export const getSlots = async (req, res) => {
  try {
    const { shop_id, date } = req.query;

    if (!shop_id || !date) {
      return res.status(400).json({ success: false, message: 'shop_id and date are required' });
    }

    // Basic date validation
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ success: false, message: 'date must be YYYY-MM-DD' });
    }

    const today = new Date().toISOString().split('T')[0];
    if (date < today) {
      return res.status(400).json({ success: false, message: 'Cannot book past dates' });
    }

    const slots = await getAvailableSlots(parseInt(shop_id), date);

    return res.json({
      success: true,
      shop_id: parseInt(shop_id),
      date,
      total_slots:     slots.length,
      available_slots: slots.filter((s) => s.is_available).length,
      slots,
    });
  } catch (err) {
    console.error('getSlots error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/booking/create
 * Body: { shop_id, booking_date, slot_time? }
 * slot_time is optional — if omitted the AI picks the best slot.
 */
export const createBooking = async (req, res) => {
  try {
    const userId              = req.user.id;
    const { shop_id, booking_date, slot_time } = req.body;

    // ── Validation ────────────────────────────────────────────────────────
    if (!shop_id || !booking_date) {
      return res.status(400).json({ success: false, message: 'shop_id and booking_date are required' });
    }

    const today = new Date().toISOString().split('T')[0];
    if (booking_date < today) {
      return res.status(400).json({ success: false, message: 'Cannot book past dates' });
    }

    // ── Ration card check ────────────────────────────────────────────────
    const rationCard = await RationCard.findOne({
      where: { user_id: userId, is_active: true },
    });
    if (!rationCard) {
      return res.status(404).json({ success: false, message: 'No active ration card found for this account' });
    }

    // ── Shop validation ──────────────────────────────────────────────────
    const shop = await Shop.findByPk(shop_id);
    if (!shop || !shop.is_active) {
      return res.status(404).json({ success: false, message: 'Shop not found or inactive' });
    }

    // ── Fraud check ──────────────────────────────────────────────────────
    const isDuplicate = await hasDuplicateBooking(rationCard.id);
    if (isDuplicate) {
      // Raise a fraud flag alert
      await WelfareAlert.create({
        user_id:        userId,
        ration_card_id: rationCard.id,
        alert_type:     'fraud_flag',
        message:        `Duplicate booking attempt detected for cycle ${getCurrentCycle().cycle_month}/${getCurrentCycle().cycle_year}.`,
      });
      return res.status(409).json({
        success: false,
        message: 'You already have a booking for this month\'s cycle. Duplicate bookings are not permitted.',
      });
    }

    // ── Slot resolution ──────────────────────────────────────────────────
    let resolvedSlot;
    let aiScore;

    if (slot_time) {
      // User picked a specific slot — validate it
      const slots     = await getAvailableSlots(parseInt(shop_id), booking_date);
      resolvedSlot    = slots.find((s) => s.slot_time === slot_time);

      if (!resolvedSlot) {
        return res.status(400).json({ success: false, message: 'Invalid slot time' });
      }
      if (!resolvedSlot.is_available) {
        return res.status(409).json({
          success: false,
          message: resolvedSlot.restriction_reason || 'Slot not available',
        });
      }
      aiScore = resolvedSlot.ai_slot_score;
    } else {
      // AI auto-picks best slot
      resolvedSlot = await getBestSlot(parseInt(shop_id), booking_date);
      if (!resolvedSlot) {
        return res.status(409).json({
          success: false,
          message: 'No available slots for this date. Please try another date.',
        });
      }
      aiScore = resolvedSlot.ai_slot_score;
    }

    // ── Token generation ─────────────────────────────────────────────────
    const tokenNumber = await getNextToken(parseInt(shop_id), booking_date);
    const { cycle_month, cycle_year } = getCurrentCycle();

    // ── Create booking ───────────────────────────────────────────────────
    const booking = await Booking.create({
      user_id:        userId,
      ration_card_id: rationCard.id,
      shop_id:        parseInt(shop_id),
      booking_date,
      slot_time:      resolvedSlot.slot_time,
      token_number:   tokenNumber,
      status:         'confirmed',
      cycle_month,
      cycle_year,
      ai_slot_score:  aiScore,
    });

    // ── QR code (JWT payload) ────────────────────────────────────────────
    const qrPayload = generateQRPayload(booking);
    await booking.update({ qr_code: qrPayload });

    // ── Welfare: check for missed last month ─────────────────────────────
    await checkAndAlertMissedCollection(userId, rationCard.id);

    console.log(`✅ Booking created | user:${userId} | token:${tokenNumber} | shop:${shop_id} | ${booking_date} ${resolvedSlot.slot_time}`);

    return res.status(201).json({
      success: true,
      message: 'Booking confirmed',
      booking: {
        id:            booking.id,
        booking_date:  booking.booking_date,
        slot_time:     booking.slot_time,
        token_number:  booking.token_number,
        qr_code:       booking.qr_code,
        status:        booking.status,
        ai_slot_score: booking.ai_slot_score,
        shop: {
          id:      shop.id,
          name:    shop.name,
          address: shop.address,
          phone:   shop.phone,
        },
      },
    });
  } catch (err) {
    console.error('createBooking error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/booking/status/:token
 * Returns live token status and estimated wait time.
 * Accessible without auth so users can share the link.
 */
export const getTokenStatus = async (req, res) => {
  try {
    const { token } = req.params;
    const { shop_id, date } = req.query;

    if (!shop_id || !date) {
      return res.status(400).json({ success: false, message: 'shop_id and date required as query params' });
    }

    const booking = await Booking.findOne({
      where: {
        token_number: parseInt(token),
        shop_id:      parseInt(shop_id),
        booking_date: date,
      },
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Token not found' });
    }

    // Currently being served token = highest completed token for this shop+date
    const lastServed = await Booking.findOne({
      where: {
        shop_id:      parseInt(shop_id),
        booking_date: date,
        status:       'completed',
      },
      order: [['token_number', 'DESC']],
    });

    const currentToken   = lastServed ? lastServed.token_number + 1 : 1;
    const tokensAhead    = Math.max(0, booking.token_number - currentToken);

    // Average service time from QueueLog (last 20 entries for this shop)
    const recentLogs = await QueueLog.findAll({
      where: {
        shop_id:     parseInt(shop_id),
        served_at:   { [Op.not]: null },
        wait_seconds:{ [Op.not]: null },
      },
      order: [['served_at', 'DESC']],
      limit: 20,
    });

    let avgWaitSeconds = 5 * 60; // default 5 min if no data
    if (recentLogs.length > 0) {
      const total  = recentLogs.reduce((s, l) => s + (l.wait_seconds || 0), 0);
      avgWaitSeconds = Math.round(total / recentLogs.length);
    }

    const estimatedWaitSeconds = tokensAhead * avgWaitSeconds;
    const estimatedWaitMinutes = Math.ceil(estimatedWaitSeconds / 60);

    return res.json({
      success: true,
      token_number:            booking.token_number,
      status:                  booking.status,
      current_token_at_shop:   currentToken,
      tokens_ahead:            tokensAhead,
      estimated_wait_minutes:  estimatedWaitMinutes,
      avg_service_seconds:     avgWaitSeconds,
      slot_time:               booking.slot_time,
    });
  } catch (err) {
    console.error('getTokenStatus error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/booking/cancel/:id
 * User can cancel their own booking.
 */
export const cancelBooking = async (req, res) => {
  try {
    const userId    = req.user.id;
    const bookingId = parseInt(req.params.id);

    const booking = await Booking.findOne({
      where: { id: bookingId, user_id: userId },
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a booking with status '${booking.status}'`,
      });
    }

    await booking.update({ status: 'cancelled' });

    return res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (err) {
    console.error('cancelBooking error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/booking/my
 * Returns the authenticated user's booking history (most recent first).
 */
export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.findAll({
      where:   { user_id: userId },
      order:   [['booking_date', 'DESC'], ['slot_time', 'ASC']],
      include: [{ model: Shop, attributes: ['id', 'name', 'address', 'phone'] }],
    });

    return res.json({ success: true, bookings });
  } catch (err) {
    console.error('getMyBookings error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};
