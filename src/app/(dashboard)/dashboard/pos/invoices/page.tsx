"use client";
import { useEffect, useMemo, useState } from "react";
import { Tabs } from "@/features/pos/ui/tabs";
import { InvoicesTable } from "@/features/pos/invoices/components/InvoicesTable";
import { invoicesService } from "@/features/invoices/services/invoices.service";
import type { Invoice } from "@/features/invoices/types";
import { money } from "@/features/pos/lib/money";
import "./invoices-page.css";

export default function InvoicesListPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    invoicesService
      .list()
      .then(setInvoices)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return invoices;
    return invoices.filter((i) => i.sales_channel === filter);
  }, [invoices, filter]);

  const totalSales = useMemo(
    () => filtered.reduce((s, i) => s + Number(i.grand_total || 0), 0),
    [filtered]
  );

  return (
    <div className="container-page">
      <div className="invoices-page-header">
        <div>
          <div className="eyebrow">Sales</div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">
            {filtered.length} bill{filtered.length === 1 ? "" : "s"} · {money(totalSales)} total
          </p>
        </div>
        <Tabs
          className="invoices-page-tabs"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All" },
            { value: "walk_in", label: "Walk-in" },
            { value: "cloud_kitchen", label: "Cloud kitchen" },
          ]}
        />
      </div>
      <InvoicesTable invoices={filtered} loading={loading} />
    </div>
  );
}
