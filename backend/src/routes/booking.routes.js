// booking.routes.js
import express from 'express';
import {
  getSlots,
  getEntitlements,
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  verifyBookingToken,
  getQueueToday,
  getMyQueuePosition,
} from '../controllers/booking.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All booking routes require auth
router.get('/slots',           protect, getSlots);
router.get('/entitlements',    protect, getEntitlements);
router.post('/book',           protect, createBooking);
router.get('/my-bookings',     protect, getMyBookings);
router.get('/queue-today',     protect, getQueueToday);       // shop_id + date query params
router.get('/my-position',     protect, getMyQueuePosition);  // shop_id + date + token query params
router.get('/verify/:token_number', protect, authorize('admin', 'shop_owner'), verifyBookingToken);
router.get('/:id',             protect, getBookingById);
router.put('/:id/cancel',      protect, cancelBooking);

export default router;