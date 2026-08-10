import type { Item } from "@/features/items/types";
import type { SalesChannel } from "@/features/invoices/types";

export type { SalesChannel };

export interface CartLine {
  item: Item;
  quantity: number;
}
