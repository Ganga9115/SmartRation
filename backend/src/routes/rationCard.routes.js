// rationCard.routes.js
import express from 'express';
import { registerCard, getMyCard, updateCard } from '../controllers/rationCard.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.post('/register', protect, registerCard);   // ✅ FIX: was POST / — now POST /register for clarity
router.get('/my',        protect, getMyCard);      // ✅ matches rationCardAPI.getMyCard() → GET /ration-card/my
router.put('/my',        protect, updateCard);     // ✅ matches rationCardAPI.update()    → PUT /ration-card/my

export default router;