"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

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
import { useItems } from "@/features/items/hooks/use-items";

import {
  useBookingResources,
  useBookingResourceTypes,
} from "../hooks/use-bookings";
import {
  addMinutesLocal,
  computeLineTotals,
  nightsBetween,
  nowLocal,
  stayWindow,
  todayDate,
  bookingMoneyExact,
} from "../lib/booking-utils";
import type {
  Booking,
  BookingInput,
  BookingKind,
  BookingLineInput,
  BookingStatus,
} from "../types";
import {
  BOOKING_KINDS,
  BOOKING_SOURCES,
  BOOKING_STATUSES,
} from "../types";

function emptyLine(): BookingLineInput {
  return {
    resource_ref: null,
    item_ref: null,
    employee_ref: null,
    line_name: "",
    hsn_code: "",
    unit: "SERVICE",
    description: "",
    quantity: 1,
    occupancy: 1,
    unit_price: 0,
    tax_rate: 0,
    line_discount: 0,
    line_starts_at: "",
    line_ends_at: "",
  };
}

function defaultWindow(kind: BookingKind) {
  if (kind === "stay") {
    return stayWindow(todayDate(), 1);
  }
  const start = nowLocal();
  return {
    starts_at: start,
    ends_at: addMinutesLocal(start, kind === "event" ? 180 : 60),
  };
}

function emptyForm(kind: BookingKind = "appointment"): BookingInput {
  const window = defaultWindow(kind);
  return {
    booking_kind: kind,
    status: "confirmed",
    customer_ref: null,
    customer_name: "",
    phone: "",
    email: "",
    enquiry_ref: null,
    employee_ref: null,
    party_size: 1,
    starts_at: window.starts_at,
    ends_at: window.ends_at,
    all_day: false,
    source: "Walk-in",
    deposit_amount: 0,
    discount_amount: 0,
    notes: "",
    lines: [emptyLine()],
  };
}

function fromBooking(booking: Booking): BookingInput {
  return {
    booking_kind: booking.booking_kind,
    status: booking.status,
    customer_ref: booking.customer_ref,
    customer_name:
      booking.display_customer_name || booking.customer_name || "",
    phone: booking.display_phone || booking.phone || "",
    email: booking.display_email || booking.email || "",
    enquiry_ref: booking.enquiry_ref,
    employee_ref: booking.employee_ref,
    party_size: booking.party_size || 1,
    starts_at: booking.starts_at,
    ends_at: booking.ends_at,
    all_day: booking.all_day,
    source: booking.source || "Walk-in",
    deposit_amount: booking.deposit_amount,
    discount_amount: booking.discount_amount,
    notes: booking.notes || "",
    lines:
      booking.lines.length > 0
        ? booking.lines.map((line) => ({
            resource_ref: line.resource_ref,
            item_ref: line.item_ref,
            employee_ref: line.employee_ref,
            line_name: line.line_name,
            hsn_code: line.hsn_code || "",
            unit: line.unit || "",
            description: line.description || "",
            quantity: line.quantity,
            occupancy: line.occupancy,
            unit_price: line.unit_price,
            tax_rate: line.tax_rate,
            line_discount: line.line_discount,
            line_starts_at: line.line_starts_at || booking.starts_at,
            line_ends_at: line.line_ends_at || booking.ends_at,
          }))
        : [emptyLine()],
  };
}

function durationMinutes(start: string, end: string) {
  const from = new Date(start);
  const to = new Date(end);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 60;
  return Math.max(15, Math.round((to.getTime() - from.getTime()) / 60000));
}

