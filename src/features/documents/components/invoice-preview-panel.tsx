"use client";

import { useRef, useState } from "react";
import { Download, Loader2, Printer, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useInvoice } from "@/features/invoices/hooks/use-invoices";
import { downloadElementAsPdf } from "@/lib/pdf-download";
import { InvoiceBillSheet } from "./invoice-bill-sheet";
import { InvoiceReceiptSheet } from "./invoice-receipt-sheet";
import { isPosInvoice } from "../lib/document-utils";

export function InvoicePreviewPanel({
  invoiceId,
  onClose,
  forceFormat,
}: {
  invoiceId: number;
  onClose?: () => void;
  forceFormat?: "bill" | "receipt";
}) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const { data: invoice, isLoading, error } = useInvoice(invoiceId);

  const format =
    forceFormat ||
    (invoice && isPosInvoice(invoice) ? "receipt" : "bill");

  async function downloadPdf() {
    if (!sheetRef.current || !invoice) return;

    try {
      setPdfError("");
      setDownloading(true);
      await downloadElementAsPdf(
        sheetRef.current,
        format === "receipt"
          ? `${invoice.invoice_number || "invoice"}-receipt.pdf`
          : `${invoice.invoice_number || "invoice"}.pdf`,
        format === "receipt" ? "receipt" : "a4"
      );
    } catch (err) {
      setPdfError(
        err instanceof Error
          ? err.message
          : "Unable to generate PDF. Try Print instead."
      );
    } finally {
      setDownloading(false);
    }
  }

  return (
    <aside className="flex h-full min-h-0 w-full flex-col bg-muted/30">
      <div className="no-print flex items-center justify-between gap-2 border-b border-border bg-background px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {format === "receipt" ? "Receipt preview" : "Invoice preview"}
          </p>
          <p className="truncate text-sm font-semibold">
            {invoice?.invoice_number || "Invoice"}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {invoice && (
            <Badge variant={invoice.is_draft ? "secondary" : "default"}>
              {invoice.is_draft ? "Draft" : "Finalized"}
            </Badge>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="no-print flex flex-wrap gap-2 border-b border-border bg-background px-4 py-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.print()}
          disabled={!invoice}
        >
          <Printer className="mr-1.5 h-4 w-4" />
          Print
        </Button>
        <Button
          size="sm"
          onClick={() => void downloadPdf()}
          disabled={!invoice || downloading}
        >
          {downloading ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-1.5 h-4 w-4" />
          )}
          {downloading ? "PDF..." : "Download PDF"}
        </Button>
      </div>

      {pdfError && (
        <p className="no-print px-4 py-2 text-sm text-destructive">{pdfError}</p>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {isLoading && (
          <div className="flex h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading invoice...
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive">Unable to load invoice.</p>
        )}

        {invoice && format === "receipt" && (
          <InvoiceReceiptSheet invoice={invoice} sheetRef={sheetRef} />
        )}

        {invoice && format === "bill" && (
          <InvoiceBillSheet invoice={invoice} sheetRef={sheetRef} />
        )}
      </div>
    </aside>
  );
}
