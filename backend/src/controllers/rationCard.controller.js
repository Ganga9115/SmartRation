// rationCard.controller.js
import { RationCard, Shop } from '../models/index.js';

// ── POST /api/ration-card/register ───────────────────────
export const registerCard = async (req, res) => {
  try {
    const { card_number, card_type, family_members, address, shop_id } = req.body;

    if (!card_number || !card_type || !address)
      return res.status(400).json({ success: false, message: 'card_number, card_type and address are required' });

    const existing = await RationCard.findOne({ where: { card_number } });
    if (existing)
      return res.status(409).json({ success: false, message: 'Ration card already registered' });

    const alreadyHasCard = await RationCard.findOne({ where: { user_id: req.user.id, is_active: true } });
    if (alreadyHasCard)
      return res.status(409).json({ success: false, message: 'You already have an active ration card' });

    if (shop_id) {
      const shop = await Shop.findByPk(shop_id);
      if (!shop || !shop.is_active)
        return res.status(404).json({ success: false, message: 'Selected shop not found or inactive' });
    }

    const card = await RationCard.create({
      user_id:        req.user.id,
      card_number,
      card_type,
      family_members: family_members ? parseInt(family_members) : 1,
      address,
      shop_id:        shop_id ? parseInt(shop_id) : null,
    });

    return res.status(201).json({ success: true, message: 'Ration card registered', card });
  } catch (err) {
    console.error('registerCard error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/ration-card/my ───────────────────────────────
export const getMyCard = async (req, res) => {
  try {
    const card = await RationCard.findOne({
      where:   { user_id: req.user.id },
      include: [{ model: Shop, attributes: ['id', 'name', 'address', 'phone', 'open_time', 'close_time'] }],
    });

    if (!card)
      return res.status(404).json({ success: false, message: 'No ration card found' });

    return res.json({ success: true, card });
  } catch (err) {
    console.error('getMyCard error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/ration-card/my ───────────────────────────────
export const updateCard = async (req, res) => {
  try {
    const card = await RationCard.findOne({ where: { user_id: req.user.id } });
    if (!card)
      return res.status(404).json({ success: false, message: 'No ration card found' });

    const { family_members, address, shop_id } = req.body;

    if (shop_id !== undefined) {
      const shop = await Shop.findByPk(shop_id);
      if (!shop || !shop.is_active)
        return res.status(404).json({ success: false, message: 'Shop not found or inactive' });
    }

    await card.update({
      ...(family_members !== undefined && { family_members: parseInt(family_members) }),
      ...(address        !== undefined && { address }),
      ...(shop_id        !== undefined && { shop_id: parseInt(shop_id) }),
    });

    const updated = await RationCard.findOne({
      where:   { user_id: req.user.id },
      include: [{ model: Shop, attributes: ['id', 'name', 'address', 'phone'] }],
    });

    return res.json({ success: true, message: 'Card updated', card: updated });
  } catch (err) {
    console.error('updateCard error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};