import { apiRequest } from "@/lib/api";

import type {
  AddStockInput,
  InvoiceStockLine,
  ItemBatch,
  LedgerEntry,
  OutwardStockInput,
  UpdateBatchInput,
} from "../types/inventory.types";

export const inventoryService = {
  addStock: (input: AddStockInput) =>
    apiRequest<null>("/inventory/inward", {
      method: "POST",
      body: JSON.stringify({
        item_id: input.item_id,
        quantity: input.quantity,
        transaction_type: input.transaction_type ?? "PURCHASE",
        reference_type: input.reference_type ?? "manual_entry",
        reference_id: input.reference_id,
        batch_number: input.batch_number,
        expiry_date: input.expiry_date,
      }),
    }),

  deductStock: (input: OutwardStockInput) =>
    apiRequest<null>("/inventory/outward", {
      method: "POST",
      body: JSON.stringify({
        item_id: input.item_id,
        quantity_needed: input.quantity_needed,
        transaction_type: input.transaction_type ?? "SALE",
        reference_type: input.reference_type ?? "invoice",
        reference_id: input.reference_id,
      }),
    }),

  async deductForInvoice(invoiceId: number, lineItems: InvoiceStockLine[]) {
    const lines = lineItems.filter(
      (line) => line.item_id && line.quantity > 0
    );

    for (const line of lines) {
      await inventoryService.deductStock({
        item_id: line.item_id!,
        quantity_needed: line.quantity,
        reference_type: "invoice",
        reference_id: String(invoiceId),
      });
    }
  },

  getBatches: (itemId: number) =>
    apiRequest<ItemBatch[]>(`/inventory/${itemId}/batches`),

  getLedger: (itemId: number) =>
    apiRequest<LedgerEntry[]>(`/inventory/${itemId}/ledger`),

  updateBatch: (batchId: number, input: UpdateBatchInput) =>
    apiRequest<null>(`/inventory/batches/${batchId}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
};
