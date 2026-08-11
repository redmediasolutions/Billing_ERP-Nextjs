import { invoicesRepository } from "../repository/invoices.repository";
import type { Invoice, InvoiceInput, InvoiceLineItem } from "../types";

function toNum(value: unknown, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function normalizeLineItem(
  line: InvoiceLineItem & { qty?: unknown }
): InvoiceLineItem {
  const unitPrice = toNum(line.unit_price);
  const amountBeforeTax = toNum(line.amount_before_tax);
  const lineTotal = toNum(line.line_total);

  // Some rows were saved with line totals but a missing/zero quantity.
  // Prefer the DB quantity; otherwise derive from amount ÷ rate.
  let quantity = toNum(line.quantity ?? line.qty);

  if (quantity <= 0 && unitPrice > 0) {
    const basis = amountBeforeTax > 0 ? amountBeforeTax : lineTotal;
    if (basis > 0) {
      quantity = Number((basis / unitPrice).toFixed(2));
    }
  }

  return {
    ...line,
    id: String(line.id),
    quantity,
    unit_price: unitPrice,
    amount_before_tax: amountBeforeTax,
    tax_rate: toNum(line.tax_rate),
    tax_amount: toNum(line.tax_amount),
    line_discount: toNum(line.line_discount),
    line_total: lineTotal,
  };
}

function normalizeInvoice(invoice: Invoice): Invoice {
  const lineItems = invoice.line_items?.map(normalizeLineItem);

  // If header totals were saved as 0 but lines have amounts, rebuild for display.
  const linesSubtotal =
    lineItems?.reduce(
      (sum, line) => sum + toNum(line.amount_before_tax || line.line_total),
      0
    ) ?? 0;
  const linesTax =
    lineItems?.reduce((sum, line) => sum + toNum(line.tax_amount), 0) ?? 0;
  const linesTotal =
    lineItems?.reduce((sum, line) => sum + toNum(line.line_total), 0) ?? 0;

  const subtotal = toNum(invoice.subtotal) || linesSubtotal;
  const taxAmount = toNum(invoice.tax_amount) || linesTax;
  const grandTotal = toNum(invoice.grand_total) || linesTotal;
  const roundedTotal =
    toNum(invoice.rounded_total) || Math.round(grandTotal);

  return {
    ...invoice,
    subtotal,
    discount_amount: toNum(invoice.discount_amount),
    tax_amount: taxAmount,
    grand_total: grandTotal,
    rounded_total: roundedTotal,
    is_draft: Number(invoice.is_draft) === 1,
    line_items: lineItems,
  };
}

export const invoicesService = {
  async list() {
    const invoices = await invoicesRepository.list();
    return invoices.map(normalizeInvoice);
  },

  async getById(id: number) {
    const invoice = await invoicesRepository.getById(id);
    return normalizeInvoice(invoice);
  },

  async create(input: InvoiceInput) {
    const invoice = await invoicesRepository.create(input);
    return normalizeInvoice(invoice);
  },

  async update(id: number, input: InvoiceInput) {
    const invoice = await invoicesRepository.update(id, input);
    return normalizeInvoice(invoice);
  },

  remove: (id: number) => invoicesRepository.remove(id),
};
