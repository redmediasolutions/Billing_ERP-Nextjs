"use client";

import { FormEvent, useEffect, useState } from "react";
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

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

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

  useEffect(() => {
    if (!open) return;

    setForm(
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
    setError("");
  }, [item, open]);

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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="text-left">
          <DialogTitle>
            {item ? "Edit Item" : "Add New Item"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Item Name *" className="sm:col-span-2">
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
                className={selectClassName}
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
                className={selectClassName}
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

            <Field label="Item Description" className="sm:col-span-2">
              <Textarea
                rows={3}
                value={form.item_description}
                onChange={(event) =>
                  updateField("item_description", event.target.value)
                }
                placeholder="Optional details about the item..."
              />
            </Field>

            <ToggleField
              title="Track Inventory"
              description="Enable standard stock tracking for this item."
              checked={form.track_inventory}
              onChange={(checked) => {
                updateField("track_inventory", checked);
                if (!checked) updateField("is_batch_tracked", false);
              }}
            />

            {form.track_inventory && (
              <ToggleField
                title="Batch Tracking"
                description="Use this for medicines or products tracked by batch."
                checked={form.is_batch_tracked}
                onChange={(checked) =>
                  updateField("is_batch_tracked", checked)
                }
              />
            )}
          </div>

          {error && (
            <p className="text-sm font-medium text-destructive">{error}</p>
          )}

          <DialogFooter className="gap-2 sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit" disabled={saving}>
              {saving && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
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
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 text-left ${className}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ToggleField({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border bg-muted/30 p-4 text-left sm:col-span-2">
      <span className="space-y-1">
        <span className="block text-sm font-medium text-foreground">
          {title}
        </span>
        <span className="block text-xs text-muted-foreground">
          {description}
        </span>
      </span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 accent-primary"
      />
    </label>
  );
}
