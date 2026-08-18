"use client";

import { FormEvent, useEffect, useState } from "react";
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

import { useBookingResourceTypes } from "../hooks/use-bookings";
import type { BookingResource, BookingResourceInput } from "../types";

const emptyForm: BookingResourceInput = {
  resource_name: "",
  resource_code: "",
  type_ref: 0,
  item_ref: null,
  employee_ref: null,
  capacity: 1,
  buffer_before_min: 0,
  buffer_after_min: 15,
  color: "",
  notes: "",
  is_active: true,
};

export function ResourceFormSheet({
  open,
  resource,
  onClose,
  onSave,
}: {
  open: boolean;
  resource: BookingResource | null;
  onClose: () => void;
  onSave: (input: BookingResourceInput) => Promise<void>;
}) {
  const { data: types = [] } = useBookingResourceTypes();
  const { data: employees = [] } = useEmployees();
  const { items } = useItems();
  const [form, setForm] = useState<BookingResourceInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const activeTypes = types.filter((type) => type.is_active);

  useEffect(() => {
    if (!open) return;
    if (resource) {
      setForm({
        resource_name: resource.resource_name,
        resource_code: resource.resource_code || "",
        type_ref: resource.type_ref,
        item_ref: resource.item_ref,
        employee_ref: resource.employee_ref,
        capacity: resource.capacity,
        buffer_before_min: resource.buffer_before_min,
        buffer_after_min: resource.buffer_after_min,
        color: resource.color || "",
        notes: resource.notes || "",
        is_active: resource.is_active,
      });
    } else {
      const firstType = types.find((type) => type.is_active);
      setForm({
        ...emptyForm,
        type_ref: firstType?.id || 0,
      });
    }
    setError("");
  }, [open, resource, types]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.resource_name.trim()) {
      setError("Give the resource a name — Room 101, Cabin 2, Priya...");
      return;
    }
    if (!form.type_ref) {
      setError("Pick a resource type first.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await onSave({
        ...form,
        resource_name: form.resource_name.trim(),
        resource_code: form.resource_code.trim(),
        notes: form.notes.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save resource.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{resource ? "Edit resource" : "New resource"}</SheetTitle>
          <SheetDescription>
            Bookable capacity — a hotel room, spa cabin, salon chair, or a
            staff member who takes appointments.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4"
        >
          <div className="space-y-2">
            <Label htmlFor="resource-name">Name</Label>
            <Input
              id="resource-name"
              value={form.resource_name}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  resource_name: event.target.value,
                }))
              }
              placeholder="Deluxe 101 / Hair station 2"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="resource-code">Code</Label>
              <Input
                id="resource-code"
                value={form.resource_code}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    resource_code: event.target.value,
                  }))
                }
                placeholder="101"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.type_ref ? String(form.type_ref) : ""}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    type_ref: Number(value),
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {activeTypes.map((type) => (
                    <SelectItem key={type.id} value={String(type.id)}>
                      {type.type_label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                min={1}
                value={form.capacity}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    capacity: Number(event.target.value) || 1,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buffer-before">Buffer before</Label>
              <Input
                id="buffer-before"
                type="number"
                min={0}
                value={form.buffer_before_min}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    buffer_before_min: Number(event.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buffer-after">Buffer after</Label>
              <Input
                id="buffer-after"
                type="number"
                min={0}
                value={form.buffer_after_min}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    buffer_after_min: Number(event.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Default priced item</Label>
            <Select
              value={form.item_ref ? String(form.item_ref) : "none"}
              onValueChange={(value) =>
                setForm((current) => ({
                  ...current,
                  item_ref: value === "none" ? null : Number(value),
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Optional" />
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
            <Label>Linked staff</Label>
            <Select
              value={form.employee_ref ? String(form.employee_ref) : "none"}
              onValueChange={(value) =>
                setForm((current) => ({
                  ...current,
                  employee_ref: value === "none" ? null : Number(value),
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Optional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={String(employee.id)}>
                    {employee.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resource-notes">Notes</Label>
            <Textarea
              id="resource-notes"
              rows={3}
              value={form.notes}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }
            />
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
              Save resource
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
