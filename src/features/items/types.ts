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
  tax_rate: number;
  unit: string | null;
  item_description: string | null;
  category: string | null;
  item_image: string | null;
  track_inventory: boolean;
  is_batch_tracked: boolean;
  total_stock: number;
  created_at: string;
}

export interface ItemInput {
  item_name: string;
  hsn_code: string;
  item_cost: number;
  tax_rate: number;
  item_cost_narration: string;
  item_description: string;
  category: string;
  item_image: string | null;
  track_inventory: boolean;
  is_batch_tracked: boolean;
}