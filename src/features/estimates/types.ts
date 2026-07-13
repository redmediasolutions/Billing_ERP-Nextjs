export interface Customer {
  id: number;
  reference: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  customer_gst: string | null;
  customer_business_name: string | null;

  customer_billing_address: string | null;
  customer_shipping_address: string | null;

  customer_gst_state: string | null;
  customer_gst_state_code: string | null;

  is_archived: boolean;
  created_at: string;
}

export interface CatalogItem {
  id: number;
  item_name: string;
  item_code: string;
  hsn_code: string | null;
  item_cost: number;
  tax_rate: number;
  unit: string | null;
  item_description: string | null;
}

export interface EstimateLineItem {
  id: string;
  item_id: number | null;
  item_name: string;
  hsn_code: string;
  unit: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount_before_tax: number;
  tax_rate: number;
  tax_amount: number;
  line_discount: number;
  line_total: number;
}

export interface Estimate {
  id: number;
  reference: string;
  estimate_number: string;
  reference_number: string | null;
  customer_id: number;
  customer_name: string;
  custom_billing_address: string | null;
  custom_delivery_address: string | null;
  estimate_date: string | null;
  valid_until: string | null;
  payment_terms: string | null;
  subtotal: number;
  total_discount: number;
  total_tax: number;
  grand_total: number;
  rounded_total: number;
  notes: string | null;
  transfer_information: string | null;
  is_draft: boolean;
  created_at: string;
  line_items?: EstimateLineItem[];
}

export interface EstimateInput {
  estimate_number: string;
  reference_number: string;
  customer_id: number;
  custom_billing_address: string;
  custom_delivery_address: string;
  estimate_date: string;
  valid_until: string;
  payment_terms: string;
  subtotal: number;
  total_discount: number;
  total_tax: number;
  grand_total: number;
  rounded_total: number;
  notes: string;
  transfer_information: string;
  is_draft: boolean;
  line_items: EstimateLineItem[];
}