// shop.controller.js
import { Shop, Stock, RationCard } from '../models/index.js';

// ── GET /api/shops ────────────────────────────────────────
export const getAllShops = async (req, res) => {
  try {
    const shops = await Shop.findAll({
      where:   { is_active: true },
      order:   [['name', 'ASC']],
      attributes: ['id', 'name', 'address', 'phone', 'open_time', 'close_time', 'is_active'],
    });
    return res.json({ success: true, count: shops.length, shops });
  } catch (err) {
    console.error('getAllShops error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/shops/:id ────────────────────────────────────
export const getShopById = async (req, res) => {
  try {
    const shop = await Shop.findByPk(req.params.id, {
      attributes: ['id', 'name', 'address', 'phone', 'open_time', 'close_time', 'is_active'],
    });
    if (!shop || !shop.is_active)
      return res.status(404).json({ success: false, message: 'Shop not found' });

    return res.json({ success: true, shop });
  } catch (err) {
    console.error('getShopById error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/shops (admin) ───────────────────────────────
export const createShop = async (req, res) => {
  try {
    const { name, address, phone, open_time, close_time } = req.body;
    if (!name || !address)
      return res.status(400).json({ success: false, message: 'name and address are required' });

    const shop = await Shop.create({ name, address, phone, open_time, close_time });
    return res.status(201).json({ success: true, message: 'Shop created', shop });
  } catch (err) {
    console.error('createShop error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/shops/:id (admin) ────────────────────────────
export const updateShop = async (req, res) => {
  try {
    const shop = await Shop.findByPk(req.params.id);
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });

    const { name, address, phone, open_time, close_time, is_active } = req.body;
    await shop.update({
      ...(name       !== undefined && { name }),
      ...(address    !== undefined && { address }),
      ...(phone      !== undefined && { phone }),
      ...(open_time  !== undefined && { open_time }),
      ...(close_time !== undefined && { close_time }),
      ...(is_active  !== undefined && { is_active }),
    });

    return res.json({ success: true, message: 'Shop updated', shop });
  } catch (err) {
    console.error('updateShop error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};