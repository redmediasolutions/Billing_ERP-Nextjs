export interface Product {
  id: number;
  reference: string;
  product_name: string;
  product_code: string;
  product_config: string | null;
  product_description: string | null;
  product_HSN: string | null;
  image: string | null;
  product_usp: string | null;
  is_archived: boolean;
  created_at: string;
}

export interface ProductInput {
  product_name: string;
  product_config: string;
  product_description: string;
  product_HSN: string;
  image: string | null;
  product_usp: string;
}
