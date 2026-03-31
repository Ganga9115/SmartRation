import express from 'express';
import {
  getSlots, getEntitlements, createBooking,
  getMyBookings, getBookingById, cancelBooking,
  verifyBookingToken, getQueueToday, getMyQueuePosition,
} from '../controllers/booking.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// ✅ All specific named routes MUST come before /:id
router.get('/slots',                getSlots);
router.get('/entitlements',         getEntitlements);
router.get('/queue-today',          getQueueToday);
router.get('/my-position',          getMyQueuePosition);
router.get('/my-bookings',          getMyBookings);
router.get('/verify/:token_number', verifyBookingToken);

// ⚠️ /:id must be LAST — it catches everything else
router.get('/:id',                  getBookingById);

router.post('/book',                createBooking);
router.put('/:id/cancel',           cancelBooking);

export default router;