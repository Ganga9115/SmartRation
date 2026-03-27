import express from 'express';
import {
  sendOTP,
  verifyOTP_Handler,
  getMe,
  updateProfile,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/send-otp',   sendOTP);
router.post('/verify-otp', verifyOTP_Handler);
router.get('/me',          protect, getMe);
router.put('/profile',     protect, updateProfile);

export default router;