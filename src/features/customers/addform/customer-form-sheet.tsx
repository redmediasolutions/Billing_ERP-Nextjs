"use client";

import { useEffect, useState } from "react";
import { Loader2, Building2, User, Mail, Phone, MapPin, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import type { Customer, CustomerInput } from "../types";

interface CustomerFormSheetProps {
  open: boolean;
  customer: Customer | null;
  onClose: () => void;
  onSave: (input: CustomerInput) => Promise<void>;
}

const DEFAULT_FORM_DATA: CustomerInput = {
  customer_name: "",
  customer_title: "",
  customer_display_name: "",
  customer_business_name: "",
  customer_email: "",
  customer_phone: "",
  customer_gst: "",
  customer_gst_state: "",
  customer_gst_state_code: "",
  customer_billing_address: "",
  customer_shipping_address: "",
};

export function CustomerFormSheet({
  open,
  customer,
  onClose,
  onSave,
}: CustomerFormSheetProps) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CustomerInput>(DEFAULT_FORM_DATA);

  useEffect(() => {
    if (customer) {
      setFormData({
        customer_name: customer.customer_name || "",
        customer_title: customer.customer_title || "",
        customer_display_name: customer.customer_display_name || customer.customer_name || "",
        customer_business_name: customer.customer_business_name || "",
        customer_email: customer.customer_email || "",
        customer_phone: customer.customer_phone || "",
        customer_gst: customer.customer_gst || "",
        customer_gst_state: customer.customer_gst_state || "",
        customer_gst_state_code: customer.customer_gst_state_code || "",
        customer_billing_address: customer.customer_billing_address || "",
        customer_shipping_address: customer.customer_shipping_address || "",
      });
    } else {
      setFormData(DEFAULT_FORM_DATA);
    }
  }, [customer, open]);

  function handleChange(field: keyof CustomerInput, value: string) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      // A useful default, while still letting the user intentionally choose a
      // different name for invoices and estimates.
      ...(field === "customer_name" && !prev.customer_display_name
        ? { customer_display_name: value }
        : {}),
    }));
  }

  function copyBillingToShipping() {
    setFormData((prev) => ({
      ...prev,
      customer_shipping_address: prev.customer_billing_address,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSubmitting(true);
      await onSave({
        ...formData,
        customer_name: formData.customer_name.trim(),
        customer_display_name: (formData.customer_display_name || formData.customer_name).trim(),
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="flex flex-col w-full sm:max-w-xl p-0 gap-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle>
            {customer ? "Edit Customer" : "Add New Customer"}
          </SheetTitle>
          <SheetDescription>
            {customer
              ? "Update contact and billing details for this customer."
              : "Enter customer information for invoicing and contact records."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* General Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <User className="h-3.5 w-3.5" /> Basic Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="customer_title">Title</Label>
                <Select value={formData.customer_title} onValueChange={(value) => handleChange("customer_title", value === "none" ? "" : value)}>
                  <SelectTrigger id="customer_title" className="w-full"><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent><SelectItem value="none">None</SelectItem><SelectItem value="Mr.">Mr.</SelectItem><SelectItem value="Mrs.">Mrs.</SelectItem><SelectItem value="Ms.">Ms.</SelectItem><SelectItem value="Dr.">Dr.</SelectItem><SelectItem value="Mx.">Mx.</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="customer_name">Customer Name *</Label>
                <Input
                  id="customer_name"
                  required
                  placeholder="e.g. Rajesh Kumar"
                  value={formData.customer_name}
                  onChange={(e) => handleChange("customer_name", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="customer_business_name">Business Name</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="customer_business_name"
                    className="pl-9"
                    placeholder="e.g. Acme Corp"
                    value={formData.customer_business_name || ""}
                    onChange={(e) => handleChange("customer_business_name", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="customer_display_name">Display Name *</Label>
                <Input id="customer_display_name" required placeholder="e.g. Rajesh or Acme Corp" value={formData.customer_display_name} onChange={(e) => handleChange("customer_display_name", e.target.value)} />
                <p className="text-xs text-muted-foreground">Used on invoices, estimates, and customer selection.</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" /> Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="customer_email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="customer_email"
                    type="email"
                    className="pl-9"
                    placeholder="rajesh@acme.com"
                    value={formData.customer_email || ""}
                    onChange={(e) => handleChange("customer_email", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="customer_phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="customer_phone"
                    className="pl-9"
                    placeholder="+91 98765 43210"
                    value={formData.customer_phone || ""}
                    onChange={(e) => handleChange("customer_phone", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Tax / GST Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Receipt className="h-3.5 w-3.5" /> Tax & GST Identification
            </h3>

            <div className="space-y-1.5">
              <Label htmlFor="customer_gst">GSTIN / Tax ID</Label>
              <Input
                id="customer_gst"
                placeholder="29ABCDE1234F1Z5"
                className="font-mono uppercase"
                maxLength={15}
                value={formData.customer_gst || ""}
                onChange={(e) => handleChange("customer_gst", e.target.value.toUpperCase())}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="customer_gst_state">GST State</Label>
                <Input
                  id="customer_gst_state"
                  placeholder="e.g. Karnataka"
                  value={formData.customer_gst_state || ""}
                  onChange={(e) => handleChange("customer_gst_state", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="customer_gst_state_code">GST State Code</Label>
                <Input
                  id="customer_gst_state_code"
                  placeholder="e.g. 29"
                  maxLength={2}
                  value={formData.customer_gst_state_code || ""}
                  onChange={(e) => handleChange("customer_gst_state_code", e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Address Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" /> Address Details
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={copyBillingToShipping}
                className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
              >
                Copy Billing to Shipping
              </Button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="customer_billing_address">Billing Address</Label>
                <Textarea
                  id="customer_billing_address"
                  rows={2}
                  placeholder="Street, City, State, PIN Code"
                  value={formData.customer_billing_address || ""}
                  onChange={(e) => handleChange("customer_billing_address", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="customer_shipping_address">Shipping Address</Label>
                <Textarea
                  id="customer_shipping_address"
                  rows={2}
                  placeholder="Street, City, State, PIN Code"
                  value={formData.customer_shipping_address || ""}
                  onChange={(e) => handleChange("customer_shipping_address", e.target.value)}
                />
              </div>
            </div>
          </div>

          <SheetFooter className="border-t pt-4 px-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {customer ? "Update Customer" : "Create Customer"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
