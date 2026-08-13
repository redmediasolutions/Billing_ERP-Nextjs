"use client";

import { FormEvent, useState } from "react";
import { Info, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { useAddStock } from "../hooks/use-inventory";
import type { Item } from "@/features/items/types";

interface AddStockSheetProps {
  item: Item;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddStockSheet({
  item,
  open,
  onClose,
  onSuccess,
}: AddStockSheetProps) {
  const [quantity, setQuantity] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [error, setError] = useState("");

  const addStock = useAddStock();

  function resetForm() {
    setQuantity("");
    setBatchNumber("");
    setExpiryDate("");
    setError("");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    const qty = Number.parseFloat(quantity.trim());

    if (!qty || qty <= 0) {
      setError("Enter a valid quantity.");
      return;
    }

    if (item.is_batch_tracked) {
      if (!batchNumber.trim()) {
        setError("Batch number is required for batch-tracked items.");
        return;
      }
      if (!expiryDate) {
        setError("Expiry date is required for batch-tracked items.");
        return;
      }
    }

    try {
      await addStock.mutateAsync({
        item_id: item.id,
        quantity: qty,
        batch_number: item.is_batch_tracked ? batchNumber.trim() : undefined,
        expiry_date: item.is_batch_tracked ? expiryDate : undefined,
      });

      resetForm();
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add stock."
      );
    }
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Add Stock</SheetTitle>
          <SheetDescription>
            Add stock for <span className="font-medium">{item.item_name}</span>
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-6 px-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity to add</Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              step="any"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="0"
              autoFocus
            />
          </div>

          {item.is_batch_tracked && (
            <>
              <div className="flex items-start gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-sm text-blue-600 dark:text-blue-400">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  This item uses batch tracking. Batch number and expiry date are
                  required for FEFO (first-expiry-first-out) stock management.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="batch-number">Batch number</Label>
                  <Input
                    id="batch-number"
                    value={batchNumber}
                    onChange={(event) => setBatchNumber(event.target.value)}
                    placeholder="e.g. BATCH-001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiry-date">Expiry date</Label>
                  <Input
                    id="expiry-date"
                    type="date"
                    value={expiryDate}
                    onChange={(event) => setExpiryDate(event.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
            </>
          )}

          {error && (
            <p className="text-sm font-medium text-destructive">{error}</p>
          )}

          <SheetFooter className="px-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={addStock.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={addStock.isPending}>
              {addStock.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Confirm & Add Stock"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
