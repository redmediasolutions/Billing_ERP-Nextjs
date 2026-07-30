export interface Brand {
  id: number;
  reference: string;
  name: string;
  description: string | null;
  brand_logo: string | null;
  cover_image: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrandInput {
  name: string;
  description: string;
  brand_logo: string;
  cover_image: string;
}