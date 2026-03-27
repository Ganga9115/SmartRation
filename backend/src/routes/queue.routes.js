import express from 'express';
import {
  getQueueStatus,
  getWaitTime,
  callNextToken,
  markServed,
  getQueueLogs,
} from '../controllers/queue.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public-ish — user can check their own wait time
router.get('/status', protect, getQueueStatus);
router.get('/wait',   protect, getWaitTime);

// Shop owner / admin only
router.post('/call-next', protect, authorize('admin', 'shop_owner'), callNextToken);
router.post('/serve',     protect, authorize('admin', 'shop_owner'), markServed);
router.get('/logs',       protect, authorize('admin', 'shop_owner'), getQueueLogs);

export default router;