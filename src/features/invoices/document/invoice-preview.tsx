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
      <div className="document-preview__state">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading invoice...
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="document-preview__state document-preview__state--error">
        <p>Unable to load this invoice.</p>

        <Button asChild>
          <Link href="/dashboard/invoices">
            Back to Invoices
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <section className="document-preview">
      <div className="no-print document-preview__toolbar">
        <div className="document-preview__crumb">
          <Button asChild variant="ghost">
            <Link href="/dashboard/invoices">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Invoices
            </Link>
          </Button>

          <span className="document-preview__separator">›</span>

          <span className="document-preview__number">
            {invoice.invoice_number}
          </span>
        </div>

        <span
          className={`document-preview__status${
            invoice.is_draft ? "" : " status-pill--finalized"
          }`}
        >
          {invoice.is_draft ? "DRAFT" : "FINALIZED"}
        </span>
      </div>

      <div ref={invoiceRef} className="document-sheet document-sheet--accent">
        <header className="document-sheet__header">
          <TenantDocumentBrand />

          <div className="document-sheet__title-block">
            <h2 className="document-sheet__title">INVOICE</h2>

            <p className="document-sheet__meta-line">
              No: <strong>{invoice.invoice_number}</strong>
            </p>

            <p className="document-sheet__meta-line">
              Date: <strong>{formatDate(invoice.invoice_date)}</strong>
            </p>

            <p className="document-sheet__meta-line">
              Due Date: <strong>{formatDate(invoice.due_date)}</strong>
            </p>
          </div>
        </header>

        <section className="document-sheet__grid">
          <div>
            <p className="document-sheet__label">Billed To</p>

            <h3 className="document-sheet__customer-name">
              {invoice.customer_name || "Customer"}
            </h3>

            <p className="document-sheet__address">
              {invoice.custom_billing_address ||
                "No billing address saved."}
            </p>
          </div>

          <div className="document-sheet__title-block">
            <p className="document-sheet__label">Payment Terms</p>

            <p className="document-sheet__address">
              {invoice.payment_terms || "Payment due on receipt"}
            </p>
          </div>
        </section>

        <section className="document-sheet__table-wrap">
          <table className="document-sheet__table">
            <thead>
              <tr>
                <th>Service Description</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {invoice.line_items?.map((line) => (
                <tr key={line.id}>
                  <td>
                    <p className="document-sheet__item-name">
                      {line.item_name}
                    </p>

                    <p className="document-sheet__item-desc">
                      {line.description || "No description"}
                    </p>
                  </td>

                  <td>{Number(line.quantity).toFixed(2)}</td>

                  <td>{money(line.unit_price)}</td>

                  <td className="document-sheet__amount">
                    {money(line.line_total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="document-sheet__footer-grid">
          <div>
            <p className="document-sheet__label">Notes</p>

            <p className="document-sheet__notes">
              {invoice.notes || "Thank you for your business."}
            </p>
          </div>

          <div className="summary-panel" style={{ display: "grid", gap: 16 }}>
            <TotalRow label="Subtotal" value={money(invoice.subtotal)} />

            <TotalRow label="Discount" value={money(invoice.discount_amount)} />

            <TotalRow label="Tax Total" value={money(invoice.tax_amount)} />

            <div className="summary-panel__total">
              <span className="summary-panel__total-label">GRAND TOTAL</span>

              <span className="summary-panel__total-value">
                {money(invoice.rounded_total)}
              </span>
            </div>
          </div>
        </section>

        <section className="document-sheet__signature-grid">
          <Signature label="Authorized Signature" value="" />

          <Signature label="Customer Acceptance (Sign Here)" value="" />
        </section>
      </div>

      <div className="no-print document-preview__footer">
        <Button onClick={() => void downloadPdf()} disabled={downloading}>
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
    <div className="summary-panel__row">
      <span className="summary-panel__label">{label}:</span>
      <span className="summary-panel__value">{value}</span>
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
    <div className="document-sheet__signature">
      <p className="document-sheet__signature-label">{label}</p>

      <div className="document-sheet__signature-space">
        {value && (
          <p className="document-sheet__signature-value">{value}</p>
        )}
      </div>

      <div className="document-sheet__signature-line" />
    </div>
  );
}