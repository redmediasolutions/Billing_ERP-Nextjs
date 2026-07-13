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
    <section className="min-h-full space-y-7 bg-[#111113] p-5 text-white md:p-8">
      <div className="flex flex-col gap-4 border-b border-zinc-800 pb-6 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search items, codes, or descriptions..."
            className="w-full rounded-xl border border-zinc-800 bg-[#151517] py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-[#FFCC00]"
          />
        </div>

        <button
          onClick={() => {
            setEditingItem(null);
            setFormOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#FFCC00] px-5 py-3 text-sm font-bold text-black transition hover:bg-yellow-400"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Total Items" value={String(items.length)} />
        <Kpi label="Inventory Tracked" value={String(trackedCount)} />
        <Kpi label="Batch Tracked" value={String(batchCount)} />
        <Kpi label="Total Stock Units" value={String(totalStock)} />
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-[#1e1e24] p-5">
        <p className="text-sm font-bold uppercase text-[#FFCC00]">
          Inventory & Catalogue
        </p>

        <p className="mt-2 text-sm text-zinc-400">
          Manage standard items, services, and batch-tracked inventory.
        </p>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Item & Services Directory</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Listing {filteredItems.length} item
              {filteredItems.length === 1 ? "" : "s"}
            </p>
          </div>

          <button
            onClick={() => void refresh()}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {actionError && (
          <p className="mb-4 rounded-xl border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-300">
            {actionError}
          </p>
        )}

        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#1e1e24]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-zinc-800 text-xs uppercase text-zinc-400">
                <tr>
                  <th className="px-6 py-5">Item Name & Code</th>
                  <th className="px-6 py-5">Price / Unit</th>
                  <th className="px-6 py-5">Stock</th>
                  <th className="px-6 py-5">Description</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-16 text-center text-zinc-400"
                    >
                      <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin" />
                      Loading items...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-16 text-center text-red-300"
                    >
                      {error}
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-16 text-center text-zinc-500"
                    >
                      No items found. Click “Add Item” to create one.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-zinc-800/70 transition hover:bg-zinc-800/30"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-[#FFCC00]">
                            <Package className="h-5 w-5" />
                          </div>

                          <div>
                            <p className="font-semibold text-white">
                              {item.item_name}
                            </p>

                            <p className="mt-1 text-xs text-zinc-500">
                              {item.item_code}
                              {item.hsn_code
                                ? ` · HSN: ${item.hsn_code}`
                                : ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 font-semibold text-white">
                        {money.format(item.item_cost)}
                        <span className="ml-1 text-zinc-400">
                          / {item.unit || "PCS"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        {item.track_inventory ? (
                          <div>
                            <p className="font-semibold text-white">
                              {item.total_stock}
                            </p>

                            <p className="mt-1 text-xs text-emerald-400">
                              {item.is_batch_tracked
                                ? "Batch tracked"
                                : "Inventory tracked"}
                            </p>
                          </div>
                        ) : (
                          <span className="text-zinc-500">—</span>
                        )}
                      </td>

                      <td className="max-w-[250px] px-6 py-5">
                        <p className="truncate text-zinc-400">
                          {item.item_description || "No description"}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setFormOpen(true);
                            }}
                            className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-[#FFCC00]"
                            title="Edit item"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => void deleteItem(item)}
                            className="rounded-lg p-2 text-zinc-400 transition hover:bg-red-950/50 hover:text-red-400"
                            title="Archive item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
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
    <div className="rounded-2xl border border-zinc-800 bg-[#1e1e24] p-5">
      <Package className="mb-4 h-5 w-5 text-[#FFCC00]" />
      <p className="text-xs font-bold uppercase text-zinc-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}