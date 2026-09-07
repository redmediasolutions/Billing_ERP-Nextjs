"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

import { useAssignSubscription } from "../hooks/use-subscription";
import { addMonthsIso, toIsoDate } from "../lib/entitlement";
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

export function PlanAssignSheet({ open, onOpenChange, current }: Props) {
  const assign = useAssignSubscription();
  const [planCode, setPlanCode] = useState<PlanCode>("professional");
  const [cycle, setCycle] = useState<BillingCycle>("yearly");
  const [startedOn, setStartedOn] = useState(toIsoDate(new Date()));
  const [expiresOn, setExpiresOn] = useState(
    addMonthsIso(toIsoDate(new Date()), 12)
  );
  const [status, setStatus] = useState<"trial" | "active" | "cancelled">(
    "active"
  );
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const selectedPlan = useMemo(
    () => SUBSCRIPTION_PLANS.find((plan) => plan.code === planCode),
    [planCode]
  );

  useEffect(() => {
    if (!open) return;
    const today = toIsoDate(new Date());
    const nextPlan = (current?.plan_code as PlanCode) || "professional";
    const nextCycle = current?.billing_cycle || "yearly";
    setPlanCode(
      SUBSCRIPTION_PLANS.some((plan) => plan.code === nextPlan)
        ? nextPlan
        : "professional"
    );
    setCycle(nextCycle);
    setStartedOn(current?.started_on?.slice(0, 10) || today);
    setExpiresOn(
      current?.expires_on?.slice(0, 10) ||
        addMonthsIso(today, nextCycle === "yearly" ? 12 : 1)
    );
    setStatus(
      current?.status === "trial" || current?.status === "cancelled"
        ? current.status
        : "active"
    );
    setAmount(current?.amount != null ? String(current.amount) : "");
    setNotes("");
    setError("");
  }, [open, current]);

  function applyCycle(next: BillingCycle) {
    setCycle(next);
    setExpiresOn(addMonthsIso(startedOn, next === "yearly" ? 12 : 1));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!expiresOn) {
      setError("Set the licence expiry date.");
      return;
    }

    try {
      await assign.mutateAsync({
        plan_code: planCode,
        billing_cycle: cycle,
        started_on: startedOn,
        expires_on: expiresOn,
        status,
        amount: amount ? Number(amount) : null,
        notes: notes.trim() || undefined,
      });
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not save the licensed plan. Confirm PUT /subscription is live on the API."
      );
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Licensed plan</SheetTitle>
          <SheetDescription>
            This is the company subscription — the package this tenant has opted
            for. Sales or onboarding should set it after payment is confirmed.
          </SheetDescription>
        </SheetHeader>

        <form
          id="plan-assign-form"
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
                    {plan.recommended ? " · recommended" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPlan ? (
              <p className="text-xs text-muted-foreground">
                {selectedPlan.tagline}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Billing cycle</Label>
              <Select
                value={cycle}
                onValueChange={(value) => applyCycle(value as BillingCycle)}
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
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(value) =>
                  setStatus(value as "trial" | "active" | "cancelled")
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="started_on">Starts on</Label>
              <Input
                id="started_on"
                type="date"
                value={startedOn}
                onChange={(event) => {
                  setStartedOn(event.target.value);
                  setExpiresOn(
                    addMonthsIso(
                      event.target.value,
                      cycle === "yearly" ? 12 : 1
                    )
                  );
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expires_on">Expires on</Label>
              <Input
                id="expires_on"
                type="date"
                value={expiresOn}
                onChange={(event) => setExpiresOn(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Licensed amount (INR)</Label>
            <Input
              id="amount"
              type="number"
              min={0}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Optional"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Internal note</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Payment reference, cheque no, or onboarding remarks"
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
            form="plan-assign-form"
            disabled={assign.isPending}
            className="gap-2"
          >
            {assign.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Save licence
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
