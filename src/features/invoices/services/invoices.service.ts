import { invoicesRepository } from "../repository/invoices.repository";
import type { Invoice, InvoiceInput } from "../types";

function normalizeInvoice(invoice: Invoice): Invoice {
  return {
    ...invoice,
    subtotal: Number(invoice.subtotal || 0),
    discount_amount: Number(invoice.discount_amount || 0),
    tax_amount: Number(invoice.tax_amount || 0),
    grand_total: Number(invoice.grand_total || 0),
    rounded_total: Number(invoice.rounded_total || 0),
    is_draft: Number(invoice.is_draft) === 1,

    line_items: invoice.line_items?.map((line) => ({
      ...line,
      quantity: Number(line.quantity || 0),
      unit_price: Number(line.unit_price || 0),
      amount_before_tax: Number(line.amount_before_tax || 0),
      tax_rate: Number(line.tax_rate || 0),
      tax_amount: Number(line.tax_amount || 0),
      line_discount: Number(line.line_discount || 0),
      line_total: Number(line.line_total || 0),
    })),
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