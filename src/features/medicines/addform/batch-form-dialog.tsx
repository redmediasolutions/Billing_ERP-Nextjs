"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NO_EXPIRY_DATE, errorMessage } from "@/features/clinic/lib/clinic-format";

import type { MedicineBatch } from "../types";

export interface BatchFormValues {
  batch_no: string;
  quantity: number;
  purchase_price: number;
  selling_price: number;
  expiry_date: string;
}

/** New batch = stock in. Editing = correct details / set the counted quantity. */
export function BatchFormDialog({
  open,
  medicineName,
  batch,
  defaultPrice,
  onClose,
  onSave,
}: {
  open: boolean;
  medicineName: string;
  batch: MedicineBatch | null;
  defaultPrice: number;
  onClose: () => void;
  onSave: (values: BatchFormValues) => Promise<void>;
}) {
  const [form, setForm] = useState<BatchFormValues>({
    batch_no: "",
    quantity: 0,
    purchase_price: 0,
    selling_price: 0,
    expiry_date: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm(
      batch
        ? {
            batch_no: batch.batch_no,
            quantity: batch.quantity,
            purchase_price: batch.purchase_price,
            selling_price: batch.selling_price,
            expiry_date: batch.expiry_date && batch.expiry_date !== NO_EXPIRY_DATE ? batch.expiry_date : "",
          }
        : { batch_no: "", quantity: 0, purchase_price: 0, selling_price: defaultPrice, expiry_date: "" }
    );
  }, [open, batch, defaultPrice]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.batch_no.trim()) {
      setError("Enter the batch number.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      await onSave({ ...form, batch_no: form.batch_no.trim() });
    } catch (err) {
      setError(errorMessage(err, "Unable to save batch."));
    } finally {
      setSaving(false);
    }
  }

  const margin =
    form.selling_price > 0 && form.purchase_price > 0
      ? Math.round(((form.selling_price - form.purchase_price) / form.selling_price) * 100)
      : null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{batch ? "Edit batch" : "Add stock (new batch)"}</DialogTitle>
          <DialogDescription>{medicineName}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="batch_no">Batch no. *</Label>
              <Input
                id="batch_no"
                required
                value={form.batch_no}
                onChange={(e) => setForm({ ...form, batch_no: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="batch_expiry">Expiry</Label>
              <Input
                id="batch_expiry"
                type="date"
                value={form.expiry_date}
                onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="batch_qty">{batch ? "Counted qty" : "Quantity *"}</Label>
              <Input
                id="batch_qty"
                type="number"
                min={0}
                step="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="batch_buy">Buy price</Label>
              <Input
                id="batch_buy"
                type="number"
                min={0}
                step="0.01"
                value={form.purchase_price}
                onChange={(e) => setForm({ ...form, purchase_price: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="batch_sell">Sell price</Label>
              <Input
                id="batch_sell"
                type="number"
                min={0}
                step="0.01"
                value={form.selling_price}
                onChange={(e) => setForm({ ...form, selling_price: Number(e.target.value) })}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {batch
              ? "Changing the quantity records a stock adjustment in the inventory ledger."
              : "Using an existing batch number adds this quantity to that batch."}
            {margin !== null ? ` Margin ${margin}%.` : ""}
          </p>
          {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {batch ? "Save batch" : "Add stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
