import { itemsRepository } from "../repository/items.repository";
import type { Item, ItemInput } from "../types";

function normalizeItem(item: Item): Item {
  return {
    ...item,
    item_cost: Number(item.item_cost || 0),
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
    const item = await itemsRepository.create(input);
    return normalizeItem(item);
  },

  async update(id: number, input: ItemInput) {
    const item = await itemsRepository.update(id, input);
    return normalizeItem(item);
  },

  remove: (id: number) => itemsRepository.remove(id),
};