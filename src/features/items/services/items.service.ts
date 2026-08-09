import { itemsRepository } from "../repository/items.repository";
import type { Item, ItemInput } from "../types";

/** Shape expected by POST/PUT /items — mirrors the Express route body. */
function serializeItemInput(input: ItemInput) {
  const itemCost = Number(input.item_cost) || 0;
  const walkInRaw =
    input.walk_in_price === undefined || input.walk_in_price === null
      ? itemCost
      : Number(input.walk_in_price);
  const cloudKitchenRaw =
    input.cloud_kitchen_price === undefined || input.cloud_kitchen_price === null
      ? 0
      : Number(input.cloud_kitchen_price);
  const trackInventory = Boolean(input.track_inventory);

  return {
    item_name: input.item_name.trim(),
    hsn_code: (input.hsn_code ?? "").trim(),
    item_cost: itemCost || walkInRaw || 0,
    tax_rate: Number(input.tax_rate) || 0,
    item_cost_narration: (input.item_cost_narration ?? "PCS").trim(),
    item_description: (input.item_description ?? "").trim(),
    category: (input.category ?? "").trim(),
    item_image: input.item_image || null,
    track_inventory: trackInventory ? 1 : 0,
    is_batch_tracked: trackInventory && input.is_batch_tracked ? 1 : 0,
    walk_in_price: walkInRaw || 0,
    cloud_kitchen_price: cloudKitchenRaw || 0,
  };
}

function normalizeItem(item: Item): Item {
  return {
    ...item,
    item_cost: Number(item.item_cost || 0),
    walk_in_price:
      item.walk_in_price === null || item.walk_in_price === undefined
        ? null
        : Number(item.walk_in_price),
    cloud_kitchen_price:
      item.cloud_kitchen_price === null || item.cloud_kitchen_price === undefined
        ? null
        : Number(item.cloud_kitchen_price),
    tax_rate: Number(item.tax_rate || 0),
    total_stock: Number(item.total_stock || 0),

    // MariaDB may return 0 / 1 or "0" / "1".
    track_inventory: Number(item.track_inventory) === 1,
    is_batch_tracked: Number(item.is_batch_tracked) === 1,
  };
}

export const itemsService = {
  async list(search?: string) {
    const items = await itemsRepository.list(search);
    return items.map(normalizeItem);
  },

  async create(input: ItemInput) {
    const item = await itemsRepository.create(serializeItemInput(input));
    return normalizeItem(item);
  },

  async update(id: number, input: ItemInput) {
    const item = await itemsRepository.update(id, serializeItemInput(input));
    return normalizeItem(item);
  },

  remove: (id: number) => itemsRepository.remove(id),
};