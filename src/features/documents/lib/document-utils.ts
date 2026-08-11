import type { Invoice } from "@/features/invoices/types";

/** POS checkout sets order_type to counter / cloud_kitchen; ERP form uses SALE. */
export function isPosInvoice(invoice: Invoice) {
  const orderType = (invoice.order_type || "").toLowerCase();
  const channel = invoice.sales_channel;

  if (orderType === "counter" || orderType === "cloud_kitchen") {
    return true;
  }

  if (channel === "cloud_kitchen") {
    return true;
  }

  // POS invoice numbers from generateInvoiceNumber: WI-... / CK-...
  if (/^(WI|CK)[-_]/i.test(invoice.invoice_number || "")) {
    return true;
  }

  return false;
}

export function formatDocDate(value?: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDocMoney(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}
