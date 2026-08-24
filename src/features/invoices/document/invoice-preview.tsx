"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Loader2, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InvoiceBillSheet } from "@/features/documents/components/invoice-bill-sheet";
import { InvoiceReceiptSheet } from "@/features/documents/components/invoice-receipt-sheet";
import { isPosInvoice } from "@/features/documents/lib/document-utils";
import { downloadElementAsPdf } from "@/lib/pdf-download";
import { useInvoice } from "../hooks/use-invoices";

export function InvoicePreview({
  invoiceId,
}: {
  invoiceId: number;
}) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const {
    data: invoice,
    isLoading,
    error,
  } = useInvoice(invoiceId);

  const format = invoice && isPosInvoice(invoice) ? "receipt" : "bill";

  async function downloadPdf() {
    if (!invoiceRef.current || !invoice) return;

    try {
      setDownloading(true);
      setDownloadError("");
      await downloadElementAsPdf(
        invoiceRef.current,
        format === "receipt"
          ? `${invoice.invoice_number}-receipt.pdf`
          : `${invoice.invoice_number}.pdf`,
        format === "receipt" ? "receipt" : "a4"
      );
    } catch (error) {
      setDownloadError(
        error instanceof Error ? error.message : "Unable to download the PDF."
      );
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
      <div className="flex flex-col items-start gap-4 py-16">
        <p className="text-sm text-destructive">Unable to load this invoice.</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/invoices">Back to Invoices</Link>
        </Button>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/invoices">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Invoices
            </Link>
          </Button>

          <Badge variant={invoice.is_draft ? "secondary" : "default"}>
            {invoice.is_draft ? "DRAFT" : "FINALIZED"}
          </Badge>

          <Badge variant="outline">
            {format === "receipt" ? "POS Receipt" : "Tax Invoice"}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button onClick={() => void downloadPdf()} disabled={downloading}>
            {downloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {downloading ? "Preparing PDF..." : "Download PDF"}
          </Button>
        </div>
      </div>

      {downloadError && (
        <p className="no-print text-sm text-destructive" role="alert">
          {downloadError}
        </p>
      )}

      {format === "receipt" ? (
        <InvoiceReceiptSheet invoice={invoice} sheetRef={invoiceRef} />
      ) : (
        <InvoiceBillSheet invoice={invoice} sheetRef={invoiceRef} />
      )}

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
