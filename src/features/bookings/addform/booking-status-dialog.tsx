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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { statusLabel } from "../lib/booking-utils";
import type { Booking, BookingStatus, BookingStatusInput } from "../types";
import { BOOKING_STATUSES } from "../types";

const NEXT_STATUSES: Record<BookingStatus, BookingStatus[]> = {
  draft: ["held", "confirmed", "cancelled"],
  held: ["confirmed", "cancelled"],
  confirmed: ["in_progress", "no_show", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: [],
  no_show: ["confirmed"],
  cancelled: ["draft"],
};

export function BookingStatusDialog({
  open,
  booking,
  onClose,
  onSave,
}: {
  open: boolean;
  booking: Booking | null;
  onClose: () => void;
  onSave: (input: BookingStatusInput) => Promise<void>;
}) {
  const [status, setStatus] = useState<BookingStatus>("confirmed");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !booking) return;
    const options = NEXT_STATUSES[booking.status] || [];
    setStatus(options[0] || booking.status);
    setNote("");
    setError("");
  }, [booking, open]);

  const options = booking
    ? (NEXT_STATUSES[booking.status] || []).map((value) => ({
        value,
        label: statusLabel(value, booking.booking_kind),
      }))
    : [];

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!booking) return;

    try {
      setSaving(true);
      setError("");
      await onSave({
        status,
        note: note.trim(),
        cancel_reason: status === "cancelled" ? note.trim() : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update status.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move booking</DialogTitle>
          <DialogDescription>
            {booking
              ? `${booking.booking_number} · currently ${statusLabel(
                  booking.status,
                  booking.booking_kind
                )}`
              : "Update status"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {options.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              This booking is closed. Edit it if you need to reopen.
            </p>
          ) : (
            <div className="space-y-2">
              <Label>Next status</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as BookingStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="status-note">Note</Label>
            <Textarea
              id="status-note"
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={
                status === "cancelled"
                  ? "Cancellation reason"
                  : "Optional note"
              }
            />
          </div>

          {error ? (
            <p className="text-sm font-medium text-destructive">{error}</p>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button type="submit" disabled={saving || options.length === 0}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
