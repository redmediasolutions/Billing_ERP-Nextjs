// Medicines are ERP items (item_type = 'medicine', batch tracked).
export interface Medicine {
  id: number;
  item_code: string | null;
  name: string;
  category: string | null;
  manufacturer: string | null;
  description: string | null;
  hsn_code: string | null;
  tax_rate: number;
  unit: string | null;
  default_price: number;
  selling_price: number;
  total_stock: number;
  batch_count: number;
  nearest_expiry: string | null;
}

export interface MedicineBatch {
  id: number;
  medicine_id: number;
  medicine_name: string;
  batch_no: string;
  quantity: number;
  purchase_price: number;
  selling_price: number;
  expiry_date: string | null;
  no_expiry: boolean;
}

export interface MedicineDetail extends Medicine {
  batches: MedicineBatch[];
}

export interface MedicineInput {
  name: string;
  category: string;
  manufacturer: string;
  description: string;
  hsn_code: string;
  tax_rate: number;
  unit: string;
  default_price: number;
}

export interface MedicineBatchInput {
  medicine_id: number;
  batch_no: string;
  quantity: number;
  purchase_price: number;
  selling_price: number;
  expiry_date: string;
}

export const MEDICINE_CATEGORIES = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Injection",
  "Ointment",
  "Drops",
  "Inhaler",
  "Powder",
  "Consumable",
  "Other",
];
