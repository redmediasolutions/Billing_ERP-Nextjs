import { estimatesRepository } from "../repository/estimates.repository";
import type { CatalogItem, Estimate, EstimateInput, EstimateLineItem } from "../types";

function toNum(value: unknown, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function normalizeLineItem(line: EstimateLineItem): EstimateLineItem {
  const unitPrice = toNum(line.unit_price);
  const amountBeforeTax = toNum(line.amount_before_tax);
  const lineTotal = toNum(line.line_total);
  let quantity = toNum(line.quantity);

  if (quantity <= 0 && unitPrice > 0) {
    const basis = amountBeforeTax > 0 ? amountBeforeTax : lineTotal;
    if (basis > 0) {
      quantity = Number((basis / unitPrice).toFixed(2));
    }
  }

  const taxRate = toNum(line.tax_rate);
  const discountPercent = toNum(line.line_discount);
  const resolvedAmount =
    amountBeforeTax > 0 ? amountBeforeTax : unitPrice * (quantity || 0);
  const discountAmount = (resolvedAmount * discountPercent) / 100;
  const taxable = resolvedAmount - discountAmount;
  const taxAmount =
    toNum(line.tax_amount) || (taxable * taxRate) / 100;
  const resolvedTotal = lineTotal > 0 ? lineTotal : taxable + taxAmount;

  return {
    ...line,
    id: String(line.id),
    quantity,
    unit_price: unitPrice,
    amount_before_tax: resolvedAmount,
    tax_rate: taxRate,
    tax_amount: taxAmount,
    line_discount: discountPercent,
    line_total: resolvedTotal,
  };
}

function normalizeEstimate(estimate: Estimate): Estimate {
  const lineItems = estimate.line_items?.map(normalizeLineItem);

  const linesSubtotal =
    lineItems?.reduce((sum, line) => sum + toNum(line.amount_before_tax), 0) ??
    0;
  const linesTax =
    lineItems?.reduce((sum, line) => sum + toNum(line.tax_amount), 0) ?? 0;
  const linesTotal =
    lineItems?.reduce((sum, line) => sum + toNum(line.line_total), 0) ?? 0;

  const subtotal = toNum(estimate.subtotal) || linesSubtotal;
  const totalTax = toNum(estimate.total_tax) || linesTax;
  const grandTotal = toNum(estimate.grand_total) || linesTotal;
  const roundedTotal =
    toNum(estimate.rounded_total) || Math.round(grandTotal);

  return {
    ...estimate,
    subtotal,
    total_discount: toNum(estimate.total_discount),
    total_tax: totalTax,
    grand_total: grandTotal,
    rounded_total: roundedTotal,
    is_draft: Number(estimate.is_draft) === 1,
    line_items: lineItems,
  };
}

export const estimatesService = {
  async list() {
    const estimates = await estimatesRepository.list();
    return estimates.map(normalizeEstimate);
  },

  async getById(id: number) {
    const estimate = await estimatesRepository.getById(id);
    return normalizeEstimate(estimate);
  },

  async create(input: EstimateInput) {
    const estimate = await estimatesRepository.create(input);
    return normalizeEstimate(estimate);
  },

  async update(id: number, input: EstimateInput) {
    const estimate = await estimatesRepository.update(id, input);
    return normalizeEstimate(estimate);
  },

  remove: (id: number) =>
    estimatesRepository.remove(id),

  getCustomers: () =>
    estimatesRepository.getCustomers(),

  async getItems() {
    const items = await estimatesRepository.getItems();
    return items.map((item) => ({
      ...item,
      item_cost: Number(item.item_cost || 0),
      walk_in_price:
        item.walk_in_price == null ? null : Number(item.walk_in_price),
      cloud_kitchen_price:
        item.cloud_kitchen_price == null
          ? null
          : Number(item.cloud_kitchen_price),
      tax_rate: Number(item.tax_rate || 0),
      total_stock: Number(item.total_stock || 0),
    })) as CatalogItem[];
  },
};