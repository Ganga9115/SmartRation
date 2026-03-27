import { Booking, RationCard, User } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Fraud signals and their weights
 */
const FRAUD_WEIGHTS = {
  MULTIPLE_CARDS:        40,
  RAPID_BOOKINGS:        30,
  LOCATION_MISMATCH:     20,
  FREQUENT_CANCELLATIONS: 15,
  INACTIVE_THEN_SUDDEN:  10,
};

/**
 * Analyse a user/ration-card pair for fraud signals.
 * Returns { isFraud, score, reasons[] }
 */
export const detectFraud = async (userId, rationCardId) => {
  const reasons = [];
  let score = 0;

  try {
    // ── 1. Multiple active ration cards for same user ──────
    const cardCount = await RationCard.count({
      where: { user_id: userId, is_active: true },
    });
    if (cardCount > 1) {
      score += FRAUD_WEIGHTS.MULTIPLE_CARDS;
      reasons.push(`User has ${cardCount} active ration cards`);
    }

    // ── 2. Rapid bookings — more than 2 bookings in 30 days ─
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentBookings = await Booking.count({
      where: {
        user_id:      userId,
        created_at:   { [Op.gte]: thirtyDaysAgo },
        status:       { [Op.notIn]: ['cancelled'] },
      },
    });
    if (recentBookings > 2) {
      score += FRAUD_WEIGHTS.RAPID_BOOKINGS;
      reasons.push(`${recentBookings} bookings in the last 30 days (max allowed: 2)`);
    }

    // ── 3. High cancellation rate ──────────────────────────
    const totalBookings = await Booking.count({ where: { user_id: userId } });
    const cancelledCount = await Booking.count({
      where: { user_id: userId, status: 'cancelled' },
    });
    if (totalBookings >= 3 && cancelledCount / totalBookings > 0.5) {
      score += FRAUD_WEIGHTS.FREQUENT_CANCELLATIONS;
      reasons.push(
        `High cancellation rate: ${cancelledCount}/${totalBookings} bookings cancelled`
      );
    }

    // ── 4. Sudden activity after long inactivity ───────────
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const recentActivity = await Booking.count({
      where: {
        user_id:    userId,
        created_at: { [Op.gte]: ninetyDaysAgo },
      },
    });
    const olderActivity = await Booking.count({
      where: {
        user_id:    userId,
        created_at: { [Op.lt]: ninetyDaysAgo },
      },
    });
    if (olderActivity === 0 && recentActivity >= 3) {
      score += FRAUD_WEIGHTS.INACTIVE_THEN_SUDDEN;
      reasons.push('Sudden burst of activity with no prior booking history');
    }

    const isFraud = score >= 40; // threshold

    if (isFraud) {
      console.warn(
        `🚨 Fraud detected | User: ${userId} | Card: ${rationCardId} | Score: ${score} | Reasons: ${reasons.join('; ')}`
      );
    }

    return {
      isFraud,
      score,
      reasons,
      riskLevel: score >= 60 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW',
    };
  } catch (err) {
    console.error('fraudDetector error:', err.message);
    // Fail open — don't block legitimate users on detector crash
    return { isFraud: false, score: 0, reasons: [], riskLevel: 'LOW' };
  }
};

/**
 * Batch-scan all users and return a list of suspicious accounts.
 * Called periodically by welfare.cron.js
 */
export const runBatchFraudScan = async () => {
  const users = await User.findAll({ where: { is_active: true }, attributes: ['id'] });
  const flagged = [];

  for (const user of users) {
    const card = await RationCard.findOne({
      where: { user_id: user.id, is_active: true },
    });
    if (!card) continue;

    const result = await detectFraud(user.id, card.id);
    if (result.isFraud) {
      flagged.push({ userId: user.id, cardId: card.id, ...result });
    }
  }

  console.log(`🔍 Fraud scan complete | Flagged: ${flagged.length}/${users.length} users`);
  return flagged;
};