"use client";

import type { Invoice } from "@/features/invoices/types";
import { DocumentBrand } from "./document-brand";
import { formatDocDate, formatDocMoney } from "../lib/document-utils";

/** Compact thermal-style receipt for POS walk-in / cloud kitchen bills. */
export function InvoiceReceiptSheet({
  invoice,
  sheetRef,
}: {
  invoice: Invoice;
  sheetRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const channelLabel =
    invoice.sales_channel === "cloud_kitchen" ? "Cloud Kitchen" : "Walk-in";

  return (
    <div
      ref={sheetRef}
      className="mx-auto w-full max-w-[340px] bg-white px-4 py-5 font-mono text-zinc-950 shadow-sm"
    >
      <DocumentBrand compact />

      <div className="my-3 border-t border-dashed border-zinc-300" />

      <div className="space-y-1 text-center text-[11px]">
        <p className="font-sans text-xs font-bold tracking-wide">
          SALE RECEIPT
        </p>
        <p>{formatDocDate(invoice.invoice_date || invoice.created_at)}</p>
        <p className="font-semibold">{invoice.invoice_number}</p>
        <p className="text-zinc-600">{channelLabel}</p>
      </div>

      <div className="my-3 border-t border-dashed border-zinc-300" />

      <div className="flex justify-between gap-3 text-[11px]">
        <div>
          <p className="text-zinc-500">Customer</p>
          <p className="font-sans font-semibold">
            {invoice.customer_name || "Walk-in Customer"}
          </p>
        </div>
        {invoice.table_name && (
          <div className="text-right">
            <p className="text-zinc-500">Table</p>
            <p className="font-sans font-semibold">{invoice.table_name}</p>
          </div>
        )}
      </div>

      <div className="my-3 border-t border-dashed border-zinc-300" />

      <table className="w-full text-[11px]">
        <thead>
          <tr className="border-b border-zinc-200 text-left text-zinc-500">
            <th className="pb-1 font-medium">Item</th>
            <th className="pb-1 text-right font-medium">Qty</th>
            <th className="pb-1 text-right font-medium">Amt</th>
          </tr>
        </thead>
        <tbody>
          {(invoice.line_items ?? []).map((line) => (
            <tr key={line.id} className="align-top">
              <td className="py-1.5 pr-2 font-sans">
                <p className="leading-snug">{line.item_name}</p>
                <p className="text-[10px] text-zinc-500">
                  @{formatDocMoney(line.unit_price)}
                </p>
              </td>
              <td className="py-1.5 text-right tabular-nums">
                {Number(line.quantity)}
              </td>
              <td className="py-1.5 text-right tabular-nums">
                {formatDocMoney(line.line_total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="my-3 border-t border-dashed border-zinc-300" />

      <div className="space-y-1 text-[11px]">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="tabular-nums">
            {formatDocMoney(invoice.subtotal)}
          </span>
        </div>
        {Number(invoice.discount_amount) > 0 && (
          <div className="flex justify-between">
            <span>Discount</span>
            <span className="tabular-nums">
              -{formatDocMoney(invoice.discount_amount)}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Tax</span>
          <span className="tabular-nums">
            {formatDocMoney(invoice.tax_amount)}
          </span>
        </div>
        <div className="flex justify-between border-t border-zinc-200 pt-2 font-sans text-sm font-bold">
          <span>TOTAL</span>
          <span className="tabular-nums">
            {formatDocMoney(invoice.rounded_total || invoice.grand_total)}
          </span>
        </div>
      </div>

      <div className="my-3 border-t border-dashed border-zinc-300" />

      <p className="text-center font-sans text-[10px] text-zinc-500">
        {invoice.notes || "Thank you! Visit again."}
      </p>
      <p className="mt-2 text-center text-[10px] text-zinc-400">
        {invoice.payment_terms || "Paid at counter"}
      </p>
    </div>
  );
}
