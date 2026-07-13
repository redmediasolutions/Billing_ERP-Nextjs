"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import {
  ITEM_UNITS,
  type Item,
  type ItemInput,
  type ItemUnit,
} from "../types";

const emptyItem: ItemInput = {
  item_name: "",
  hsn_code: "",
  item_cost: 0,
  tax_rate: 0,
  item_cost_narration: "PCS",
  item_description: "",
  category: "",
  item_image: null,
  track_inventory: false,
  is_batch_tracked: false,
};

interface ItemFormModalProps {
  item: Item | null;
  onClose: () => void;
  onSave: (input: ItemInput) => Promise<void>;
}

export function ItemFormModal({
  item,
  onClose,
  onSave,
}: ItemFormModalProps) {
  const [form, setForm] = useState<ItemInput>(
    item
      ? {
          item_name: item.item_name,
          hsn_code: item.hsn_code || "",
          item_cost: item.item_cost,
          tax_rate: item.tax_rate,
          item_cost_narration: item.unit || "PCS",
          item_description: item.item_description || "",
          category: item.category || "",
          item_image: item.item_image,
          track_inventory: item.track_inventory,
          is_batch_tracked: item.is_batch_tracked,
        }
      : emptyItem
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateField<K extends keyof ItemInput>(
    field: K,
    value: ItemInput[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.item_name.trim()) {
      setError("Item name is required.");
      return;
    }

    if (form.item_cost < 0) {
      setError("Sale price cannot be negative.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await onSave({
        ...form,
        item_name: form.item_name.trim(),
        hsn_code: form.hsn_code.trim(),
        item_cost_narration: form.item_cost_narration.trim(),
        item_description: form.item_description.trim(),
        category: form.category.trim(),

        // A batch item must always be inventory-tracked.
        is_batch_tracked:
          form.track_inventory && form.is_batch_tracked,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save item."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:p-6">
      <form
        onSubmit={handleSubmit}
        className="max-h-[100vh] w-full max-w-5xl overflow-y-auto rounded-t-[24px] border border-zinc-800 bg-[#1e1e24] sm:rounded-[24px]"
      >
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-6">
          <h2 className="text-2xl font-bold text-white">
            {item ? "Edit Item" : "Add New Item"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-7 w-7" />
          </button>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-6">
          <Field label="Item Name *" className="md:col-span-6">
            <input
              autoFocus
              value={form.item_name}
              onChange={(event) =>
                updateField("item_name", event.target.value)
              }
              placeholder="e.g. Anwy Paracetamol 500mg"
            />
          </Field>

          <Field label="Item Code" className="md:col-span-3">
            <input
              disabled
              value={item?.item_code || "Auto-generated"}
              className="cursor-not-allowed opacity-60"
            />
          </Field>

          <Field label="HSN Code" className="md:col-span-3">
            <input
              value={form.hsn_code}
              onChange={(event) =>
                updateField("hsn_code", event.target.value)
              }
              placeholder="e.g. 998313"
            />
          </Field>

          <Field label="Sale Price (₹) *" className="md:col-span-2">
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.item_cost}
              onChange={(event) =>
                updateField("item_cost", Number(event.target.value))
              }
            />
          </Field>

          <Field label="Tax Rate" className="md:col-span-2">
            <select
              value={form.tax_rate}
              onChange={(event) =>
                updateField("tax_rate", Number(event.target.value))
              }
            >
              {[0, 5, 12, 18, 28].map((rate) => (
                <option key={rate} value={rate}>
                  {rate}%
                </option>
              ))}
            </select>
          </Field>

          <Field label="Unit" className="md:col-span-2">
            <select
              value={form.item_cost_narration}
              onChange={(event) =>
                updateField(
                  "item_cost_narration",
                  event.target.value as ItemUnit
                )
              }
            >
              {ITEM_UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Category" className="md:col-span-3">
            <input
              value={form.category}
              onChange={(event) =>
                updateField("category", event.target.value)
              }
              placeholder="e.g. Medicines, Doors, Services"
            />
          </Field>

          <Field label="Image URL" className="md:col-span-3">
            <input
              value={form.item_image || ""}
              onChange={(event) =>
                updateField("item_image", event.target.value || null)
              }
              placeholder="Optional image URL"
            />
          </Field>

          <Field label="Item Description" className="md:col-span-6">
            <textarea
              rows={3}
              value={form.item_description}
              onChange={(event) =>
                updateField("item_description", event.target.value)
              }
              placeholder="Optional details about the item..."
            />
          </Field>

          <label className="md:col-span-6 flex cursor-pointer items-center justify-between rounded-xl border border-zinc-800 bg-[#151517] p-5">
            <span>
              <span className="block text-lg font-bold text-white">
                Track Inventory
              </span>
              <span className="mt-1 block text-sm text-zinc-400">
                Enable standard stock tracking for this item.
              </span>
            </span>

            <input
              type="checkbox"
              checked={form.track_inventory}
              onChange={(event) => {
                updateField("track_inventory", event.target.checked);

                if (!event.target.checked) {
                  updateField("is_batch_tracked", false);
                }
              }}
              className="h-6 w-6 accent-[#FFCC00]"
            />
          </label>

          {form.track_inventory && (
            <label className="md:col-span-6 flex cursor-pointer items-center justify-between rounded-xl border border-zinc-800 bg-[#151517] p-5">
              <span>
                <span className="block text-lg font-bold text-white">
                  Batch Tracking
                </span>
                <span className="mt-1 block text-sm text-zinc-400">
                  Use this for medicines or products tracked by batch.
                </span>
              </span>

              <input
                type="checkbox"
                checked={form.is_batch_tracked}
                onChange={(event) =>
                  updateField("is_batch_tracked", event.target.checked)
                }
                className="h-6 w-6 accent-[#FFCC00]"
              />
            </label>
          )}

          {error && (
            <p className="md:col-span-6 rounded-xl border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-300">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-zinc-800 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-500 px-6 py-3 font-semibold text-zinc-200"
          >
            Cancel
          </button>

          <button
            disabled={saving}
            className="rounded-xl bg-[#FFCC00] px-6 py-3 font-bold text-black transition hover:bg-yellow-400 disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : item
                ? "Save Changes"
                : "Add Item"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-bold uppercase text-zinc-400">
        {label}
      </span>

      <div
        className="
          [&_input]:w-full [&_input]:rounded-xl [&_input]:border
          [&_input]:border-zinc-700 [&_input]:bg-[#151517]
          [&_input]:px-4 [&_input]:py-3 [&_input]:text-white
          [&_input]:outline-none [&_input]:focus:border-[#FFCC00]

          [&_select]:w-full [&_select]:rounded-xl [&_select]:border
          [&_select]:border-zinc-700 [&_select]:bg-[#151517]
          [&_select]:px-4 [&_select]:py-3 [&_select]:text-white
          [&_select]:outline-none [&_select]:focus:border-[#FFCC00]

          [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border
          [&_textarea]:border-zinc-700 [&_textarea]:bg-[#151517]
          [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:text-white
          [&_textarea]:outline-none [&_textarea]:focus:border-[#FFCC00]
        "
      >
        {children}
      </div>
    </label>
  );
}