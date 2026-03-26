/**
 * welfare.cron.js
 *
 * Runs on the 28th of every month at 08:00 IST.
 * Scans all active ration cards and raises 'missed_collection' alerts
 * for any card that hasn't had a completed booking in the current cycle.
 *
 * Install: npm install node-cron
 * Register in server.js: import './src/jobs/welfare.cron.js'
 */

import cron from 'node-cron';
import { Op } from 'sequelize';
import { RationCard, Booking, WelfareAlert } from '../models/index.js';

async function runWelfareCheck() {
  const now         = new Date();
  const cycle_month = now.getMonth() + 1;
  const cycle_year  = now.getFullYear();

  console.log(`🔍 [Welfare Cron] Running check for ${cycle_month}/${cycle_year}`);

  try {
    const activeCards = await RationCard.findAll({ where: { is_active: true } });

    let alertsRaised = 0;

    for (const card of activeCards) {
      // Check if there's a completed booking this cycle
      const completed = await Booking.findOne({
        where: {
          ration_card_id: card.id,
          cycle_month,
          cycle_year,
          status: 'completed',
        },
      });

      if (!completed) {
        // Check if alert already raised this cycle
        const exists = await WelfareAlert.findOne({
          where: {
            ration_card_id: card.id,
            alert_type:     'missed_collection',
            is_resolved:    false,
          },
        });

        if (!exists) {
          await WelfareAlert.create({
            user_id:        card.user_id,
            ration_card_id: card.id,
            alert_type:     'missed_collection',
            message: `Reminder: You have not collected your ration for ${cycle_month}/${cycle_year}. Your card may become inactive if you miss 3 consecutive months.`,
          });
          alertsRaised++;
        }
      }
    }

    console.log(`✅ [Welfare Cron] Done — ${alertsRaised} alerts raised`);
  } catch (err) {
    console.error('❌ [Welfare Cron] Error:', err.message);
  }
}

// Schedule: 08:00 AM IST on the 28th of every month
// node-cron uses server local time; ensure TZ=Asia/Kolkata in your env
cron.schedule('0 8 28 * *', runWelfareCheck, {
  timezone: 'Asia/Kolkata',
});

console.log('📅 Welfare cron scheduled — runs on the 28th of each month at 08:00 IST');
