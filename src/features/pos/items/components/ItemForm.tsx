"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { Dialog } from "@/features/pos/ui/dialog";
import { Button } from "@/features/pos/ui/button";
import { FieldGroup, Label, Input, Textarea } from "@/features/pos/ui/input";
import { uploadItemImage } from "@/features/pos/lib/upload-item-image";
import { useToast } from "@/features/pos/ui/toast";
import type { Item, ItemInput } from "@/features/items/types";
import "./ItemForm.css";

const EMPTY: ItemInput = {
  item_name: "",
  hsn_code: "",
  item_cost: 0,
  walk_in_price: 0,
  cloud_kitchen_price: 0,
  tax_rate: 5,
  item_cost_narration: "PCS",
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
  const [uploading, setUploading] = useState(false);
  const [syncPrices, setSyncPrices] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  useEffect(() => {
    if (editing) {
      setForm({
        item_name: editing.item_name,
        hsn_code: editing.hsn_code ?? "",
        item_cost: Number(editing.item_cost) || 0,
        walk_in_price: Number(editing.walk_in_price) || 0,
        cloud_kitchen_price: Number(editing.cloud_kitchen_price) || 0,
        tax_rate: Number(editing.tax_rate) || 0,
        item_cost_narration: editing.unit || "PCS",
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

  async function handleImagePick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadItemImage(file);
      set("item_image", url);
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.item_name.trim()) return;

    setSaving(true);
    try {
      await onSubmit({
        ...form,
        hsn_code: editing?.hsn_code ?? "",
        item_cost_narration: editing?.unit || "PCS",
        track_inventory: editing?.track_inventory ?? false,
        is_batch_tracked: editing?.is_batch_tracked ?? false,
        item_cost: form.walk_in_price ?? form.item_cost,
      });
      onClose();
    } catch {
      // usePosItems shows the API error toast; keep the dialog open to retry.
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? "Edit item" : "Add item"}
      description="Set walk-in and cloud kitchen prices for billing."
      width={520}
      mobileSheet
    >
      <form onSubmit={handleSubmit} className="item-form">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="item-form-image-input"
          tabIndex={-1}
          aria-hidden
          onChange={handleImagePick}
        />

        <FieldGroup>
          <Label htmlFor="item_name">Item name</Label>
          <Input
            id="item_name"
            required
            value={form.item_name}
            onChange={(e) => set("item_name", e.target.value)}
            placeholder="e.g. Mango Lassi"
          />
        </FieldGroup>

        <div className="item-form-row">
          <FieldGroup>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              placeholder="e.g. Beverages"
            />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="tax">Tax %</Label>
            <Input
              id="tax"
              type="number"
              step="0.01"
              min={0}
              value={form.tax_rate}
              onChange={(e) => set("tax_rate", parseFloat(e.target.value) || 0)}
            />
          </FieldGroup>
        </div>

        <div className="price-block">
          <div className="item-form-pricing-head">
            <span className="eyebrow">Pricing</span>
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
          <div className="item-form-prices">
            <FieldGroup>
              <Label htmlFor="walk_in_price">Walk-in</Label>
              <Input
                id="walk_in_price"
                type="number"
                step="0.01"
                min={0}
                required
                value={form.walk_in_price ?? 0}
                onChange={(e) => set("walk_in_price", parseFloat(e.target.value) || 0)}
              />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="cloud_kitchen_price">Cloud kitchen</Label>
              <Input
                id="cloud_kitchen_price"
                type="number"
                step="0.01"
                min={0}
                required
                disabled={syncPrices}
                value={form.cloud_kitchen_price ?? 0}
                onChange={(e) => set("cloud_kitchen_price", parseFloat(e.target.value) || 0)}
              />
            </FieldGroup>
          </div>
        </div>

        <FieldGroup>
          <Label htmlFor="desc">Description</Label>
          <Textarea
            id="desc"
            rows={3}
            value={form.item_description}
            onChange={(e) => set("item_description", e.target.value)}
            placeholder="Optional — shown on the billing screen"
          />
        </FieldGroup>

        <FieldGroup>
          <Label>Photo</Label>
          <button
            type="button"
            className="item-form-photo"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {form.item_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.item_image} alt="" className="item-form-photo-preview" />
            ) : (
              <span className="item-form-photo-icon">
                <ImagePlus size={22} />
              </span>
            )}
            <span className="item-form-photo-label">
              {uploading ? "Uploading…" : form.item_image ? "Tap to change photo" : "Choose from gallery"}
            </span>
            <p className="item-form-photo-hint">JPG, PNG or WebP · max 5 MB</p>
          </button>
          {form.item_image && (
            <div className="item-form-photo-actions">
              <Button type="button" variant="ghost" size="sm" onClick={() => set("item_image", null)}>
                <Trash2 size={14} /> Remove photo
              </Button>
            </div>
          )}
        </FieldGroup>

        <div className="item-form-footer">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving || uploading}>
            {editing ? "Save changes" : "Add item"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
