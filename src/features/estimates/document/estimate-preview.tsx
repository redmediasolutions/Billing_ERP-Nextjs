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
import { useEstimate } from "../hooks/use-estimates";

function formatDate(value?: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
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

export function EstimatePreview({
  estimateId,
}: {
  estimateId: number;
}) {
  const documentRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const {
    data: estimate,
    isLoading,
    error,
  } = useEstimate(estimateId);

  async function downloadPdf() {
    if (!documentRef.current || !estimate) return;

    try {
      setDownloading(true);

      const canvas = await html2canvas(documentRef.current, {
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

      let heightLeft = imageHeight;
      let position = 0;

      pdf.addImage(
        image,
        "PNG",
        0,
        position,
        pageWidth,
        imageHeight
      );

      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imageHeight;

        pdf.addPage();

        pdf.addImage(
          image,
          "PNG",
          0,
          position,
          pageWidth,
          imageHeight
        );

        heightLeft -= pageHeight;
      }

      pdf.save(`${estimate.estimate_number}.pdf`);
    } finally {
      setDownloading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#111113] text-zinc-400">
        <Loader2 className="mr-3 h-5 w-5 animate-spin text-[#FFCC00]" />
        Loading estimate...
      </div>
    );
  }

  if (error || !estimate) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#111113] text-white">
        <p className="text-red-300">
          Unable to load this estimate.
        </p>

        <Button asChild>
          <Link href="/dashboard/estimates">
            Back to Estimates
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-[#0d1111] p-4 text-white md:p-8">
      <div className="no-print mx-auto mb-8 flex max-w-[1080px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button
            asChild
            variant="ghost"
            className="text-zinc-300 hover:text-white"
          >
            <Link href="/dashboard/estimates">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to List
            </Link>
          </Button>

          <span className="hidden text-zinc-600 md:block">/</span>

          <span className="font-bold text-[#FFCC00]">
            {estimate.estimate_number}
          </span>
        </div>

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

      <div
        ref={documentRef}
        className="mx-auto max-w-[1080px] bg-white px-8 py-10 text-slate-700 shadow-2xl md:px-11 md:py-12"
      >
        <header className="flex flex-col justify-between gap-8 border-b border-slate-200 pb-8 md:flex-row">
          <TenantDocumentBrand />

          <div className="text-left md:text-right">
            <p className="text-4xl font-black tracking-tight text-[#f5ca28]">
              ESTIMATE
            </p>

            <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              Estimate No.
            </p>

            <p className="mt-1 text-2xl font-black text-black">
              {estimate.estimate_number}
            </p>
          </div>
        </header>

        <section className="grid gap-8 py-9 md:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Billing To
            </p>

            <h2 className="mt-3 text-2xl font-black text-[#f5ca28]">
              {estimate.customer_name || "Customer"}
            </h2>

            <p className="mt-3 whitespace-pre-wrap text-sm font-medium leading-6 text-slate-600">
              {estimate.custom_billing_address ||
                "No billing address saved."}
            </p>
          </div>

          <div className="rounded border border-slate-200 bg-slate-50 p-6">
            <DetailRow
              label="Estimate Date"
              value={formatDate(estimate.estimate_date)}
            />

            <DetailRow
              label="Expiry Date"
              value={formatDate(estimate.valid_until)}
            />

            <DetailRow
              label="Currency"
              value="INR (₹)"
            />

            {estimate.reference_number && (
              <DetailRow
                label="Reference No."
                value={estimate.reference_number}
                highlight
              />
            )}
          </div>
        </section>

        <section className="overflow-hidden border border-slate-200">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4">Item Description</th>
                <th className="px-3 py-4 text-right">Qty</th>
                <th className="px-3 py-4 text-right">Rate</th>
                <th className="px-3 py-4 text-right">Tax</th>
                <th className="px-5 py-4 text-right">Amount</th>
              </tr>
            </thead>

            <tbody>
              {estimate.line_items?.map((line) => (
                <tr
                  key={line.id}
                  className="border-t border-slate-200"
                >
                  <td className="px-5 py-5">
                    <p className="font-bold text-black">
                      {line.item_name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {line.description || "No description"}
                    </p>
                  </td>

                  <td className="px-3 py-5 text-right font-semibold text-black">
                    {Number(line.quantity).toFixed(2)}
                  </td>

                  <td className="px-3 py-5 text-right font-semibold text-black">
                    {money(line.unit_price)}
                  </td>

                  <td className="px-3 py-5 text-right font-semibold text-black">
                    {Number(line.tax_rate)}%
                  </td>

                  <td className="px-5 py-5 text-right text-lg font-black text-[#e7bd16]">
                    {money(line.line_total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-20 grid gap-8 md:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Notes & Terms
            </p>

            <div className="mt-3 whitespace-pre-wrap text-sm font-medium leading-6 text-slate-600">
              {estimate.notes || "No additional notes."}
            </div>

            {estimate.payment_terms && (
              <p className="mt-3 border-t border-slate-200 pt-3 text-sm font-semibold text-slate-600">
                Payment Terms: {estimate.payment_terms}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <TotalRow
              label="Subtotal"
              value={money(estimate.subtotal)}
            />

            <TotalRow
              label="Discount"
              value={money(estimate.total_discount)}
            />

            <TotalRow
              label="Tax Total"
              value={money(estimate.total_tax)}
            />

            <div className="border-t border-slate-200 pt-5">
              <div className="flex items-end justify-between gap-4">
                <span className="text-xl font-black text-slate-700">
                  GRAND TOTAL
                </span>

                <span className="text-2xl font-black text-[#f5ca28]">
                  {money(estimate.rounded_total)}
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

function DetailRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-200 py-3 last:border-0">
      <span className="text-sm font-bold text-slate-500">
        {label}:
      </span>

      <span
        className={`text-right font-black ${
          highlight ? "text-[#e7bd16]" : "text-black"
        }`}
      >
        {value}
      </span>
    </div>
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
    <div className="flex justify-between gap-4 text-sm">
      <span className="font-bold text-slate-500">{label}:</span>
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