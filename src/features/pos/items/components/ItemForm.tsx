"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogFooter } from "@/features/pos/ui/dialog";
import { Button } from "@/features/pos/ui/button";
import { FieldGroup, Label, Input, Textarea, Select } from "@/features/pos/ui/input";
import { Item, ItemInput, POS_UNIT_OPTIONS } from "@/features/items/types";

const EMPTY: ItemInput = {
  item_name: "",
  hsn_code: "",
  item_cost: 0,
  walk_in_price: 0,
  cloud_kitchen_price: 0,
  tax_rate: 5,
  item_cost_narration: "Plate",
  item_description: "",
  category: "",
  item_image: null,
  track_inventory: false,
  is_batch_tracked: false,
};

export function ItemForm({
  open,
  onClose,
  onSubmit,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: ItemInput) => Promise<void>;
  editing?: Item | null;
}) {
  const [form, setForm] = useState<ItemInput>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [syncPrices, setSyncPrices] = useState(true);

  useEffect(() => {
    if (editing) {
      setForm({
        item_name: editing.item_name,
        hsn_code: editing.hsn_code ?? "",
        item_cost: Number(editing.item_cost) || 0,
        walk_in_price: Number(editing.walk_in_price) || 0,
        cloud_kitchen_price: Number(editing.cloud_kitchen_price) || 0,
        tax_rate: Number(editing.tax_rate) || 0,
        item_cost_narration: editing.unit || "Plate",
        item_description: editing.item_description ?? "",
        category: editing.category ?? "",
        item_image: editing.item_image ?? null,
        track_inventory: editing.track_inventory,
        is_batch_tracked: editing.is_batch_tracked,
      });
      setSyncPrices(Number(editing.walk_in_price) === Number(editing.cloud_kitchen_price));
    } else {
      setForm(EMPTY);
      setSyncPrices(true);
    }
  }, [editing, open]);

  function set<K extends keyof ItemInput>(key: K, value: ItemInput[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "walk_in_price" && syncPrices) next.cloud_kitchen_price = value as number;
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        ...form,
        item_cost: form.walk_in_price ?? form.item_cost,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? "Edit item" : "Add item"}
      description="Set a walk-in price and a cloud kitchen price — the cashier picks the channel at billing time."
      width={560}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex gap-3">
          <FieldGroup className="flex-1">
            <Label htmlFor="item_name">Item name</Label>
            <Input id="item_name" required value={form.item_name} onChange={(e) => set("item_name", e.target.value)} placeholder="Signature Wagyu Burger" />
          </FieldGroup>
          <FieldGroup style={{ width: 140 }}>
            <Label htmlFor="unit">Unit</Label>
            <Select id="unit" value={form.item_cost_narration} onChange={(e) => set("item_cost_narration", e.target.value)}>
              {POS_UNIT_OPTIONS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </Select>
          </FieldGroup>
        </div>

        <div className="flex gap-3">
          <FieldGroup className="flex-1">
            <Label htmlFor="category">Category</Label>
            <Input id="category" value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="Main Course" />
          </FieldGroup>
          <FieldGroup style={{ width: 140 }}>
            <Label htmlFor="hsn">HSN code</Label>
            <Input id="hsn" value={form.hsn_code} onChange={(e) => set("hsn_code", e.target.value)} placeholder="2106" />
          </FieldGroup>
          <FieldGroup style={{ width: 110 }}>
            <Label htmlFor="tax">Tax %</Label>
            <Input id="tax" type="number" step="0.01" min={0} value={form.tax_rate} onChange={(e) => set("tax_rate", parseFloat(e.target.value) || 0)} />
          </FieldGroup>
        </div>

        <div className="price-block">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Pricing by sales channel</span>
            <label className="sync-toggle">
              <input
                type="checkbox"
                checked={syncPrices}
                onChange={(e) => {
                  setSyncPrices(e.target.checked);
                  if (e.target.checked) set("cloud_kitchen_price", form.walk_in_price ?? 0);
                }}
              />
              Same price for both
            </label>
          </div>
          <div className="flex gap-3" style={{ marginTop: 10 }}>
            <FieldGroup className="flex-1">
              <Label htmlFor="walk_in_price">Walk-in price</Label>
              <Input id="walk_in_price" type="number" step="0.01" min={0} required value={form.walk_in_price ?? 0}
                onChange={(e) => set("walk_in_price", parseFloat(e.target.value) || 0)} />
            </FieldGroup>
            <FieldGroup className="flex-1">
              <Label htmlFor="cloud_kitchen_price">Cloud kitchen price</Label>
              <Input id="cloud_kitchen_price" type="number" step="0.01" min={0} required disabled={syncPrices} value={form.cloud_kitchen_price ?? 0}
                onChange={(e) => set("cloud_kitchen_price", parseFloat(e.target.value) || 0)} />
            </FieldGroup>
          </div>
        </div>

        <FieldGroup>
          <Label htmlFor="desc">Description</Label>
          <Textarea id="desc" value={form.item_description} onChange={(e) => set("item_description", e.target.value)} placeholder="Short description shown on the billing screen" />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="image">Image URL</Label>
          <Input id="image" value={form.item_image ?? ""} onChange={(e) => set("item_image", e.target.value || null)} placeholder="https://…" />
        </FieldGroup>

        <label className="sync-toggle">
          <input type="checkbox" checked={form.track_inventory} onChange={(e) => set("track_inventory", e.target.checked)} />
          Track stock for this item
        </label>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>{editing ? "Save changes" : "Add item"}</Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
