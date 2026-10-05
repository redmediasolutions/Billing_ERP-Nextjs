import type { Invoice } from "../types";

export type InvoiceCollectionStatus =
  | "draft"
  | "finalized"
  | "partial"
  | "paid"
  | "overdue";

const STATUS_LABEL: Record<InvoiceCollectionStatus, string> = {
  draft: "Draft",
  finalized: "Finalized",
  partial: "Partially paid",
  paid: "Paid",
  overdue: "Overdue",
};

export function invoicePayable(invoice: Pick<Invoice, "rounded_total" | "grand_total">) {
  const total = Number(invoice.rounded_total || invoice.grand_total || 0);
  return roundMoney(Number.isFinite(total) ? total : 0);
}

export function invoicePaid(invoice: Pick<Invoice, "amount_paid">) {
  const paid = Number(invoice.amount_paid || 0);
  return roundMoney(Number.isFinite(paid) ? Math.max(0, paid) : 0);
}

export function invoiceBalance(
  invoice: Pick<Invoice, "rounded_total" | "grand_total" | "amount_paid">
) {
  return roundMoney(Math.max(0, invoicePayable(invoice) - invoicePaid(invoice)));
}

export function collectionStatus(
  invoice: Pick<
    Invoice,
    "is_draft" | "due_date" | "rounded_total" | "grand_total" | "amount_paid"
  >
): InvoiceCollectionStatus {
  if (invoice.is_draft) return "draft";

  const paid = invoicePaid(invoice);
  const balance = invoiceBalance(invoice);

  if (balance <= 0.009) return "paid";
  if (isPastDue(invoice.due_date)) return "overdue";
  if (paid > 0.009) return "partial";
  return "finalized";
}

export function collectionLabel(status: InvoiceCollectionStatus) {
  return STATUS_LABEL[status];
}

export function matchesCollectionFilter(
  invoice: Pick<
    Invoice,
    "is_draft" | "due_date" | "rounded_total" | "grand_total" | "amount_paid"
  >,
  statusFilter: string
) {
  const status = collectionStatus(invoice);

  if (statusFilter === "draft") return status === "draft";
  if (statusFilter === "finalized") return status === "finalized";
  if (statusFilter === "paid") return status === "paid";
  if (statusFilter === "partial") return status === "partial";
  if (statusFilter === "overdue") return status === "overdue";

  return true;
}

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function isPastDue(dueDate: string | null) {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return due < today;
}
