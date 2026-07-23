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
    <div className="item-form-overlay">
      <form onSubmit={handleSubmit} className="item-form">
        <div className="item-form__header">
          <h2 className="item-form__title">
            {item ? "Edit Item" : "Add New Item"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="item-form__close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="item-form__grid">
          <Field label="Item Name *" className="item-form__field--full">
            <input
              autoFocus
              value={form.item_name}
              onChange={(event) =>
                updateField("item_name", event.target.value)
              }
              placeholder="e.g. Anwy Paracetamol 500mg"
            />
          </Field>

          <Field label="Item Code" className="item-form__field--half">
            <input
              disabled
              value={item?.item_code || "Auto-generated"}
            />
          </Field>

          <Field label="HSN Code" className="item-form__field--half">
            <input
              value={form.hsn_code}
              onChange={(event) =>
                updateField("hsn_code", event.target.value)
              }
              placeholder="e.g. 998313"
            />
          </Field>

          <Field label="Sale Price (₹) *" className="item-form__field--third">
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

          <Field label="Tax Rate" className="item-form__field--third">
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

          <Field label="Unit" className="item-form__field--third">
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

          <Field label="Category" className="item-form__field--half">
            <input
              value={form.category}
              onChange={(event) =>
                updateField("category", event.target.value)
              }
              placeholder="e.g. Medicines, Doors, Services"
            />
          </Field>

          <Field label="Image URL" className="item-form__field--half">
            <input
              value={form.item_image || ""}
              onChange={(event) =>
                updateField("item_image", event.target.value || null)
              }
              placeholder="Optional image URL"
            />
          </Field>

          <Field label="Item Description" className="item-form__field--full">
            <textarea
              rows={3}
              value={form.item_description}
              onChange={(event) =>
                updateField("item_description", event.target.value)
              }
              placeholder="Optional details about the item..."
            />
          </Field>

          <label className="item-form__toggle item-form__field--full">
            <span>
              <span className="item-form__toggle-title">
                Track Inventory
              </span>
              <span className="item-form__toggle-desc">
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
            />
          </label>

          {form.track_inventory && (
            <label className="item-form__toggle item-form__field--full">
              <span>
                <span className="item-form__toggle-title">
                  Batch Tracking
                </span>
                <span className="item-form__toggle-desc">
                  Use this for medicines or products tracked by batch.
                </span>
              </span>

              <input
                type="checkbox"
                checked={form.is_batch_tracked}
                onChange={(event) =>
                  updateField("is_batch_tracked", event.target.checked)
                }
              />
            </label>
          )}

          {error && (
            <p className="form-error item-form__field--full">{error}</p>
          )}
        </div>

        <div className="item-form__footer">
          <button
            type="button"
            onClick={onClose}
            className="item-form__cancel"
          >
            Cancel
          </button>

          <button disabled={saving} className="item-form__submit">
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
    <label className={`form-field item-form__field ${className}`}>
      <span className="form-field__label">{label}</span>
      <div>{children}</div>
    </label>
  );
}