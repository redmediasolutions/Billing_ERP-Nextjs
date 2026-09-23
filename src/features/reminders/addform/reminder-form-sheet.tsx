"use client";

import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
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
import {
  useCreateCustomer,
  useCustomers,
} from "@/features/customers/hooks/use-customers";
import { customerDisplayName } from "@/features/customers/customer-display";
import { useEmployees } from "@/features/employees/hooks/use-employees";
import { useInvoices } from "@/features/invoices/hooks/use-invoices";
import { useItems } from "@/features/items/hooks/use-items";
import { useWarranties } from "@/features/warranty/hooks/use-warranty";
import { useBookings } from "@/features/bookings/hooks/use-bookings";

import type { Reminder, ReminderInput, ReminderRecurrence, ReminderType } from "../types";
import {
  REMINDER_RECURRENCES,
  REMINDER_TYPES,
} from "../types";
import { recurrenceLabel, toDateInput } from "../lib/reminder-utils";

function defaultDueLocal(daysFromNow = 7) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(10, 0, 0, 0);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

const emptyForm: ReminderInput = {
  reminder_type: "service",
  title: "",
  description: "",
  customer_ref: null,
  customer_name: "",
  phone: "",
  email: "",
  item_ref: null,
  invoice_ref: null,
  booking_ref: null,
  warranty_ref: null,
  assigned_to: null,
  due_at: defaultDueLocal(180),
  lead_days: 7,
  recurrence: "semi_annual",
  recurrence_days: 180,
  amount_due: null,
  renewal_label: "",
};

