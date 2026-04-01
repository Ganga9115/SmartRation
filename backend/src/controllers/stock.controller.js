import { Stock, Shop } from '../models/index.js';

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
    console.error('❌ getStock error:', err.message); // now visible in terminal
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/stock ───────────────────────────────────────
export const addStock = async (req, res) => {
  try {
    const {
      shop_id, item_name, unit,
      total_qty, available_qty, per_family_qty,
      min_qty_per_member, max_qty_per_family,
      is_optional, category,
    } = req.body;

    if (!shop_id || !item_name || !unit)
      return res.status(400).json({ success: false, message: 'shop_id, item_name and unit are required' });

    const shop = await Shop.findByPk(shop_id);
    if (!shop)
      return res.status(404).json({ success: false, message: 'Shop not found' });

    const existing = await Stock.findOne({ where: { shop_id, item_name } });
    if (existing)
      return res.status(409).json({ success: false, message: `'${item_name}' already exists for this shop` });

    const item = await Stock.create({
      shop_id,
      item_name,
      unit,
      total_qty:          total_qty          ?? 0,
      available_qty:      available_qty      ?? 0,
      per_family_qty:     per_family_qty     ?? 0,
      min_qty_per_member: min_qty_per_member ?? 0,
      max_qty_per_family: max_qty_per_family ?? 0,
      is_optional:        is_optional        ?? false,
      category:           category           ?? 'other',
    });

    return res.status(201).json({ success: true, message: 'Stock item added', item });
  } catch (err) {
    console.error('❌ addStock error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/stock/:id ────────────────────────────────────
export const updateStock = async (req, res) => {
  try {
    const item = await Stock.findByPk(req.params.id);
    if (!item)
      return res.status(404).json({ success: false, message: 'Stock item not found' });

    const {
      total_qty, available_qty, per_family_qty, unit,
      min_qty_per_member, max_qty_per_family, is_optional, category,
    } = req.body;

    await item.update({
      ...(total_qty          !== undefined && { total_qty }),
      ...(available_qty      !== undefined && { available_qty }),
      ...(per_family_qty     !== undefined && { per_family_qty }),
      ...(unit               !== undefined && { unit }),
      ...(min_qty_per_member !== undefined && { min_qty_per_member }),
      ...(max_qty_per_family !== undefined && { max_qty_per_family }),
      ...(is_optional        !== undefined && { is_optional }),
      ...(category           !== undefined && { category }),
    });

    return res.json({ success: true, message: 'Stock updated', item });
  } catch (err) {
    console.error('❌ updateStock error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/stock/:id/restock ────────────────────────────
export const restockItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity <= 0)
      return res.status(400).json({ success: false, message: 'quantity must be positive' });

    const item = await Stock.findByPk(req.params.id);
    if (!item)
      return res.status(404).json({ success: false, message: 'Stock item not found' });

    await item.update({
      total_qty:     parseFloat(item.total_qty)     + parseFloat(quantity),
      available_qty: parseFloat(item.available_qty) + parseFloat(quantity),
    });

    return res.json({
      success: true,
      message: `Restocked ${quantity} ${item.unit} of ${item.item_name}`,
      item,
    });
  } catch (err) {
    console.error('❌ restockItem error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/stock/:id ─────────────────────────────────
export const deleteStock = async (req, res) => {
  try {
    const item = await Stock.findByPk(req.params.id);
    if (!item)
      return res.status(404).json({ success: false, message: 'Stock item not found' });

    await item.destroy();
    return res.json({ success: true, message: 'Stock item removed' });
  } catch (err) {
    console.error('❌ deleteStock error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/stock/low-alert ──────────────────────────────
export const getLowStockItems = async (req, res) => {
  try {
    const where = {};
    if (req.query.shop_id) where.shop_id = req.query.shop_id;

    const all = await Stock.findAll({ where });
    const low = all.filter(
      i => parseFloat(i.total_qty) > 0 &&
           parseFloat(i.available_qty) / parseFloat(i.total_qty) < 0.2
    );

    return res.json({ success: true, count: low.length, items: low });
  } catch (err) {
    console.error('❌ getLowStockItems error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};