"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Loader2, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EstimateDocumentSheet } from "@/features/documents/components/estimate-document-sheet";
import { downloadElementAsPdf } from "@/lib/pdf-download";
import { useEstimate } from "../hooks/use-estimates";

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
      await downloadElementAsPdf(
        documentRef.current,
        `${estimate.estimate_number}.pdf`,
        "a4"
      );
    } finally {
      setDownloading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        Loading estimate...
      </div>
    );
  }

  if (error || !estimate) {
    return (
      <div className="flex flex-col items-start gap-4 py-16">
        <p className="text-sm text-destructive">Unable to load this estimate.</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/estimates">Back to Estimates</Link>
        </Button>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/estimates">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Estimates
          </Link>
        </Button>

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

      <EstimateDocumentSheet estimate={estimate} sheetRef={documentRef} />

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
