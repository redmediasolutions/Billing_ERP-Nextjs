import type { Item } from "@/features/items/types";

export type StockCheckResult =
  | { ok: true }
  | { ok: false; message: string };

export function checkStockAvailability(
  item: Pick<Item, "item_name" | "track_inventory" | "total_stock">,
  requestedQty: number
): StockCheckResult {
  if (!item.track_inventory) return { ok: true };

  if (requestedQty <= 0) {
    return { ok: false, message: "Quantity must be greater than zero." };
  }

  if (requestedQty > item.total_stock) {
    return {
      ok: false,
      message: `Insufficient stock for "${item.item_name}". Available: ${item.total_stock}`,
    };
  }

  return { ok: true };
}
