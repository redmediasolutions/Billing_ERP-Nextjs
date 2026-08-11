"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";

import { Button } from "@/features/pos/ui/button";
import { Skeleton } from "@/features/pos/ui/skeleton";
import { InvoiceReceiptSheet } from "@/features/documents/components/invoice-receipt-sheet";
import { invoicesService } from "@/features/invoices/services/invoices.service";
import type { Invoice } from "@/features/invoices/types";

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const sheetRef = useRef<HTMLDivElement>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    invoicesService
      .getById(Number(id))
      .then(setInvoice)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (invoice && searchParams.get("print") === "1") {
      const timer = setTimeout(() => window.print(), 350);
      return () => clearTimeout(timer);
    }
  }, [invoice, searchParams]);

  if (loading) {
    return (
      <div className="container-page" style={{ maxWidth: 420 }}>
        <Skeleton style={{ height: 420, borderRadius: 12 }} />
      </div>
    );
  }

  if (!invoice) {
    return <div className="container-page">Invoice not found.</div>;
  }

  return (
    <div className="container-page" style={{ maxWidth: 420 }}>
      <div className="page-header no-print" style={{ marginBottom: 16 }}>
        <div>
          <div className="eyebrow">POS Receipt</div>
          <h1 className="page-title">{invoice.invoice_number}</h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/dashboard/pos/invoices">
            <Button variant="outline">
              <ArrowLeft size={15} /> Back
            </Button>
          </Link>
          <Button onClick={() => window.print()}>
            <Printer size={15} /> Print / Save PDF
          </Button>
        </div>
      </div>

      <InvoiceReceiptSheet invoice={invoice} sheetRef={sheetRef} />
    </div>
  );
}
