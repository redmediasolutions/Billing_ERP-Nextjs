"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import {
  ArrowLeft,
  Download,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { TenantDocumentBrand } from "@/features/tenant/components/tenant-document-brand";
import { useInvoice } from "../hooks/use-invoices";

function formatDate(value?: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function InvoicePreview({
  invoiceId,
}: {
  invoiceId: number;
}) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const {
    data: invoice,
    isLoading,
    error,
  } = useInvoice(invoiceId);

  async function downloadPdf() {
    if (!invoiceRef.current || !invoice) return;

    try {
      setDownloading(true);

      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const image = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const imageHeight =
        (canvas.height * pageWidth) / canvas.width;

      let remainingHeight = imageHeight;
      let position = 0;

      pdf.addImage(
        image,
        "PNG",
        0,
        position,
        pageWidth,
        imageHeight
      );

      remainingHeight -= pageHeight;

      while (remainingHeight > 0) {
        position = remainingHeight - imageHeight;

        pdf.addPage();

        pdf.addImage(
          image,
          "PNG",
          0,
          position,
          pageWidth,
          imageHeight
        );

        remainingHeight -= pageHeight;
      }

      pdf.save(`${invoice.invoice_number}.pdf`);
    } finally {
      setDownloading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d1111] text-zinc-400">
        <Loader2 className="mr-3 h-5 w-5 animate-spin text-[#FFCC00]" />
        Loading invoice...
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0d1111] text-white">
        <p className="text-red-300">
          Unable to load this invoice.
        </p>

        <Button asChild>
          <Link href="/dashboard/invoices">
            Back to Invoices
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-[#0d1111] p-4 text-white md:p-8">
      <div className="no-print mx-auto mb-7 flex max-w-[1120px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="ghost"
            className="text-zinc-300 hover:text-white"
          >
            <Link href="/dashboard/invoices">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Invoices
            </Link>
          </Button>

          <span className="text-zinc-600">›</span>

          <span className="font-bold text-white">
            {invoice.invoice_number}
          </span>
        </div>

        <div
          className={`rounded-full px-4 py-2 text-sm font-bold ${
            invoice.is_draft
              ? "bg-zinc-700 text-zinc-200"
              : "bg-emerald-500/15 text-emerald-400"
          }`}
        >
          {invoice.is_draft ? "DRAFT" : "FINALIZED"}
        </div>
      </div>

      <div
        ref={invoiceRef}
        className="mx-auto max-w-[1120px] border-t-[6px] border-[#FFCC00] bg-white px-9 py-10 text-slate-800 shadow-2xl md:px-12 md:py-12"
      >
        <header className="flex flex-col justify-between gap-8 border-b border-slate-300 pb-10 md:flex-row">
          <TenantDocumentBrand />

          <div className="text-left md:text-right">
            <h2 className="text-5xl font-black tracking-[0.08em] text-[#e6be00]">
              INVOICE
            </h2>

            <p className="mt-5 text-lg text-slate-600">
              No:{" "}
              <span className="font-black text-black">
                {invoice.invoice_number}
              </span>
            </p>

            <p className="mt-2 text-lg text-slate-600">
              Date:{" "}
              <span className="font-semibold text-black">
                {formatDate(invoice.invoice_date)}
              </span>
            </p>

            <p className="mt-2 text-lg text-slate-600">
              Due Date:{" "}
              <span className="font-semibold text-black">
                {formatDate(invoice.due_date)}
              </span>
            </p>
          </div>
        </header>

        <section className="grid gap-8 py-10 md:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-slate-600">
              Billed To
            </p>

            <h3 className="mt-5 text-3xl font-black text-black">
              {invoice.customer_name || "Customer"}
            </h3>

            <p className="mt-3 whitespace-pre-wrap text-base font-medium leading-7 text-slate-700">
              {invoice.custom_billing_address ||
                "No billing address saved."}
            </p>
          </div>

          <div className="text-left md:text-right">
            <p className="text-sm font-bold uppercase tracking-wider text-slate-600">
              Payment Terms
            </p>

            <p className="mt-5 whitespace-pre-wrap text-lg font-medium leading-7 text-black">
              {invoice.payment_terms || "Payment due on receipt"}
            </p>
          </div>
        </section>

        <section className="overflow-hidden border-y border-slate-300">
          <table className="w-full text-left">
            <thead className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-5 py-5">Service Description</th>
                <th className="px-3 py-5 text-right">Qty</th>
                <th className="px-3 py-5 text-right">Rate</th>
                <th className="px-5 py-5 text-right">Total</th>
              </tr>
            </thead>

            <tbody>
              {invoice.line_items?.map((line) => (
                <tr
                  key={line.id}
                  className="border-b border-slate-200 last:border-0"
                >
                  <td className="px-5 py-6">
                    <p className="text-lg font-black text-black">
                      {line.item_name}
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      {line.description || "No description"}
                    </p>
                  </td>

                  <td className="px-3 py-6 text-right text-lg font-semibold text-black">
                    {Number(line.quantity).toFixed(2)}
                  </td>

                  <td className="px-3 py-6 text-right text-lg font-semibold text-black">
                    {money(line.unit_price)}
                  </td>

                  <td className="px-5 py-6 text-right text-lg font-black text-black">
                    {money(line.line_total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-14 grid gap-8 md:grid-cols-[1.25fr_0.75fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-slate-600">
              Notes
            </p>

            <p className="mt-4 whitespace-pre-wrap text-sm font-medium leading-6 text-slate-600">
              {invoice.notes || "Thank you for your business."}
            </p>
          </div>

          <div className="space-y-4">
            <TotalRow
              label="Subtotal"
              value={money(invoice.subtotal)}
            />

            <TotalRow
              label="Discount"
              value={money(invoice.discount_amount)}
            />

            <TotalRow
              label="Tax Total"
              value={money(invoice.tax_amount)}
            />

            <div className="border-t border-slate-300 pt-5">
              <div className="flex items-end justify-between gap-4">
                <span className="text-xl font-black text-black">
                  GRAND TOTAL
                </span>

                <span className="text-3xl font-black text-[#e6be00]">
                  {money(invoice.rounded_total)}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20 grid gap-10 md:grid-cols-2">
          <Signature
            label="Authorized Signature"
            value=""
          />

          <Signature
            label="Customer Acceptance (Sign Here)"
            value=""
          />
        </section>
      </div>

      <div className="no-print mx-auto mt-7 flex max-w-[1120px] justify-end">
        <Button
          onClick={() => void downloadPdf()}
          disabled={downloading}
          className="bg-[#FFCC00] font-bold text-black hover:bg-yellow-400"
        >
          {downloading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Download className="mr-2 h-5 w-5" />
          )}

          {downloading ? "Preparing PDF..." : "Download PDF"}
        </Button>
      </div>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background: white !important;
          }
        }
      `}</style>
    </section>
  );
}

function TotalRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="font-bold text-slate-600">{label}:</span>
      <span className="font-black text-black">{value}</span>
    </div>
  );
}

function Signature({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-t border-slate-300 pt-4">
      <p className="text-sm font-bold text-slate-500">{label}</p>

      <div className="mt-10 min-h-8">
        {value && (
          <p className="font-serif text-2xl italic text-slate-700">
            {value}
          </p>
        )}
      </div>

      <div className="mt-8 border-b border-dashed border-slate-300" />
    </div>
  );
}