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
    <section className="items-dashboard">
      <div className="items-dashboard__toolbar">
        <div className="items-dashboard__search">
          <Search className="items-dashboard__search-icon" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search items, codes, or descriptions..."
            className="items-dashboard__search-input"
          />
        </div>

        <button
          onClick={() => {
            setEditingItem(null);
            setFormOpen(true);
          }}
          className="items-dashboard__primary-action"
        >
          <Plus size={16} />
          Add Item
        </button>
      </div>

      <div className="items-dashboard__kpis">
        <Kpi label="Total Items" value={String(items.length)} />
        <Kpi label="Inventory Tracked" value={String(trackedCount)} />
        <Kpi label="Batch Tracked" value={String(batchCount)} />
        <Kpi label="Total Stock Units" value={String(totalStock)} />
      </div>

      <div className="items-dashboard__summary">
        <p className="items-dashboard__summary-label">
          Inventory & Catalogue
        </p>

        <p className="items-dashboard__summary-copy">
          Manage standard items, services, and batch-tracked inventory.
        </p>
      </div>

      <div>
        <div className="items-dashboard__directory-heading">
          <div>
            <h1 className="items-dashboard__title">Item & Services Directory</h1>
            <p className="items-dashboard__count">
              Listing {filteredItems.length} item
              {filteredItems.length === 1 ? "" : "s"}
            </p>
          </div>

          <button
            onClick={() => void refresh()}
            className="items-dashboard__refresh"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {actionError && (
          <p className="items-dashboard__error">
            {actionError}
          </p>
        )}

        <div className="items-dashboard__table-card">
          <div className="items-dashboard__table-scroll">
            <table className="items-dashboard__table">
              <thead>
                <tr>
                  <th>Item Name & Code</th><th>Price / Unit</th><th>Stock</th><th>Description</th><th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="items-dashboard__state"
                    >
                      <Loader2 className="items-dashboard__spinner" />
                      Loading items...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="items-dashboard__state items-dashboard__state--error"
                    >
                      {error}
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="items-dashboard__state"
                    >
                      No items found. Click “Add Item” to create one.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="items-dashboard__row"
                    >
                      <td><div className="items-dashboard__item">
                          <div className="items-dashboard__item-icon"><Package size={20} />
                          </div>

                          <div>
                            <p className="items-dashboard__item-name">
                              {item.item_name}
                            </p>

                            <p className="items-dashboard__item-code">
                              {item.item_code}
                              {item.hsn_code
                                ? ` · HSN: ${item.hsn_code}`
                                : ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="items-dashboard__price">
                        {money.format(item.item_cost)}
                        <span className="items-dashboard__unit">
                          / {item.unit || "PCS"}
                        </span>
                      </td>

                      <td>
                        {item.track_inventory ? (
                          <div>
                            <p className="items-dashboard__stock">
                              {item.total_stock}
                            </p>

                            <p className="items-dashboard__stock-label">
                              {item.is_batch_tracked
                                ? "Batch tracked"
                                : "Inventory tracked"}
                            </p>
                          </div>
                        ) : (
                          <span className="items-dashboard__empty">—</span>
                        )}
                      </td>

                      <td className="items-dashboard__description"><p>
                          {item.item_description || "No description"}
                        </p>
                      </td>

                      <td><div className="items-dashboard__actions">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setFormOpen(true);
                            }}
                            className="items-dashboard__icon-action"
                            title="Edit item"
                          >
                            <Edit3 size={16} />
                          </button>

                          <button
                            onClick={() => void deleteItem(item)}
                            className="items-dashboard__icon-action"
                            title="Archive item"
                          >
                            <Trash2 size={16} />
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
    <div className="items-kpi">
      <Package size={20} className="items-kpi__icon" />
      <p className="items-kpi__label">{label}</p>
      <p className="items-kpi__value">{value}</p>
    </div>
  );
}
