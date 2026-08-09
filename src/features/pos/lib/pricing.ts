import type { Item } from "@/features/items/types";
import type { SalesChannel } from "@/features/invoices/types";

/** Price for an item under the active channel — mirrors the server's computeLineItemAmounts logic. */
export function priceFor(item: Item, channel: SalesChannel): number {
  const chosen =
    channel === "cloud_kitchen" ? item.cloud_kitchen_price : item.walk_in_price;
  return chosen && Number(chosen) > 0 ? Number(chosen) : Number(item.item_cost) || 0;
}
