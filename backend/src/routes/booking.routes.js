import express from 'express';
import {
  getSlots,
  createBooking,
  getTokenStatus,
  cancelBooking,
  getMyBookings,
} from '../controllers/booking.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public — anyone with the link can check token status (for the "track live" feature)
router.get('/status/:token', getTokenStatus);

// Protected — requires JWT
router.get('/slots',        protect, getSlots);
router.post('/create',      protect, createBooking);
router.delete('/cancel/:id',protect, cancelBooking);
router.get('/my',           protect, getMyBookings);

export default router;