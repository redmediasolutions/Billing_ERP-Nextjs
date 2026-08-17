"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { CreatableSelect } from "@/components/forms/creatable-select";
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
import {
  useCreateCustomer,
  useCustomers,
} from "@/features/customers/hooks/use-customers";
import { useEmployees } from "@/features/employees/hooks/use-employees";

import {
  useCreateEnquiryChannel,
  useEnquiryChannels,
} from "../hooks/use-enquiries";
import type { Enquiry, EnquiryInput, EnquiryPriority, EnquiryStatus } from "../types";
import { ENQUIRY_PRIORITIES, ENQUIRY_STATUSES } from "../types";

function nowLocal() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function addDaysLocal(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(10, 0, 0, 0);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

const emptyForm: EnquiryInput = {
  customer_ref: null,
  customer_name: "",
  phone: "",
  email: "",
  channel_ref: null,
  channel: "",
  status: "new",
  priority: "medium",
  source_detail: "",
  enquiry_data: "",
  estimated_value: null,
  assigned_to: null,
  call_datetime: nowLocal(),
  follow_up_at: "",
  follow_up_note: "",
  lost_reason: "",
};

function fromEnquiry(enquiry: Enquiry): EnquiryInput {
  return {
    customer_ref: enquiry.customer_ref,
    customer_name:
      enquiry.display_customer_name || enquiry.customer_name || "",
    phone: enquiry.display_phone || enquiry.phone || "",
    email: enquiry.display_email || enquiry.email || "",
    channel_ref: enquiry.channel_ref,
    channel: enquiry.channel_name || enquiry.channel || "",
    status: enquiry.status || "new",
    priority: enquiry.priority || "medium",
    source_detail: enquiry.source_detail || "",
    enquiry_data: enquiry.enquiry_data || "",
    estimated_value: enquiry.estimated_value,
    assigned_to: enquiry.assigned_to,
    call_datetime: enquiry.call_datetime || nowLocal(),
    follow_up_at: enquiry.follow_up_at || "",
    follow_up_note: enquiry.follow_up_note || "",
    lost_reason: enquiry.lost_reason || "",
  };
}

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export function EnquiryFormSheet({
  open,
  enquiry,
  onClose,
  onSave,
}: {
  open: boolean;
  enquiry: Enquiry | null;
  onClose: () => void;
  onSave: (input: EnquiryInput) => Promise<void>;
}) {
  const { data: channels = [], isLoading: loadingChannels } =
    useEnquiryChannels();
  const createChannel = useCreateEnquiryChannel();
  const { data: customers = [] } = useCustomers();
  const createCustomer = useCreateCustomer();
  const { data: employees = [] } = useEmployees();

  const [form, setForm] = useState<EnquiryInput>(emptyForm);
  const [valueText, setValueText] = useState("");
  const [saveAsCustomer, setSaveAsCustomer] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEditing = Boolean(enquiry?.id);
  const activeChannels = channels.filter((channel) => channel.is_active);

  useEffect(() => {
    if (!open) return;

    if (enquiry) {
      const next = fromEnquiry(enquiry);
      setForm(next);
      setValueText(
        next.estimated_value != null ? String(next.estimated_value) : ""
      );
      setSaveAsCustomer(false);
      setError("");
      return;
    }

    setForm({ ...emptyForm, call_datetime: nowLocal() });
    setValueText("");
    setSaveAsCustomer(false);
    setError("");
  }, [enquiry, open]);

  const customerOptions = useMemo(
    () =>
      customers.map((customer) => ({
        value: customer.id,
        label: `${customer.customer_name}${
          customer.customer_phone ? ` · ${customer.customer_phone}` : ""
        }`,
        phone: customer.customer_phone || "",
        email: customer.customer_email || "",
        name: customer.customer_name,
      })),
    [customers]
  );

  function setValue<K extends keyof EnquiryInput>(
    key: K,
    value: EnquiryInput[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function applyCustomer(customerId: number | null) {
    if (!customerId) {
      setForm((current) => ({
        ...current,
        customer_ref: null,
      }));
      return;
    }

    const match = customers.find((customer) => customer.id === customerId);
    if (!match) return;

    setForm((current) => ({
      ...current,
      customer_ref: match.id,
      customer_name: match.customer_name || current.customer_name,
      phone: match.customer_phone || current.phone,
      email: match.customer_email || current.email,
    }));
    setSaveAsCustomer(false);
  }

  function applyPhone(phone: string) {
    const match = customers.find(
      (customer) =>
        customer.customer_phone &&
        customer.customer_phone.replace(/\D/g, "") === phone.replace(/\D/g, "") &&
        phone.replace(/\D/g, "").length >= 8
    );

    setForm((current) => ({
      ...current,
      phone,
      customer_ref: match ? match.id : current.customer_ref,
      customer_name: match
        ? match.customer_name || current.customer_name
        : current.customer_name,
      email: match ? match.customer_email || current.email : current.email,
    }));
  }

  async function handleCreateChannel(label: string) {
    const created = await createChannel.mutateAsync({ channel_name: label });
    return {
      value: created.id,
      label: created.channel_name || label,
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.customer_name.trim() && !form.phone.trim()) {
      setError("Enter a customer name or phone number.");
      return;
    }

    if (!form.enquiry_data.trim()) {
      setError("What is this enquiry about?");
      return;
    }

    if (form.status === "lost" && !form.lost_reason.trim()) {
      setError("Add a lost reason.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      let customerRef = form.customer_ref;

      if (saveAsCustomer && !customerRef && (form.customer_name || form.phone)) {
        const created = await createCustomer.mutateAsync({
          customer_name: form.customer_name.trim() || form.phone.trim(),
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
        enquiry_data: form.enquiry_data.trim(),
        estimated_value: valueText ? Number(valueText) || 0 : null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save enquiry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit enquiry" : "New enquiry"}</SheetTitle>
          <SheetDescription>
            Capture the lead once — phone match, channel create, follow-up, and
            customer link without leaving this panel.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="enquiry-phone">Phone</Label>
              <Input
                id="enquiry-phone"
                value={form.phone}
                onChange={(event) => applyPhone(event.target.value)}
                placeholder="9876543210"
                autoFocus={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label>Existing customer</Label>
              <Select
                value={form.customer_ref ? String(form.customer_ref) : "none"}
                onValueChange={(value) =>
                  applyCustomer(value === "none" ? null : Number(value))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Link customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">New / unlinked</SelectItem>
                  {customerOptions.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="enquiry-name">Customer name</Label>
              <Input
                id="enquiry-name"
                value={form.customer_name}
                onChange={(event) => setValue("customer_name", event.target.value)}
                placeholder="Name of the person / business"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="enquiry-email">Email</Label>
              <Input
                id="enquiry-email"
                type="email"
                value={form.email}
                onChange={(event) => setValue("email", event.target.value)}
                placeholder="optional"
              />
            </div>
          </div>

          {!form.customer_ref ? (
            <label className="flex items-start gap-2 rounded-lg border border-border p-3 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={saveAsCustomer}
                onChange={(event) => setSaveAsCustomer(event.target.checked)}
              />
              <span>
                Also save as customer
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  Creates a customer record so you can invoice later without
                  retyping.
                </span>
              </span>
            </label>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="enquiry-data">Enquiry *</Label>
            <Textarea
              id="enquiry-data"
              rows={3}
              value={form.enquiry_data}
              onChange={(event) => setValue("enquiry_data", event.target.value)}
              placeholder="What do they need? Product, qty, budget, urgency..."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Channel</Label>
              <CreatableSelect
                value={form.channel_ref}
                options={activeChannels.map((channel) => ({
                  value: channel.id,
                  label: channel.channel_name,
                }))}
                onChange={(value) => {
                  const id = value ? Number(value) : null;
                  const match = activeChannels.find((channel) => channel.id === id);
                  setForm((current) => ({
                    ...current,
                    channel_ref: id,
                    channel: match?.channel_name || "",
                  }));
                }}
                onCreate={handleCreateChannel}
                placeholder="Select or create"
                loading={loadingChannels}
                selectClassName={selectClassName}
                inputClassName={selectClassName}
                emptyLabel="No channels yet"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="call-datetime">Call / received at</Label>
              <Input
                id="call-datetime"
                type="datetime-local"
                value={form.call_datetime}
                onChange={(event) => setValue("call_datetime", event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setValue("status", value as EnquiryStatus)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENQUIRY_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(value) =>
                  setValue("priority", value as EnquiryPriority)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENQUIRY_PRIORITIES.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated-value">Est. value</Label>
              <Input
                id="estimated-value"
                inputMode="decimal"
                value={valueText}
                onChange={(event) => setValueText(event.target.value)}
                placeholder="₹"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assigned to</Label>
            <Select
              value={form.assigned_to ? String(form.assigned_to) : "none"}
              onValueChange={(value) =>
                setValue("assigned_to", value === "none" ? null : Number(value))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={String(employee.id)}>
                    {employee.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="follow-up-at">Follow-up</Label>
            <Input
              id="follow-up-at"
              type="datetime-local"
              value={form.follow_up_at}
              onChange={(event) => setValue("follow_up_at", event.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Today 6pm", value: (() => {
                  const d = new Date();
                  d.setHours(18, 0, 0, 0);
                  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                  return d.toISOString().slice(0, 16);
                })() },
                { label: "Tomorrow", value: addDaysLocal(1) },
                { label: "+3 days", value: addDaysLocal(3) },
                { label: "+1 week", value: addDaysLocal(7) },
              ].map((chip) => (
                <Button
                  key={chip.label}
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setValue("follow_up_at", chip.value)}
                >
                  {chip.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="follow-up-note">Follow-up note</Label>
            <Textarea
              id="follow-up-note"
              rows={2}
              value={form.follow_up_note}
              onChange={(event) => setValue("follow_up_note", event.target.value)}
              placeholder="What should we say / ask next?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source-detail">Source detail</Label>
            <Input
              id="source-detail"
              value={form.source_detail}
              onChange={(event) => setValue("source_detail", event.target.value)}
              placeholder="Campaign, referrer, listing id..."
            />
          </div>

          {form.status === "lost" ? (
            <div className="space-y-2">
              <Label htmlFor="lost-reason">Lost reason *</Label>
              <Input
                id="lost-reason"
                value={form.lost_reason}
                onChange={(event) => setValue("lost_reason", event.target.value)}
                placeholder="Price, competitor, not interested..."
              />
            </div>
          ) : null}

          {isEditing && enquiry?.updates?.length ? (
            <div className="space-y-2 rounded-lg border border-border p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Timeline
              </p>
              <ul className="max-h-40 space-y-2 overflow-y-auto">
                {[...enquiry.updates].reverse().map((update) => (
                  <li key={update.id} className="text-xs">
                    <p className="font-medium text-foreground">
                      {update.note || update.type}
                    </p>
                    <p className="text-muted-foreground">
                      {new Date(update.at).toLocaleString("en-IN")}
                      {update.status ? ` · ${update.status}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {error ? (
            <p className="text-sm font-medium text-destructive">{error}</p>
          ) : null}

          <SheetFooter className="mt-auto gap-2 sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || createCustomer.isPending}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isEditing ? "Save changes" : "Save enquiry"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
