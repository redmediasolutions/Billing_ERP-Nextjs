export const ITEM_UNITS = [
  "PCS",
  "NOS",
  "BOX",
  "KG",
  "GM",
  "LTR",
  "ML",
  "MTR",
  "SQFT",
  "RFT",
  "SERVICE",
] as const;

export type ItemUnit = (typeof ITEM_UNITS)[number];

export interface Item {
  id: number;
  reference: string;
  item_name: string;
  item_code: string;
  hsn_code: string | null;
  item_cost: number;
  walk_in_price: number | null;
  cloud_kitchen_price: number | null;
  tax_rate: number;
  unit: string | null;
  item_description: string | null;
  category: string | null;
  item_image: string | null;
  track_inventory: boolean;
  is_batch_tracked: boolean;
  total_stock: number;
  /** Default days between service visits (e.g. 180 for AC AMC). */
  service_interval_days: number | null;
  /** Suggested reminder title when scheduling from this item. */
  service_reminder_title: string | null;
  created_at: string;
}

export interface ItemInput {
  item_name: string;
  hsn_code: string;
  item_cost: number;
  walk_in_price?: number | null;
  cloud_kitchen_price?: number | null;
  tax_rate: number;
  item_cost_narration: string;
  item_description: string;
  category: string;
  item_image: string | null;
  track_inventory: boolean;
  is_batch_tracked: boolean;
  service_interval_days?: number | null;
  service_reminder_title?: string;
}

/** Restaurant / POS unit options (item_cost_narration). */
export const POS_UNIT_OPTIONS = [
  "Piece",
  "Plate",
  "Portion",
  "Glass",
  "Bowl",
  "KG",
  "Litre",
  "Pack",
] as const;