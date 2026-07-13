"use client";

import Link from "next/link";
import {
  FileText,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useDeleteInvoice,
  useInvoices,
} from "../hooks/use-invoices";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export function InvoicesDashboard() {
  const { data: invoices = [], isLoading, error } =
    useInvoices();

  const deleteInvoice = useDeleteInvoice();

  const draftCount = invoices.filter(
    (invoice) => invoice.is_draft
  ).length;

  const totalValue = invoices.reduce(
    (sum, invoice) => sum + invoice.rounded_total,
    0
  );

  async function removeInvoice(id: number) {
    if (
      !window.confirm(
        "Archive this invoice? Stock will be automatically restored."
      )
    ) {
      return;
    }

    await deleteInvoice.mutateAsync(id);
  }

  return (
    <section className="min-h-screen bg-[#111113] p-5 pt-20 text-white lg:p-8 lg:pt-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#FFCC00]">
            Sales
          </p>

          <h1 className="mt-1 text-3xl font-bold">Invoices</h1>

          <p className="mt-2 text-sm text-zinc-400">
            Create invoices and manage billing records.
          </p>
        </div>

        <Button
          asChild
          className="bg-[#FFCC00] font-bold text-black hover:bg-yellow-400"
        >
          <Link href="/dashboard/invoices/new">
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Link>
        </Button>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-3">
        <Kpi label="Total Invoices" value={invoices.length} />

        <Kpi label="Draft Invoices" value={draftCount} />

        <Kpi
          label="Invoice Value"
          value={money.format(totalValue)}
        />
      </div>

      <Card className="mt-7 border-zinc-800 bg-[#1e1e24] text-white">
        <CardContent className="p-0">
          <div className="border-b border-zinc-800 p-5">
            <h2 className="text-xl font-bold">Invoice Directory</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead className="border-b border-zinc-800 text-xs uppercase text-zinc-400">
                <tr>
                  <th className="px-6 py-4">Invoice #</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-14 text-center text-zinc-400"
                    >
                      <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin" />
                      Loading invoices...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-14 text-center text-red-300"
                    >
                      Unable to load invoices.
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-14 text-center text-zinc-500"
                    >
                      No invoices created yet.
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-b border-zinc-800/70 hover:bg-zinc-800/30"
                    >
                      <td className="px-6 py-5 font-bold text-[#FFCC00]">
                        {invoice.invoice_number}
                      </td>

                      <td className="px-6 py-5 font-semibold">
                        {invoice.customer_name || "Unknown customer"}
                      </td>

                      <td className="px-6 py-5 text-zinc-400">
                        {invoice.invoice_date
                          ? new Date(
                              invoice.invoice_date
                            ).toLocaleDateString("en-IN")
                          : "—"}
                      </td>

                      <td className="px-6 py-5 font-bold">
                        {money.format(invoice.rounded_total)}
                      </td>

                      <td className="px-6 py-5">
                        <Badge
                          className={
                            invoice.is_draft
                              ? "bg-zinc-700 text-zinc-200 hover:bg-zinc-700"
                              : "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15"
                          }
                        >
                          {invoice.is_draft
                            ? "Draft"
                            : "Finalized"}
                        </Badge>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={deleteInvoice.isPending}
                            onClick={() =>
                              void removeInvoice(invoice.id)
                            }
                            className="text-zinc-500 hover:bg-red-950/40 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function Kpi({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <Card className="border-zinc-800 bg-[#1e1e24] text-white">
      <CardContent className="p-5">
        <FileText className="mb-4 h-5 w-5 text-[#FFCC00]" />

        <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
          {label}
        </p>

        <p className="mt-2 text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}