export type PricedCatalogItem = {
  item_cost?: number | null;
  walk_in_price?: number | null;
  cloud_kitchen_price?: number | null;
};

export function catalogSellPrice(
  item: PricedCatalogItem,
  channel: "walk_in" | "cloud_kitchen" = "walk_in"
): number {
  const cost = Number(item.item_cost) || 0;
  const walkIn = Number(item.walk_in_price) || 0;
  const cloud = Number(item.cloud_kitchen_price) || 0;
  const channelPrice = channel === "cloud_kitchen" ? cloud : walkIn;

  if (channelPrice > 0) return channelPrice;
  if (walkIn > 0) return walkIn;
  if (cloud > 0) return cloud;
  return cost;
}

export function toDateInputValue(value?: string | null): string {
  if (!value) return "";
  const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : "";
}
