import express from 'express';
import {
  getAlerts,
  getMyAlerts,
  resolveAlert,
  resolveBulk,
  runWelfareChecks,
  getWelfareSummary,
} from '../controllers/welfare.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// User routes
router.get('/alerts/my', protect, getMyAlerts);

// Admin routes
router.get('/alerts',              protect, authorize('admin'), getAlerts);
router.get('/summary',             protect, authorize('admin'), getWelfareSummary);
router.put('/alerts/:id/resolve',  protect, authorize('admin'), resolveAlert);
router.put('/alerts/resolve-bulk', protect, authorize('admin'), resolveBulk);
router.post('/run-checks',         protect, authorize('admin'), runWelfareChecks);

export default router;