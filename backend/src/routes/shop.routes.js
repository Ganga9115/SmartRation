import express from 'express';
import { Shop } from '../models/index.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const shops = await Shop.findAll({ where: { is_active: true } });
    return res.json({ success: true, shops });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const shop = await Shop.findByPk(req.params.id);
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });
    return res.json({ success: true, shop });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;