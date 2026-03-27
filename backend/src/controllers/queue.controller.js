import { QueueLog, Booking, Shop } from '../models/index.js';
import { predictWaitTime, predictPeakSlot, getCongestionLevel } from '../ai/queuePredictor.js';
import { Op } from 'sequelize';
import sequelize from '../config/db.js';

// ── GET /api/queue/status?shop_id=1&date=2024-06-01 ──────
export const getQueueStatus = async (req, res) => {
  try {
    const { shop_id, date } = req.query;
    if (!shop_id || !date)
      return res.status(400).json({ success: false, message: 'shop_id and date are required' });

    const shop = await Shop.findByPk(shop_id);
    if (!shop)
      return res.status(404).json({ success: false, message: 'Shop not found' });

    const bookings = await Booking.findAll({
      where: {
        shop_id,
        booking_date: date,
        status: { [Op.notIn]: ['cancelled'] },
      },
      attributes: ['id', 'token_number', 'slot_time', 'status'],
      order: [['token_number', 'ASC']],
    });

    const congestion = await getCongestionLevel(shop_id);
    const { peakSlot, peakCount, distribution } = await predictPeakSlot(shop_id, date);

    return res.json({
      success: true,
      shop: { id: shop.id, name: shop.name },
      date,
      total_bookings: bookings.length,
      congestion_level: congestion,
      peak_slot: peakSlot,
      peak_count: peakCount,
      slot_distribution: distribution,
      queue: bookings,
    });
  } catch (err) {
    console.error('getQueueStatus error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/queue/wait?shop_id=1&date=2024-06-01&token=5 ─
export const getWaitTime = async (req, res) => {
  try {
    const { shop_id, date, token } = req.query;
    if (!shop_id || !date || !token)
      return res.status(400).json({ success: false, message: 'shop_id, date, and token are required' });

    const result = await predictWaitTime(shop_id, date, parseInt(token));

    return res.json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/queue/call-next  (shop owner) ───────────────
// Marks the next pending token as 'called' and records called_at
export const callNextToken = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { shop_id, date } = req.body;
    if (!shop_id || !date) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'shop_id and date are required' });
    }

    // Find the lowest uncalled token for today
    const nextLog = await QueueLog.findOne({
      where: {
        shop_id,
        log_date:  date,
        called_at: null,
      },
      order: [['token_number', 'ASC']],
    });

    if (!nextLog) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'No more tokens in queue for today' });
    }

    await nextLog.update({ called_at: new Date() }, { transaction: t });
    await t.commit();

    return res.json({
      success: true,
      message: `Token #${nextLog.token_number} called`,
      token_number: nextLog.token_number,
      booking_id:   nextLog.booking_id,
    });
  } catch (err) {
    await t.rollback();
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/queue/serve  (shop owner) ───────────────────
// Marks a token as served and updates wait_seconds + booking status
export const markServed = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { shop_id, token_number, date } = req.body;
    if (!shop_id || !token_number || !date) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'shop_id, token_number, and date are required' });
    }

    const log = await QueueLog.findOne({
      where: { shop_id, token_number, log_date: date },
    });
    if (!log) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Queue log entry not found' });
    }

    const servedAt   = new Date();
    const calledAt   = log.called_at || servedAt;
    const waitSeconds = Math.round((servedAt - new Date(calledAt)) / 1000);

    await log.update({ served_at: servedAt, wait_seconds: waitSeconds }, { transaction: t });

    // Mark booking as completed
    await Booking.update(
      { status: 'completed' },
      { where: { id: log.booking_id }, transaction: t }
    );

    await t.commit();

    console.log(`✅ Token #${token_number} served | Wait: ${waitSeconds}s`);
    return res.json({
      success: true,
      message: `Token #${token_number} marked as served`,
      wait_seconds: waitSeconds,
    });
  } catch (err) {
    await t.rollback();
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/queue/logs?shop_id=1&date=2024-06-01 ─────────
export const getQueueLogs = async (req, res) => {
  try {
    const { shop_id, date } = req.query;
    if (!shop_id || !date)
      return res.status(400).json({ success: false, message: 'shop_id and date are required' });

    const logs = await QueueLog.findAll({
      where: { shop_id, log_date: date },
      order: [['token_number', 'ASC']],
    });

    return res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};