"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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
import { CustomerPickerField } from "@/features/customers/components/customer-picker-field";
import { customerDisplayName } from "@/features/customers/customer-display";
import {
  useCreateCustomer,
} from "@/features/customers/hooks/use-customers";
import { useInvoices } from "@/features/invoices/hooks/use-invoices";

import { addBillingPeriod } from "../lib/membership-utils";
import type {
  MembershipEnrollment,
  MembershipEnrollmentInput,
  MembershipPlan,
  MembershipStatus,
} from "../types";
import { MEMBERSHIP_STATUSES } from "../types";

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

const emptyForm = (plan?: MembershipPlan | null): MembershipEnrollmentInput => {
  const start = todayDate();
  const end = plan
    ? addBillingPeriod(start, plan.billing_cycle, plan.duration_days)
    : start;
  return {
    customer_ref: null,
    customer_name: "",
    phone: "",
    email: "",
    plan_ref: plan?.id ?? 0,
    status: "active",
    starts_at: start,
    ends_at: end,
    next_billing_at: end,
    auto_renew: plan?.auto_renew_default ?? true,
    entry_invoice_ref: null,
    notes: "",
  };
};

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm";

export function EnrollmentFormSheet({
  open,
  enrollment,
  plans,
  presetPlanId,
  onClose,
  onSave,
}: {
  open: boolean;
  enrollment: MembershipEnrollment | null;
  plans: MembershipPlan[];
  presetPlanId?: number;
  onClose: () => void;
  onSave: (input: MembershipEnrollmentInput) => Promise<void>;
}) {
  const createCustomer = useCreateCustomer();
  const { data: invoices = [] } = useInvoices();

  const [form, setForm] = useState<MembershipEnrollmentInput>(emptyForm());
  const [saveAsCustomer, setSaveAsCustomer] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const activePlans = useMemo(
    () => plans.filter((p) => p.is_active),
    [plans]
  );

  useEffect(() => {
    if (!open) return;
    if (enrollment) {
      setForm({
        customer_ref: enrollment.customer_ref,
        customer_name:
          enrollment.display_customer_name || enrollment.customer_name || "",
        phone: enrollment.display_phone || enrollment.phone || "",
        email: enrollment.email || "",
        plan_ref: enrollment.plan_ref,
        status: enrollment.status === "expired" ? "active" : enrollment.status,
        starts_at: enrollment.starts_at.slice(0, 10),
        ends_at: enrollment.ends_at.slice(0, 10),
        next_billing_at: enrollment.next_billing_at || enrollment.ends_at,
        auto_renew: enrollment.auto_renew,
        entry_invoice_ref: enrollment.entry_invoice_ref,
        notes: enrollment.notes || "",
      });
    } else {
      const plan =
        activePlans.find((p) => p.id === presetPlanId) || activePlans[0];
      setForm(emptyForm(plan));
    }
    setSaveAsCustomer(false);
    setError("");
  }, [open, enrollment, presetPlanId, activePlans]);

  function applyPlan(planId: number) {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;
    const start = form.starts_at || todayDate();
    const end = addBillingPeriod(start, plan.billing_cycle, plan.duration_days);
    setForm((f) => ({
      ...f,
      plan_ref: planId,
      ends_at: end,
      next_billing_at: end,
      auto_renew: plan.auto_renew_default,
    }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.plan_ref) {
      setError("Select a plan.");
      return;
    }
    if (!form.starts_at || !form.ends_at) {
      setError("Start and end dates are required.");
      return;
    }

    try {
      setSaving(true);
      let customerRef = form.customer_ref;
      if (saveAsCustomer && !customerRef && form.customer_name.trim()) {
        const created = await createCustomer.mutateAsync({
          customer_name: form.customer_name.trim() || form.phone.trim(),
          customer_title: "",
          customer_display_name: form.customer_name.trim() || form.phone.trim(),
          customer_phone: form.phone.trim(),
          customer_email: form.email.trim(),
          customer_gst: "",
          customer_business_name: "",
          customer_billing_address: "",
          customer_shipping_address: "",
          customer_gst_state: "",
          customer_gst_state_code: "",
        });
        customerRef = created.id;
      }

      await onSave({
        ...form,
        customer_ref: customerRef,
        customer_name: form.customer_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        notes: form.notes.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save member.");
    } finally {
      setSaving(false);
    }
  }

  const finalizedInvoices = invoices.filter((inv) => !inv.is_draft);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <ResizableSheetContent
        defaultWidth={560}
        minWidth={400}
        maxWidth={960}
        storageKey="memberships-enrollment-sheet-width"
        className="p-0"
      >
        <SheetHeader className="shrink-0 border-b px-6 py-4 pr-14">
          <SheetTitle className="text-lg">
            {enrollment ? "Edit membership" : "Enroll member"}
          </SheetTitle>
          <SheetDescription>
            Ties to an existing customer and plan. You can bill via invoice after
            saving.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <Field label="Plan *">
            <select
              className={selectClassName}
              value={form.plan_ref || ""}
              onChange={(e) => applyPlan(Number(e.target.value))}
            >
              <option value="">Select plan</option>
              {activePlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.plan_name} · ₹{plan.price}
                </option>
              ))}
            </select>
          </Field>

          <CustomerPickerField
            label="Customer"
            value={form.customer_ref ? String(form.customer_ref) : ""}
            onChange={(id) => {
              if (!id) {
                setForm((f) => ({ ...f, customer_ref: null }));
              }
            }}
            onCustomerSelect={(customer) => {
              if (!customer) {
                setForm((f) => ({ ...f, customer_ref: null }));
                return;
              }
              setForm((f) => ({
                ...f,
                customer_ref: customer.id,
                customer_name:
                  customerDisplayName(customer) || customer.customer_name,
                phone: customer.customer_phone || f.phone,
                email: customer.customer_email || f.email,
              }));
            }}
            initialCustomer={
              enrollment?.customer_ref
                ? {
                    id: enrollment.customer_ref,
                    customer_name: enrollment.customer_name || "",
                    customer_display_name: enrollment.display_customer_name,
                    customer_phone: enrollment.phone,
                    customer_email: enrollment.email,
                  }
                : null
            }
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <Input
                value={form.customer_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, customer_name: e.target.value }))
                }
              />
            </Field>
            <Field label="Phone">
              <Input
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
            </Field>
          </div>

          {!form.customer_ref && form.customer_name.trim() && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={saveAsCustomer}
                onChange={(e) => setSaveAsCustomer(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              Save as new customer
            </label>
          )}

          <Field label="Status">
            <select
              className={selectClassName}
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  status: e.target.value as MembershipStatus,
                }))
              }
            >
              {MEMBERSHIP_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Starts">
              <Input
                type="date"
                value={form.starts_at}
                onChange={(e) => {
                  const start = e.target.value;
                  const plan = plans.find((p) => p.id === form.plan_ref);
                  const end = plan
                    ? addBillingPeriod(
                        start,
                        plan.billing_cycle,
                        plan.duration_days
                      )
                    : form.ends_at;
                  setForm((f) => ({
                    ...f,
                    starts_at: start,
                    ends_at: end,
                    next_billing_at: end,
                  }));
                }}
              />
            </Field>
            <Field label="Ends">
              <Input
                type="date"
                value={form.ends_at}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    ends_at: e.target.value,
                    next_billing_at: e.target.value,
                  }))
                }
              />
            </Field>
          </div>

          <Field label="Link entry invoice (optional)">
            <select
              className={selectClassName}
              value={form.entry_invoice_ref ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  entry_invoice_ref: e.target.value
                    ? Number(e.target.value)
                    : null,
                }))
              }
            >
              <option value="">None</option>
              {finalizedInvoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoice_number}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Notes">
            <Textarea
              rows={2}
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
            />
          </Field>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.auto_renew}
              onChange={(e) =>
                setForm((f) => ({ ...f, auto_renew: e.target.checked }))
              }
              className="h-4 w-4 accent-primary"
            />
            Auto-renew (syncs with Renewals module)
          </label>

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
              {enrollment ? "Save changes" : "Enroll member"}
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
