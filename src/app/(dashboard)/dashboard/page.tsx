"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowRight,
  Loader2,
  Package,
  ReceiptText,
  Users,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Warehouse,
  Tags,
  AlertTriangle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBrands } from "@/features/brands/hooks/use-brands";
import { useCustomers } from "@/features/customers/hooks/use-customers";
import { useEstimates } from "@/features/estimates/hooks/use-estimates";
import { useInvoices } from "@/features/invoices/hooks/use-invoices";
import { useItems } from "@/features/items/hooks/use-items";
import { useReportSummary } from "@/features/pos/reports/hooks/useReports";
import { useProducts } from "@/features/products/hooks/use-products";
import { useStocks } from "@/features/stocks/hooks/use-stocks";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function DashboardPage() {
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoices();
  const { data: customers = [], isLoading: customersLoading } = useCustomers();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: estimates = [], isLoading: estimatesLoading } = useEstimates();
  const { items, loading: itemsLoading } = useItems();
  const { data: stocks = [], isLoading: stocksLoading } = useStocks();
  const { data: brands = [], isLoading: brandsLoading } = useBrands();
  const { summary, loading: reportsLoading } = useReportSummary();

  const statsLoading =
    invoicesLoading ||
    customersLoading ||
    productsLoading ||
    estimatesLoading ||
    itemsLoading ||
    stocksLoading ||
    brandsLoading;

  const metrics = useMemo(() => {
    const finalizedInvoices = invoices.filter((invoice) => !invoice.is_draft);
    const draftInvoices = invoices.filter((invoice) => invoice.is_draft);
    const revenue = finalizedInvoices.reduce(
      (sum, invoice) => sum + invoice.rounded_total,
      0
    );

    const availableStock = stocks.filter((item) => item.status === "available");
    const soldStock = stocks.filter((item) => item.status === "sold");
    const lowStockProducts = products.filter(
      (product) => Number(product.available_stock || 0) === 0
    );
    const trackedItems = items.filter((item) => item.track_inventory);

    const recentInvoices = [...invoices]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 5);

    return {
      revenue,
      finalizedCount: finalizedInvoices.length,
      draftCount: draftInvoices.length,
      availableStockCount: availableStock.length,
      soldStockCount: soldStock.length,
      lowStockCount: lowStockProducts.length,
      trackedItemsCount: trackedItems.length,
      recentInvoices,
    };
  }, [invoices, items, products, stocks]);

  const primaryStats = [
    {
      title: "Total Revenue",
      value: statsLoading ? "—" : money.format(metrics.revenue),
      hint: `${metrics.finalizedCount} finalized invoices`,
      icon: DollarSign,
    },
    {
      title: "Today's Sales",
      value: reportsLoading
        ? "—"
        : money.format(summary?.today.combined.grand_total ?? 0),
      hint: summary
        ? `${summary.today.combined.invoice_count} invoice${summary.today.combined.invoice_count === 1 ? "" : "s"} today`
        : "POS & billing today",
      icon: TrendingUp,
    },
    {
      title: "Customers",
      value: statsLoading ? "—" : String(customers.length),
      hint: `${estimates.length} estimate${estimates.length === 1 ? "" : "s"}`,
      icon: Users,
    },
    {
      title: "Catalog Items",
      value: statsLoading ? "—" : String(items.length),
      hint: `${metrics.trackedItemsCount} inventory tracked`,
      icon: Package,
    },
  ];

  const secondaryStats = [
    {
      title: "Invoices",
      value: statsLoading ? "—" : String(invoices.length),
      hint: `${metrics.draftCount} draft${metrics.draftCount === 1 ? "" : "s"}`,
      icon: ReceiptText,
    },
    {
      title: "Products",
      value: statsLoading ? "—" : String(products.length),
      hint: `${brands.length} brand${brands.length === 1 ? "" : "s"}`,
      icon: ShoppingCart,
    },
    {
      title: "Available Stock",
      value: statsLoading ? "—" : String(metrics.availableStockCount),
      hint: `${metrics.soldStockCount} sold units`,
      icon: Warehouse,
    },
    {
      title: "Low Stock",
      value: statsLoading ? "—" : String(metrics.lowStockCount),
      hint: "Products with 0 units",
      icon: AlertTriangle,
      alert: metrics.lowStockCount > 0,
    },
  ];

  return (
    <div className="w-full space-y-10 text-left">
      <div className="flex w-full flex-col items-start gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="w-full text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Dashboard
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            Welcome back 👋
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Manage invoices, customers, inventory and accounting from one
            central dashboard.
          </p>
        </div>

        <Card className="w-full max-w-sm self-start">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-2xl bg-primary/10 p-3">
              <TrendingUp className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">This week</p>
              <h3 className="text-lg font-semibold">
                {reportsLoading ? (
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  money.format(summary?.week.combined.grand_total ?? 0)
                )}
              </h3>
              <p className="text-xs text-muted-foreground">
                {summary
                  ? `${summary.week.combined.invoice_count} invoices this week`
                  : "Weekly sales total"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {primaryStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {secondaryStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading invoices...
              </div>
            ) : metrics.recentInvoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No invoices yet.{" "}
                <Link
                  href="/dashboard/invoices/new"
                  className="font-medium text-primary hover:underline"
                >
                  Create your first invoice
                </Link>
                .
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {metrics.recentInvoices.map((invoice) => (
                  <li
                    key={invoice.id}
                    className="flex items-center justify-between gap-4 py-3 text-sm"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/dashboard/invoices/${invoice.id}`}
                        className="font-medium hover:text-primary hover:underline"
                      >
                        {invoice.invoice_number}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">
                        {invoice.customer_name || "Customer"} ·{" "}
                        {invoice.invoice_date
                          ? new Date(invoice.invoice_date).toLocaleDateString(
                              "en-IN"
                            )
                          : "—"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <Badge
                        variant={invoice.is_draft ? "secondary" : "default"}
                      >
                        {invoice.is_draft ? "Draft" : "Finalized"}
                      </Badge>
                      <span className="font-medium">
                        {money.format(invoice.rounded_total)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Sales channels today</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reportsLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : (
              <>
                <ChannelRow
                  label="Walk-in"
                  amount={summary?.today.walk_in.grand_total ?? 0}
                  count={summary?.today.walk_in.invoice_count ?? 0}
                />
                <ChannelRow
                  label="Cloud kitchen"
                  amount={summary?.today.cloud_kitchen.grand_total ?? 0}
                  count={summary?.today.cloud_kitchen.invoice_count ?? 0}
                />
                <div className="border-t border-border pt-3">
                  <ChannelRow
                    label="Combined"
                    amount={summary?.today.combined.grand_total ?? 0}
                    count={summary?.today.combined.invoice_count ?? 0}
                    bold
                  />
                </div>
              </>
            )}
            <Link
              href="/dashboard/pos/reports"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View reports
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Tags className="h-4 w-4" />
            Inventory snapshot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SnapshotItem label="Brands" value={brands.length} href="/dashboard/brands" />
            <SnapshotItem label="Products" value={products.length} href="/dashboard/products" />
            <SnapshotItem
              label="Serial units"
              value={metrics.availableStockCount}
              href="/dashboard/stocks"
            />
            <SnapshotItem
              label="Estimates"
              value={estimates.length}
              href="/dashboard/estimates"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  hint,
  icon: Icon,
  alert = false,
}: {
  title: string;
  value: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  alert?: boolean;
}) {
  return (
    <Card className="transition-all hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="flex items-center justify-between p-6">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{title}</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">{value}</h2>
          <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>
        </div>
        <div
          className={`rounded-2xl p-3 ${
            alert
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              : "bg-primary/10 text-primary"
          }`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}

function ChannelRow({
  label,
  amount,
  count,
  bold = false,
}: {
  label: string;
  amount: number;
  count: number;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className={bold ? "font-semibold" : "text-muted-foreground"}>
        {label}
      </span>
      <div className="text-right">
        <p className={bold ? "font-semibold" : "font-medium"}>
          {money.format(amount)}
        </p>
        <p className="text-xs text-muted-foreground">
          {count} invoice{count === 1 ? "" : "s"}
        </p>
      </div>
    </div>
  );
}

function SnapshotItem({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-border p-4 transition-colors hover:bg-accent/50"
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </Link>
  );
}
