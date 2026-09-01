"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Loader2, ScanLine } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import { customerDisplayName } from "@/features/customers/customer-display";
import { useInvoices } from "@/features/invoices/hooks/use-invoices";
import { useProducts } from "@/features/products/hooks/use-products";
import { useStocks } from "@/features/stocks/hooks/use-stocks";
import { useVendors } from "@/features/vendors/hooks/use-vendors";
import { useItems } from "@/features/items/hooks/use-items";
import { useDebounce } from "@/lib/use-debounce";

import { useWarrantyLookup, useWarrantyPolicies } from "../hooks/use-warranty";
import {
  addMonths,
  remainingCopy,
  todayDate,
} from "../lib/warranty-utils";
import type {
  CoverageType,
  WarrantyInput,
  WarrantyRegistration,
  WarrantySource,
  WarrantyStatus,
} from "../types";
import {
  COVERAGE_TYPES,
  WARRANTY_SOURCES,
  WARRANTY_STATUSES,
} from "../types";

function emptyForm(): WarrantyInput {
  const start = todayDate();
  return {
    customer_ref: null,
    customer_name: "",
    phone: "",
    email: "",
    product_ref: null,
    item_ref: null,
    stock_ref: null,
    serial_number: "",
    invoice_ref: null,
    vendor_ref: null,
    policy_ref: null,
    coverage_type: "manufacturer",
    coverage_months: 12,
    purchase_date: start,
    starts_at: start,
    ends_at: addMonths(start, 12),
    source: "walk_in",
    status: "active",
    proof_note: "",
    notes: "",
  };
}

function fromWarranty(row: WarrantyRegistration): WarrantyInput {
  return {
    customer_ref: row.customer_ref,
    customer_name: row.display_customer_name || row.customer_name || "",
    phone: row.display_phone || row.phone || "",
    email: row.display_email || row.email || "",
    product_ref: row.product_ref,
    item_ref: row.item_ref,
    stock_ref: row.stock_ref,
    serial_number: row.serial_number,
    invoice_ref: row.invoice_ref,
    vendor_ref: row.vendor_ref,
    policy_ref: row.policy_ref,
    coverage_type: row.coverage_type,
    coverage_months: row.coverage_months,
    purchase_date: row.purchase_date || row.starts_at,
    starts_at: row.starts_at,
    ends_at: row.ends_at,
    source: row.source,
    status: row.status === "expired" ? "active" : row.status,
    proof_note: row.proof_note || "",
    notes: row.notes || "",
  };
}

