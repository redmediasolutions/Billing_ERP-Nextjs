"use client";

import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
      <DialogContent className="form-dialog">
        <DialogHeader>
          <DialogTitle>
            {customer ? "Edit Customer" : "Add New Customer"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="customer-form">
          <div className="form-grid form-grid--2col">
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
              />
            </Field>
          </div>

          <div className="form-grid form-grid--2col" style={{ marginTop: 20 }}>
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
              />
            </Field>
          </div>

          {error && <p className="form-error">{error}</p>}

          <DialogFooter className="form-actions">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit" disabled={saving}>
              {saving && <Loader2 size={16} className="form-spinner" />}
              {customer ? "Save Changes" : "Add Customer"}
            </Button>
          </DialogFooter>
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
    <div className="form-field">
      <Label className="form-field__label">{label}</Label>
      {children}
    </div>
  );
}
