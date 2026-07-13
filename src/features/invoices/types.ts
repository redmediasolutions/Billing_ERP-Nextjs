export interface InvoiceLineItem {
  id: string;
  item_id: number | null;
  batch_id: number | null;
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

export interface Invoice {
  id: number;
  reference: string;
  invoice_number: string;
  customer_id: number;
  customer_name: string;
  custom_billing_address: string | null;
  custom_delivery_address: string | null;
  invoice_date: string | null;
  due_date: string | null;
  payment_terms: string | null;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  grand_total: number;
  rounded_total: number;
  notes: string | null;
  order_type: string | null;
  table_name: string | null;
  is_draft: boolean;
  created_at: string;
  line_items?: InvoiceLineItem[];
}

export interface InvoiceInput {
  invoice_number: string;
  customer_id: number;
  custom_billing_address: string;
  custom_delivery_address: string;
  invoice_date: string;
  due_date: string;
  payment_terms: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  grand_total: number;
  rounded_total: number;
  notes: string;
  order_type: string;
  table_name: string;
  is_draft: boolean;
  line_items: InvoiceLineItem[];
}