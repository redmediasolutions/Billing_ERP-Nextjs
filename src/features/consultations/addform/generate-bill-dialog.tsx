"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, ReceiptText } from "lucide-react";

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
import { useClinicServices } from "@/features/clinic-services/hooks/use-clinic-services";
import { useMedicines } from "@/features/medicines/hooks/use-medicines";
import { errorMessage, money } from "@/features/clinic/lib/clinic-format";

import type { ConsultationDetail, GenerateBillInput } from "../types";

/** Preview of what will be billed + optional dispensing of prescribed medicines. */
export function GenerateBillDialog({
  open,
  detail,
  onClose,
  onConfirm,
}: {
  open: boolean;
  detail: ConsultationDetail | null;
  onClose: () => void;
  onConfirm: (input: GenerateBillInput) => Promise<void>;
}) {
  const { data: services = [] } = useClinicServices();
  const { data: medicines = [] } = useMedicines();
  const [qty, setQty] = useState<Record<number, string>>({});
  const [discount, setDiscount] = useState("0");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setQty({});
    setDiscount("0");
    setError("");
  }, [open]);

  const consultationService = services.find((s) => /consultation/i.test(s.name));
  const fee = detail?.consultation.consultation_fee || 0;
  const consultLine = consultationService
    ? { name: consultationService.name, amount: fee > 0 ? fee : consultationService.cost }
    : fee > 0
      ? { name: "Consultation fee", amount: fee }
      : null;

  const dispensable = useMemo(
    () =>
      (detail?.prescriptions || [])
        .filter((p) => p.medicine_id)
        .map((p) => ({ p, medicine: medicines.find((m) => m.id === p.medicine_id) || null })),
    [detail, medicines]
  );

  const medsTotal = dispensable.reduce((s, { p, medicine }) => {
    const q = Number(qty[p.id] || 0);
    return s + (medicine ? q * medicine.selling_price : 0);
  }, 0);
  const proceduresTotal = (detail?.procedures || []).reduce((s, p) => s + p.quantity * p.price, 0);
  const total = Math.max((consultLine?.amount || 0) + proceduresTotal + medsTotal - Number(discount || 0), 0);

  async function confirm() {
    try {
      setSaving(true);
      setError("");
      const extra_lines = dispensable
        .filter(({ p }) => Number(qty[p.id] || 0) > 0)
        .map(({ p }) => ({ item_id: p.medicine_id as number, quantity: Number(qty[p.id]) }));
      await onConfirm({ discount: Number(discount || 0), extra_lines });
    } catch (err) {
      setError(errorMessage(err, "Unable to generate bill."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Generate bill</DialogTitle>
          <DialogDescription>
            Creates an invoice for {detail?.consultation.patient_name}. Payments, printing and
            edits are then done from Invoices.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="divide-y rounded-lg border border-border divide-border">
            {consultLine ? (
              <Line name={consultLine.name} amount={consultLine.amount} />
            ) : (
              <p className="p-3 text-xs text-amber-700 dark:text-amber-400">
                No consultation fee: set a fee on this consultation or add a service named
                “Consultation”.
              </p>
            )}
            {(detail?.procedures || []).map((p) => (
              <Line
                key={p.id}
                name={`${p.procedure_name || "Procedure"}${p.quantity !== 1 ? ` × ${p.quantity}` : ""}`}
                amount={p.quantity * p.price}
              />
            ))}
          </div>

          {dispensable.length ? (
            <div className="space-y-2">
              <Label>Dispense prescribed medicines (optional)</Label>
              <div className="space-y-2">
                {dispensable.map(({ p, medicine }) => (
                  <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg border p-2 border-border">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{p.medicine_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {medicine
                          ? `${medicine.total_stock} in stock · ${money.format(medicine.selling_price)} each`
                          : "Not in medicines list"}
                      </p>
                    </div>
                    <Input
                      type="number"
                      min={0}
                      max={medicine?.total_stock || 0}
                      disabled={!medicine || medicine.total_stock <= 0}
                      className="h-8 w-20"
                      placeholder="Qty"
                      value={qty[p.id] || ""}
                      onChange={(e) => setQty((prev) => ({ ...prev, [p.id]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Taken from the earliest-expiry batch first.</p>
            </div>
          ) : null}

          <div className="flex items-end justify-between gap-4">
            <div className="w-32 space-y-1.5">
              <Label htmlFor="bill_discount">Discount (₹)</Label>
              <Input
                id="bill_discount"
                type="number"
                min={0}
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{money.format(total)}</p>
            </div>
          </div>
          {error ? <p className="font-medium text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => void confirm()} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ReceiptText className="h-4 w-4" />}
            Create invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Line({ name, amount }: { name: string; amount: number }) {
  return (
    <div className="flex items-center justify-between p-3">
      <span>{name}</span>
      <span className="font-medium">{money.format(amount)}</span>
    </div>
  );
}