export function WarrantyFormSheet({
  open,
  warranty,
  presetSerial,
  onClose,
  onSave,
}: {
  open: boolean;
  warranty: WarrantyRegistration | null;
  presetSerial?: string;
  onClose: () => void;
  onSave: (input: WarrantyInput) => Promise<void>;
}) {
  const { data: customers = [] } = useCustomers();
  const createCustomer = useCreateCustomer();
  const { data: products = [] } = useProducts();
  const { data: invoices = [] } = useInvoices();
  const { data: stocks = [] } = useStocks("", "sold");
  const { data: vendors = [] } = useVendors();
  const { items } = useItems();
  const { data: policies = [] } = useWarrantyPolicies();

  const [form, setForm] = useState<WarrantyInput>(emptyForm);
  const [saveAsCustomer, setSaveAsCustomer] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [lastAppliedSerial, setLastAppliedSerial] = useState("");

  const isEditing = Boolean(warranty?.id);
  const debouncedSerial = useDebounce(form.serial_number, 400);
  const { data: lookup } = useWarrantyLookup(
    isEditing ? "" : debouncedSerial
  );

  useEffect(() => {
    if (!open) return;
    if (warranty) {
      setForm(fromWarranty(warranty));
      setSaveAsCustomer(false);
      setError("");
      return;
    }
    const next = emptyForm();
    if (presetSerial) next.serial_number = presetSerial;
    setForm(next);
    setSaveAsCustomer(false);
    setError("");
    setLastAppliedSerial("");
  }, [open, warranty, presetSerial]);

  useEffect(() => {
    if (!open || isEditing || !lookup) return;
    const serial = (lookup.serial || "").trim().toLowerCase();
    if (!serial || serial === lastAppliedSerial) return;
    if (serial !== form.serial_number.trim().toLowerCase()) return;

    setLastAppliedSerial(serial);
    setForm((current) => {
      const next = { ...current };
      if (lookup.stock) {
        next.stock_ref = lookup.stock.id;
        next.product_ref = lookup.stock.product_id || next.product_ref;
        next.serial_number = lookup.stock.product_serial || next.serial_number;
        if (lookup.stock.invoice_id) {
          next.invoice_ref = lookup.stock.invoice_id;
          next.source = "stock_sale";
        }
        if (lookup.stock.sold_at) {
          const sold = lookup.stock.sold_at.slice(0, 10);
          next.purchase_date = sold;
          next.starts_at = sold;
        }
      }
      if (lookup.product) {
        next.product_ref = lookup.product.id;
      }
      if (lookup.invoice) {
        next.invoice_ref = lookup.invoice.id;
        next.source = next.source === "walk_in" ? "invoice" : next.source;
        if (lookup.invoice.invoice_date) {
          next.purchase_date = lookup.invoice.invoice_date.slice(0, 10);
          next.starts_at = next.purchase_date;
        }
      }
      if (lookup.customer) {
        next.customer_ref = lookup.customer.id;
        next.customer_name =
          lookup.customer.customer_display_name ||
          lookup.customer.customer_name ||
          next.customer_name;
        next.phone = lookup.customer.customer_phone || next.phone;
        next.email = lookup.customer.customer_email || next.email;
      }
      if (lookup.policy) {
        next.policy_ref = lookup.policy.id;
        next.coverage_type = lookup.policy.coverage_type;
        next.coverage_months = lookup.policy.coverage_months;
      }
      next.ends_at = addMonths(next.starts_at, next.coverage_months);
      return next;
    });
  }, [lookup, open, isEditing, lastAppliedSerial, form.serial_number]);

  const matchingPolicies = useMemo(
    () =>
      policies.filter(
        (policy) =>
          policy.is_active &&
          (!policy.product_ref || policy.product_ref === form.product_ref)
      ),
    [policies, form.product_ref]
  );

  function setValue<K extends keyof WarrantyInput>(
    key: K,
    value: WarrantyInput[K]
  ) {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === "coverage_months" || key === "starts_at") {
        next.ends_at = addMonths(next.starts_at, Number(next.coverage_months) || 0);
      }
      return next;
    });
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
      customer_name: customerDisplayName(match) || current.customer_name,
      phone: match.customer_phone || current.phone,
      email: match.customer_email || current.email,
    }));
    setSaveAsCustomer(false);
  }

  function applyInvoice(invoiceId: number | null) {
    if (!invoiceId) {
      setValue("invoice_ref", null);
      return;
    }
    const invoice = invoices.find((row) => row.id === invoiceId);
    if (!invoice) return;
    setForm((current) => ({
      ...current,
      invoice_ref: invoice.id,
      customer_ref: invoice.customer_id || current.customer_ref,
      customer_name:
        invoice.customer_display_name ||
        invoice.customer_name ||
        current.customer_name,
      purchase_date: (invoice.invoice_date || current.purchase_date).slice(0, 10),
      starts_at: (invoice.invoice_date || current.starts_at).slice(0, 10),
      ends_at: addMonths(
        (invoice.invoice_date || current.starts_at).slice(0, 10),
        current.coverage_months
      ),
      source: "invoice",
    }));
  }

  function applyStock(stockId: number | null) {
    if (!stockId) {
      setValue("stock_ref", null);
      return;
    }
    const stock = stocks.find((row) => row.id === stockId);
    if (!stock) return;
    setForm((current) => ({
      ...current,
      stock_ref: stock.id,
      serial_number: stock.product_serial,
      product_ref: stock.product_id,
      invoice_ref: stock.invoice_id || current.invoice_ref,
      purchase_date: (stock.sold_at || current.purchase_date || todayDate()).slice(
        0,
        10
      ),
      starts_at: (stock.sold_at || current.starts_at || todayDate()).slice(0, 10),
      ends_at: addMonths(
        (stock.sold_at || current.starts_at || todayDate()).slice(0, 10),
        current.coverage_months
      ),
      source: "stock_sale",
    }));
  }

  function applyPolicy(policyId: number | null) {
    if (!policyId) {
      setValue("policy_ref", null);
      return;
    }
    const policy = policies.find((row) => row.id === policyId);
    if (!policy) return;
    setForm((current) => ({
      ...current,
      policy_ref: policy.id,
      coverage_type: policy.coverage_type,
      coverage_months: policy.coverage_months,
      product_ref: policy.product_ref || current.product_ref,
      ends_at: addMonths(current.starts_at, policy.coverage_months),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.serial_number.trim()) {
      setError("Serial number is required.");
      return;
    }
    if (!form.customer_name.trim() && !form.phone.trim() && !form.customer_ref) {
      setError("Link a customer or enter a name / phone.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      let customerRef = form.customer_ref;
      if (saveAsCustomer && !customerRef) {
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
        serial_number: form.serial_number.trim(),
        customer_name: form.customer_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        ends_at: addMonths(form.starts_at, Number(form.coverage_months) || 0),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save warranty.");
    } finally {
      setSaving(false);
    }
  }

  const existingForSerial =
    !isEditing && lookup?.registration ? lookup.registration : null;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? "Edit warranty" : "Register warranty"}
          </SheetTitle>
          <SheetDescription>
            Type a serial — stock, invoice, customer, and policy fill in
            automatically when they already exist in the ERP.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-4"
        >
          <div className="space-y-2">
            <Label htmlFor="serial">Serial number</Label>
            <div className="relative">
              <ScanLine className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="serial"
                className="pl-9 font-mono"
                value={form.serial_number}
                onChange={(event) =>
                  setValue("serial_number", event.target.value)
                }
                placeholder="Scan or type serial"
                autoFocus={!isEditing}
              />
            </div>
            {existingForSerial ? (
              <p className="text-xs text-amber-600">
                {existingForSerial.warranty_number} is already registered for
                this serial ({remainingCopy(existingForSerial.days_remaining)}).
              </p>
            ) : lookup?.stock ? (
              <p className="text-xs text-muted-foreground">
                Matched stock {lookup.stock.product_name || ""} ·{" "}
                {lookup.stock.status}
                {lookup.invoice?.invoice_number
                  ? ` · ${lookup.invoice.invoice_number}`
                  : ""}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Sold serial (stock)</Label>
              <Select
                value={form.stock_ref ? String(form.stock_ref) : "none"}
                onValueChange={(value) =>
                  applyStock(value === "none" ? null : Number(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not linked</SelectItem>
                  {stocks.slice(0, 80).map((stock) => (
                    <SelectItem key={stock.id} value={String(stock.id)}>
                      {stock.product_serial} · {stock.product_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Invoice</Label>
              <Select
                value={form.invoice_ref ? String(form.invoice_ref) : "none"}
                onValueChange={(value) =>
                  applyInvoice(value === "none" ? null : Number(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not linked</SelectItem>
                  {invoices.slice(0, 80).map((invoice) => (
                    <SelectItem key={invoice.id} value={String(invoice.id)}>
                      {invoice.invoice_number} ·{" "}
                      {invoice.customer_display_name || invoice.customer_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Customer</Label>
              <Select
                value={form.customer_ref ? String(form.customer_ref) : "none"}
                onValueChange={(value) =>
                  applyCustomer(value === "none" ? null : Number(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Walk-in / new</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={String(customer.id)}>
                      {customerDisplayName(customer)}
                      {customer.customer_phone
                        ? ` · ${customer.customer_phone}`
                        : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(event) => setValue("phone", event.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="customer-name">Owner name</Label>
              <Input
                id="customer-name"
                value={form.customer_name}
                onChange={(event) =>
                  setValue("customer_name", event.target.value)
                }
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) => setValue("email", event.target.value)}
              />
            </div>
          </div>

          {!form.customer_ref ? (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={saveAsCustomer}
                onChange={(event) => setSaveAsCustomer(event.target.checked)}
              />
              Save as a customer record
            </label>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Product</Label>
              <Select
                value={form.product_ref ? String(form.product_ref) : "none"}
                onValueChange={(value) =>
                  setValue(
                    "product_ref",
                    value === "none" ? null : Number(value)
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Master product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={String(product.id)}>
                      {product.product_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Catalog item</Label>
              <Select
                value={form.item_ref ? String(form.item_ref) : "none"}
                onValueChange={(value) =>
                  setValue("item_ref", value === "none" ? null : Number(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Optional item" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.item_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Vendor / OEM</Label>
              <Select
                value={form.vendor_ref ? String(form.vendor_ref) : "none"}
                onValueChange={(value) =>
                  setValue(
                    "vendor_ref",
                    value === "none" ? null : Number(value)
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={String(vendor.id)}>
                      {vendor.vendor_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Policy</Label>
              <Select
                value={form.policy_ref ? String(form.policy_ref) : "none"}
                onValueChange={(value) =>
                  applyPolicy(value === "none" ? null : Number(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Coverage policy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Custom months</SelectItem>
                  {matchingPolicies.map((policy) => (
                    <SelectItem key={policy.id} value={String(policy.id)}>
                      {policy.policy_name} · {policy.coverage_months}m
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Coverage</Label>
              <Select
                value={form.coverage_type}
                onValueChange={(value) =>
                  setValue("coverage_type", value as CoverageType)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COVERAGE_TYPES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="months">Months</Label>
              <Input
                id="months"
                type="number"
                min={1}
                value={form.coverage_months}
                onChange={(event) =>
                  setValue("coverage_months", Number(event.target.value) || 0)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="starts">Starts</Label>
              <Input
                id="starts"
                type="date"
                value={form.starts_at}
                onChange={(event) => setValue("starts_at", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ends">Ends</Label>
              <Input id="ends" type="date" value={form.ends_at} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Source</Label>
              <Select
                value={form.source}
                onValueChange={(value) =>
                  setValue("source", value as WarrantySource)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WARRANTY_SOURCES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
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
                  setValue("status", value as WarrantyStatus)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WARRANTY_STATUSES.filter(
                    (item) => item.value !== "expired"
                  ).map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proof">Purchase proof / notes</Label>
            <Textarea
              id="proof"
              value={form.proof_note}
              onChange={(event) => setValue("proof_note", event.target.value)}
              placeholder="Invoice number, dealer name, or QR source"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Internal notes</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(event) => setValue("notes", event.target.value)}
            />
          </div>

          {form.ends_at ? (
            <Badge variant="secondary">
              Coverage until {form.ends_at} ({form.coverage_months} months)
            </Badge>
          ) : null}

          {error ? (
            <p className="text-sm font-medium text-destructive">{error}</p>
          ) : null}

          <SheetFooter className="mt-auto">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isEditing ? (
                "Save warranty"
              ) : (
                "Activate warranty"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
