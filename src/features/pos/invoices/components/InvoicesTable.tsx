"use client";
import Link from "next/link";
import { Receipt, Store, Truck } from "lucide-react";
import { Table, THead, TBody, TR, TH, TD } from "@/features/pos/ui/table";
import { Badge } from "@/features/pos/ui/badge";
import { Skeleton } from "@/features/pos/ui/skeleton";
import { money } from "@/features/pos/lib/money";
import { formatDateTime } from "@/features/pos/lib/utils";
import { Invoice } from "@/features/invoices/types";

export function InvoicesTable({ invoices, loading }: { invoices: Invoice[]; loading: boolean }) {
  if (loading) {
    return <div className="flex flex-col gap-2">{[...Array(6)].map((_, i) => <Skeleton key={i} style={{ height: 50, borderRadius: 10 }} />)}</div>;
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
    <Table>
      <THead>
        <TR>
          <TH>Invoice</TH>
          <TH>Customer</TH>
          <TH>Channel</TH>
          <TH>Date</TH>
          <TH className="text-right">Total</TH>
        </TR>
      </THead>
      <TBody>
        {invoices.map((inv) => (
          <TR key={inv.id}>
            <TD>
              <Link href={`/dashboard/pos/invoices/${inv.id}`} className="font-medium mono" style={{ textDecoration: "underline" }}>
                {inv.invoice_number}
              </Link>
            </TD>
            <TD className="text-sm">{inv.customer_name || "—"}</TD>
            <TD>
              {inv.sales_channel === "cloud_kitchen" ? (
                <Badge variant="neutral"><Truck size={11} /> Cloud kitchen</Badge>
              ) : (
                <Badge variant="outline"><Store size={11} /> Walk-in</Badge>
              )}
            </TD>
            <TD className="text-sm text-muted">{formatDateTime(inv.invoice_date || inv.created_at)}</TD>
            <TD className="text-right amount">{money(inv.grand_total)}</TD>
          </TR>
        ))}
      </TBody>
    </Table>
  );
}
