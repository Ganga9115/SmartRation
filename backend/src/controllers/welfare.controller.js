import { WelfareAlert, User, RationCard } from '../models/index.js';
import { Op } from 'sequelize';
import {
  checkMissedCollections,
  checkInactiveBookings,
  checkLowStock,
} from '../ai/welfareMonitor.js';
import { runBatchFraudScan } from '../ai/fraudDetector.js';
import { raiseFraudAlerts } from '../ai/welfareMonitor.js';

// ── GET /api/welfare/alerts  (admin) ─────────────────────
export const getAlerts = async (req, res) => {
  try {
    const { type, resolved, user_id, page = 1, limit = 20 } = req.query;

    const where = {};
    if (type)     where.alert_type  = type;
    if (user_id)  where.user_id     = user_id;
    if (resolved !== undefined)
      where.is_resolved = resolved === 'true';

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await WelfareAlert.findAndCountAll({
      where,
      include: [
        { model: User,       attributes: ['id', 'name', 'phone'] },
        { model: RationCard, attributes: ['id', 'card_number', 'card_type'] },
      ],
      order:  [['created_at', 'DESC']],
      limit:  parseInt(limit),
      offset,
    });

    return res.json({
      success:     true,
      total:       count,
      page:        parseInt(page),
      total_pages: Math.ceil(count / limit),
      alerts:      rows,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/welfare/alerts/my  (user) ───────────────────
export const getMyAlerts = async (req, res) => {
  try {
    const alerts = await WelfareAlert.findAll({
      where:  { user_id: req.user.id },
      order:  [['created_at', 'DESC']],
    });
    return res.json({ success: true, count: alerts.length, alerts });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/welfare/alerts/:id/resolve  (admin) ─────────
export const resolveAlert = async (req, res) => {
  try {
    const alert = await WelfareAlert.findByPk(req.params.id);
    if (!alert)
      return res.status(404).json({ success: false, message: 'Alert not found' });

    if (alert.is_resolved)
      return res.status(400).json({ success: false, message: 'Alert is already resolved' });

    await alert.update({ is_resolved: true, resolved_at: new Date() });
    return res.json({ success: true, message: 'Alert resolved', alert });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/welfare/alerts/resolve-bulk  (admin) ────────
export const resolveBulk = async (req, res) => {
  try {
    const { ids } = req.body; // array of alert IDs
    if (!Array.isArray(ids) || ids.length === 0)
      return res.status(400).json({ success: false, message: 'ids array is required' });

    const [updated] = await WelfareAlert.update(
      { is_resolved: true, resolved_at: new Date() },
      { where: { id: { [Op.in]: ids }, is_resolved: false } }
    );

    return res.json({ success: true, message: `${updated} alert(s) resolved` });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/welfare/run-checks  (admin) ────────────────
// Manually trigger all welfare monitoring jobs
export const runWelfareChecks = async (req, res) => {
  try {
    const [missed, inactive, stock, fraudList] = await Promise.all([
      checkMissedCollections(),
      checkInactiveBookings(),
      checkLowStock(),
      runBatchFraudScan(),
    ]);

    const fraudAlerts = await raiseFraudAlerts(fraudList);

    return res.json({
      success: true,
      message: 'Welfare checks complete',
      results: {
        missed_collections:   missed,
        inactive_bookings:    inactive,
        low_stock:            stock,
        fraud_users_flagged:  fraudList.length,
        fraud_alerts_created: fraudAlerts,
      },
    });
  } catch (err) {
    console.error('runWelfareChecks error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/welfare/summary  (admin) ────────────────────
export const getWelfareSummary = async (req, res) => {
  try {
    const [total, unresolved, byType] = await Promise.all([
      WelfareAlert.count(),
      WelfareAlert.count({ where: { is_resolved: false } }),
      WelfareAlert.findAll({
        attributes: [
          'alert_type',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
        ],
        group: ['alert_type'],
        raw:   true,
      }),
    ]);

    return res.json({ success: true, total, unresolved, by_type: byType });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};