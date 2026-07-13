import { estimatesRepository } from "../repository/estimates.repository";
import type { Estimate, EstimateInput } from "../types";

function normalizeEstimate(estimate: Estimate): Estimate {
  return {
    ...estimate,
    subtotal: Number(estimate.subtotal || 0),
    total_discount: Number(estimate.total_discount || 0),
    total_tax: Number(estimate.total_tax || 0),
    grand_total: Number(estimate.grand_total || 0),
    rounded_total: Number(estimate.rounded_total || 0),
    is_draft: Number(estimate.is_draft) === 1,
    line_items: estimate.line_items?.map((line) => ({
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

export const estimatesService = {
  async list() {
    const estimates = await estimatesRepository.list();
    return estimates.map(normalizeEstimate);
  },

  async getById(id: number) {
    const estimate = await estimatesRepository.getById(id);
    return normalizeEstimate(estimate);
  },

  create: (input: EstimateInput) =>
    estimatesRepository.create(input),

  update: (id: number, input: EstimateInput) =>
    estimatesRepository.update(id, input),

  remove: (id: number) =>
    estimatesRepository.remove(id),

  getCustomers: () =>
    estimatesRepository.getCustomers(),

  getItems: () =>
    estimatesRepository.getItems(),
};