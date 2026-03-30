import { WelfareAlert } from '../models/index.js';

const ALERT_MESSAGES = {
  booking_confirmed:     (token, date, time) =>
    `✅ Booking confirmed! Token #${token} for ${date} at ${time}. Show QR at the counter.`,
  booking_reminder_1day: (token, date, time) =>
    `📅 Reminder: Your ration collection is tomorrow (${date}) at ${time}. Token #${token}.`,
  booking_reminder_1hr:  (token, time) =>
    `⏰ 1 hour left! Your slot is at ${time}. Token #${token}. Head to the shop now.`,
  collection_missed:     (token, date) =>
    `⚠️ You missed your collection on ${date} (Token #${token}). Stock has been restored. Please rebook.`,
};

export const notify = async (userId, rationCardId, alertType, message) => {
  try {
    const existing = await WelfareAlert.findOne({
      where: {
        user_id:        userId,
        ration_card_id: rationCardId,
        alert_type:     alertType,
        is_resolved:    false,
      },
    });
    if (existing) return null;

    return await WelfareAlert.create({
      user_id:        userId,
      ration_card_id: rationCardId,
      alert_type:     alertType,
      message,
    });
  } catch (err) {
    console.error('notify error:', err.message);
    return null;
  }
};

export const notifyBookingConfirmed = (userId, cardId, token, date, time) =>
  notify(userId, cardId, 'booking_confirmed',
    ALERT_MESSAGES.booking_confirmed(token, date, time));

export const notifyReminder1Day = (userId, cardId, token, date, time) =>
  notify(userId, cardId, 'booking_reminder_1day',
    ALERT_MESSAGES.booking_reminder_1day(token, date, time));

export const notifyReminder1Hr = (userId, cardId, token, time) =>
  notify(userId, cardId, 'booking_reminder_1hr',
    ALERT_MESSAGES.booking_reminder_1hr(token, time));

export const notifyCollectionMissed = (userId, cardId, token, date) =>
  notify(userId, cardId, 'collection_missed',
    ALERT_MESSAGES.collection_missed(token, date));