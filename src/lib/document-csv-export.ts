import {
  downloadCsvFile,
  inDateRange,
  rowsToCsv,
  toIsoDate,
} from "@/lib/csv";
import { invoicesService } from "@/features/invoices/services/invoices.service";
import { estimatesService } from "@/features/estimates/services/estimates.service";
import type { Invoice } from "@/features/invoices/types";
import type { Estimate } from "@/features/estimates/types";

const DETAIL_CONCURRENCY = 6;

async function mapInBatches<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
  onProgress?: (done: number, total: number) => void
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;
  let completed = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index], index);
      completed += 1;
      onProgress?.(completed, items.length);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, Math.max(items.length, 1)) },
    () => worker()
  );

  await Promise.all(workers);
  return results;
}

const INVOICE_HEADERS = [
  "Invoice Number",
  "Invoice Date",
  "Due Date",
  "Status",
  "Sales Channel",
  "Order Type",
  "Customer Name",
  "Billing Address",
  "Delivery Address",
  "Payment Terms",
  "Invoice Subtotal",
  "Invoice Discount",
  "Invoice Tax",
  "Invoice Grand Total",
  "Invoice Rounded Total",
  "Notes",
  "Created At",
  "Line No",
  "Item ID",
  "Item Name",
  "HSN Code",
  "Unit",
  "Description",
  "Quantity",
  "Unit Price",
  "Amount Before Tax",
  "Tax Rate %",
  "Tax Amount",
  "Line Discount",
  "Line Total",
] as const;

const ESTIMATE_HEADERS = [
  "Estimate Number",
  "Reference Number",
  "Estimate Date",
  "Valid Until",
  "Status",
  "Customer Name",
  "Billing Address",
  "Delivery Address",
  "Payment Terms",
  "Estimate Subtotal",
  "Estimate Discount",
  "Estimate Tax",
  "Estimate Grand Total",
  "Estimate Rounded Total",
  "Notes",
  "Created At",
  "Line No",
  "Item ID",
  "Item Name",
  "HSN Code",
  "Unit",
  "Description",
  "Quantity",
  "Unit Price",
  "Amount Before Tax",
  "Tax Rate %",
  "Tax Amount",
  "Line Discount",
  "Line Total",
] as const;

function flattenInvoice(invoice: Invoice): Array<Record<string, unknown>> {
  const base = {
    "Invoice Number": invoice.invoice_number || "",
    "Invoice Date": toIsoDate(invoice.invoice_date),
    "Due Date": toIsoDate(invoice.due_date),
    Status: invoice.is_draft ? "Draft" : "Finalized",
    "Sales Channel": invoice.sales_channel || "",
    "Order Type": invoice.order_type || "",
    "Customer Name": invoice.customer_name || "",
    "Billing Address": invoice.custom_billing_address || "",
    "Delivery Address": invoice.custom_delivery_address || "",
    "Payment Terms": invoice.payment_terms || "",
    "Invoice Subtotal": invoice.subtotal,
    "Invoice Discount": invoice.discount_amount,
    "Invoice Tax": invoice.tax_amount,
    "Invoice Grand Total": invoice.grand_total,
    "Invoice Rounded Total": invoice.rounded_total,
    Notes: invoice.notes || "",
    "Created At": invoice.created_at || "",
  };

  const lines = invoice.line_items ?? [];

  if (lines.length === 0) {
    return [
      {
        ...base,
        "Line No": "",
        "Item ID": "",
        "Item Name": "",
        "HSN Code": "",
        Unit: "",
        Description: "",
        Quantity: "",
        "Unit Price": "",
        "Amount Before Tax": "",
        "Tax Rate %": "",
        "Tax Amount": "",
        "Line Discount": "",
        "Line Total": "",
      },
    ];
  }

  return lines.map((line, index) => ({
    ...base,
    "Line No": index + 1,
    "Item ID": line.item_id ?? "",
    "Item Name": line.item_name || "",
    "HSN Code": line.hsn_code || "",
    Unit: line.unit || "",
    Description: line.description || "",
    Quantity: line.quantity,
    "Unit Price": line.unit_price,
    "Amount Before Tax": line.amount_before_tax,
    "Tax Rate %": line.tax_rate,
    "Tax Amount": line.tax_amount,
    "Line Discount": line.line_discount,
    "Line Total": line.line_total,
  }));
}

