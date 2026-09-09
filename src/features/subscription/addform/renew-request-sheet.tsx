"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { platformBilling } from "@/lib/platform-billing";

import { useRequestSubscriptionRenewal } from "../hooks/use-subscription";
import { formatDateOnly } from "../lib/entitlement";
import type { TenantSubscription } from "../types";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current?: TenantSubscription | null;
};

export function RenewRequestSheet({ open, onOpenChange, current }: Props) {
  const requestRenewal = useRequestSubscriptionRenewal();
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    setNotes("");
    setError("");
    setDone(false);
  }, [open]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    try {
      await requestRenewal.mutateAsync({
        notes: notes.trim() || undefined,
      });
      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not send the renewal request."
      );
    }
  }

  const renewalAmount =
    current?.amount != null ? money.format(current.amount) : "—";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Request licence renewal</SheetTitle>
          <SheetDescription>
            Notify {platformBilling.providerName} that your company has paid or
            wants to renew. Accounts will extend your expiry after verification.
          </SheetDescription>
        </SheetHeader>

        {done ? (
          <div className="space-y-3 px-4">
            <p className="text-sm text-foreground">
              Request sent. {platformBilling.providerName} will confirm payment
              and update your licence expiry.
            </p>
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        ) : (
          <>
            <div className="space-y-3 px-4 text-sm">
              <div className="rounded-xl border border-border bg-muted/40 p-3">
                <p>
                  <span className="text-muted-foreground">Package · </span>
                  {current?.plan_name || "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">Renewal fee · </span>
                  <span className="font-semibold">{renewalAmount}</span>
                  {current?.billing_cycle
                    ? ` / ${current.billing_cycle}`
                    : ""}
                </p>
                <p>
                  <span className="text-muted-foreground">Current expiry · </span>
                  {formatDateOnly(current?.expires_on)}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Pay {platformBilling.upi} or {platformBilling.email} first, then
                paste the UTR / UPI reference below.
              </p>
            </div>

            <form
              id="renew-request-form"
              onSubmit={handleSubmit}
              className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
            >
              <div className="space-y-2">
                <Label htmlFor="renew-notes">Payment reference</Label>
                <Textarea
                  id="renew-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="UTR, UPI ref, date paid, or message to billing"
                />
              </div>

              {error ? (
                <p className="text-sm font-medium text-destructive">{error}</p>
              ) : null}
            </form>

            <SheetFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="renew-request-form"
                disabled={requestRenewal.isPending}
                className="gap-2"
              >
                {requestRenewal.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Send to {platformBilling.providerName}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
