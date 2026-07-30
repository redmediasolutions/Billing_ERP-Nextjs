export interface Product {
  id: number;
  reference: string;
  brand_id: number | null;
  brand_name: string | null;
  product_type: string | null;
  product_name: string;
  product_code: string;
  product_config: string | null;
  product_description: string | null;
  product_HSN: string | null;
  image: string | null;
  product_usp: string | null;
  total_stock: number | string;
  available_stock: number | string;
  created_at: string;
  updated_at: string;
}

export interface ProductInput {
  brand_id: number | null;
  product_type: string;
  product_name: string;
  product_code: string;
  product_config: string;
  product_description: string;
  product_HSN: string;
  image: string;
  product_usp: string;
}