export interface Stock {
  id: number;
  product_id: number;
  vendor_id: number | null;
  purchase_id: number | null;

  product_serial: string;
  barcode_gen: string | null;

  stock_name: string;
  stock_code: string | null;
  stock_hsn: string | null;

  stock_cost: number | string;
  sale_price: number | string;

  stock_narration: string | null;
  stock_description: string | null;
  item_condition: string | null;

  status: "available" | "sold" | "archived";
  invoice_id: number | null;
  invoice_number: string | null;
  sold_at: string | null;

  product_name: string;
  product_code: string;
  product_config: string | null;
  product_description: string | null;
  product_image: string | null;

  vendor_name: string | null;
  purchase_date: string | null;
  created_at: string;
}

export interface StockInput {
  product_id: number | null;
  vendor_id: number | null;
  purchase_date: string;
  stock_cost: string;
  sale_price: string;
  item_condition: string;
  narration: string;
  serials: string[];
}

export interface StockUpdateInput {
  vendor_id: number | null;
  product_serial: string;
  stock_cost: string;
  sale_price: string;
  item_condition: string;
  narration: string;
}

export interface SellStockInput {
  customer_id: number | null;
  sale_price: string;
  tax_rate: string;
  notes: string;
}

export interface CustomerOption {
  id: number;
  customer_name: string;
  customer_phone: string | null;
}