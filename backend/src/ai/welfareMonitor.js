import { Booking, RationCard, Stock, WelfareAlert } from '../models/index.js';
import { Op, literal } from 'sequelize';   // ✅ literal imported properly

export const checkMissedCollections = async () => {
  try {
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

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
            message:        `Ration card ${card.card_number} has not collected rations in over 2 months.`,
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

    console.log(`⏰ Inactivity check | Stale: ${staleBookings.length} | Alerts: ${created}`);
    return { stale: staleBookings.length, alertsCreated: created };
  } catch (err) {
    console.error('checkInactiveBookings error:', err.message);
    return { stale: 0, alertsCreated: 0 };
  }
};

export const checkLowStock = async () => {
  try {
    // ✅ Use literal() from sequelize import — no require()
    const allStock = await Stock.findAll({
      where: { total_qty: { [Op.gt]: 0 } },
    });

    const lowItems = allStock.filter(
      (i) => parseFloat(i.available_qty) < parseFloat(i.total_qty) * 0.2
    );

    const byShop = {};
    for (const item of lowItems) {
      if (!byShop[item.shop_id]) byShop[item.shop_id] = [];
      byShop[item.shop_id].push(item.item_name);
    }

    let created = 0;
    for (const [shopId, items] of Object.entries(byShop)) {
      const existing = await WelfareAlert.findOne({
        where: {
          alert_type:  'stock_low',
          is_resolved: false,
          message:     { [Op.like]: `%Shop #${shopId}%` },
        },
      });

      if (!existing) {
        await WelfareAlert.create({
          user_id:        1,
          ration_card_id: 1,
          alert_type:     'stock_low',
          message:        `Shop #${shopId} is critically low on: ${items.join(', ')}. Restock needed immediately.`,
        });
        created++;
      }
    }

    console.log(`📦 Stock check | Low shops: ${Object.keys(byShop).length} | Alerts: ${created}`);
    return { lowShops: Object.keys(byShop).length, alertsCreated: created };
  } catch (err) {
    console.error('checkLowStock error:', err.message);
    return { lowShops: 0, alertsCreated: 0 };
  }
};

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