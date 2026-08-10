"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Tabs } from "@/features/pos/ui/tabs";
import { Input } from "@/features/pos/ui/input";
import { InvoicesTable } from "@/features/pos/invoices/components/InvoicesTable";
import { invoicesService } from "@/features/invoices/services/invoices.service";
import type { Invoice } from "@/features/invoices/types";
import { matchesSearch } from "@/lib/erp-search";
import { useUrlSearchParam } from "@/lib/use-url-search";
import { money } from "@/features/pos/lib/money";
import "./invoices-page.css";

export function PosInvoicesPageContent() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { value: search, setSearch } = useUrlSearchParam();

  useEffect(() => {
    invoicesService
      .list()
      .then(setInvoices)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesChannel =
        filter === "all" || invoice.sales_channel === filter;

      const matchesQuery = matchesSearch(search, [
        invoice.invoice_number,
        invoice.customer_name,
        invoice.reference,
      ]);

      return matchesChannel && matchesQuery;
    });
  }, [invoices, filter, search]);

  const totalSales = useMemo(
    () => filtered.reduce((sum, invoice) => sum + Number(invoice.grand_total || 0), 0),
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

      <div className="items-page-search" style={{ marginBottom: "1rem" }}>
        <Search size={15} className="items-page-search-icon" />
        <Input
          className="items-page-search-input"
          placeholder="Search invoices or customers..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <InvoicesTable invoices={filtered} loading={loading} />
    </div>
  );
}
