import { Stock, Shop } from '../models/index.js';
import sequelize from '../config/db.js';

/**
 * Get total stock ratio for a shop (0 = empty, 1 = full).
 * Used by the slot recommender to score dates.
 */
export const getShopStockRatio = async (shopId) => {
  const items = await Stock.findAll({ where: { shop_id: shopId } });
  if (!items.length) return 0;

  const ratio =
    items.reduce((acc, i) => acc + (i.available_qty / (i.total_qty || 1)), 0) /
    items.length;

  return Math.min(1, Math.max(0, ratio));
};

/**
 * Maximum families the shop can serve based on current stock.
 */
export const getMaxFamiliesFromStock = (stockItems) => {
  if (!stockItems.length) return 50;

  const caps = stockItems
    .filter((i) => i.per_family_qty > 0)
    .map((i) => Math.floor(i.available_qty / i.per_family_qty));

  return caps.length ? Math.min(50, Math.min(...caps)) : 50;
};

/**
 * Check whether all items in a shop have sufficient stock
 * to serve one more family. Returns { sufficient, shortages[] }.
 */
export const checkStockSufficiency = async (shopId) => {
  const items = await Stock.findAll({ where: { shop_id: shopId } });
  const shortages = items.filter((i) => i.available_qty < i.per_family_qty);

  return {
    sufficient: shortages.length === 0,
    shortages:  shortages.map((i) => ({ item: i.item_name, available: i.available_qty, needed: i.per_family_qty })),
  };
};

/**
 * Deduct one family's allocation from all stock items (within an existing transaction).
 */
export const deductFamilyStock = async (shopId, transaction) => {
  const items = await Stock.findAll({ where: { shop_id: shopId } });

  for (const item of items) {
    await Stock.update(
      { available_qty: sequelize.literal(`available_qty - ${item.per_family_qty}`) },
      { where: { id: item.id }, transaction }
    );
  }
};

/**
 * Restore one family's allocation (on booking cancellation).
 */
export const restoreFamilyStock = async (shopId, transaction) => {
  const items = await Stock.findAll({ where: { shop_id: shopId } });

  for (const item of items) {
    await Stock.update(
      { available_qty: sequelize.literal(`LEAST(available_qty + ${item.per_family_qty}, total_qty)`) },
      { where: { id: item.id }, transaction }
    );
  }
};