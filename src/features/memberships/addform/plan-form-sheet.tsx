"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet } from "@/components/ui/sheet";
import {
  ResizableSheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/resizable-sheet-content";
import { Textarea } from "@/components/ui/textarea";
import { useItems } from "@/features/items/hooks/use-items";

import type {
  MembershipBillingCycle,
  MembershipPlan,
  MembershipPlanInput,
  MembershipVisitModel,
} from "../types";
import {
  MEMBERSHIP_BILLING_CYCLES,
  VISIT_MODELS,
} from "../types";

const empty: MembershipPlanInput = {
  plan_name: "",
  description: "",
  billing_cycle: "monthly",
  duration_days: null,
  price: 0,
  item_ref: null,
  visit_model: "unlimited",
  visits_per_period: null,
  grace_days: 3,
  auto_renew_default: true,
  is_active: true,
};

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm";

export function PlanFormSheet({
  open,
  plan,
  onClose,
  onSave,
}: {
  open: boolean;
  plan: MembershipPlan | null;
  onClose: () => void;
  onSave: (input: MembershipPlanInput) => Promise<void>;
}) {
  const { items } = useItems();
  const [form, setForm] = useState<MembershipPlanInput>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (plan) {
      setForm({
        plan_name: plan.plan_name,
        description: plan.description || "",
        billing_cycle: plan.billing_cycle,
        duration_days: plan.duration_days,
        price: plan.price,
        item_ref: plan.item_ref,
        visit_model: plan.visit_model,
        visits_per_period: plan.visits_per_period,
        grace_days: plan.grace_days,
        auto_renew_default: plan.auto_renew_default,
        is_active: plan.is_active,
      });
    } else {
      setForm(empty);
    }
    setError("");
  }, [open, plan]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.plan_name.trim()) {
      setError("Plan name is required.");
      return;
    }
    try {
      setSaving(true);
      await onSave({
        ...form,
        plan_name: form.plan_name.trim(),
        description: form.description.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save plan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <ResizableSheetContent
        defaultWidth={560}
        minWidth={400}
        maxWidth={960}
        storageKey="memberships-plan-sheet-width"
        className="p-0"
      >
        <SheetHeader className="shrink-0 border-b px-6 py-4 pr-14">
          <SheetTitle className="text-lg">
            {plan ? "Edit plan" : "New membership plan"}
          </SheetTitle>
          <SheetDescription>
            Link a catalog item for invoicing. Set visit rules for gyms, classes,
            or session packs.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <Field label="Plan name *">
            <Input
              value={form.plan_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, plan_name: e.target.value }))
              }
            />
          </Field>

          <Field label="Description">
            <Textarea
              rows={2}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Billing cycle">
              <select
                className={selectClassName}
                value={form.billing_cycle}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    billing_cycle: e.target.value as MembershipBillingCycle,
                  }))
                }
              >
                {MEMBERSHIP_BILLING_CYCLES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>

            {form.billing_cycle === "custom" && (
              <Field label="Duration (days)">
                <Input
                  type="number"
                  min={1}
                  value={form.duration_days ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      duration_days: Number(e.target.value) || null,
                    }))
                  }
                />
              </Field>
            )}

            <Field label="Price (₹)">
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: Number(e.target.value) }))
                }
              />
            </Field>

            <Field label="Catalog item (for invoices)">
              <select
                className={selectClassName}
                value={form.item_ref ?? ""}
                onChange={(e) => {
                  const id = e.target.value ? Number(e.target.value) : null;
                  const item = items.find((row) => row.id === id);
                  setForm((f) => ({
                    ...f,
                    item_ref: id,
                    price: item ? item.item_cost : f.price,
                  }));
                }}
              >
                <option value="">None</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.item_name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Visit model">
            <select
              className={selectClassName}
              value={form.visit_model}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  visit_model: e.target.value as MembershipVisitModel,
                }))
              }
            >
              {VISIT_MODELS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </Field>

          {form.visit_model !== "unlimited" && (
            <Field label="Visits allowed">
              <Input
                type="number"
                min={1}
                value={form.visits_per_period ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    visits_per_period: Number(e.target.value) || null,
                  }))
                }
              />
            </Field>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Grace days after expiry">
              <Input
                type="number"
                min={0}
                value={form.grace_days}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    grace_days: Number(e.target.value) || 0,
                  }))
                }
              />
            </Field>
            <label className="flex items-center gap-2 pt-6 text-sm">
              <input
                type="checkbox"
                checked={form.auto_renew_default}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    auto_renew_default: e.target.checked,
                  }))
                }
                className="h-4 w-4 accent-primary"
              />
              Auto-renew by default
            </label>
          </div>

          </div>

          <SheetFooter className="shrink-0 gap-2 border-t bg-muted/20 px-6 py-4 sm:justify-end">
            {error && (
              <p className="w-full text-sm font-medium text-destructive sm:col-span-2">
                {error}
              </p>
            )}
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save plan
            </Button>
          </SheetFooter>
        </form>
      </ResizableSheetContent>
    </Sheet>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
