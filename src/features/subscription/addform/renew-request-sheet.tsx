"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

import { useRequestSubscriptionRenewal } from "../hooks/use-subscription";
import { SUBSCRIPTION_PLANS } from "../lib/plans";
import type {
  BillingCycle,
  PlanCode,
  TenantSubscription,
} from "../types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current?: TenantSubscription | null;
};

export function RenewRequestSheet({ open, onOpenChange, current }: Props) {
  const requestRenewal = useRequestSubscriptionRenewal();
  const [planCode, setPlanCode] = useState<PlanCode>("professional");
  const [cycle, setCycle] = useState<BillingCycle>("yearly");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    const nextPlan = (current?.plan_code as PlanCode) || "professional";
    setPlanCode(
      SUBSCRIPTION_PLANS.some((plan) => plan.code === nextPlan)
        ? nextPlan
        : "professional"
    );
    setCycle(current?.billing_cycle || "yearly");
    setNotes("");
    setError("");
    setDone(false);
  }, [open, current]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    try {
      await requestRenewal.mutateAsync({
        plan_code: planCode,
        billing_cycle: cycle,
        notes: notes.trim() || undefined,
      });
      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not send the renewal request. Confirm POST /subscription/renew-request is live."
      );
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Renew subscription</SheetTitle>
          <SheetDescription>
            Raise a renewal with 108medz billing. After payment is confirmed,
            the licensed plan and expiry are updated on this company.
          </SheetDescription>
        </SheetHeader>

        {done ? (
          <div className="space-y-3 px-4">
            <p className="text-sm text-foreground">
              Renewal request sent. Keep the UPI or bank transfer reference
              handy — accounts will extend your licence once the payment posts.
            </p>
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        ) : (
          <>
            <form
              id="renew-request-form"
              onSubmit={handleSubmit}
              className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
            >
              <div className="space-y-2">
                <Label>Package</Label>
                <Select
                  value={planCode}
                  onValueChange={(value) => setPlanCode(value as PlanCode)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBSCRIPTION_PLANS.map((plan) => (
                      <SelectItem key={plan.code} value={plan.code}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Billing cycle</Label>
                <Select
                  value={cycle}
                  onValueChange={(value) => setCycle(value as BillingCycle)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="renew-notes">Payment note</Label>
                <Textarea
                  id="renew-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="UTR, UPI reference, or preferred payment date"
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
                Send request
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