export function BookingFormSheet({
  open,
  booking,
  defaultKind,
  onClose,
  onSave,
}: {
  open: boolean;
  booking: Booking | null;
  defaultKind?: BookingKind;
  onClose: () => void;
  onSave: (input: BookingInput) => Promise<void>;
}) {
  const { data: customers = [] } = useCustomers();
  const createCustomer = useCreateCustomer();
  const { data: employees = [] } = useEmployees();
  const { items } = useItems();
  const { data: resources = [] } = useBookingResources();
  const { data: resourceTypes = [] } = useBookingResourceTypes();

  const [form, setForm] = useState<BookingInput>(emptyForm(defaultKind));
  const [nights, setNights] = useState(1);
  const [duration, setDuration] = useState(60);
  const [saveAsCustomer, setSaveAsCustomer] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEditing = Boolean(booking?.id);
  const activeResources = resources.filter((resource) => resource.is_active);

  useEffect(() => {
    if (!open) return;

    if (booking) {
      const next = fromBooking(booking);
      setForm(next);
      setNights(
        next.booking_kind === "stay"
          ? nightsBetween(next.starts_at, next.ends_at)
          : 1
      );
      setDuration(durationMinutes(next.starts_at, next.ends_at));
      setSaveAsCustomer(false);
      setError("");
      return;
    }

    const next = emptyForm(defaultKind || "appointment");
    setForm(next);
    setNights(1);
    setDuration(next.booking_kind === "event" ? 180 : 60);
    setSaveAsCustomer(false);
    setError("");
  }, [booking, defaultKind, open]);

  const preview = useMemo(() => {
    const lines = form.lines.map((line) => computeLineTotals(line));
    const subtotal = lines.reduce((sum, line) => sum + line.amount_before_tax, 0);
    const tax = lines.reduce((sum, line) => sum + line.tax_amount, 0);
    const grand = Math.max(0, subtotal + tax - (Number(form.discount_amount) || 0));
    return { subtotal, tax, grand };
  }, [form.discount_amount, form.lines]);

  function setValue<K extends keyof BookingInput>(key: K, value: BookingInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function changeKind(kind: BookingKind) {
    const window = defaultWindow(kind);
    setDuration(kind === "event" ? 180 : 60);
    setNights(1);
    setForm((current) => ({
      ...current,
      booking_kind: kind,
      starts_at: window.starts_at,
      ends_at: window.ends_at,
      lines: current.lines.map((line) => ({
        ...line,
        unit: kind === "stay" ? "NIGHT" : "SERVICE",
        quantity: kind === "stay" ? 1 : line.quantity || 1,
      })),
    }));
  }

  function applyCustomer(customerId: number | null) {
    if (!customerId) {
      setValue("customer_ref", null);
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
    const digits = phone.replace(/\D/g, "");
    const match = customers.find(
      (customer) =>
        customer.customer_phone &&
        customer.customer_phone.replace(/\D/g, "") === digits &&
        digits.length >= 8
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

  function patchLine(index: number, patch: Partial<BookingLineInput>) {
    setForm((current) => ({
      ...current,
      lines: current.lines.map((line, lineIndex) =>
        lineIndex === index ? { ...line, ...patch } : line
      ),
    }));
  }

  function applyResource(index: number, resourceId: number | null) {
    const resource = activeResources.find((item) => item.id === resourceId);
    const type = resourceTypes.find((item) => item.id === resource?.type_ref);
    const catalog = items.find((item) => item.id === resource?.item_ref);
    const unit =
      form.booking_kind === "stay" || type?.time_model === "overnight"
        ? "NIGHT"
        : catalog?.unit || "SERVICE";

    patchLine(index, {
      resource_ref: resourceId,
      employee_ref: resource?.employee_ref || form.employee_ref,
      item_ref: catalog?.id || null,
      line_name: catalog?.item_name || resource?.resource_name || "",
      hsn_code: catalog?.hsn_code || "",
      unit,
      unit_price: catalog
        ? Number(catalog.walk_in_price ?? catalog.item_cost ?? 0)
        : 0,
      tax_rate: catalog?.tax_rate || 0,
      occupancy: form.party_size || 1,
      quantity:
        form.booking_kind === "stay"
          ? nights
          : 1,
    });
  }

  function applyItem(index: number, itemId: number | null) {
    const catalog = items.find((item) => item.id === itemId);
    patchLine(index, {
      item_ref: itemId,
      line_name: catalog?.item_name || "",
      hsn_code: catalog?.hsn_code || "",
      unit:
        form.booking_kind === "stay"
          ? "NIGHT"
          : catalog?.unit || "SERVICE",
      unit_price: catalog
        ? Number(catalog.walk_in_price ?? catalog.item_cost ?? 0)
        : 0,
      tax_rate: catalog?.tax_rate || 0,
    });
  }

  function applyStayNights(nextNights: number) {
    const safe = Math.max(1, nextNights);
    setNights(safe);
    const checkIn = form.starts_at.slice(0, 10) || todayDate();
    const window = stayWindow(checkIn, safe);
    setForm((current) => ({
      ...current,
      starts_at: window.starts_at,
      ends_at: window.ends_at,
      lines: current.lines.map((line) => ({
        ...line,
        quantity: line.unit === "NIGHT" || !line.item_ref ? safe : line.quantity,
      })),
    }));
  }

  function applyAppointmentStart(start: string) {
    setForm((current) => ({
      ...current,
      starts_at: start,
      ends_at: addMinutesLocal(start, duration),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.customer_name.trim() && !form.phone.trim()) {
      setError("Enter a guest name or phone number.");
      return;
    }

    if (!form.starts_at || !form.ends_at) {
      setError("Set the booking time window.");
      return;
    }

    if (new Date(form.ends_at) <= new Date(form.starts_at)) {
      setError("End must be after start.");
      return;
    }

    const usableLines = form.lines.filter(
      (line) => line.resource_ref || line.item_ref || line.line_name.trim()
    );

    if (!usableLines.length) {
      setError("Add a room, chair, or service line.");
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
        notes: form.notes.trim(),
        create_customer: saveAsCustomer && !customerRef,
        lines: usableLines.map((line) => ({
          ...line,
          occupancy: line.occupancy || form.party_size || 1,
          line_starts_at: line.line_starts_at || form.starts_at,
          line_ends_at: line.line_ends_at || form.ends_at,
          line_name:
            line.line_name.trim() ||
            (form.booking_kind === "stay" ? "Stay" : "Service"),
        })),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save booking.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? "Edit booking" : "New booking"}
          </SheetTitle>
          <SheetDescription>
            One reservation for appointments, hotel stays, and venue slots.
            Bill later from the same record.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-4"
        >
          <div className="grid grid-cols-3 gap-2">
            {BOOKING_KINDS.map((kind) => (
              <Button
                key={kind.value}
                type="button"
                size="sm"
                variant={
                  form.booking_kind === kind.value ? "default" : "outline"
                }
                onClick={() => changeKind(kind.value)}
              >
                {kind.label}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {BOOKING_KINDS.find((kind) => kind.value === form.booking_kind)?.hint}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="booking-phone">Phone</Label>
              <Input
                id="booking-phone"
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
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={String(customer.id)}>
                      {customer.customer_name}
                      {customer.customer_phone
                        ? ` · ${customer.customer_phone}`
                        : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="booking-name">Guest name</Label>
              <Input
                id="booking-name"
                value={form.customer_name}
                onChange={(event) =>
                  setValue("customer_name", event.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="booking-email">Email</Label>
              <Input
                id="booking-email"
                type="email"
                value={form.email}
                onChange={(event) => setValue("email", event.target.value)}
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
                  Needed before converting this booking into an invoice.
                </span>
              </span>
            </label>
          ) : null}

          {form.booking_kind === "stay" ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="check-in">Check-in</Label>
                <Input
                  id="check-in"
                  type="date"
                  value={form.starts_at.slice(0, 10)}
                  onChange={(event) => {
                    const window = stayWindow(event.target.value, nights);
                    setForm((current) => ({
                      ...current,
                      starts_at: window.starts_at,
                      ends_at: window.ends_at,
                    }));
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nights">Nights</Label>
                <Input
                  id="nights"
                  type="number"
                  min={1}
                  value={nights}
                  onChange={(event) =>
                    applyStayNights(Number(event.target.value) || 1)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Check-out</Label>
                <Input readOnly value={form.ends_at.slice(0, 10)} />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="starts-at">Starts</Label>
                <Input
                  id="starts-at"
                  type="datetime-local"
                  value={form.starts_at}
                  onChange={(event) => applyAppointmentStart(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={15}
                  step={15}
                  value={duration}
                  onChange={(event) => {
                    const next = Number(event.target.value) || 60;
                    setDuration(next);
                    setValue("ends_at", addMinutesLocal(form.starts_at, next));
                  }}
                />
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="party-size">
                {form.booking_kind === "stay" ? "Guests" : "Party size"}
              </Label>
              <Input
                id="party-size"
                type="number"
                min={1}
                value={form.party_size}
                onChange={(event) =>
                  setValue("party_size", Number(event.target.value) || 1)
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Staff</Label>
              <Select
                value={form.employee_ref ? String(form.employee_ref) : "none"}
                onValueChange={(value) =>
                  setValue(
                    "employee_ref",
                    value === "none" ? null : Number(value)
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Optional" />
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
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setValue("status", value as BookingStatus)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BOOKING_STATUSES.filter(
                    (status) =>
                      !["cancelled", "no_show", "completed"].includes(
                        status.value
                      ) || isEditing
                  ).map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {form.booking_kind === "stay"
                        ? status.stay
                        : form.booking_kind === "appointment"
                          ? status.appointment
                          : status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>
                {form.booking_kind === "stay"
                  ? "Rooms / extras"
                  : "Services / resources"}
              </Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    lines: [...current.lines, emptyLine()],
                  }))
                }
              >
                <Plus className="h-3.5 w-3.5" />
                Add line
              </Button>
            </div>

            {form.lines.map((line, index) => (
              <div
                key={index}
                className="space-y-3 rounded-xl border border-border p-3"
              >
                <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                  <div className="space-y-1.5">
                    <Label>Resource</Label>
                    <Select
                      value={
                        line.resource_ref ? String(line.resource_ref) : "none"
                      }
                      onValueChange={(value) =>
                        applyResource(
                          index,
                          value === "none" ? null : Number(value)
                        )
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Room / chair / staff" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {activeResources.map((resource) => (
                          <SelectItem
                            key={resource.id}
                            value={String(resource.id)}
                          >
                            {resource.resource_name}
                            {resource.type_label
                              ? ` · ${resource.type_label}`
                              : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Item</Label>
                    <Select
                      value={line.item_ref ? String(line.item_ref) : "none"}
                      onValueChange={(value) =>
                        applyItem(
                          index,
                          value === "none" ? null : Number(value)
                        )
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Priced item" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Custom</SelectItem>
                        {items.map((item) => (
                          <SelectItem key={item.id} value={String(item.id)}>
                            {item.item_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {form.lines.length > 1 ? (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="self-end"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          lines: current.lines.filter(
                            (_line, lineIndex) => lineIndex !== index
                          ),
                        }))
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : (
                    <span />
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-4">
                  <Input
                    placeholder="Line name"
                    value={line.line_name}
                    onChange={(event) =>
                      patchLine(index, { line_name: event.target.value })
                    }
                  />
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="Qty / nights"
                    value={line.quantity}
                    onChange={(event) =>
                      patchLine(index, {
                        quantity: Number(event.target.value) || 0,
                      })
                    }
                  />
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="Rate"
                    value={line.unit_price}
                    onChange={(event) =>
                      patchLine(index, {
                        unit_price: Number(event.target.value) || 0,
                      })
                    }
                  />
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="Tax %"
                    value={line.tax_rate}
                    onChange={(event) =>
                      patchLine(index, {
                        tax_rate: Number(event.target.value) || 0,
                      })
                    }
                  />
                </div>
                <p className="text-right text-xs text-muted-foreground">
                  Line total{" "}
                  {bookingMoneyExact.format(computeLineTotals(line).line_total)}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Source</Label>
              <Select
                value={form.source || "Walk-in"}
                onValueChange={(value) => setValue("source", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BOOKING_SOURCES.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deposit">Deposit</Label>
              <Input
                id="deposit"
                type="number"
                min={0}
                value={form.deposit_amount}
                onChange={(event) =>
                  setValue("deposit_amount", Number(event.target.value) || 0)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount">Discount</Label>
              <Input
                id="discount"
                type="number"
                min={0}
                value={form.discount_amount}
                onChange={(event) =>
                  setValue("discount_amount", Number(event.target.value) || 0)
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking-notes">Notes</Label>
            <Textarea
              id="booking-notes"
              rows={3}
              value={form.notes}
              onChange={(event) => setValue("notes", event.target.value)}
              placeholder="Allergies, early check-in, colour formula..."
            />
          </div>

          <div className="rounded-xl bg-muted/50 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{bookingMoneyExact.format(preview.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>{bookingMoneyExact.format(preview.tax)}</span>
            </div>
            <div className="mt-1 flex justify-between font-semibold">
              <span>Total</span>
              <span>{bookingMoneyExact.format(preview.grand)}</span>
            </div>
          </div>

          {error ? (
            <p className="text-sm font-medium text-destructive">{error}</p>
          ) : null}

          <SheetFooter className="px-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isEditing ? "Save booking" : "Create booking"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
