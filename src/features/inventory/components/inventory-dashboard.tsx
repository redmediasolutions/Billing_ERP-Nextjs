"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  IndianRupee,
  Loader2,
  PackageCheck,
  Tags,
  Warehouse,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBrands } from "@/features/brands/hooks/use-brands";
import { useProducts } from "@/features/products/hooks/use-products";
import { useStocks } from "@/features/stocks/hooks/use-stocks";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const modules = [
  {
    title: "Products",
    description:
      "Product catalog with brand associations and aggregate stock counts.",
    href: "/dashboard/products",
    icon: Boxes,
  },
  {
    title: "Brands",
    description: "Organize products under brands for structured inventory.",
    href: "/dashboard/brands",
    icon: Tags,
  },
  {
    title: "Serial Stock",
    description:
      "Track individual stock units by serial number, barcode, and vendor.",
    href: "/dashboard/stocks",
    icon: Warehouse,
  },
];

export function InventoryDashboard() {
  const { data: brands = [], isLoading: brandsLoading } = useBrands();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: stocks = [], isLoading: stocksLoading } = useStocks();

  const loading = brandsLoading || productsLoading || stocksLoading;

  const stats = useMemo(() => {
    const availableUnits = stocks.filter((item) => item.status === "available");
    const soldUnits = stocks.filter((item) => item.status === "sold");

    const availableStockValue = availableUnits.reduce(
      (sum, item) => sum + Number(item.stock_cost || 0),
      0
    );

    const lowStockProducts = products.filter(
      (product) => Number(product.available_stock || 0) === 0
    );

    const topBrands = [...brands]
      .map((brand) => ({
        name: brand.name,
        count: products.filter((product) => product.brand_id === brand.id)
          .length,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      brandCount: brands.length,
      productCount: products.length,
      availableCount: availableUnits.length,
      soldCount: soldUnits.length,
      availableStockValue,
      lowStockCount: lowStockProducts.length,
      lowStockProducts: lowStockProducts.slice(0, 5),
      topBrands,
      totalCatalogUnits: products.reduce(
        (sum, product) => sum + Number(product.total_stock || 0),
        0
      ),
    };
  }, [brands, products, stocks]);

  return (
    <div className="w-full space-y-8 text-left">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Inventory
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Product Inventory
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Manage products, brands, and serial-tracked stock. Items &amp;
          services for billing live under{" "}
          <Link
            href="/dashboard/items"
            className="font-medium text-primary hover:underline"
          >
            Items
          </Link>
          ; suppliers are managed under{" "}
          <Link
            href="/dashboard/vendors"
            className="font-medium text-primary hover:underline"
          >
            Vendors
          </Link>
          .
        </p>
      </div>

      {loading ? (
        <div className="flex h-32 items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Loading inventory stats...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Products"
              value={String(stats.productCount)}
              hint={`${stats.brandCount} brand${stats.brandCount === 1 ? "" : "s"}`}
              icon={Boxes}
            />
            <StatCard
              label="Available Units"
              value={String(stats.availableCount)}
              hint={`${stats.soldCount} sold`}
              icon={PackageCheck}
            />
            <StatCard
              label="Stock Value"
              value={money.format(stats.availableStockValue)}
              hint="Cost of available serial stock"
              icon={IndianRupee}
            />
            <StatCard
              label="Low Stock Products"
              value={String(stats.lowStockCount)}
              hint="Products with 0 available units"
              icon={AlertTriangle}
              alert={stats.lowStockCount > 0}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Stock breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <BreakdownRow
                  label="Available serial units"
                  value={stats.availableCount}
                  total={stocks.length}
                  tone="primary"
                />
                <BreakdownRow
                  label="Sold units"
                  value={stats.soldCount}
                  total={stocks.length}
                  tone="muted"
                />
                <BreakdownRow
                  label="Total catalog units"
                  value={stats.totalCatalogUnits}
                  total={Math.max(stats.totalCatalogUnits, 1)}
                  tone="primary"
                />
                <div className="pt-2">
                  <Link
                    href="/dashboard/stocks"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    View all serial stock
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Top brands by products</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.topBrands.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No brands yet.{" "}
                    <Link
                      href="/dashboard/brands"
                      className="font-medium text-primary hover:underline"
                    >
                      Add your first brand
                    </Link>
                    .
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {stats.topBrands.map((brand) => (
                      <li
                        key={brand.name}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span className="font-medium">{brand.name}</span>
                        <Badge variant="secondary">
                          {brand.count} product{brand.count === 1 ? "" : "s"}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {stats.lowStockProducts.length > 0 ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Needs restocking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-border">
                  {stats.lowStockProducts.map((product) => (
                    <li
                      key={product.id}
                      className="flex items-center justify-between gap-4 py-3 text-sm"
                    >
                      <div>
                        <p className="font-medium">{product.product_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.product_code}
                          {product.brand_name
                            ? ` · ${product.brand_name}`
                            : ""}
                        </p>
                      </div>
                      <Link
                        href="/dashboard/stocks"
                        className="shrink-0 text-xs font-medium text-primary hover:underline"
                      >
                        Add stock
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
        </>
      )}

      <div>
        <h2 className="mb-4 text-lg font-semibold">Quick access</h2>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon;

            return (
              <Link key={module.href} href={module.href}>
                <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-6 w-6" />
                    </div>

                    <h2 className="mt-5 text-lg font-semibold">
                      {module.title}
                    </h2>
                    <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
                      {module.description}
                    </p>

                    <div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary">
                      Open
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  alert = false,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  alert?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
            alert
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              : "bg-primary/10 text-primary"
          }`}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <p className="truncate text-xs text-muted-foreground">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function BreakdownRow({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: "primary" | "muted";
}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${
            tone === "primary" ? "bg-primary" : "bg-muted-foreground/40"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
