"use client";
import Link from "next/link";
import { ChevronRight, Receipt, Store, Truck } from "lucide-react";
import { Badge } from "@/features/pos/ui/badge";
import { Skeleton } from "@/features/pos/ui/skeleton";
import { money } from "@/features/pos/lib/money";
import { formatDate, formatTime } from "@/features/pos/lib/utils";
import type { Invoice } from "@/features/invoices/types";
import "./InvoicesTable.css";

function ChannelBadge({ channel }: { channel?: Invoice["sales_channel"] }) {
  if (channel === "cloud_kitchen") {
    return (
      <Badge variant="neutral" className="invoice-channel-badge">
        <Truck size={11} /> Cloud kitchen
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="invoice-channel-badge">
      <Store size={11} /> Walk-in
    </Badge>
  );
}

function InvoiceRow({ invoice }: { invoice: Invoice }) {
  const when = invoice.invoice_date || invoice.created_at;
  const time = formatTime(when);

  return (
    <Link href={`/dashboard/pos/invoices/${invoice.id}`} className="invoice-card">
      <div className="invoice-card-top">
        <div className="invoice-card-main">
          <div className="invoice-card-number mono">{invoice.invoice_number}</div>
          <div className="invoice-card-meta">
            <ChannelBadge channel={invoice.sales_channel} />
            <span className="invoice-card-date">
              {formatDate(when)}
              {time ? ` · ${time}` : ""}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="invoice-card-total amount">{money(invoice.grand_total)}</span>
          <ChevronRight size={16} className="text-faint invoice-card-chevron" aria-hidden />
        </div>
      </div>
    </Link>
  );
}

export function InvoicesTable({ invoices, loading }: { invoices: Invoice[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="invoices-list">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="invoice-skeleton" />
        ))}
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon"><Receipt size={18} /></div>
        <div className="empty-state-title">No bills yet</div>
        <p className="text-sm">Generated bills will show up here.</p>
      </div>
    );
  }

  return (
    <div className="invoices-list">
      {invoices.map((invoice) => (
        <InvoiceRow key={invoice.id} invoice={invoice} />
      ))}
    </div>
  );
}
