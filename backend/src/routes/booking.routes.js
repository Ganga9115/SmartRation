import express from 'express';
import {
  getSlots,
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  verifyBookingToken,
} from '../controllers/booking.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All booking routes require login
router.use(protect);

router.get('/slots',              getSlots);
router.post('/book',              createBooking);
router.get('/my-bookings',        getMyBookings);
router.get('/verify/:token_number', verifyBookingToken); // shop owner
router.get('/:id',                getBookingById);
router.put('/:id/cancel',         cancelBooking);

export default router;