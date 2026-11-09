// Clinic services are ERP items with item_type = 'service'.
export interface ClinicService {
  id: number;
  item_code: string | null;
  name: string;
  cost: number;
  description: string | null;
  image_url: string | null;
  tax_rate: number;
  hsn_code: string | null;
}

export interface ClinicServiceInput {
  name: string;
  cost: number;
  description: string;
  tax_rate: number;
  hsn_code: string;
}
