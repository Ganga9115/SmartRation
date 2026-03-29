import express from 'express';
import { registerCard, getMyCard, updateCard } from '../controllers/rationCard.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.post('/',  registerCard);
router.get('/my', getMyCard);
router.put('/my', updateCard);

export default router;