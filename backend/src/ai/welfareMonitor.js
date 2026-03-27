import { Booking, RationCard, WelfareAlert, Stock } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Check for families who haven't collected rations in 2+ months.
 * Creates a 'missed_collection' welfare alert if not already open.
 */
export const checkMissedCollections = async () => {
  try {
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    // Active ration cards with no recent booking
    const cards = await RationCard.findAll({ where: { is_active: true } });
    let created = 0;

    for (const card of cards) {
      const recentBooking = await Booking.findOne({
        where: {
          ration_card_id: card.id,
          booking_date:   { [Op.gte]: twoMonthsAgo.toISOString().split('T')[0] },
          status:         { [Op.notIn]: ['cancelled'] },
        },
      });

      if (!recentBooking) {
        // Avoid duplicate open alerts
        const existing = await WelfareAlert.findOne({
          where: {
            ration_card_id: card.id,
            alert_type:     'missed_collection',
            is_resolved:    false,
          },
        });

        if (!existing) {
          await WelfareAlert.create({
            user_id:        card.user_id,
            ration_card_id: card.id,
            alert_type:     'missed_collection',
            message:        `Ration card ${card.card_number} has not collected rations in over 2 months. Please check on this family.`,
          });
          created++;
        }
      }
    }

    console.log(`🤝 Missed collection check | Alerts created: ${created}`);
    return { checked: cards.length, alertsCreated: created };
  } catch (err) {
    console.error('checkMissedCollections error:', err.message);
    return { checked: 0, alertsCreated: 0 };
  }
};

/**
 * Flag users who had a confirmed booking but status never moved to 'completed'
 * (i.e., they booked but didn't show up — potential token abuse).
 */
export const checkInactiveBookings = async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const staleBookings = await Booking.findAll({
      where: {
        status:       'confirmed',
        booking_date: { [Op.lt]: sevenDaysAgo.toISOString().split('T')[0] },
      },
      include: [{ model: RationCard, attributes: ['id', 'card_number', 'user_id'] }],
    });

    let created = 0;

    for (const booking of staleBookings) {
      const card = booking.RationCard;
      if (!card) continue;

      const existing = await WelfareAlert.findOne({
        where: {
          ration_card_id: card.id,
          alert_type:     'inactivity_warning',
          is_resolved:    false,
        },
      });

      if (!existing) {
        await WelfareAlert.create({
          user_id:        card.user_id,
          ration_card_id: card.id,
          alert_type:     'inactivity_warning',
          message:        `Booking #${booking.id} on ${booking.booking_date} was confirmed but never collected. Token: ${booking.token_number}.`,
        });
        created++;
      }
    }

    console.log(`⏰ Inactivity check | Stale bookings: ${staleBookings.length} | Alerts: ${created}`);
    return { stale: staleBookings.length, alertsCreated: created };
  } catch (err) {
    console.error('checkInactiveBookings error:', err.message);
    return { stale: 0, alertsCreated: 0 };
  }
};

/**
 * Check all shops for critically low stock and raise 'stock_low' alerts.
 * Threshold: available_qty < 20% of total_qty
 */
export const checkLowStock = async () => {
  try {
    const lowItems = await Stock.findAll({
      where: {
        available_qty: { [Op.lt]: require('sequelize').literal('total_qty * 0.20') },
        total_qty:     { [Op.gt]: 0 },
      },
    });

    // Group by shop
    const byShop = {};
    for (const item of lowItems) {
      if (!byShop[item.shop_id]) byShop[item.shop_id] = [];
      byShop[item.shop_id].push(item.item_name);
    }

    let created = 0;
    for (const [shopId, items] of Object.entries(byShop)) {
      // We create one alert per shop per item per day (no ration_card context needed,
      // so we use a sentinel user_id = 0 / admin placeholder)
      // In practice tie this to the shop_owner user_id if available.
      const existing = await WelfareAlert.findOne({
        where: {
          alert_type:  'stock_low',
          is_resolved: false,
          message:     { [Op.like]: `%Shop #${shopId}%` },
        },
      });

      if (!existing) {
        await WelfareAlert.create({
          user_id:        1, // admin user — adjust to your admin ID
          ration_card_id: 1, // sentinel
          alert_type:     'stock_low',
          message:        `Shop #${shopId} is critically low on: ${items.join(', ')}. Restock needed immediately.`,
        });
        created++;
      }
    }

    console.log(`📦 Stock check | Low-stock shops: ${Object.keys(byShop).length} | Alerts: ${created}`);
    return { lowShops: Object.keys(byShop).length, alertsCreated: created };
  } catch (err) {
    console.error('checkLowStock error:', err.message);
    return { lowShops: 0, alertsCreated: 0 };
  }
};

/**
 * Flag fraud-scan results as welfare alerts.
 * Called from welfare.cron after runBatchFraudScan().
 *
 * @param {Array} flaggedUsers – output of fraudDetector.runBatchFraudScan()
 */
export const raiseFraudAlerts = async (flaggedUsers = []) => {
  let created = 0;

  for (const { userId, cardId, reasons, score } of flaggedUsers) {
    const existing = await WelfareAlert.findOne({
      where: {
        user_id:        userId,
        ration_card_id: cardId,
        alert_type:     'fraud_flag',
        is_resolved:    false,
      },
    });

    if (!existing) {
      await WelfareAlert.create({
        user_id:        userId,
        ration_card_id: cardId,
        alert_type:     'fraud_flag',
        message:        `Fraud risk score: ${score}. Signals: ${reasons.join('; ')}`,
      });
      created++;
    }
  }

  console.log(`🚩 Fraud alerts raised: ${created}`);
  return created;
};