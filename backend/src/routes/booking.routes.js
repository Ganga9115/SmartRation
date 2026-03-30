import express from 'express';
import {
  getSlots, getEntitlements, createBooking,
  getMyBookings, getBookingById, cancelBooking,
  verifyBookingToken, getQueueToday,
} from '../controllers/booking.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/slots',                getSlots);
router.get('/entitlements',         getEntitlements);
router.get('/queue-today',          getQueueToday);        // all users see this
router.post('/book',                createBooking);
router.get('/my-bookings',          getMyBookings);
router.get('/verify/:token_number', verifyBookingToken);
router.get('/:id',                  getBookingById);
router.put('/:id/cancel',           cancelBooking);

export default router;