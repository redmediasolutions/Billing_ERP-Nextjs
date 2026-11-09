"use client";

import { useState } from "react";
import { Edit3, Loader2, Minus, PackagePlus, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import {
  ResizableSheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/resizable-sheet-content";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  errorMessage,
  formatExpiry,
  money,
  todayInput,
  toneClass,
} from "@/features/clinic/lib/clinic-format";

import { BatchFormDialog, type BatchFormValues } from "../addform/batch-form-dialog";
import { useAddBatch, useAdjustStock, useMedicine, useUpdateBatch } from "../hooks/use-medicines";
import type { MedicineBatch } from "../types";

function expiryTone(batch: MedicineBatch) {
  if (batch.no_expiry || !batch.expiry_date) return "muted" as const;
  const days = (new Date(batch.expiry_date).getTime() - new Date(todayInput()).getTime()) / 86400000;
  if (days < 0) return "red" as const;
  if (days <= 60) return "amber" as const;
  return "green" as const;
}

export function MedicineBatchesSheet({
  medicineId,
  onClose,
}: {
  medicineId: number | null;
  onClose: () => void;
}) {
  const { data: medicine, isLoading } = useMedicine(medicineId);
  const addBatch = useAddBatch();
  const updateBatch = useUpdateBatch();
  const adjust = useAdjustStock();

  const [batchForm, setBatchForm] = useState<{ open: boolean; batch: MedicineBatch | null }>({
    open: false,
    batch: null,
  });
  const [adjustQty, setAdjustQty] = useState<Record<number, string>>({});
  const [error, setError] = useState("");

  async function saveBatch(values: BatchFormValues) {
    if (!medicine) return;
    if (batchForm.batch) {
      await updateBatch.mutateAsync({ id: batchForm.batch.id, input: values });
    } else {
      await addBatch.mutateAsync({ ...values, medicine_id: medicine.id });
    }
    setBatchForm({ open: false, batch: null });
  }

  async function quickAdjust(batch: MedicineBatch, type: "add" | "deduct") {
    const qty = Number(adjustQty[batch.id] || 0);
    if (!qty || qty <= 0) return;
    try {
      setError("");
      await adjust.mutateAsync({ id: batch.id, type, quantity: qty });
      setAdjustQty((prev) => ({ ...prev, [batch.id]: "" }));
    } catch (err) {
      setError(errorMessage(err, "Unable to adjust stock."));
    }
  }

  return (
    <Sheet open={Boolean(medicineId)} onOpenChange={(v) => !v && onClose()}>
      <ResizableSheetContent
        defaultWidth={720}
        minWidth={460}
        maxWidth={1100}
        storageKey="medicine-batches-width"
        className="flex w-full flex-col gap-0 p-0"
      >
        <SheetHeader className="border-b p-6 pb-4 border-border">
          <SheetTitle>{medicine?.name || "Medicine"}</SheetTitle>
          <SheetDescription>
            {medicine
              ? `${medicine.total_stock} in stock · ${medicine.batch_count} active batch${medicine.batch_count === 1 ? "" : "es"} · billed earliest-expiry first`
              : "Batches"}
          </SheetDescription>
          <div className="pt-2">
            <Button
              size="sm"
              className="gap-1.5"
              disabled={!medicine}
              onClick={() => setBatchForm({ open: true, batch: null })}
            >
              <PackagePlus className="h-3.5 w-3.5" /> Add stock
            </Button>
          </div>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-6">
          {error ? <p className="mb-3 text-sm font-medium text-destructive">{error}</p> : null}
          {isLoading || !medicine ? (
            <div className="flex h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading batches...
            </div>
          ) : medicine.batches.length === 0 ? (
            <p className="text-sm text-muted-foreground">No batches yet. Use “Add stock”.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Buy / Sell</TableHead>
                  <TableHead className="text-right">Adjust</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicine.batches.map((b) => (
                  <TableRow key={b.id} className={b.quantity <= 0 ? "opacity-60" : ""}>
                    <TableCell className="font-mono text-xs">{b.batch_no}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={toneClass[expiryTone(b)]}>
                        {formatExpiry(b.expiry_date)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{b.quantity}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {money.format(b.purchase_price)} / {money.format(b.selling_price)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Input
                          type="number"
                          min={0}
                          className="h-8 w-16"
                          placeholder="qty"
                          value={adjustQty[b.id] || ""}
                          onChange={(e) => setAdjustQty((prev) => ({ ...prev, [b.id]: e.target.value }))}
                        />
                        <Button
                          size="icon-sm"
                          variant="outline"
                          title="Add to stock"
                          disabled={adjust.isPending}
                          onClick={() => void quickAdjust(b, "add")}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="outline"
                          title="Remove (damaged / expired)"
                          disabled={adjust.isPending}
                          onClick={() => void quickAdjust(b, "deduct")}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          title="Edit batch"
                          onClick={() => setBatchForm({ open: true, batch: b })}
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </ResizableSheetContent>

      <BatchFormDialog
        open={batchForm.open}
        batch={batchForm.batch}
        medicineName={medicine?.name || ""}
        defaultPrice={medicine?.default_price || 0}
        onClose={() => setBatchForm({ open: false, batch: null })}
        onSave={saveBatch}
      />
    </Sheet>
  );
}
