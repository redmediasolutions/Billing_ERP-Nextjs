export type PaymentStatus = "paid" | "unpaid";
export type RecurrenceInterval = "weekly" | "monthly" | "yearly";

export interface ExpenseCategory {
  id: number;
  created_at: string;
  category_name: string;
  description: string | null;
  is_active: boolean;
  is_system: boolean;
  sort_order: number;
}

export interface Expense {
  id: number;
  created_at: string;
  updated_at: string;
  tenant_id: number;
  reference: string;
  expense_name: string;
  expense_date: string;
  amount: number;
  tax_rate: number;
  tax_inclusive: boolean;
  tax_amount: number;
  total_amount: number;
  category_ref: number | null;
  vendor_ref: number | null;
  vendor_name: string | null;
  employee_ref: number | null;
  description: string | null;
  payment_mode: string | null;
  payment_status: PaymentStatus;
  bill_number: string | null;
  receipt_url: string | null;
  is_recurring: boolean;
  recurrence_interval: RecurrenceInterval | null;
  next_due_date: string | null;
  is_parts_purchase: boolean;
  is_parcel_charge: boolean;
  is_reimbursable: boolean;
  is_archived: boolean;
  category_name: string | null;
  display_vendor_name: string | null;
  employee_name: string | null;
}

export interface ExpenseInput {
  expense_name: string;
  expense_date: string;
  amount: number;
  tax_rate: number;
  tax_inclusive: boolean;
  category_ref: number | null;
  vendor_ref: number | null;
  vendor_name: string;
  employee_ref: number | null;
  description: string;
  payment_mode: string;
  payment_status: PaymentStatus;
  bill_number: string;
  receipt_url: string;
  is_recurring: boolean;
  recurrence_interval: RecurrenceInterval;
  next_due_date: string;
  is_parts_purchase: boolean;
  is_parcel_charge: boolean;
  is_reimbursable: boolean;
}

export interface ExpenseSummary {
  this_month: number;
  last_month: number;
  unpaid: number;
  parts_this_month: number;
  parcel_this_month: number;
  recurring_due: number;
  expense_count: number;
  by_category: Array<{
    category_name: string;
    total: number;
  }>;
}

export interface ExpenseCategoryInput {
  category_name: string;
  description?: string;
  is_active?: boolean;
}

export const PAYMENT_MODES = [
  "Cash",
  "UPI",
  "Bank Transfer",
  "Card",
  "Cheque",
  "Credit",
] as const;
