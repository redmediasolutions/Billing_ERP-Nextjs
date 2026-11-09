"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage } from "@/features/clinic/lib/clinic-format";

import type { ClinicService, ClinicServiceInput } from "../types";

const EMPTY: ClinicServiceInput = { name: "", cost: 0, description: "", tax_rate: 0, hsn_code: "" };

export function ServiceFormDialog({
  open,
  service,
  onClose,
  onSave,
}: {
  open: boolean;
  service: ClinicService | null;
  onClose: () => void;
  onSave: (input: ClinicServiceInput) => Promise<void>;
}) {
  const [form, setForm] = useState<ClinicServiceInput>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm(
      service
        ? {
            name: service.name,
            cost: service.cost,
            description: service.description || "",
            tax_rate: service.tax_rate,
            hsn_code: service.hsn_code || "",
          }
        : EMPTY
    );
  }, [open, service]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      await onSave({ ...form, name: form.name.trim() });
    } catch (err) {
      setError(errorMessage(err, "Unable to save service."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{service ? "Edit service" : "New service"}</DialogTitle>
          <DialogDescription>
            Consultation fees, procedures and tests. Saved as an item, so it can
            be billed from Invoices too.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="service_name">Service name *</Label>
            <Input
              id="service_name"
              required
              placeholder="e.g. General Consultation"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              A service with &quot;consultation&quot; in its name is added automatically
              when you bill a consultation.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="service_cost">Fee (₹)</Label>
              <Input
                id="service_cost"
                type="number"
                min={0}
                step="0.01"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="service_tax">GST %</Label>
              <Input
                id="service_tax"
                type="number"
                min={0}
                step="0.01"
                value={form.tax_rate}
                onChange={(e) => setForm({ ...form, tax_rate: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="service_hsn">SAC / HSN</Label>
              <Input
                id="service_hsn"
                value={form.hsn_code}
                onChange={(e) => setForm({ ...form, hsn_code: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="service_desc">Description</Label>
            <Textarea
              id="service_desc"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {service ? "Update service" : "Create service"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
