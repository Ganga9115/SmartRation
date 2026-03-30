import cron from 'node-cron';
import { Op } from 'sequelize';
import { Booking, RationCard, Stock, BookingItem } from '../models/index.js';
import {
  notifyReminder1Day,
  notifyReminder1Hr,
  notifyCollectionMissed,
} from './notificationService.js';

async function runNotificationCheck() {
  const now   = new Date();
  const today = now.toISOString().split('T')[0];

  console.log(`🔔 [Notification Cron] Running at ${now.toLocaleTimeString()}`);

  try {
    // ── 1. Tomorrow's bookings → 1-day reminder ───────────
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const tomorrowBookings = await Booking.findAll({
      where:   { booking_date: tomorrowStr, status: 'confirmed' },
      include: [{ model: RationCard, attributes: ['id', 'user_id'] }],
    });

    for (const b of tomorrowBookings) {
      await notifyReminder1Day(
        b.user_id, b.RationCard?.id, b.token_number, tomorrowStr, b.slot_time
      );
    }

    // ── 2. 1-hr before slot reminder ──────────────────────
    const inOneHour  = new Date(now.getTime() + 60 * 60 * 1000);
    const targetSlot = `${String(inOneHour.getHours()).padStart(2,'0')}:${String(inOneHour.getMinutes()).padStart(2,'0')}:00`;

    const upcomingBookings = await Booking.findAll({
      where:   { booking_date: today, slot_time: targetSlot, status: 'confirmed' },
      include: [{ model: RationCard, attributes: ['id', 'user_id'] }],
    });

    for (const b of upcomingBookings) {
      await notifyReminder1Hr(b.user_id, b.RationCard?.id, b.token_number, b.slot_time);
    }

    // ── 3. Missed collections — slot passed, still confirmed ──
    const twoHoursAgo    = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const missedSlotTime = `${String(twoHoursAgo.getHours()).padStart(2,'0')}:${String(twoHoursAgo.getMinutes()).padStart(2,'0')}:00`;

    const missedBookings = await Booking.findAll({
      where: {
        booking_date: today,
        slot_time:    { [Op.lte]: missedSlotTime },
        status:       'confirmed',
      },
      include: [
        { model: RationCard, attributes: ['id', 'user_id'] },
        { model: BookingItem },
      ],
    });

    for (const b of missedBookings) {
      await b.update({ status: 'no_show' });

      for (const item of b.BookingItems || []) {
        if (!item.is_skipped) {
          await Stock.increment('available_qty', {
            by:    parseFloat(item.selected_qty),
            where: { shop_id: b.shop_id, item_name: item.item_name },
          });
        }
      }

      await notifyCollectionMissed(
        b.user_id, b.RationCard?.id, b.token_number, b.booking_date
      );

      console.log(`⚠️  Booking #${b.id} marked no_show | Stock restored`);
    }

    console.log(`✅ [Notification Cron] Done | Reminders: ${tomorrowBookings.length + upcomingBookings.length} | Missed: ${missedBookings.length}`);
  } catch (err) {
    console.error('❌ [Notification Cron] Error:', err.message);
  }
}

// Run every 30 minutes IST
cron.schedule('*/30 * * * *', runNotificationCheck, { timezone: 'Asia/Kolkata' });

// Run once at startup
runNotificationCheck();

console.log('🔔 Notification cron scheduled — runs every 30 minutes');