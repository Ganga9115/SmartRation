import { QueueLog, Booking } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Get real-time live queue state for a shop on a date.
 * Returns tokens grouped as waiting / called / served.
 */
export const getLiveQueue = async (shopId, date) => {
  const logs = await QueueLog.findAll({
    where:  { shop_id: shopId, log_date: date },
    order:  [['token_number', 'ASC']],
  });

  const waiting = logs.filter((l) => !l.called_at && !l.served_at);
  const called  = logs.filter((l) =>  l.called_at && !l.served_at);
  const served  = logs.filter((l) =>  l.served_at);

  return {
    total:   logs.length,
    waiting: waiting.length,
    called:  called.length,
    served:  served.length,
    current: called[0]?.token_number ?? null,
    next:    waiting[0]?.token_number ?? null,
  };
};

/**
 * Compute average daily throughput for a shop over the last N days.
 */
export const getDailyThroughput = async (shopId, days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().split('T')[0];

  const served = await QueueLog.count({
    where: {
      shop_id:  shopId,
      log_date: { [Op.gte]: sinceStr },
      served_at: { [Op.not]: null },
    },
  });

  return { avgPerDay: Math.round(served / days), totalServed: served, days };
};

/**
 * Get average wait time per slot for a shop (for display in UI).
 */
export const getSlotWaitStats = async (shopId) => {
  const logs = await QueueLog.findAll({
    where:      { shop_id: shopId, wait_seconds: { [Op.not]: null } },
    attributes: ['wait_seconds'],
  });

  if (!logs.length) return { avgWaitMinutes: 0, sampleSize: 0 };

  const total = logs.reduce((sum, l) => sum + (l.wait_seconds || 0), 0);
  return {
    avgWaitMinutes: Math.ceil(total / logs.length / 60),
    sampleSize:     logs.length,
  };
};