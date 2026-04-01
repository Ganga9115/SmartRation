// shop.routes.js
import express from 'express';
import { getAllShops, getShopById, createShop, updateShop } from '../controllers/shop.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/',     getAllShops);                                    // public — any user can browse shops
router.get('/:id',  getShopById);                                   // public
router.post('/',    protect, authorize('admin'), createShop);       // admin only
router.put('/:id',  protect, authorize('admin'), updateShop);       // admin only

export default router;