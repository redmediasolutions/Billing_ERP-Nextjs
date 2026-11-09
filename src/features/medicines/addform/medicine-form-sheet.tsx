"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, Pill } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import {
  ResizableSheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/resizable-sheet-content";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage } from "@/features/clinic/lib/clinic-format";

import { MEDICINE_CATEGORIES, type Medicine, type MedicineInput } from "../types";

const EMPTY: MedicineInput = {
  name: "",
  category: "Tablet",
  manufacturer: "",
  description: "",
  hsn_code: "",
  tax_rate: 0,
  unit: "PCS",
  default_price: 0,
};

export function MedicineFormSheet({
  open,
  medicine,
  onClose,
  onSave,
}: {
  open: boolean;
  medicine: Medicine | null;
  onClose: () => void;
  onSave: (input: MedicineInput) => Promise<void>;
}) {
  const [form, setForm] = useState<MedicineInput>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm(
      medicine
        ? {
            name: medicine.name,
            category: medicine.category || "Other",
            manufacturer: medicine.manufacturer || "",
            description: medicine.description || "",
            hsn_code: medicine.hsn_code || "",
            tax_rate: medicine.tax_rate,
            unit: medicine.unit || "PCS",
            default_price: medicine.default_price,
          }
        : EMPTY
    );
  }, [open, medicine]);

  const categories = MEDICINE_CATEGORIES.includes(form.category)
    ? MEDICINE_CATEGORIES
    : [form.category, ...MEDICINE_CATEGORIES];

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      await onSave({ ...form, name: form.name.trim() });
    } catch (err) {
      setError(errorMessage(err, "Unable to save medicine."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <ResizableSheetContent
        defaultWidth={500}
        minWidth={380}
        maxWidth={860}
        storageKey="medicine-sheet-width"
        className="flex w-full flex-col gap-0 p-0"
      >
        <SheetHeader className="border-b p-6 pb-4 border-border">
          <SheetTitle>{medicine ? "Edit medicine" : "New medicine"}</SheetTitle>
          <SheetDescription>
            Saved as a batch-tracked item. Add stock as batches after saving.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={submit} className="flex-1 space-y-5 overflow-y-auto p-6">
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Pill className="h-3.5 w-3.5" /> Medicine
          </h3>
          <div className="space-y-1.5">
            <Label htmlFor="med_name">Name *</Label>
            <Input
              id="med_name"
              required
              placeholder="e.g. Paracetamol 650"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="med_category">Form</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger id="med_category" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="med_mfr">Manufacturer</Label>
              <Input
                id="med_mfr"
                value={form.manufacturer}
                onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="med_price">Default price (₹)</Label>
              <Input
                id="med_price"
                type="number"
                min={0}
                step="0.01"
                value={form.default_price}
                onChange={(e) => setForm({ ...form, default_price: Number(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">Used when a batch has no selling price.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="med_unit">Unit</Label>
              <Input id="med_unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="med_tax">GST %</Label>
              <Input
                id="med_tax"
                type="number"
                min={0}
                step="0.01"
                value={form.tax_rate}
                onChange={(e) => setForm({ ...form, tax_rate: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="med_hsn">HSN code</Label>
            <Input id="med_hsn" value={form.hsn_code} onChange={(e) => setForm({ ...form, hsn_code: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="med_desc">Notes</Label>
            <Textarea
              id="med_desc"
              rows={2}
              placeholder="Composition, storage..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
          <SheetFooter className="border-t px-0 pt-4 border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {medicine ? "Update medicine" : "Create medicine"}
            </Button>
          </SheetFooter>
        </form>
      </ResizableSheetContent>
    </Sheet>
  );
}
