import { catalogSellPrice } from "@/lib/catalog-price";
import type { Item } from "@/features/items/types";
import type { SalesChannel } from "@/features/invoices/types";

/** Price for an item under the active channel — mirrors the server's computeLineItemAmounts logic. */
export function priceFor(item: Item, channel: SalesChannel): number {
  return catalogSellPrice(item, channel);
}