function fromReminder(row: Reminder): ReminderInput {
  return {
    reminder_type: row.reminder_type,
    title: row.title,
    description: row.description || "",
    customer_ref: row.customer_ref,
    customer_name: row.display_customer_name || row.customer_name || "",
    phone: row.display_phone || row.phone || "",
    email: row.email || "",
    item_ref: row.item_ref,
    invoice_ref: row.invoice_ref,
    booking_ref: row.booking_ref,
    warranty_ref: row.warranty_ref,
    assigned_to: row.assigned_to,
    due_at: toDateInput(row.due_at) || defaultDueLocal(),
    lead_days: row.lead_days ?? 7,
    recurrence: row.recurrence,
    recurrence_days: row.recurrence_days,
    amount_due: row.amount_due,
    renewal_label: row.renewal_label || "",
  };
}

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function ReminderFormSheet({
  open,
  reminder,
  preset,
  onClose,
  onSave,
}: {
  open: boolean;
  reminder: Reminder | null;
  preset?: Partial<ReminderInput>;
  onClose: () => void;
  onSave: (input: ReminderInput) => Promise<void>;
}) {
  const { data: customers = [] } = useCustomers();
  const createCustomer = useCreateCustomer();
  const { data: employees = [] } = useEmployees();
  const { data: invoices = [] } = useInvoices();
  const { items } = useItems();
  const { data: warranties = [] } = useWarranties();
  const { data: bookings = [] } = useBookings();

  const [form, setForm] = useState<ReminderInput>(emptyForm);
  const [amountText, setAmountText] = useState("");
  const [customDaysText, setCustomDaysText] = useState("180");
  const [saveAsCustomer, setSaveAsCustomer] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEditing = Boolean(reminder?.id);

  const finalizedInvoices = useMemo(
    () => invoices.filter((inv) => !inv.is_draft),
    [invoices]
  );

  useEffect(() => {
    if (!open) return;

    if (reminder) {
      const next = fromReminder(reminder);
      setForm(next);
      setAmountText(next.amount_due != null ? String(next.amount_due) : "");
      setCustomDaysText(String(next.recurrence_days ?? 180));
      setSaveAsCustomer(false);
      setError("");
      return;
    }

    const next = { ...emptyForm, ...preset };
    if (preset?.due_at) next.due_at = toDateInput(preset.due_at) || next.due_at;
    setForm(next);
    setAmountText(
      next.amount_due != null ? String(next.amount_due) : ""
    );
    setCustomDaysText(String(next.recurrence_days ?? 180));
    setSaveAsCustomer(false);
    setError("");
  }, [open, reminder, preset]);

  function updateField<K extends keyof ReminderInput>(
    field: K,
    value: ReminderInput[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function applyItemDefaults(itemId: number | null) {
    if (!itemId) return;
    const item = items.find((row) => row.id === itemId);
    if (!item) return;

    const interval = item.service_interval_days;
    const next: Partial<ReminderInput> = {
      item_ref: itemId,
    };

    if (!form.title.trim()) {
      next.title = item.service_reminder_title?.trim() || `${item.item_name} service`;
    }

    if (interval && interval > 0) {
      next.recurrence = "custom";
      next.recurrence_days = interval;
      setCustomDaysText(String(interval));
      if (!isEditing) {
        next.due_at = defaultDueLocal(interval);
      }
    }

    setForm((current) => ({ ...current, ...next }));
  }

  function applyInvoice(invoiceId: number | null) {
    if (!invoiceId) return;
    const invoice = finalizedInvoices.find((row) => row.id === invoiceId);
    if (!invoice) return;

    setForm((current) => ({
      ...current,
      invoice_ref: invoiceId,
      customer_ref: invoice.customer_id || current.customer_ref,
      customer_name:
        invoice.customer_display_name ||
        invoice.customer_name ||
        current.customer_name,
      amount_due: invoice.rounded_total,
      reminder_type:
        current.reminder_type === "general" ? "payment" : current.reminder_type,
      title:
        current.title.trim() ||
        `Collect payment · ${invoice.invoice_number}`,
      due_at: invoice.due_date
        ? toDateInput(invoice.due_date)
        : current.due_at,
    }));
    setAmountText(String(invoice.rounded_total));
  }

  function applyTypeDefaults(type: ReminderType) {
    updateField("reminder_type", type);
    if (type === "renewal" && !form.recurrence) {
      updateField("recurrence", "yearly");
    }
    if (type === "payment") {
      updateField("recurrence", "none");
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!form.due_at) {
      setError("Due date is required.");
      return;
    }
    if (form.recurrence === "custom") {
      const days = Number(customDaysText);
      if (!Number.isFinite(days) || days < 1) {
        setError("Custom interval must be at least 1 day.");
        return;
      }
    }

    try {
      setSaving(true);
      setError("");

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

      const amount =
        amountText.trim() === "" ? null : Number(amountText) || null;

      await onSave({
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        customer_ref: customerRef,
        customer_name: form.customer_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        renewal_label: form.renewal_label.trim(),
        amount_due: amount,
        recurrence_days:
          form.recurrence === "custom"
            ? Number(customDaysText) || null
            : null,
        lead_days: Number(form.lead_days) || 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save reminder.");
    } finally {
      setSaving(false);
    }
  }

  const typeHint =
    REMINDER_TYPES.find((item) => item.value === form.reminder_type)?.hint ||
    "";

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <ResizableSheetContent
        defaultWidth={560}
        minWidth={400}
        maxWidth={960}
        storageKey="reminders-sheet-width"
        className="p-0"
      >
        <SheetHeader className="shrink-0 border-b px-6 py-4 pr-14">
          <SheetTitle className="text-lg">
            {isEditing ? "Edit reminder" : "New reminder"}
          </SheetTitle>
          <SheetDescription>
            Set what to follow up, when it is due, and who it is for.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
            <FormSection title="Basics">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Type</Label>
                  <select
                    value={form.reminder_type}
                    onChange={(event) =>
                      applyTypeDefaults(event.target.value as ReminderType)
                    }
                    className={selectClassName}
                  >
                    {REMINDER_TYPES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  {typeHint && (
                    <p className="text-xs text-muted-foreground">{typeHint}</p>
                  )}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Title *</Label>
                  <Input
                    value={form.title}
                    onChange={(event) =>
                      updateField("title", event.target.value)
                    }
                    placeholder="Short label for this follow-up"
                  />
                </div>

                {form.reminder_type === "renewal" && (
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Renewal subject</Label>
                    <Input
                      value={form.renewal_label}
                      onChange={(event) =>
                        updateField("renewal_label", event.target.value)
                      }
                      placeholder="What needs to be renewed"
                    />
                  </div>
                )}

                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    rows={2}
                    value={form.description}
                    onChange={(event) =>
                      updateField("description", event.target.value)
                    }
                    placeholder="Internal notes for your team"
                  />
                </div>
              </div>
            </FormSection>

            <FormSection title="Customer & assignment">
              <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Customer</Label>
              <select
                value={form.customer_ref ?? ""}
                onChange={(event) => {
                  const id = event.target.value
                    ? Number(event.target.value)
                    : null;
                  const customer = customers.find((row) => row.id === id);
                  updateField("customer_ref", id);
                  if (customer) {
                    updateField(
                      "customer_name",
                      customerDisplayName(customer) || customer.customer_name
                    );
                    updateField("phone", customer.customer_phone || "");
                    updateField("email", customer.customer_email || "");
                  }
                }}
                className={selectClassName}
              >
                <option value="">Walk-in / manual</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customerDisplayName(customer) || customer.customer_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Assign to</Label>
              <select
                value={form.assigned_to ?? ""}
                onChange={(event) =>
                  updateField(
                    "assigned_to",
                    event.target.value ? Number(event.target.value) : null
                  )
                }
                className={selectClassName}
              >
                <option value="">Unassigned</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Contact name</Label>
              <Input
                value={form.customer_name}
                onChange={(event) =>
                  updateField("customer_name", event.target.value)
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
              />
            </div>

            {!form.customer_ref && form.customer_name.trim() && (
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  checked={saveAsCustomer}
                  onChange={(event) => setSaveAsCustomer(event.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                Save as new customer
              </label>
            )}
              </div>
            </FormSection>

            <FormSection title="Links">
              <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Catalog item</Label>
              <select
                value={form.item_ref ?? ""}
                onChange={(event) => {
                  const id = event.target.value
                    ? Number(event.target.value)
                    : null;
                  applyItemDefaults(id);
                }}
                className={selectClassName}
              >
                <option value="">None</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.item_name}
                    {item.service_interval_days
                      ? ` · every ${item.service_interval_days}d`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Invoice</Label>
              <select
                value={form.invoice_ref ?? ""}
                onChange={(event) => {
                  const id = event.target.value
                    ? Number(event.target.value)
                    : null;
                  updateField("invoice_ref", id);
                  applyInvoice(id);
                }}
                className={selectClassName}
              >
                <option value="">None</option>
                {finalizedInvoices.map((invoice) => (
                  <option key={invoice.id} value={invoice.id}>
                    {invoice.invoice_number} ·{" "}
                    {invoice.customer_display_name || invoice.customer_name}
                  </option>
                ))}
              </select>
            </div>

            {form.reminder_type === "booking" && (
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Booking</Label>
                <select
                  value={form.booking_ref ?? ""}
                  onChange={(event) =>
                    updateField(
                      "booking_ref",
                      event.target.value ? Number(event.target.value) : null
                    )
                  }
                  className={selectClassName}
                >
                  <option value="">None</option>
                  {bookings.map((booking) => (
                    <option key={booking.id} value={booking.id}>
                      {booking.booking_number} · {booking.display_customer_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {form.reminder_type === "warranty" && (
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Warranty</Label>
                <select
                  value={form.warranty_ref ?? ""}
                  onChange={(event) =>
                    updateField(
                      "warranty_ref",
                      event.target.value ? Number(event.target.value) : null
                    )
                  }
                  className={selectClassName}
                >
                  <option value="">None</option>
                  {warranties.map((row) => (
                    <option key={row.id} value={row.id}>
                      {row.warranty_number} · {row.serial_number}
                    </option>
                  ))}
                </select>
              </div>
            )}
              </div>
            </FormSection>

            <FormSection title="Schedule">
              <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Due *</Label>
              <Input
                type="datetime-local"
                value={form.due_at}
                onChange={(event) => updateField("due_at", event.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Remind before (days)</Label>
              <Input
                type="number"
                min={0}
                value={form.lead_days}
                onChange={(event) =>
                  updateField("lead_days", Number(event.target.value))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label>Repeat</Label>
              <select
                value={form.recurrence}
                onChange={(event) =>
                  updateField(
                    "recurrence",
                    event.target.value as ReminderRecurrence
                  )
                }
                className={selectClassName}
              >
                {REMINDER_RECURRENCES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                {recurrenceLabel(form.recurrence, Number(customDaysText) || null)}
              </p>
            </div>

            {form.recurrence === "custom" && (
              <div className="space-y-1.5">
                <Label>Interval (days)</Label>
                <Input
                  type="number"
                  min={1}
                  value={customDaysText}
                  onChange={(event) => setCustomDaysText(event.target.value)}
                  placeholder="Number of days"
                />
              </div>
            )}

            {(form.reminder_type === "payment" || form.amount_due != null) && (
              <div className="space-y-1.5">
                <Label>Amount due (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={amountText}
                  onChange={(event) => setAmountText(event.target.value)}
                />
              </div>
            )}
              </div>
            </FormSection>
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
              {isEditing ? "Save changes" : "Create reminder"}
            </Button>
          </SheetFooter>
        </form>
      </ResizableSheetContent>
    </Sheet>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border/80 bg-muted/15 p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}
