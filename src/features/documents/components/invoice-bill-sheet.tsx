"use client";

import type { Invoice } from "@/features/invoices/types";
import { DocumentBrand } from "./document-brand";
import { formatDocDate, formatDocMoney } from "../lib/document-utils";

export function InvoiceBillSheet({
  invoice,
  sheetRef,
}: {
  invoice: Invoice;
  sheetRef?: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={sheetRef}
      className="mx-auto w-full max-w-[720px] bg-white p-6 text-zinc-950 shadow-sm sm:p-8"
    >
      <header className="flex flex-col gap-6 border-b border-zinc-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <DocumentBrand />

        <div className="text-left sm:text-right">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Tax Invoice
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight">
            {invoice.invoice_number}
          </p>
          <div className="mt-3 space-y-1 text-xs text-zinc-600">
            <p>
              Invoice date:{" "}
              <span className="font-medium text-zinc-950">
                {formatDocDate(invoice.invoice_date)}
              </span>
            </p>
            <p>
              Due date:{" "}
              <span className="font-medium text-zinc-950">
                {formatDocDate(invoice.due_date)}
              </span>
            </p>
            <p>
              Status:{" "}
              <span className="font-medium text-zinc-950">
                {invoice.is_draft ? "Draft" : "Finalized"}
              </span>
            </p>
          </div>
        </div>
      </header>

      <section className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Bill To
          </p>
          <h2 className="mt-1 text-base font-semibold">
            {invoice.customer_display_name || invoice.customer_name || "Customer"}
          </h2>
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-zinc-600">
            {invoice.custom_billing_address || "No billing address"}
          </p>
          {invoice.custom_delivery_address && (
            <>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Ship To
              </p>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-zinc-600">
                {invoice.custom_delivery_address}
              </p>
            </>
          )}
        </div>

        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm">
          <Row
            label="Payment terms"
            value={invoice.payment_terms || "Due on receipt"}
          />
          {invoice.order_type && (
            <Row label="Order type" value={invoice.order_type} />
          )}
          {invoice.sales_channel && (
            <Row
              label="Channel"
              value={
                invoice.sales_channel === "cloud_kitchen"
                  ? "Cloud kitchen"
                  : "Walk-in"
              }
            />
          )}
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-lg border border-zinc-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-950 text-white">
            <tr>
              <th className="px-3 py-2.5 font-medium">Description</th>
              <th className="px-3 py-2.5 text-right font-medium">Qty</th>
              <th className="px-3 py-2.5 text-right font-medium">Rate</th>
              <th className="px-3 py-2.5 text-right font-medium">Tax</th>
              <th className="px-3 py-2.5 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {(invoice.line_items ?? []).map((line) => (
              <tr key={line.id} className="border-t border-zinc-200">
                <td className="px-3 py-3 align-top">
                  <p className="font-medium">{line.item_name}</p>
                  {line.description && (
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {line.description}
                    </p>
                  )}
                  {line.hsn_code && (
                    <p className="mt-0.5 text-[11px] text-zinc-400">
                      HSN {line.hsn_code}
                    </p>
                  )}
                  {!line.item_id && (
                    <p className="mt-0.5 text-[11px] text-amber-600">
                      Snapshot line (not linked to current catalog)
                    </p>
                  )}
                </td>
                <td className="px-3 py-3 text-right tabular-nums">
                  {Number(line.quantity).toFixed(2)}
                </td>
                <td className="px-3 py-3 text-right tabular-nums">
                  {formatDocMoney(line.unit_price)}
                </td>
                <td className="px-3 py-3 text-right tabular-nums">
                  {Number(line.tax_rate)}%
                </td>
                <td className="px-3 py-3 text-right font-medium tabular-nums">
                  {formatDocMoney(line.line_total)}
                </td>
              </tr>
            ))}
            {(invoice.line_items ?? []).length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-8 text-center text-zinc-500"
                >
                  No line items
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Notes
          </p>
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-zinc-600">
            {invoice.notes || "Thank you for your business."}
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <TotalRow label="Subtotal" value={formatDocMoney(invoice.subtotal)} />
          <TotalRow
            label="Discount"
            value={formatDocMoney(invoice.discount_amount)}
          />
          <TotalRow label="Tax" value={formatDocMoney(invoice.tax_amount)} />
          <div className="mt-3 flex items-center justify-between border-t border-zinc-300 pt-3">
            <span className="text-sm font-semibold">Grand Total</span>
            <span className="text-lg font-bold tabular-nums">
              {formatDocMoney(invoice.rounded_total)}
            </span>
          </div>
        </div>
      </section>

      <section className="mt-10 grid grid-cols-2 gap-8">
        <Signature label="Authorized Signature" />
        <Signature label="Customer Acceptance" />
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <span className="text-zinc-500">{label}</span>
      <span className="font-medium text-zinc-950">{value}</span>
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-zinc-600">{label}</span>
      <span className="font-medium tabular-nums text-zinc-950">{value}</span>
    </div>
  );
}

function Signature({ label }: { label: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <div className="mt-10 border-b border-zinc-300" />
    </div>
  );
}
