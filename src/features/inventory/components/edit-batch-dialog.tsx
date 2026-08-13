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

import { useUpdateBatch } from "../hooks/use-inventory";
import type { ItemBatch } from "../types/inventory.types";

interface EditBatchDialogProps {
  itemId: number;
  batch: ItemBatch | null;
  open: boolean;
  onClose: () => void;
}

export function EditBatchDialog({
  itemId,
  batch,
  open,
  onClose,
}: EditBatchDialogProps) {
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [error, setError] = useState("");

  const updateBatch = useUpdateBatch(itemId);

  useEffect(() => {
    if (!batch) return;

    setBatchNumber(batch.batch_number ?? "");
    setExpiryDate(
      batch.expiry_date
        ? batch.expiry_date.split("T")[0]
        : ""
    );
    setError("");
  }, [batch]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!batch) return;

    const batchId = batch.batch_id ?? batch.id;

    if (!batchId) {
      setError("Invalid batch record.");
      return;
    }

    if (!batchNumber.trim() || !expiryDate) {
      setError("Batch number and expiry date are required.");
      return;
    }

    try {
      await updateBatch.mutateAsync({
        batchId,
        input: {
          batch_number: batchNumber.trim(),
          expiry_date: expiryDate,
        },
      });
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update batch."
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Batch Info</DialogTitle>
          <DialogDescription>
            Only edit batch numbers or expiry dates to fix typos. Stock
            adjustments must be done via the ledger.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-batch-number">Batch number</Label>
            <Input
              id="edit-batch-number"
              value={batchNumber}
              onChange={(event) => setBatchNumber(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-expiry-date">Expiry date</Label>
            <Input
              id="edit-expiry-date"
              type="date"
              value={expiryDate}
              onChange={(event) => setExpiryDate(event.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm font-medium text-destructive">{error}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateBatch.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateBatch.isPending}>
              {updateBatch.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
