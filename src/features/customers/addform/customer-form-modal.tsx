"use client";

import { FormEvent, useState } from "react";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Customer, CustomerInput } from "../types";

const emptyCustomer: CustomerInput = {
  customer_name: "",
  customer_phone: "",
  customer_email: "",
  customer_gst: "",
  customer_business_name: "",
  customer_billing_address: "",
  customer_shipping_address: "",
  customer_gst_state: "",
  customer_gst_state_code: "",
};

interface CustomerFormModalProps {
  customer: Customer | null;
  onClose: () => void;
  onSave: (input: CustomerInput) => Promise<void>;
}

export function CustomerFormModal({
  customer,
  onClose,
  onSave,
}: CustomerFormModalProps) {
  const [form, setForm] = useState<CustomerInput>(
    customer
      ? {
          customer_name: customer.customer_name || "",
          customer_phone: customer.customer_phone || "",
          customer_email: customer.customer_email || "",
          customer_gst: customer.customer_gst || "",
          customer_business_name:
            customer.customer_business_name || "",
          customer_billing_address:
            customer.customer_billing_address || "",
          customer_shipping_address:
            customer.customer_shipping_address || "",
          customer_gst_state:
            customer.customer_gst_state || "",
          customer_gst_state_code:
            customer.customer_gst_state_code || "",
        }
      : emptyCustomer
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateField<K extends keyof CustomerInput>(
    field: K,
    value: CustomerInput[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.customer_name.trim()) {
      setError("Customer name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await onSave({
        ...form,
        customer_name: form.customer_name.trim(),
        customer_phone: form.customer_phone.trim(),
        customer_email: form.customer_email.trim(),
        customer_gst: form.customer_gst.trim().toUpperCase(),
        customer_business_name:
          form.customer_business_name.trim(),
        customer_billing_address:
          form.customer_billing_address.trim(),
        customer_shipping_address:
          form.customer_shipping_address.trim(),
        customer_gst_state:
          form.customer_gst_state.trim(),
        customer_gst_state_code:
          form.customer_gst_state_code.trim(),
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save customer."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto border-zinc-800 bg-[#1e1e24] text-white">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-2xl">
            {customer ? "Edit Customer" : "Add New Customer"}
          </DialogTitle>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-zinc-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-3">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Customer Name *">
              <Input
                value={form.customer_name}
                onChange={(event) =>
                  updateField(
                    "customer_name",
                    event.target.value
                  )
                }
                placeholder="e.g. Acme Logistics"
                className="border-zinc-700 bg-[#151517]"
              />
            </Field>

            <Field label="Business Name">
              <Input
                value={form.customer_business_name}
                onChange={(event) =>
                  updateField(
                    "customer_business_name",
                    event.target.value
                  )
                }
                placeholder="e.g. Acme Logistics Pvt. Ltd."
                className="border-zinc-700 bg-[#151517]"
              />
            </Field>

            <Field label="Phone Number">
              <Input
                value={form.customer_phone}
                onChange={(event) =>
                  updateField(
                    "customer_phone",
                    event.target.value
                  )
                }
                placeholder="e.g. 9876543210"
                className="border-zinc-700 bg-[#151517]"
              />
            </Field>

            <Field label="Email Address">
              <Input
                type="email"
                value={form.customer_email}
                onChange={(event) =>
                  updateField(
                    "customer_email",
                    event.target.value
                  )
                }
                placeholder="customer@company.com"
                className="border-zinc-700 bg-[#151517]"
              />
            </Field>

            <Field label="GSTIN">
              <Input
                value={form.customer_gst}
                onChange={(event) =>
                  updateField(
                    "customer_gst",
                    event.target.value
                  )
                }
                placeholder="e.g. 27ABCDE1234F1Z5"
                className="border-zinc-700 bg-[#151517]"
              />
            </Field>

            <Field label="GST State">
              <Input
                value={form.customer_gst_state}
                onChange={(event) =>
                  updateField(
                    "customer_gst_state",
                    event.target.value
                  )
                }
                placeholder="e.g. Maharashtra"
                className="border-zinc-700 bg-[#151517]"
              />
            </Field>

            <Field label="GST State Code">
              <Input
                value={form.customer_gst_state_code}
                onChange={(event) =>
                  updateField(
                    "customer_gst_state_code",
                    event.target.value
                  )
                }
                placeholder="e.g. 27"
                className="border-zinc-700 bg-[#151517]"
              />
            </Field>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Billing Address">
              <Textarea
                rows={4}
                value={form.customer_billing_address}
                onChange={(event) =>
                  updateField(
                    "customer_billing_address",
                    event.target.value
                  )
                }
                placeholder="Customer billing address..."
                className="border-zinc-700 bg-[#151517]"
              />
            </Field>

            <Field label="Shipping Address">
              <Textarea
                rows={4}
                value={form.customer_shipping_address}
                onChange={(event) =>
                  updateField(
                    "customer_shipping_address",
                    event.target.value
                  )
                }
                placeholder="Customer shipping address..."
                className="border-zinc-700 bg-[#151517]"
              />
            </Field>
          </div>

          {error && (
            <p className="rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-zinc-800 pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-zinc-600 bg-transparent"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={saving}
              className="bg-[#FFCC00] font-bold text-black hover:bg-yellow-400"
            >
              {saving && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}

              {customer ? "Save Changes" : "Add Customer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
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
    <div>
      <Label className="mb-2 block text-xs font-bold uppercase text-zinc-400">
        {label}
      </Label>
      {children}
    </div>
  );
}