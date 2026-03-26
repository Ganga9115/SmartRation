/**
 * slotEngine.service.js
 * AI-driven slot recommendation engine for SmartRation.
 *
 * Scoring formula (all weights sum to 1.0):
 *   ai_slot_score = 0.4 × stock_factor
 *                 + 0.35 × load_factor   (inverted — less load = better)
 *                 + 0.25 × time_factor   (prefer morning slots)
 *
 * Returns slots ranked best → worst. Score stored in bookings.ai_slot_score.
 */

import { Op } from 'sequelize';
import { Booking, Stock, Shop } from '../models/index.js';
import { config } from '../config/env.js';

// ── Constants ────────────────────────────────────────────────────────────────

const SLOT_DURATION_MINUTES = 30;   // each slot window
const MAX_BOOKINGS_PER_SLOT  = 10;  // hard cap per slot
const STOCK_LOW_THRESHOLD    = 0.2; // below 20% available → restrict bookings

// Weight coefficients for AI score
const W_STOCK = 0.40;
const W_LOAD  = 0.35;
const W_TIME  = 0.25;

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Generate all slot windows for a shop on a given date.
 * Returns array of "HH:MM:SS" strings.
 */
export function generateSlotTimes(openTime, closeTime) {
  const slots = [];
  const [oh, om] = openTime.split(':').map(Number);
  const [ch, cm] = closeTime.split(':').map(Number);

  let cursor = oh * 60 + om;
  const end  = ch * 60 + cm;

  while (cursor + SLOT_DURATION_MINUTES <= end) {
    const h = String(Math.floor(cursor / 60)).padStart(2, '0');
    const m = String(cursor % 60).padStart(2, '0');
    slots.push(`${h}:${m}:00`);
    cursor += SLOT_DURATION_MINUTES;
  }
  return slots;
}

/**
 * Time-of-day preference score.
 * Earlier morning slots score higher (users prefer finishing early).
 *   09:00 → 1.0,  13:00 → 0.5,  17:00 → 0.0
 */
function computeTimeFactor(slotTime, openTime, closeTime) {
  const toMinutes = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const open  = toMinutes(openTime);
  const close = toMinutes(closeTime);
  const slot  = toMinutes(slotTime);
  if (close === open) return 1;
  return 1 - (slot - open) / (close - open);
}

// ── Core Export ──────────────────────────────────────────────────────────────

/**
 * getAvailableSlots
 *
 * @param {number} shopId
 * @param {string} date        - "YYYY-MM-DD"
 * @returns {Promise<Array>}   - ranked slot objects
 *
 * Each returned slot:
 * {
 *   slot_time:          "HH:MM:SS",
 *   available_capacity: number,
 *   booked_count:       number,
 *   ai_slot_score:      number (0–1, higher = better),
 *   stock_factor:       number,
 *   load_factor:        number,
 *   time_factor:        number,
 *   is_available:       boolean,
 *   restriction_reason: string | null,
 * }
 */
export async function getAvailableSlots(shopId, date) {
  // 1. Load shop details
  const shop = await Shop.findByPk(shopId);
  if (!shop || !shop.is_active) {
    throw new Error('Shop not found or inactive');
  }

  const openTime  = shop.open_time  || '09:00:00';
  const closeTime = shop.close_time || '17:00:00';

  // 2. Stock factor — ratio of available to total across all items
  const stocks = await Stock.findAll({ where: { shop_id: shopId } });

  let stockFactor = 1.0; // default full score if no stock rows yet
  if (stocks.length > 0) {
    const totalQty     = stocks.reduce((s, r) => s + parseFloat(r.total_qty     || 0), 0);
    const availableQty = stocks.reduce((s, r) => s + parseFloat(r.available_qty || 0), 0);
    stockFactor = totalQty > 0 ? availableQty / totalQty : 0;
  }

  // 3. Existing bookings for this shop on this date
  const existingBookings = await Booking.findAll({
    where: {
      shop_id:      shopId,
      booking_date: date,
      status:       { [Op.notIn]: ['cancelled'] },
    },
    attributes: ['slot_time'],
  });

  // Count bookings per slot
  const slotLoadMap = {};
  for (const b of existingBookings) {
    const t = b.slot_time;
    slotLoadMap[t] = (slotLoadMap[t] || 0) + 1;
  }

  // 4. Build scored slot list
  const slotTimes = generateSlotTimes(openTime, closeTime);
  const scoredSlots = slotTimes.map((slotTime) => {
    const bookedCount       = slotLoadMap[slotTime] || 0;
    const availableCapacity = MAX_BOOKINGS_PER_SLOT - bookedCount;

    // Load factor — 1.0 means empty, 0.0 means full
    const loadFactor = availableCapacity / MAX_BOOKINGS_PER_SLOT;

    // Time factor — prefer earlier
    const timeFactor = computeTimeFactor(slotTime, openTime, closeTime);

    // Composite AI score
    const aiScore =
      W_STOCK * stockFactor +
      W_LOAD  * loadFactor  +
      W_TIME  * timeFactor;

    // Determine availability
    let isAvailable    = true;
    let restrictionReason = null;

    if (availableCapacity <= 0) {
      isAvailable       = false;
      restrictionReason = 'Slot fully booked';
    } else if (stockFactor < STOCK_LOW_THRESHOLD) {
      isAvailable       = false;
      restrictionReason = 'Insufficient stock — try another date';
    }

    return {
      slot_time:          slotTime,
      available_capacity: Math.max(0, availableCapacity),
      booked_count:       bookedCount,
      ai_slot_score:      parseFloat(aiScore.toFixed(4)),
      stock_factor:       parseFloat(stockFactor.toFixed(4)),
      load_factor:        parseFloat(loadFactor.toFixed(4)),
      time_factor:        parseFloat(timeFactor.toFixed(4)),
      is_available:       isAvailable,
      restriction_reason: restrictionReason,
    };
  });

  // 5. Sort by AI score descending (best recommendation first)
  return scoredSlots.sort((a, b) => b.ai_slot_score - a.ai_slot_score);
}

/**
 * getBestSlot — returns the single best available slot.
 * Used internally when the user doesn't pick a specific time.
 */
export async function getBestSlot(shopId, date) {
  const slots = await getAvailableSlots(shopId, date);
  const best  = slots.find((s) => s.is_available);
  return best || null;
}