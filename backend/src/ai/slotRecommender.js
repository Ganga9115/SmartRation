import { Booking, Stock } from '../models/index.js';
import { Op } from 'sequelize';

// Score a time slot — higher = better recommendation
const scoreSlot = (hour, bookingsOnDate, maxSlots, stockRatio) => {
  let score = 100;

  // Prefer mid-morning (avoid rush at open/close)
  if (hour >= 10 && hour <= 12) score += 20;
  else if (hour >= 14 && hour <= 15) score += 10;
  else if (hour <= 9 || hour >= 16) score -= 20;

  // Penalise crowded slots
  const fillRatio = bookingsOnDate / maxSlots;
  score -= fillRatio * 40;

  // Penalise low stock
  score += stockRatio * 30;

  return Math.max(0, Math.min(100, score));
};

// Generate slot times between shop open and close
const generateTimeSlots = (openTime, closeTime, intervalMins = 30) => {
  const slots = [];
  const [openH, openM] = openTime.split(':').map(Number);
  const [closeH, closeM] = closeTime.split(':').map(Number);

  let current = openH * 60 + openM;
  const end = closeH * 60 + closeM;

  while (current + intervalMins <= end) {
    const h = String(Math.floor(current / 60)).padStart(2, '0');
    const m = String(current % 60).padStart(2, '0');
    slots.push(`${h}:${m}`);
    current += intervalMins;
  }
  return slots;
};

export const getRecommendedSlots = async (shopId, shop, daysAhead = 7) => {
  const stockItems = await Stock.findAll({ where: { shop_id: shopId } });

  // Calculate stock fill ratio (0 = empty, 1 = full)
  const stockRatio = stockItems.length
    ? stockItems.reduce((acc, item) => {
        return acc + (item.available_qty / (item.total_qty || 1));
      }, 0) / stockItems.length
    : 0;

  // Max bookings per day based on stock
  const maxSlotsPerDay = Math.min(
    50,
    Math.floor(
      Math.min(
        ...stockItems.map((i) =>
          i.per_family_qty > 0 ? i.available_qty / i.per_family_qty : 50
        )
      )
    )
  );

  const recommendations = [];
  const today = new Date();

  for (let d = 1; d <= daysAhead; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    const dateStr = date.toISOString().split('T')[0];

    // Skip Sundays (government shops closed)
    if (date.getDay() === 0) continue;

    // Count existing bookings for this date
    const existingCount = await Booking.count({
      where: {
        shop_id: shopId,
        booking_date: dateStr,
        status: { [Op.notIn]: ['cancelled'] },
      },
    });

    if (existingCount >= maxSlotsPerDay) continue; // date full

    const timeSlots = generateTimeSlots(
      shop.open_time || '09:00',
      shop.close_time || '17:00'
    );

    for (const slotTime of timeSlots) {
      const hour = parseInt(slotTime.split(':')[0]);

      // Count bookings for this specific slot
      const slotCount = await Booking.count({
        where: {
          shop_id: shopId,
          booking_date: dateStr,
          slot_time: slotTime,
          status: { [Op.notIn]: ['cancelled'] },
        },
      });

      const slotsPerTime = Math.ceil(maxSlotsPerDay / timeSlots.length);
      if (slotCount >= slotsPerTime) continue; // slot full

      const score = scoreSlot(
        hour,
        existingCount,
        maxSlotsPerDay,
        stockRatio
      );

      recommendations.push({
        date: dateStr,
        slot_time: slotTime,
        available_count: slotsPerTime - slotCount,
        score: parseFloat(score.toFixed(2)),
        stock_ratio: parseFloat(stockRatio.toFixed(2)),
        is_recommended: score >= 70,
      });
    }
  }

  // Sort by score descending
  return recommendations.sort((a, b) => b.score - a.score);
};