import express from 'express';
import {
  getStock,
  addStock,
  updateStock,
  restockItem,
  deleteStock,
  getLowStockItems,
} from '../controllers/stock.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Any authenticated user can view stock
router.get('/',           protect, getStock);
router.get('/low-alert',  protect, authorize('admin', 'shop_owner'), getLowStockItems);

// Shop owner / admin mutations
router.post('/',          protect, authorize('admin', 'shop_owner'), addStock);
router.put('/:id',        protect, authorize('admin', 'shop_owner'), updateStock);
router.put('/:id/restock',protect, authorize('admin', 'shop_owner'), restockItem);
router.delete('/:id',     protect, authorize('admin'),               deleteStock);

export default router;