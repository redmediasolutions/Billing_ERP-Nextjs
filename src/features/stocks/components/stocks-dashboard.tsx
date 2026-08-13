"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Edit3,
  Loader2,
  PackagePlus,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useDebouncedUrlSearchParam } from "@/lib/use-url-search";
import {
  useDeleteStock,
  useStocks,
} from "../hooks/use-stocks";
import type { Stock } from "../types/stock.types";
import { SellStockDialog } from "./sell-stock-dialog";
import { StockForm } from "./stock-form";

function money(value: string | number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function StocksDashboard() {
  const { value: search, setValue: setSearch, query } =
    useDebouncedUrlSearchParam();
  const [status, setStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [sellingStock, setSellingStock] = useState<Stock | null>(null);

  const { data: stocks = [], isLoading, error } = useStocks(query, status);
  const deleteStock = useDeleteStock();

  const summary = useMemo(
    () => ({
      total: stocks.length,
      available: stocks.filter((item) => item.status === "available").length,
      sold: stocks.filter((item) => item.status === "sold").length,
    }),
    [stocks]
  );

  function openAdd() {
    setEditingStock(null);
    setShowForm(true);
  }

  function openEdit(stock: Stock) {
    setEditingStock(stock);
    setShowForm(true);
  }

  async function archiveStock(stock: Stock) {
    const confirmed = window.confirm(
      `Archive stock serial "${stock.product_serial}"?`
    );

    if (!confirmed) return;

    try {
      await deleteStock.mutateAsync(stock.id);
    } catch (requestError) {
      window.alert(
        requestError instanceof Error
          ? requestError.message
          : "Unable to archive stock."
      );
    }
  }

  return (
    <section className="w-full space-y-6 text-left">
      {/* Header */}
      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Inventory management
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Stocks
          </h1>
          <p className="text-sm text-muted-foreground">
            Track every physical device by its unique serial number.
          </p>
        </div>

        <Button onClick={openAdd} className="gap-2 self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          Add Stock
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Total Stock Records
              </p>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {summary.total}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <PackagePlus className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Available Devices
              </p>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {summary.available}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <PackagePlus className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Sold Devices
              </p>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {summary.sold}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <ShoppingCart className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search product, vendor, or serial..."
            className="pl-9"
          />
        </div>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="flex h-9 w-full sm:w-48 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
        >
          <option value="">All stock</option>
          <option value="available">Available</option>
          <option value="sold">Sold</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Main Content Table Card */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>Loading stock...</span>
            </div>
          ) : error ? (
            <div className="flex h-64 items-center justify-start p-6 text-left text-sm font-medium text-destructive">
              Unable to load stock. Please refresh and try again.
            </div>
          ) : stocks.length === 0 ? (
            <div className="flex flex-col items-start justify-center gap-3 py-16 text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <PackagePlus className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">
                  No stock found
                </h3>
                <p className="text-xs text-muted-foreground">
                  Add products and vendors first, then add physical stock devices.
                </p>
              </div>
              <Button onClick={openAdd} className="mt-2 gap-2" size="sm">
                <Plus className="h-4 w-4" />
                Add First Stock
              </Button>
            </div>
          ) : (
            <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[260px]">Product</TableHead>
                    <TableHead>Serial</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Sale Price</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {stocks.map((stock) => (
                    <TableRow key={stock.id}>
                      {/* Product details */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {stock.product_image ? (
                            <img
                              className="h-10 w-10 rounded-md object-cover border border-border"
                              src={stock.product_image}
                              alt={stock.product_name}
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-sm font-bold text-primary">
                              {stock.product_name.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">
                              {stock.product_name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {stock.product_config || stock.stock_code || "—"}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="font-mono text-xs text-foreground">
                        {stock.product_serial}
                      </TableCell>

                      <TableCell className="text-foreground">
                        {stock.vendor_name || "—"}
                      </TableCell>

                      <TableCell className="font-medium text-foreground">
                        {money(stock.stock_cost)}
                      </TableCell>

                      <TableCell className="font-medium text-foreground">
                        {money(stock.sale_price)}
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {stock.item_condition || "—"}
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {stock.purchase_date
                          ? new Date(stock.purchase_date).toLocaleDateString(
                              "en-IN"
                            )
                          : "—"}
                      </TableCell>

                      {/* Status badge */}
                      <TableCell>
                        {stock.status === "available" ? (
                          <Badge
                            variant="outline"
                            className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 capitalize"
                          >
                            available
                          </Badge>
                        ) : stock.status === "sold" ? (
                          <Badge
                            variant="outline"
                            className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-400 capitalize"
                          >
                            sold
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="capitalize">
                            {stock.status}
                          </Badge>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        {stock.status === "available" ? (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(stock)}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            >
                              <Edit3 className="h-4 w-4" />
                              <span className="sr-only">Edit stock</span>
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSellingStock(stock)}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            >
                              <ShoppingCart className="h-4 w-4" />
                              <span className="sr-only">Sell stock</span>
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={deleteStock.isPending}
                              onClick={() => archiveStock(stock)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Archive stock</span>
                            </Button>
                          </div>
                        ) : stock.invoice_id ? (
                          <Link
                            href={`/dashboard/invoices/${stock.invoice_id}`}
                            className="text-xs font-medium text-primary hover:underline"
                          >
                            {stock.invoice_number || "Invoice"}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          )}
        </CardContent>
      </Card>

      {showForm ? (
        <StockForm
          stock={editingStock}
          onClose={() => {
            setShowForm(false);
            setEditingStock(null);
          }}
        />
      ) : null}

      {sellingStock ? (
        <SellStockDialog
          stock={sellingStock}
          onClose={() => setSellingStock(null)}
        />
      ) : null}
    </section>
  );
}
