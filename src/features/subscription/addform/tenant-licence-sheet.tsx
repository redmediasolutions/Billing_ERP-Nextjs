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
import { platformBilling } from "@/lib/platform-billing";

import { useAssignPlatformLicence } from "../hooks/use-platform-licences";
import {
  addMonthsIso,
  extendOneBillingPeriod,
  toIsoDate,
} from "../lib/entitlement";
import { planPrice, SUBSCRIPTION_PLANS } from "../lib/plans";
import type {
  BillingCycle,
  PlanCode,
  PlatformTenantLicence,
} from "../types";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenants: PlatformTenantLicence[];
  editing?: PlatformTenantLicence | null;
};

export function TenantLicenceSheet({
  open,
  onOpenChange,
  tenants,
  editing,
}: Props) {
  const assign = useAssignPlatformLicence();
  const [tenantId, setTenantId] = useState("");
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

  const catalogueHint = useMemo(() => {
    if (!selectedPlan) return "";
    const price = planPrice(selectedPlan, cycle);
    return price != null ? `Catalogue reference: ${money.format(price)}` : "";
  }, [selectedPlan, cycle]);

  useEffect(() => {
    if (!open) return;
    const today = toIsoDate(new Date());
    const row = editing;
    const nextPlan = (row?.plan_code as PlanCode) || "professional";
    const nextCycle = row?.billing_cycle || "yearly";

    setTenantId(row ? String(row.tenant_id) : "");
    setPlanCode(
      SUBSCRIPTION_PLANS.some((plan) => plan.code === nextPlan)
        ? nextPlan
        : "professional"
    );
    setCycle(nextCycle);
    setStartedOn(row?.started_on?.slice(0, 10) || today);
    setExpiresOn(
      row?.expires_on?.slice(0, 10) ||
        addMonthsIso(today, nextCycle === "yearly" ? 12 : 1)
    );
    setStatus(
      row?.subscription_status === "trial" || row?.subscription_status === "cancelled"
        ? (row.subscription_status as "trial" | "cancelled")
        : "active"
    );
    setAmount(row?.amount != null ? String(row.amount) : "");
    setNotes("");
    setError("");
  }, [open, editing]);

  function applyCycle(next: BillingCycle) {
    setCycle(next);
    if (!editing) {
      setExpiresOn(addMonthsIso(startedOn, next === "yearly" ? 12 : 1));
      const plan = SUBSCRIPTION_PLANS.find((p) => p.code === planCode);
      const price = plan ? planPrice(plan, next) : null;
      if (price != null && !amount) setAmount(String(price));
    }
  }

  function applyPlan(next: PlanCode) {
    setPlanCode(next);
    if (!editing) {
      const plan = SUBSCRIPTION_PLANS.find((p) => p.code === next);
      const price = plan ? planPrice(plan, cycle) : null;
      if (price != null) setAmount(String(price));
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    const id = Number(tenantId);
    const licenceAmount = Number(amount);

    if (!id) {
      setError("Choose a tenant company.");
      return;
    }
    if (!expiresOn) {
      setError("Set the licence expiry date.");
      return;
    }
    if (!Number.isFinite(licenceAmount) || licenceAmount <= 0) {
      setError("Enter the custom licence fee for this company.");
      return;
    }

    try {
      await assign.mutateAsync({
        tenant_id: id,
        plan_code: planCode,
        billing_cycle: cycle,
        started_on: startedOn,
        expires_on: expiresOn,
        status,
        amount: licenceAmount,
        notes: notes.trim() || undefined,
      });
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not save licence. Confirm PUT /platform/subscriptions/:id is live."
      );
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {editing ? "Update tenant licence" : "Assign tenant licence"}
          </SheetTitle>
          <SheetDescription>
            Set the package, custom price, and expiry for each company you sell
            ERP to. Tenants only see their licence — they cannot change it.
          </SheetDescription>
        </SheetHeader>

        <form
          id="tenant-licence-form"
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
        >
          <div className="space-y-2">
            <Label>Tenant company</Label>
            {editing ? (
              <p className="rounded-lg border border-border px-3 py-2 text-sm">
                {editing.business_name}
                <span className="text-muted-foreground">
                  {" "}
                  · #{editing.tenant_id}
                </span>
              </p>
            ) : tenants.length > 0 ? (
              <Select value={tenantId} onValueChange={setTenantId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((tenant) => (
                    <SelectItem
                      key={tenant.tenant_id}
                      value={String(tenant.tenant_id)}
                    >
                      {tenant.business_name}
                      {tenant.reference ? ` · ${tenant.reference}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <>
                <Input
                  type="number"
                  min={1}
                  value={tenantId}
                  onChange={(event) => setTenantId(event.target.value)}
                  placeholder="Tenant ID (e.g. 7)"
                />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Company list did not load — enter tenant ID manually. Fix{" "}
                  <code className="text-[11px]">GET /platform/subscriptions</code>{" "}
                  on the API (see server logs).
                </p>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label>Package</Label>
            <Select
              value={planCode}
              onValueChange={(value) => applyPlan(value as PlanCode)}
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
            {selectedPlan ? (
              <p className="text-xs text-muted-foreground">
                {selectedPlan.tagline}
                {catalogueHint ? ` · ${catalogueHint}` : ""}
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
              <Label htmlFor="licence-started">Starts on</Label>
              <Input
                id="licence-started"
                type="date"
                value={startedOn}
                onChange={(event) => setStartedOn(event.target.value)}
              />
            </div>
          <div className="space-y-2">
            <Label htmlFor="licence-expires">Expires on</Label>
              <Input
                id="licence-expires"
                type="date"
                value={expiresOn}
                onChange={(event) => setExpiresOn(event.target.value)}
                required
              />
            </div>
          </div>

          {editing ? (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setExpiresOn(extendOneBillingPeriod(expiresOn, cycle));
                if (status === "cancelled") setStatus("active");
              }}
            >
              Extend one {cycle === "yearly" ? "year" : "month"} after payment
            </Button>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="licence-amount">Licence fee for this tenant (INR)</Label>
            <Input
              id="licence-amount"
              type="number"
              min={1}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Custom price — can differ from catalogue"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="licence-notes">Internal note</Label>
            <Textarea
              id="licence-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Payment ref, discount reason, onboarding note"
            />
          </div>

          {error ? (
            <p className="text-sm font-medium text-destructive">{error}</p>
          ) : null}
        </form>

        <SheetFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="tenant-licence-form"
            disabled={assign.isPending}
            className="gap-2"
          >
            {assign.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save licence
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
