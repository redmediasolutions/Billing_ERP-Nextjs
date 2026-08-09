"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Printer, Store, Truck } from "lucide-react";
import { Button } from "@/features/pos/ui/button";
import { Badge } from "@/features/pos/ui/badge";
import { Skeleton } from "@/features/pos/ui/skeleton";
import { money } from "@/features/pos/lib/money";
import { formatDate } from "@/features/pos/lib/utils";
import { invoicesService } from "@/features/invoices/services/invoices.service";
import type { Invoice } from "@/features/invoices/types";
import "./receipt.css";

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
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
      const t = setTimeout(() => window.print(), 350);
      return () => clearTimeout(t);
    }
  }, [invoice, searchParams]);

  if (loading) {
    return (
      <div className="container-page" style={{ maxWidth: 620 }}>
        <Skeleton style={{ height: 420, borderRadius: 12 }} />
      </div>
    );
  }

  if (!invoice) {
    return <div className="container-page">Invoice not found.</div>;
  }

  return (
    <div className="container-page" style={{ maxWidth: 620 }}>
      <div className="page-header no-print">
        <div>
          <div className="eyebrow">Invoice</div>
          <h1 className="page-title">{invoice.invoice_number}</h1>
        </div>
        <Button onClick={() => window.print()}><Printer size={15} /> Print / Save PDF</Button>
      </div>

      <div className="receipt">
        <div className="receipt-head">
          <div>
            <div className="receipt-brand">Billing ERP</div>
            <div className="text-sm text-muted">{formatDate(invoice.invoice_date)}</div>
          </div>
          <div>
            {invoice.sales_channel === "cloud_kitchen" ? (
              <Badge variant="neutral"><Truck size={11} /> Cloud kitchen</Badge>
            ) : (
              <Badge variant="outline"><Store size={11} /> Walk-in</Badge>
            )}
          </div>
        </div>

        <div className="divider" style={{ margin: "14px 0" }} />

        <div className="flex justify-between text-sm" style={{ marginBottom: 14 }}>
          <div>
            <div className="text-faint text-xs uppercase">Billed to</div>
            <div className="font-medium">{invoice.customer_name || "Walk-in Customer"}</div>
          </div>
          <div className="text-right">
            <div className="text-faint text-xs uppercase">Invoice #</div>
            <div className="mono font-medium">{invoice.invoice_number}</div>
          </div>
        </div>

        <table className="receipt-table">
          <thead>
            <tr>
              <th>Item</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Rate</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.line_items?.map((li) => (
              <tr key={li.id}>
                <td>{li.item_name}</td>
                <td className="text-right mono">{li.quantity}</td>
                <td className="text-right mono">{money(li.unit_price)}</td>
                <td className="text-right mono">{money(li.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="divider" style={{ margin: "14px 0" }} />

        <div className="receipt-totals">
          <div className="flex justify-between text-sm"><span className="text-muted">Subtotal</span><span className="mono">{money(invoice.subtotal)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted">Tax</span><span className="mono">{money(invoice.tax_amount)}</span></div>
          {Number(invoice.discount_amount) > 0 && (
            <div className="flex justify-between text-sm"><span className="text-muted">Discount</span><span className="mono">-{money(invoice.discount_amount)}</span></div>
          )}
          <div className="flex justify-between" style={{ fontSize: 18, fontWeight: 700, marginTop: 6 }}>
            <span>Total</span><span className="amount">{money(invoice.grand_total)}</span>
          </div>
        </div>

        <div className="receipt-footer text-center text-xs text-faint">Thank you for your business</div>
      </div>
    </div>
  );
}
