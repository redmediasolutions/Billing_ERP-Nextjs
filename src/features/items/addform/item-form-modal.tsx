"use client";

import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  open?: boolean;
  onClose: () => void;
  onSave: (input: ItemInput) => Promise<void>;
}

export function ItemFormModal({
  item,
  open = true,
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
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="form-dialog item-form-dialog">
        <DialogHeader>
          <DialogTitle>
            {item ? "Edit Item" : "Add New Item"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="item-form-dialog__form">
          <div className="form-grid form-grid--2col">
            <Field label="Item Name *" full>
              <Input
                autoFocus
                value={form.item_name}
                onChange={(event) =>
                  updateField("item_name", event.target.value)
                }
                placeholder="e.g. Anwy Paracetamol 500mg"
              />
            </Field>

            <Field label="Item Code">
              <Input
                disabled
                value={item?.item_code || "Auto-generated"}
              />
            </Field>

            <Field label="HSN Code">
              <Input
                value={form.hsn_code}
                onChange={(event) =>
                  updateField("hsn_code", event.target.value)
                }
                placeholder="e.g. 998313"
              />
            </Field>

            <Field label="Sale Price (₹) *">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.item_cost}
                onChange={(event) =>
                  updateField("item_cost", Number(event.target.value))
                }
              />
            </Field>

            <Field label="Tax Rate">
              <select
                value={form.tax_rate}
                onChange={(event) =>
                  updateField("tax_rate", Number(event.target.value))
                }
                className="employee-form__select"
              >
                {[0, 5, 12, 18, 28].map((rate) => (
                  <option key={rate} value={rate}>
                    {rate}%
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Unit">
              <select
                value={form.item_cost_narration}
                onChange={(event) =>
                  updateField(
                    "item_cost_narration",
                    event.target.value as ItemUnit
                  )
                }
                className="employee-form__select"
              >
                {ITEM_UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Category">
              <Input
                value={form.category}
                onChange={(event) =>
                  updateField("category", event.target.value)
                }
                placeholder="e.g. Medicines, Doors, Services"
              />
            </Field>

            <Field label="Image URL">
              <Input
                value={form.item_image || ""}
                onChange={(event) =>
                  updateField("item_image", event.target.value || null)
                }
                placeholder="Optional image URL"
              />
            </Field>

            <Field label="Item Description" full>
              <Textarea
                rows={3}
                value={form.item_description}
                onChange={(event) =>
                  updateField("item_description", event.target.value)
                }
                placeholder="Optional details about the item..."
              />
            </Field>

            <label className="item-form__toggle item-form-dialog__toggle">
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
              <label className="item-form__toggle item-form-dialog__toggle">
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
          </div>

          {error && <p className="form-error">{error}</p>}

          <DialogFooter className="form-actions">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit" disabled={saving}>
              {saving && <Loader2 size={16} className="form-spinner" />}
              {item ? "Save Changes" : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
  full = false,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div
      className={`form-field${full ? " form-field--full" : ""}`}
      style={full ? { gridColumn: "1 / -1" } : undefined}
    >
      <Label className="form-field__label">{label}</Label>
      {children}
    </div>
  );
}
