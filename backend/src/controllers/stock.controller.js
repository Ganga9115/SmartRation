import { Stock, Shop } from '../models/index.js';
import { Op } from 'sequelize';

// ── GET /api/stock?shop_id=1 ──────────────────────────────
export const getStock = async (req, res) => {
  try {
    const { shop_id } = req.query;
    if (!shop_id)
      return res.status(400).json({ success: false, message: 'shop_id is required' });

    const shop = await Shop.findByPk(shop_id);
    if (!shop)
      return res.status(404).json({ success: false, message: 'Shop not found' });

    const stock = await Stock.findAll({ where: { shop_id } });

    return res.json({
      success:    true,
      shop:       { id: shop.id, name: shop.name },
      item_count: stock.length,
      stock,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/stock  (admin / shop owner) ─────────────────
export const addStock = async (req, res) => {
  try {
    const { shop_id, item_name, unit, total_qty, available_qty, per_family_qty } = req.body;

    if (!shop_id || !item_name || !unit)
      return res.status(400).json({ success: false, message: 'shop_id, item_name, and unit are required' });

    const shop = await Shop.findByPk(shop_id);
    if (!shop)
      return res.status(404).json({ success: false, message: 'Shop not found' });

    // Prevent duplicate item for same shop
    const existing = await Stock.findOne({ where: { shop_id, item_name } });
    if (existing)
      return res.status(409).json({
        success: false,
        message: `Item '${item_name}' already exists for this shop. Use the update endpoint.`,
      });

    const item = await Stock.create({
      shop_id,
      item_name,
      unit,
      total_qty:      total_qty      ?? 0,
      available_qty:  available_qty  ?? 0,
      per_family_qty: per_family_qty ?? 0,
    });

    return res.status(201).json({ success: true, message: 'Stock item added', item });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/stock/:id  (admin / shop owner) ──────────────
export const updateStock = async (req, res) => {
  try {
    const item = await Stock.findByPk(req.params.id);
    if (!item)
      return res.status(404).json({ success: false, message: 'Stock item not found' });

    const { total_qty, available_qty, per_family_qty, unit } = req.body;

    await item.update({
      ...(total_qty      !== undefined && { total_qty }),
      ...(available_qty  !== undefined && { available_qty }),
      ...(per_family_qty !== undefined && { per_family_qty }),
      ...(unit           !== undefined && { unit }),
    });

    return res.json({ success: true, message: 'Stock updated', item });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/stock/:id/restock  (admin / shop owner) ──────
// Convenience endpoint — top up total and available qty
export const restockItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity <= 0)
      return res.status(400).json({ success: false, message: 'quantity must be a positive number' });

    const item = await Stock.findByPk(req.params.id);
    if (!item)
      return res.status(404).json({ success: false, message: 'Stock item not found' });

    const newTotal     = parseFloat(item.total_qty)     + parseFloat(quantity);
    const newAvailable = parseFloat(item.available_qty) + parseFloat(quantity);

    await item.update({ total_qty: newTotal, available_qty: newAvailable });

    return res.json({
      success: true,
      message: `Restocked ${quantity} ${item.unit} of ${item.item_name}`,
      item,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/stock/:id  (admin) ────────────────────────
export const deleteStock = async (req, res) => {
  try {
    const item = await Stock.findByPk(req.params.id);
    if (!item)
      return res.status(404).json({ success: false, message: 'Stock item not found' });

    await item.destroy();
    return res.json({ success: true, message: 'Stock item removed' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/stock/low-alert?shop_id=1 ────────────────────
// Returns items where available_qty < 20% of total
export const getLowStockItems = async (req, res) => {
  try {
    const where = {};
    if (req.query.shop_id) where.shop_id = req.query.shop_id;

    const all = await Stock.findAll({ where });
    const low = all.filter(
      (i) => i.total_qty > 0 && i.available_qty / i.total_qty < 0.2
    );

    return res.json({ success: true, count: low.length, items: low });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};