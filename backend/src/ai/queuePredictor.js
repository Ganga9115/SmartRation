import { QueueLog, Booking } from '../models/index.js';
import { Op, fn, col, literal } from 'sequelize';

/**
 * Predict estimated wait time for a given token at a shop on a date.
 * Uses historical average serve time from queue_log.
 *
 * @param {number} shopId
 * @param {string} date        – YYYY-MM-DD
 * @param {number} tokenNumber – the token being queried
 * @returns {{ estimatedWaitMinutes, avgServeSeconds, queueAhead }}
 */
export const predictWaitTime = async (shopId, date, tokenNumber) => {
  try {
    // ── 1. Average serve time from last 30 days ────────────
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];

    const logs = await QueueLog.findAll({
      where: {
        shop_id:        shopId,
        log_date:       { [Op.gte]: cutoffDate },
        wait_seconds:   { [Op.not]: null },
      },
      attributes: ['wait_seconds'],
    });

    const avgServeSeconds =
      logs.length > 0
        ? logs.reduce((sum, l) => sum + (l.wait_seconds || 0), 0) / logs.length
        : 300; // fallback: 5 minutes per family

    // ── 2. How many confirmed tokens are ahead in the queue ─
    const queueAhead = await Booking.count({
      where: {
        shop_id:      shopId,
        booking_date: date,
        token_number: { [Op.lt]: tokenNumber },
        status:       { [Op.in]: ['confirmed', 'pending'] },
      },
    });

    const totalWaitSeconds = queueAhead * avgServeSeconds;
    const estimatedWaitMinutes = Math.ceil(totalWaitSeconds / 60);

    return {
      estimatedWaitMinutes,
      avgServeSeconds: Math.round(avgServeSeconds),
      queueAhead,
    };
  } catch (err) {
    console.error('predictWaitTime error:', err.message);
    return { estimatedWaitMinutes: 0, avgServeSeconds: 300, queueAhead: 0 };
  }
};

/**
 * Predict the busiest time window for a shop on a given date
 * based on slot distribution of existing bookings.
 *
 * @param {number} shopId
 * @param {string} date – YYYY-MM-DD
 * @returns {{ peakSlot, peakCount, distribution }}
 */
export const predictPeakSlot = async (shopId, date) => {
  try {
    const bookings = await Booking.findAll({
      where: {
        shop_id:      shopId,
        booking_date: date,
        status:       { [Op.notIn]: ['cancelled'] },
      },
      attributes: ['slot_time'],
    });

    // Tally bookings per slot
    const distribution = {};
    for (const b of bookings) {
      const slot = b.slot_time;
      distribution[slot] = (distribution[slot] || 0) + 1;
    }

    let peakSlot  = null;
    let peakCount = 0;

    for (const [slot, count] of Object.entries(distribution)) {
      if (count > peakCount) {
        peakCount = count;
        peakSlot  = slot;
      }
    }

    return { peakSlot, peakCount, distribution };
  } catch (err) {
    console.error('predictPeakSlot error:', err.message);
    return { peakSlot: null, peakCount: 0, distribution: {} };
  }
};

/**
 * Estimate shop congestion level for today.
 * Returns 'low' | 'medium' | 'high'
 */
export const getCongestionLevel = async (shopId) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const confirmedToday = await Booking.count({
      where: {
        shop_id:      shopId,
        booking_date: today,
        status:       { [Op.in]: ['confirmed', 'pending'] },
      },
    });

    if (confirmedToday <= 10) return 'low';
    if (confirmedToday <= 30) return 'medium';
    return 'high';
  } catch (err) {
    console.error('getCongestionLevel error:', err.message);
    return 'low';
  }
};