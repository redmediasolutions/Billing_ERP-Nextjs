"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

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
import { ApiError } from "@/lib/api";

import {
  useDeletePayment,
  useInvoice,
  useRecordPayment,
} from "../hooks/use-invoices";
import {
  collectionLabel,
  collectionStatus,
  invoiceBalance,
  invoicePaid,
  invoicePayable,
  roundMoney,
} from "../lib/invoice-payment";
import type { Invoice, PaymentMethod } from "../types";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "upi", label: "UPI" },
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank transfer" },
  { value: "card", label: "Card" },
  { value: "cheque", label: "Cheque" },
  { value: "other", label: "Other" },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function RecordPaymentSheet({
  invoice,
  open,
  onOpenChange,
}: {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const recordPayment = useRecordPayment();
  const deletePayment = useDeletePayment();
  const detail = useInvoice(open && invoice ? invoice.id : 0);
  const current = detail.data ?? invoice;

  const [amount, setAmount] = useState("");
  const [paidOn, setPaidOn] = useState(today());
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [pendingRemove, setPendingRemove] = useState<number | null>(null);

  const payable = current ? invoicePayable(current) : 0;
  const received = current ? invoicePaid(current) : 0;
  const balance = current ? invoiceBalance(current) : 0;
  const payments = current?.payments ?? [];

  useEffect(() => {
    if (!open || !current) return;
    setAmount(balance > 0 ? String(balance) : "");
    setPaidOn(today());
    setMethod("upi");
    setReference("");
    setNotes("");
    setError("");
  }, [open, current?.id, balance]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!current) return;

    const value = roundMoney(Number(amount));
    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter the amount received.");
      return;
    }
    if (value - balance > 0.009) {
      setError(`This invoice only has ${money.format(balance)} left to collect.`);
      return;
    }

    try {
      setError("");
      await recordPayment.mutateAsync({
        id: current.id,
        input: {
          amount: value,
          paid_on: paidOn,
          method,
          reference: reference.trim(),
          notes: notes.trim(),
        },
      });
      setAmount("");
      setReference("");
      setNotes("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not record this payment.");
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <ResizableSheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Record payment</SheetTitle>
          <SheetDescription>
            {current
              ? `${current.invoice_number} · ${collectionLabel(collectionStatus(current))}`
              : "Collect against a finalized invoice."}
          </SheetDescription>
        </SheetHeader>

        {current && (
          <form onSubmit={(event) => void onSubmit(event)} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 pb-4">
              <div className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-muted/40 p-3 text-sm">
                <figure>
                  <figcaption className="text-xs text-muted-foreground">Invoice</figcaption>
                  <p className="font-semibold tabular-nums">{money.format(payable)}</p>
                </figure>
                <figure>
                  <figcaption className="text-xs text-muted-foreground">Received</figcaption>
                  <p className="font-semibold tabular-nums">{money.format(received)}</p>
                </figure>
                <figure>
                  <figcaption className="text-xs text-muted-foreground">Balance</figcaption>
                  <p className="font-semibold tabular-nums">{money.format(balance)}</p>
                </figure>
              </div>

              {balance <= 0.009 ? (
                <p className="text-sm text-muted-foreground">
                  This invoice is paid in full. You can still remove a receipt below if it was entered by mistake.
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="payment-amount">Amount received</Label>
                    <Input
                      id="payment-amount"
                      inputMode="decimal"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="payment-date">Paid on</Label>
                      <Input
                        id="payment-date"
                        type="date"
                        value={paidOn}
                        onChange={(event) => setPaidOn(event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Method</Label>
                      <Select
                        value={method}
                        onValueChange={(value) => setMethod(value as PaymentMethod)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {METHODS.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment-reference">Reference</Label>
                    <Input
                      id="payment-reference"
                      value={reference}
                      onChange={(event) => setReference(event.target.value)}
                      placeholder="UPI ref, cheque no., transfer id"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment-notes">Note</Label>
                    <Textarea
                      id="payment-notes"
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      rows={2}
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium">Receipts</p>
                {detail.isLoading && payments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Loading receipts…</p>
                ) : payments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nothing collected yet.</p>
                ) : (
                  <ul className="divide-y divide-border rounded-xl border border-border">
                    {payments.map((payment) => (
                      <li key={payment.id} className="flex items-start justify-between gap-3 px-3 py-2 text-sm">
                        <div>
                          <p className="font-medium tabular-nums">{money.format(payment.amount)}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(payment.paid_on).toLocaleDateString("en-IN")}
                            {" · "}
                            {METHODS.find((item) => item.value === payment.method)?.label || payment.method}
                            {payment.reference ? ` · ${payment.reference}` : ""}
                          </p>
                        </div>
                        {pendingRemove === payment.id ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={deletePayment.isPending}
                            onClick={() =>
                              void deletePayment
                                .mutateAsync({
                                  invoiceId: current.id,
                                  paymentId: payment.id,
                                })
                                .then(() => setPendingRemove(null))
                            }
                          >
                            Confirm
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setPendingRemove(payment.id)}
                          >
                            Remove
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              {balance > 0.009 && (
                <Button type="submit" disabled={recordPayment.isPending}>
                  {recordPayment.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save receipt
                </Button>
              )}
            </SheetFooter>
          </form>
        )}
      </ResizableSheetContent>
    </Sheet>
  );
}
