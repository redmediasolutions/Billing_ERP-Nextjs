"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

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
import { useEmployees } from "@/features/employees/hooks/use-employees";
import { useItems } from "@/features/items/hooks/use-items";
import { useStocks } from "@/features/stocks/hooks/use-stocks";
import { useDebounce } from "@/lib/use-debounce";

import { useWarrantyLookup } from "../hooks/use-warranty";
import { remainingCopy } from "../lib/warranty-utils";
import type {
  ClaimIssueType,
  ClaimPartInput,
  ClaimPriority,
  WarrantyClaim,
  WarrantyClaimInput,
  WarrantyRegistration,
} from "../types";
import { CLAIM_ISSUE_TYPES, CLAIM_PRIORITIES } from "../types";

function emptyPart(): ClaimPartInput {
  return { item_ref: null, item_name: "", quantity: 1, unit_cost: 0 };
}

function emptyForm(registrationId: number | null = null): WarrantyClaimInput {
  return {
    registration_ref: registrationId,
    serial_number: "",
    issue_type: "malfunction",
    issue_description: "",
    priority: "medium",
    assigned_to: null,
    replacement_stock_ref: null,
    replacement_serial: "",
    invoice_ref: null,
    parts: [],
  };
}

function fromClaim(claim: WarrantyClaim): WarrantyClaimInput {
  return {
    registration_ref: claim.registration_ref,
    serial_number: claim.serial_number || "",
    issue_type: claim.issue_type,
    issue_description: claim.issue_description || "",
    priority: claim.priority,
    assigned_to: claim.assigned_to,
    replacement_stock_ref: claim.replacement_stock_ref,
    replacement_serial: claim.replacement_serial || "",
    invoice_ref: claim.invoice_ref,
    parts: (claim.parts || []).map((part) => ({
      item_ref: part.item_ref,
      item_name: part.item_name,
      quantity: part.quantity,
      unit_cost: part.unit_cost,
    })),
  };
}

