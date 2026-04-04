// src/routes/specialEvent.routes.js
import express from 'express';
import {
  // Admin
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventTokens,
  markTokenUsed,
  // User
  getActiveEvents,
  getUpcomingEvents,
  generateToken,
  getMyTokens,
  cancelMyToken,
} from '../controllers/Specialevent.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// ── User routes (authenticated) ───────────────────────────
router.get('/active',               protect, getActiveEvents);     // events happening now for user's shop
router.get('/upcoming',             protect, getUpcomingEvents);   // all current + future events
router.get('/my-tokens',            protect, getMyTokens);         // user's own tokens
router.post('/:id/generate-token',  protect, generateToken);       // generate token for an event
router.put('/tokens/:tokenId/cancel', protect, cancelMyToken);     // cancel own token

// ── Admin routes ──────────────────────────────────────────
router.get('/',           protect, authorize('admin', 'shop_owner'), getAllEvents);
router.post('/',          protect, authorize('admin', 'shop_owner'), createEvent);
router.put('/:id',        protect, authorize('admin', 'shop_owner'), updateEvent);
router.delete('/:id',     protect, authorize('admin'),               deleteEvent);
router.get('/:id/tokens', protect, authorize('admin', 'shop_owner'), getEventTokens);
router.post('/:id/tokens/:tokenId/mark-used', protect, authorize('admin', 'shop_owner'), markTokenUsed);

export default router;