function flattenEstimate(estimate: Estimate): Array<Record<string, unknown>> {
  const base = {
    "Estimate Number": estimate.estimate_number || "",
    "Reference Number": estimate.reference_number || "",
    "Estimate Date": toIsoDate(estimate.estimate_date),
    "Valid Until": toIsoDate(estimate.valid_until),
    Status: estimate.is_draft ? "Draft" : "Finalized",
    "Customer Name": estimate.customer_name || "",
    "Billing Address": estimate.custom_billing_address || "",
    "Delivery Address": estimate.custom_delivery_address || "",
    "Payment Terms": estimate.payment_terms || "",
    "Estimate Subtotal": estimate.subtotal,
    "Estimate Discount": estimate.total_discount,
    "Estimate Tax": estimate.total_tax,
    "Estimate Grand Total": estimate.grand_total,
    "Estimate Rounded Total": estimate.rounded_total,
    Notes: estimate.notes || "",
    "Created At": estimate.created_at || "",
  };

  const lines = estimate.line_items ?? [];

  if (lines.length === 0) {
    return [
      {
        ...base,
        "Line No": "",
        "Item ID": "",
        "Item Name": "",
        "HSN Code": "",
        Unit: "",
        Description: "",
        Quantity: "",
        "Unit Price": "",
        "Amount Before Tax": "",
        "Tax Rate %": "",
        "Tax Amount": "",
        "Line Discount": "",
        "Line Total": "",
      },
    ];
  }

  return lines.map((line, index) => ({
    ...base,
    "Line No": index + 1,
    "Item ID": line.item_id ?? "",
    "Item Name": line.item_name || "",
    "HSN Code": line.hsn_code || "",
    Unit: line.unit || "",
    Description: line.description || "",
    Quantity: line.quantity,
    "Unit Price": line.unit_price,
    "Amount Before Tax": line.amount_before_tax,
    "Tax Rate %": line.tax_rate,
    "Tax Amount": line.tax_amount,
    "Line Discount": line.line_discount,
    "Line Total": line.line_total,
  }));
}

export async function exportInvoicesCsv(options: {
  mode: "range" | "all";
  from?: string;
  to?: string;
  onProgress?: (message: string) => void;
}) {
  const { mode, from, to, onProgress } = options;

  onProgress?.("Loading invoices...");
  const invoices = await invoicesService.list();
  const filtered = invoices.filter((invoice) =>
    mode === "all"
      ? true
      : inDateRange(invoice.invoice_date || invoice.created_at, from, to)
  );

  if (filtered.length === 0) {
    throw new Error(
      mode === "all"
        ? "No invoices to export."
        : "No invoices found in this date range."
    );
  }

  onProgress?.(`Fetching line items (0/${filtered.length})...`);

  const detailed = await mapInBatches(
    filtered,
    DETAIL_CONCURRENCY,
    (invoice) => invoicesService.getById(invoice.id),
    (done, total) => onProgress?.(`Fetching line items (${done}/${total})...`)
  );

  const rows = detailed.flatMap(flattenInvoice);
  const stamp = mode === "all" ? "all" : `${from}_to_${to}`;
  downloadCsvFile(
    `invoices-export-${stamp}.csv`,
    rowsToCsv([...INVOICE_HEADERS], rows)
  );

  return { documents: filtered.length, rows: rows.length };
}

export async function exportEstimatesCsv(options: {
  mode: "range" | "all";
  from?: string;
  to?: string;
  onProgress?: (message: string) => void;
}) {
  const { mode, from, to, onProgress } = options;

  onProgress?.("Loading estimates...");
  const estimates = await estimatesService.list();
  const filtered = estimates.filter((estimate) =>
    mode === "all"
      ? true
      : inDateRange(estimate.estimate_date || estimate.created_at, from, to)
  );

  if (filtered.length === 0) {
    throw new Error(
      mode === "all"
        ? "No estimates to export."
        : "No estimates found in this date range."
    );
  }

  onProgress?.(`Fetching line items (0/${filtered.length})...`);

  const detailed = await mapInBatches(
    filtered,
    DETAIL_CONCURRENCY,
    (estimate) => estimatesService.getById(estimate.id),
    (done, total) => onProgress?.(`Fetching line items (${done}/${total})...`)
  );

  const rows = detailed.flatMap(flattenEstimate);
  const stamp = mode === "all" ? "all" : `${from}_to_${to}`;
  downloadCsvFile(
    `estimates-export-${stamp}.csv`,
    rowsToCsv([...ESTIMATE_HEADERS], rows)
  );

  return { documents: filtered.length, rows: rows.length };
}
