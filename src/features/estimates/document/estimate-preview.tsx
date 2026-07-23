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
      <div className="document-preview__state">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading estimate...
      </div>
    );
  }

  if (error || !estimate) {
    return (
      <div className="document-preview__state document-preview__state--error">
        <p>Unable to load this estimate.</p>

        <Button asChild>
          <Link href="/dashboard/estimates">
            Back to Estimates
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
            <Link href="/dashboard/estimates">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to List
            </Link>
          </Button>

          <span className="document-preview__separator">/</span>

          <span className="document-preview__number">
            {estimate.estimate_number}
          </span>
        </div>

        <Button onClick={() => void downloadPdf()} disabled={downloading}>
          {downloading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Download className="mr-2 h-5 w-5" />
          )}

          {downloading ? "Preparing PDF..." : "Download PDF"}
        </Button>
      </div>

      <div ref={documentRef} className="document-sheet">
        <header className="document-sheet__header">
          <TenantDocumentBrand />

          <div className="document-sheet__title-block">
            <p className="document-sheet__title">ESTIMATE</p>

            <p className="document-sheet__title-label">Estimate No.</p>

            <p className="document-sheet__title-value">
              {estimate.estimate_number}
            </p>
          </div>
        </header>

        <section className="document-sheet__grid">
          <div>
            <p className="document-sheet__label">Billing To</p>

            <h2 className="document-sheet__customer-name">
              {estimate.customer_name || "Customer"}
            </h2>

            <p className="document-sheet__address">
              {estimate.custom_billing_address ||
                "No billing address saved."}
            </p>
          </div>

          <div className="document-sheet__box">
            <DetailRow
              label="Estimate Date"
              value={formatDate(estimate.estimate_date)}
            />

            <DetailRow
              label="Expiry Date"
              value={formatDate(estimate.valid_until)}
            />

            <DetailRow label="Currency" value="INR (₹)" />

            {estimate.reference_number && (
              <DetailRow
                label="Reference No."
                value={estimate.reference_number}
              />
            )}
          </div>
        </section>

        <section className="document-sheet__table-wrap">
          <table className="document-sheet__table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Tax</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              {estimate.line_items?.map((line) => (
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

                  <td>{Number(line.tax_rate)}%</td>

                  <td className="document-sheet__amount">
                    {money(line.line_total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="document-sheet__footer-grid">
          <div className="document-sheet__box">
            <p className="document-sheet__label">Notes & Terms</p>

            <div className="document-sheet__notes">
              {estimate.notes || "No additional notes."}
            </div>

            {estimate.payment_terms && (
              <p className="document-sheet__notes-terms">
                Payment Terms: {estimate.payment_terms}
              </p>
            )}
          </div>

          <div className="summary-panel" style={{ display: "grid", gap: 16 }}>
            <TotalRow label="Subtotal" value={money(estimate.subtotal)} />

            <TotalRow label="Discount" value={money(estimate.total_discount)} />

            <TotalRow label="Tax Total" value={money(estimate.total_tax)} />

            <div className="summary-panel__total">
              <span className="summary-panel__total-label">GRAND TOTAL</span>

              <span className="summary-panel__total-value">
                {money(estimate.rounded_total)}
              </span>
            </div>
          </div>
        </section>

        <section className="document-sheet__signature-grid">
          <Signature label="Authorized Signature" value="" />

          <Signature label="Customer Acceptance (Sign Here)" value="" />
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
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="document-sheet__detail-row">
      <span className="document-sheet__detail-label">{label}:</span>
      <span className="document-sheet__detail-value">{value}</span>
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