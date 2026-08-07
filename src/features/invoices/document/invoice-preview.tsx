"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import {
  ArrowLeft,
  ChevronRight,
  Download,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
      <div className="flex h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span>Loading invoice...</span>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <p className="text-sm text-destructive">Unable to load this invoice.</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/invoices">
            Back to Invoices
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Top Toolbar */}
      <div className="no-print flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/invoices">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Invoices
            </Link>
          </Button>

          <ChevronRight className="h-4 w-4 text-muted-foreground" />

          <span className="text-sm font-semibold text-foreground">
            {invoice.invoice_number}
          </span>
        </div>

        <Badge
          variant={invoice.is_draft ? "secondary" : "default"}
          className={
            invoice.is_draft
              ? ""
              : "bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700"
          }
        >
          {invoice.is_draft ? "DRAFT" : "FINALIZED"}
        </Badge>
      </div>

      {/* Printable Sheet Container - Fixed white background for clean html2canvas/PDF output */}
      <div
        ref={invoiceRef}
        className="mx-auto rounded-lg border border-zinc-200 bg-white p-6 shadow-sm sm:p-12 space-y-8 text-zinc-950"
      >
        {/* Document Header */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between border-b border-zinc-200 pb-8">
          <TenantDocumentBrand />

          <div className="space-y-1 text-left sm:text-right">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-950">
              INVOICE
            </h2>

            <p className="text-sm text-zinc-600">
              No: <strong className="text-zinc-950 font-semibold">{invoice.invoice_number}</strong>
            </p>

            <p className="text-sm text-zinc-600">
              Date: <strong className="text-zinc-950 font-semibold">{formatDate(invoice.invoice_date)}</strong>
            </p>

            <p className="text-sm text-zinc-600">
              Due Date: <strong className="text-zinc-950 font-semibold">{formatDate(invoice.due_date)}</strong>
            </p>
          </div>
        </header>

        {/* Billed To & Payment Terms */}
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Billed To
            </p>
            <h3 className="text-base font-semibold text-zinc-950">
              {invoice.customer_name || "Customer"}
            </h3>
            <p className="whitespace-pre-line text-sm text-zinc-600 leading-relaxed">
              {invoice.custom_billing_address || "No billing address saved."}
            </p>
          </div>

          <div className="space-y-1 sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Payment Terms
            </p>
            <p className="text-sm text-zinc-600 leading-relaxed">
              {invoice.payment_terms || "Payment due on receipt"}
            </p>
          </div>
        </section>

        {/* Items Table */}
        <section className="rounded-md border border-zinc-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50 border-b border-zinc-200 hover:bg-zinc-50">
                <TableHead className="w-[45%] text-zinc-700 font-semibold">
                  Service Description
                </TableHead>
                <TableHead className="text-center text-zinc-700 font-semibold">
                  Qty
                </TableHead>
                <TableHead className="text-right text-zinc-700 font-semibold">
                  Rate
                </TableHead>
                <TableHead className="text-right text-zinc-700 font-semibold">
                  Total
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {invoice.line_items?.map((line) => (
                <TableRow key={line.id} className="border-b border-zinc-200 hover:bg-zinc-50/50">
                  <TableCell>
                    <p className="font-medium text-zinc-950">
                      {line.item_name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {line.description || "No description"}
                    </p>
                  </TableCell>

                  <TableCell className="text-center text-zinc-700">
                    {Number(line.quantity).toFixed(2)}
                  </TableCell>

                  <TableCell className="text-right text-zinc-700">
                    {money(line.unit_price)}
                  </TableCell>

                  <TableCell className="text-right font-medium text-zinc-950">
                    {money(line.line_total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        {/* Notes & Totals Summary */}
        <section className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Notes
            </p>
            <p className="text-sm text-zinc-600 whitespace-pre-line leading-relaxed">
              {invoice.notes || "Thank you for your business."}
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 space-y-3">
            <TotalRow label="Subtotal" value={money(invoice.subtotal)} />
            <TotalRow label="Discount" value={money(invoice.discount_amount)} />
            <TotalRow label="Tax Total" value={money(invoice.tax_amount)} />

            <div className="flex items-center justify-between border-t border-zinc-200 pt-3 font-semibold text-zinc-950">
              <span className="text-sm">GRAND TOTAL</span>
              <span className="text-lg text-zinc-950">
                {money(invoice.rounded_total)}
              </span>
            </div>
          </div>
        </section>

        {/* Signature Line Section */}
        <section className="grid grid-cols-1 gap-12 pt-8 sm:grid-cols-2">
          <Signature label="Authorized Signature" value="" />
          <Signature label="Customer Acceptance (Sign Here)" value="" />
        </section>
      </div>

      {/* Floating Action Button */}
      <div className="no-print flex justify-center pt-2">
        <Button onClick={() => void downloadPdf()} disabled={downloading} size="lg">
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
    <div className="flex items-center justify-between text-sm">
      <span className="text-zinc-600">{label}:</span>
      <span className="font-medium text-zinc-950">{value}</span>
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
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </p>

      <div className="h-12 flex items-end">
        {value && <p className="text-sm font-medium text-zinc-950">{value}</p>}
      </div>

      <div className="border-b border-zinc-300" />
    </div>
  );
}