export function ClaimFormSheet({
  open,
  claim,
  registration,
  onClose,
  onSave,
}: {
  open: boolean;
  claim: WarrantyClaim | null;
  registration: WarrantyRegistration | null;
  onClose: () => void;
  onSave: (input: WarrantyClaimInput) => Promise<void>;
}) {
  const { data: employees = [] } = useEmployees();
  const { items } = useItems();
  const { data: stocks = [] } = useStocks("", "available");
  const [form, setForm] = useState<WarrantyClaimInput>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEditing = Boolean(claim?.id);
  const debouncedSerial = useDebounce(form.serial_number, 400);
  const { data: lookup } = useWarrantyLookup(
    registration || isEditing ? "" : debouncedSerial
  );

  useEffect(() => {
    if (!open) return;
    if (claim) {
      setForm(fromClaim(claim));
      setError("");
      return;
    }
    const next = emptyForm(registration?.id ?? null);
    next.serial_number = registration?.serial_number || "";
    setForm(next);
    setError("");
  }, [open, claim, registration]);

  const eligibility = lookup?.eligibility;
  const matchedRegistration = registration || lookup?.registration || null;

  const eligibilityNote = useMemo(() => {
    if (registration) {
      if (registration.open_claims > 0 && !isEditing) {
        return "This serial already has an open claim.";
      }
      if (registration.status !== "active" && registration.days_remaining < 0) {
        return "Coverage has ended. You can still log an out-of-warranty job.";
      }
      return remainingCopy(registration.days_remaining);
    }
    return eligibility?.reasons[0] || "";
  }, [eligibility, isEditing, registration]);

  function setValue<K extends keyof WarrantyClaimInput>(
    key: K,
    value: WarrantyClaimInput[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updatePart(index: number, patch: Partial<ClaimPartInput>) {
    setForm((current) => ({
      ...current,
      parts: current.parts.map((part, partIndex) =>
        partIndex === index ? { ...part, ...patch } : part
      ),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.issue_description.trim()) {
      setError("Describe the issue.");
      return;
    }
    const registrationRef =
      form.registration_ref || matchedRegistration?.id || null;
    if (!registrationRef) {
      setError("Register the warranty for this serial before filing a claim.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await onSave({
        ...form,
        registration_ref: registrationRef,
        serial_number: form.serial_number.trim(),
        issue_description: form.issue_description.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save claim.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit claim" : "New warranty claim"}</SheetTitle>
          <SheetDescription>
            Claims attach to a registered serial. Eligibility is checked against
            coverage dates and open tickets.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-4"
        >
          {!registration ? (
            <div className="space-y-2">
              <Label htmlFor="claim-serial">Serial</Label>
              <Input
                id="claim-serial"
                className="font-mono"
                value={form.serial_number}
                onChange={(event) =>
                  setValue("serial_number", event.target.value)
                }
                placeholder="Scan serial to attach warranty"
              />
            </div>
          ) : (
            <div className="rounded-xl border border-border p-3 text-sm">
              <p className="font-medium">{registration.warranty_number}</p>
              <p className="font-mono text-xs text-muted-foreground">
                {registration.serial_number}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {registration.display_customer_name ||
                  registration.customer_name}{" "}
                · {registration.product_name || "Product"}
              </p>
            </div>
          )}

          {eligibilityNote ? (
            <Badge
              variant={
                eligibility?.can_claim ||
                (registration &&
                  registration.status === "active" &&
                  registration.open_claims === 0)
                  ? "default"
                  : "outline"
              }
            >
              {eligibilityNote}
            </Badge>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Issue type</Label>
              <Select
                value={form.issue_type}
                onValueChange={(value) =>
                  setValue("issue_type", value as ClaimIssueType)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLAIM_ISSUE_TYPES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
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
                  setValue("priority", value as ClaimPriority)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLAIM_PRIORITIES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="issue">What happened?</Label>
            <Textarea
              id="issue"
              value={form.issue_description}
              onChange={(event) =>
                setValue("issue_description", event.target.value)
              }
              placeholder="Symptoms, when it started, any photos already taken…"
            />
          </div>

          <div className="space-y-2">
            <Label>Assign technician</Label>
            <Select
              value={form.assigned_to ? String(form.assigned_to) : "none"}
              onValueChange={(value) =>
                setValue(
                  "assigned_to",
                  value === "none" ? null : Number(value)
                )
              }
            >
              <SelectTrigger>
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
            <div className="flex items-center justify-between">
              <Label>Parts used (items)</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    parts: [...current.parts, emptyPart()],
                  }))
                }
              >
                <Plus className="h-3.5 w-3.5" />
                Add part
              </Button>
            </div>
            {form.parts.map((part, index) => (
              <div key={index} className="grid gap-2 sm:grid-cols-12">
                <Select
                  value={part.item_ref ? String(part.item_ref) : "custom"}
                  onValueChange={(value) => {
                    if (value === "custom") {
                      updatePart(index, { item_ref: null });
                      return;
                    }
                    const item = items.find((row) => row.id === Number(value));
                    updatePart(index, {
                      item_ref: Number(value),
                      item_name: item?.item_name || part.item_name,
                      unit_cost: item?.item_cost || part.unit_cost,
                    });
                  }}
                >
                  <SelectTrigger className="sm:col-span-5">
                    <SelectValue placeholder="Item" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom</SelectItem>
                    {items.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.item_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  className="sm:col-span-3"
                  placeholder="Name"
                  value={part.item_name}
                  onChange={(event) =>
                    updatePart(index, { item_name: event.target.value })
                  }
                />
                <Input
                  className="sm:col-span-2"
                  type="number"
                  min={1}
                  value={part.quantity}
                  onChange={(event) =>
                    updatePart(index, {
                      quantity: Number(event.target.value) || 1,
                    })
                  }
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="sm:col-span-2"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      parts: current.parts.filter(
                        (_, partIndex) => partIndex !== index
                      ),
                    }))
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Replacement serial (if swapping)</Label>
            <Select
              value={
                form.replacement_stock_ref
                  ? String(form.replacement_stock_ref)
                  : "none"
              }
              onValueChange={(value) => {
                if (value === "none") {
                  setForm((current) => ({
                    ...current,
                    replacement_stock_ref: null,
                    replacement_serial: "",
                  }));
                  return;
                }
                const stock = stocks.find((row) => row.id === Number(value));
                setForm((current) => ({
                  ...current,
                  replacement_stock_ref: Number(value),
                  replacement_serial: stock?.product_serial || "",
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Available stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None yet</SelectItem>
                {stocks.slice(0, 80).map((stock) => (
                  <SelectItem key={stock.id} value={String(stock.id)}>
                    {stock.product_serial} · {stock.product_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
                "Save claim"
              ) : (
                "File claim"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
