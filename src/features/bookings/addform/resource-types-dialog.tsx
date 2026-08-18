"use client";

import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  useBookingResourceTypes,
  useCreateBookingResourceType,
  useUpdateBookingResourceType,
} from "../hooks/use-bookings";
import type { BookingTimeModel } from "../types";
import { TIME_MODELS } from "../types";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 40);
}

export function ResourceTypesDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data: types = [], isLoading } = useBookingResourceTypes();
  const createType = useCreateBookingResourceType();
  const updateType = useUpdateBookingResourceType();

  const [label, setLabel] = useState("");
  const [timeModel, setTimeModel] = useState<BookingTimeModel>("timed");
  const [error, setError] = useState("");

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    const type_label = label.trim();
    if (!type_label) {
      setError("Enter a type name such as Room, Chair, or Therapist.");
      return;
    }

    try {
      setError("");
      await createType.mutateAsync({
        type_key: slugify(type_label) || "custom",
        type_label,
        time_model: timeModel,
        allows_staff: timeModel === "timed",
        default_duration_min: timeModel === "timed" ? 45 : null,
      });
      setLabel("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add type.");
    }
  }

  async function toggleActive(
    id: number,
    isActive: boolean,
    row: (typeof types)[number]
  ) {
    try {
      setError("");
      await updateType.mutateAsync({
        id,
        input: {
          type_key: row.type_key,
          type_label: row.type_label,
          time_model: row.time_model,
          default_duration_min: row.default_duration_min,
          allows_staff: row.allows_staff,
          is_active: !isActive,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update type.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Resource types</DialogTitle>
          <DialogDescription>
            This is the industry switch. Salon uses Staff / Station. Lodge uses
            Room / Cottage. Same bookings module.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreate} className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Room, Cabin, Therapist..."
            />
            <Button type="submit" disabled={createType.isPending}>
              {createType.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Add
            </Button>
          </div>
          <div className="space-y-1.5">
            <Label>How time works</Label>
            <Select
              value={timeModel}
              onValueChange={(value) =>
                setTimeModel(value as BookingTimeModel)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_MODELS.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </form>

        {error ? (
          <p className="text-sm font-medium text-destructive">{error}</p>
        ) : null}

        {isLoading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading types...
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {types.map((type) => (
              <li
                key={type.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{type.type_label}</p>
                  <p className="text-xs text-muted-foreground">
                    {type.time_model}
                    {type.default_duration_min
                      ? ` · ${type.default_duration_min} min`
                      : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={type.is_active ? "secondary" : "outline"}>
                    {type.is_active ? "Active" : "Hidden"}
                  </Badge>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleActive(type.id, type.is_active, type)}
                  >
                    {type.is_active ? "Hide" : "Show"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
