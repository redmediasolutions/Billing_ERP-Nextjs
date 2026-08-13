export interface ItemBatch {
  batch_id?: number;
  id?: number;
  batch_number: string;
  expiry_date: string;
  quantity: number;
}

export interface LedgerEntry {
  id?: number;
  transaction_type: string;
  quantity_change: number;
  batch_number?: string | null;
  reference_type?: string | null;
  reference_id?: string | null;
  created_at: string;
}

export interface AddStockInput {
  item_id: number;
  quantity: number;
  transaction_type?: string;
  reference_type?: string;
  reference_id?: string;
  batch_number?: string;
  expiry_date?: string;
}

export interface UpdateBatchInput {
  batch_number: string;
  expiry_date: string;
}

export interface OutwardStockInput {
  item_id: number;
  quantity_needed: number;
  transaction_type?: string;
  reference_type?: string;
  reference_id?: string;
}

export interface InvoiceStockLine {
  item_id: number | null;
  quantity: number;
}
