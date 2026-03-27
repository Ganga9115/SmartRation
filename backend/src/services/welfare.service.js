import { WelfareAlert, RationCard, Booking } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Create a welfare alert, avoiding duplicates of the same open alert.
 */
export const createAlert = async ({ userId, rationCardId, alertType, message }) => {
  const existing = await WelfareAlert.findOne({
    where: {
      user_id:        userId,
      ration_card_id: rationCardId,
      alert_type:     alertType,
      is_resolved:    false,
    },
  });

  if (existing) return { created: false, alert: existing };

  const alert = await WelfareAlert.create({
    user_id:        userId,
    ration_card_id: rationCardId,
    alert_type:     alertType,
    message,
  });

  return { created: true, alert };
};

/**
 * Get unresolved alert count per user.
 */
export const getUnresolvedCount = async (userId) =>
  WelfareAlert.count({ where: { user_id: userId, is_resolved: false } });

/**
 * Resolve all open alerts of a given type for a user/card pair.
 * Useful when a user completes a booking and a missed_collection alert should auto-close.
 */
export const autoResolveAlerts = async (userId, rationCardId, alertType) => {
  const [count] = await WelfareAlert.update(
    { is_resolved: true, resolved_at: new Date() },
    {
      where: {
        user_id:        userId,
        ration_card_id: rationCardId,
        alert_type:     alertType,
        is_resolved:    false,
      },
    }
  );
  return count;
};

/**
 * Summary stats for the admin dashboard.
 */
export const getAlertStats = async () => {
  const [total, unresolved] = await Promise.all([
    WelfareAlert.count(),
    WelfareAlert.count({ where: { is_resolved: false } }),
  ]);

  const fraudOpen     = await WelfareAlert.count({ where: { alert_type: 'fraud_flag',         is_resolved: false } });
  const missedOpen    = await WelfareAlert.count({ where: { alert_type: 'missed_collection',   is_resolved: false } });
  const inactiveOpen  = await WelfareAlert.count({ where: { alert_type: 'inactivity_warning',  is_resolved: false } });
  const stockLowOpen  = await WelfareAlert.count({ where: { alert_type: 'stock_low',           is_resolved: false } });

  return {
    total,
    unresolved,
    by_type: {
      fraud_flag:         fraudOpen,
      missed_collection:  missedOpen,
      inactivity_warning: inactiveOpen,
      stock_low:          stockLowOpen,
    },
  };
};