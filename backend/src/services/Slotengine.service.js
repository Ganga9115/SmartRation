import { Booking, Stock, Shop } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Central slot engine — wraps and extends the AI slot recommender.
 * Provides additional helpers for admin dashboards and booking services.
 */

/**
 * Check if a specific slot is available for booking.
 * Returns { available, reason }
 */
export const isSlotAvailable = async (shopId, date, slotTime, maxPerSlot = 10) => {
  const count = await Booking.count({
    where: {
      shop_id:      shopId,
      booking_date: date,
      slot_time:    slotTime,
      status:       { [Op.notIn]: ['cancelled'] },
    },
  });

  if (count >= maxPerSlot) {
    return { available: false, reason: 'Slot is fully booked', booked: count, max: maxPerSlot };
  }

  return { available: true, booked: count, max: maxPerSlot };
};

/**
 * Return a capacity summary for every slot on a given date.
 * Useful for admin "day view" screens.
 */
export const getDayCapacity = async (shopId, date) => {
  const shop = await Shop.findByPk(shopId);
  if (!shop) throw { status: 404, message: 'Shop not found' };

  const bookings = await Booking.findAll({
    where: {
      shop_id:      shopId,
      booking_date: date,
      status:       { [Op.notIn]: ['cancelled'] },
    },
    attributes: ['slot_time'],
  });

  const tally = {};
  for (const b of bookings) {
    tally[b.slot_time] = (tally[b.slot_time] || 0) + 1;
  }

  // Generate all possible slots
  const slots = generateRange(
    shop.open_time  || '09:00',
    shop.close_time || '17:00'
  );

  return slots.map((slot) => ({
    slot_time:       slot,
    booked:          tally[slot] || 0,
    available_spots: Math.max(0, 10 - (tally[slot] || 0)),
    is_full:         (tally[slot] || 0) >= 10,
  }));
};

/**
 * Block or unblock a slot for a shop on a date
 * by setting all its bookings to no_show (soft block).
 * This is an admin safety valve — normally slots fill naturally.
 */
export const blockSlot = async (shopId, date, slotTime) => {
  const [count] = await Booking.update(
    { status: 'no_show' },
    {
      where: {
        shop_id:      shopId,
        booking_date: date,
        slot_time:    slotTime,
        status:       'confirmed',
      },
    }
  );
  return { blocked: count };
};

// ── Helper ────────────────────────────────────────────────
const generateRange = (openTime, closeTime, intervalMins = 30) => {
  const slots = [];
  const [oH, oM] = openTime.split(':').map(Number);
  const [cH, cM] = closeTime.split(':').map(Number);
  let cur = oH * 60 + oM;
  const end = cH * 60 + cM;

  while (cur + intervalMins <= end) {
    const h = String(Math.floor(cur / 60)).padStart(2, '0');
    const m = String(cur % 60).padStart(2, '0');
    slots.push(`${h}:${m}`);
    cur += intervalMins;
  }
  return slots;
};