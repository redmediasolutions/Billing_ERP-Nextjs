"use client";

import { useMemo, useState } from "react";
import {
  Edit3,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ItemFormModal } from "../addform/item-form-modal";
import { useItems } from "../hooks/use-items";
import type { Item, ItemInput } from "../types";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export function ItemsDashboard() {
  const { items, loading, error, refresh, create, update, remove } =
    useItems();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [actionError, setActionError] = useState("");

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return items;

    return items.filter((item) =>
      [
        item.item_name,
        item.item_code,
        item.hsn_code || "",
        item.item_description || "",
      ].some((value) => value.toLowerCase().includes(term))
    );
  }, [items, search]);

  const trackedCount = items.filter(
    (item) => item.track_inventory
  ).length;

  const batchCount = items.filter(
    (item) => item.is_batch_tracked
  ).length;

  const totalStock = items.reduce(
    (total, item) => total + item.total_stock,
    0
  );

  async function saveItem(input: ItemInput) {
    try {
      setActionError("");

      if (editingItem) {
        await update(editingItem.id, input);
      } else {
        await create(input);
      }

      setFormOpen(false);
      setEditingItem(null);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Unable to save item."
      );
    }
  }

  async function deleteItem(item: Item) {
    const confirmed = window.confirm(
      `Delete "${item.item_name}"? It will be archived and removed from this list.`
    );

    if (!confirmed) return;

    try {
      setActionError("");
      await remove(item.id);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Unable to delete item."
      );
    }
  }

  return (
    <section className="space-y-6">
      {/* Search Bar & Primary Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search items, codes, or descriptions..."
            className="pl-9"
          />
        </div>

        <Button
          onClick={() => {
            setEditingItem(null);
            setFormOpen(true);
          }}
          className="gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Total Items" value={String(items.length)} />
        <Kpi label="Inventory Tracked" value={String(trackedCount)} />
        <Kpi label="Batch Tracked" value={String(batchCount)} />
        <Kpi label="Total Stock Units" value={String(totalStock)} />
      </div>

      {/* Section Summary */}
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Inventory & Catalogue
        </p>
        <p className="text-sm text-muted-foreground">
          Manage standard items, services, and batch-tracked inventory.
        </p>
      </div>

      {/* Item Directory Section */}
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Item & Services Directory
            </h1>
            <p className="text-xs text-muted-foreground">
              Listing {filteredItems.length} item
              {filteredItems.length === 1 ? "" : "s"}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => void refresh()}
            className="gap-2 self-start sm:self-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {actionError && (
          <p className="text-sm font-medium text-destructive">
            {actionError}
          </p>
        )}

        {/* Directory Table Card */}
        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[280px]">Item Name & Code</TableHead>
                    <TableHead>Price / Unit</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-32 text-center text-muted-foreground"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span>Loading items...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-32 text-center text-destructive"
                      >
                        {error}
                      </TableCell>
                    </TableRow>
                  ) : filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-32 text-center text-muted-foreground"
                      >
                        No items found. Click &ldquo;Add Item&rdquo; to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        {/* Item Name & Code */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <Package className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">
                                {item.item_name}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {item.item_code}
                                {item.hsn_code
                                  ? ` · HSN: ${item.hsn_code}`
                                  : ""}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Price & Unit */}
                        <TableCell>
                          <div className="text-sm font-medium text-foreground">
                            {money.format(item.item_cost)}{" "}
                            <span className="text-xs font-normal text-muted-foreground">
                              / {item.unit || "PCS"}
                            </span>
                          </div>
                        </TableCell>

                        {/* Stock */}
                        <TableCell>
                          {item.track_inventory ? (
                            <div>
                              <p className="font-medium text-foreground">
                                {item.total_stock}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.is_batch_tracked
                                  ? "Batch tracked"
                                  : "Inventory tracked"}
                              </p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        {/* Description */}
                        <TableCell>
                          <p
                            className="max-w-[250px] truncate text-xs text-muted-foreground"
                            title={item.item_description || undefined}
                          >
                            {item.item_description || "No description"}
                          </p>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingItem(item);
                                setFormOpen(true);
                              }}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              title="Edit item"
                            >
                              <Edit3 className="h-4 w-4" />
                              <span className="sr-only">Edit item</span>
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => void deleteItem(item)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              title="Archive item"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Archive item</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {formOpen && (
        <ItemFormModal
          item={editingItem}
          onClose={() => {
            setFormOpen(false);
            setEditingItem(null);
          }}
          onSave={saveItem}
        />
      )}
    </section>
  );
}

function Kpi({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Package className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
