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

import type { Reminder, ReminderSnoozeInput } from "../types";
import { toDateInput } from "../lib/reminder-utils";

function addDaysLocal(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(10, 0, 0, 0);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export function ReminderCompleteDialog({
  reminder,
  open,
  onClose,
  onSave,
}: {
  reminder: Reminder | null;
  open: boolean;
  onClose: () => void;
  onSave: (note: string) => Promise<void>;
}) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setNote("");
    setError("");
  }, [open, reminder?.id]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      await onSave(note.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to complete.");
    } finally {
      setSaving(false);
    }
  }

  const recurring =
    reminder && reminder.recurrence !== "none" && reminder.status !== "completed";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark done</DialogTitle>
          <DialogDescription>
            {reminder?.title}
            {recurring
              ? " — the next due date will be scheduled from your recurrence rule."
              : " — this reminder will be closed."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Note (optional)</Label>
            <Textarea
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional note about what was done"
            />
          </div>

          {error && (
            <p className="text-sm font-medium text-destructive">{error}</p>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ReminderSnoozeDialog({
  reminder,
  open,
  onClose,
  onSave,
}: {
  reminder: Reminder | null;
  open: boolean;
  onClose: () => void;
  onSave: (input: ReminderSnoozeInput) => Promise<void>;
}) {
  const [snoozedUntil, setSnoozedUntil] = useState(addDaysLocal(1));
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setSnoozedUntil(addDaysLocal(1));
    setNote("");
    setError("");
  }, [open, reminder?.id]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!snoozedUntil) {
      setError("Pick when to remind again.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await onSave({
        snoozed_until: toDateInput(snoozedUntil),
        note: note.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to snooze.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Snooze</DialogTitle>
          <DialogDescription>
            Hide &quot;{reminder?.title}&quot; until a later date.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Tomorrow", days: 1 },
              { label: "3 days", days: 3 },
              { label: "1 week", days: 7 },
            ].map((preset) => (
              <Button
                key={preset.days}
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setSnoozedUntil(addDaysLocal(preset.days))}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label>Remind again on</Label>
            <Input
              type="datetime-local"
              value={snoozedUntil}
              onChange={(event) => setSnoozedUntil(event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Note (optional)</Label>
            <Textarea
              rows={2}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm font-medium text-destructive">{error}</p>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Snooze
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
