"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Edit3,
  Loader2,
  Package,
  Plus,
  QrCode,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { Item } from "@/features/items/types";
import { useItemBatches, useItemLedger } from "../hooks/use-inventory";
import type { ItemBatch } from "../types/inventory.types";
import { AddStockSheet } from "./add-stock-sheet";
import { EditBatchDialog } from "./edit-batch-dialog";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface ItemDetailViewProps {
  item: Item;
  onItemRefresh?: () => void;
}

export function ItemDetailView({ item, onItemRefresh }: ItemDetailViewProps) {
  const [addStockOpen, setAddStockOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<ItemBatch | null>(null);

  const {
    data: batches = [],
    isLoading: batchesLoading,
    refetch: refetchBatches,
  } = useItemBatches(item.id, item.is_batch_tracked);

  const {
    data: ledger = [],
    isLoading: ledgerLoading,
    refetch: refetchLedger,
  } = useItemLedger(item.id, item.track_inventory);

  const lowStock =
    item.track_inventory && item.total_stock <= 5;

  function refreshInventory() {
    onItemRefresh?.();
    if (item.is_batch_tracked) void refetchBatches();
    if (item.track_inventory) void refetchLedger();
  }

  return (
    <section className="w-full space-y-6 text-left">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/items">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Items
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl ${
                item.is_batch_tracked
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : "bg-primary/10 text-primary"
              }`}
            >
              <Package className="h-8 w-8" />
            </div>

            <div>
              {item.is_batch_tracked && (
                <Badge variant="outline" className="mb-2 border-blue-500/30 text-blue-600 dark:text-blue-400">
                  Batch tracked
                </Badge>
              )}
              <h1 className="text-2xl font-bold tracking-tight">
                {item.item_name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.item_code || "No item code"}
              </p>
            </div>
          </div>

          <div className="text-left lg:text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Sale price
            </p>
            <p className="text-2xl font-bold text-primary">
              {money.format(item.item_cost)}
            </p>
            {item.unit && (
              <p className="text-sm text-muted-foreground">per {item.unit}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-6 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider">
              General information
            </h2>
            {item.track_inventory && (
              <Button size="sm" onClick={() => setAddStockOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Stock
              </Button>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <InfoField
              label="HSN code"
              value={item.hsn_code || "—"}
            />
            <InfoField
              label="Current stock"
              value={
                item.track_inventory
                  ? `${item.total_stock} ${item.unit || "PCS"}`
                  : "Untracked"
              }
              valueClassName={lowStock ? "text-destructive" : undefined}
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              {item.item_description || "No description provided."}
            </p>
          </div>
        </CardContent>
      </Card>

      {item.is_batch_tracked && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider">
            Active batches & expiry (FEFO)
          </h2>

          <Card>
            <CardContent className="p-0">
              {batchesLoading ? (
                <div className="flex h-32 items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading batches...
                </div>
              ) : batches.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  No active batches in stock.
                </p>
              ) : (
                <Table frameless>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="w-[60px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batches.map((batch) => {
                      const expiry = batch.expiry_date
                        ? new Date(batch.expiry_date)
                        : null;
                      const daysUntilExpiry = expiry
                        ? Math.ceil(
                            (expiry.getTime() - Date.now()) /
                              (1000 * 60 * 60 * 24)
                          )
                        : null;
                      const expiringSoon =
                        daysUntilExpiry !== null && daysUntilExpiry <= 30;

                      return (
                        <TableRow key={batch.batch_id ?? batch.id ?? batch.batch_number}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                                <QrCode className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <span className="font-medium">
                                {batch.batch_number}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span
                                className={
                                  expiringSoon ? "text-destructive" : ""
                                }
                              >
                                {expiry ? formatDate(batch.expiry_date) : "—"}
                              </span>
                              {expiringSoon && (
                                <Badge variant="destructive" className="text-[10px]">
                                  Soon
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {Number(batch.quantity).toFixed(2)}{" "}
                            {item.unit || "PCS"}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setEditingBatch(batch)}
                              title="Edit batch info"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {item.track_inventory && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider">
            Stock movement ledger
          </h2>

          <Card>
            <CardContent className="p-0">
              {ledgerLoading ? (
                <div className="flex h-32 items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading ledger...
                </div>
              ) : ledger.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  No stock movements recorded yet.
                </p>
              ) : (
                <Table frameless>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead className="text-right">Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledger.map((entry, index) => {
                      const qtyChange = Number(entry.quantity_change);
                      const isPositive = qtyChange > 0;

                      return (
                        <TableRow key={entry.id ?? `${entry.created_at}-${index}`}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                  isPositive
                                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                                }`}
                              >
                                {isPositive ? (
                                  <ArrowDown className="h-4 w-4" />
                                ) : (
                                  <ArrowUp className="h-4 w-4" />
                                )}
                              </div>
                              <span className="font-medium">
                                {entry.transaction_type}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDateTime(entry.created_at)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {entry.batch_number || "—"}
                          </TableCell>
                          <TableCell
                            className={`text-right font-semibold ${
                              isPositive
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {isPositive ? "+" : ""}
                            {qtyChange.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <AddStockSheet
        item={item}
        open={addStockOpen}
        onClose={() => setAddStockOpen(false)}
        onSuccess={refreshInventory}
      />

      <EditBatchDialog
        itemId={item.id}
        batch={editingBatch}
        open={Boolean(editingBatch)}
        onClose={() => setEditingBatch(null)}
      />
    </section>
  );
}

function InfoField({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`mt-2 text-sm font-medium ${valueClassName ?? ""}`}>
        {value}
      </p>
    </div>
  );
}
