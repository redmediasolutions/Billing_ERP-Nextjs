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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import type { Enquiry, EnquiryStatus, EnquiryUpdateInput } from "../types";
import { ENQUIRY_STATUSES } from "../types";

function toLocal(value: string | null | undefined) {
  if (!value) return "";
  const text = String(value);
  if (text.includes("T")) return text.slice(0, 16);
  if (text.includes(" ")) return text.replace(" ", "T").slice(0, 16);
  return text.slice(0, 16);
}

export function EnquiryUpdateDialog({
  enquiry,
  open,
  onClose,
  onSave,
}: {
  enquiry: Enquiry | null;
  open: boolean;
  onClose: () => void;
  onSave: (input: EnquiryUpdateInput) => Promise<void>;
}) {
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<EnquiryStatus>("new");
  const [followUpAt, setFollowUpAt] = useState("");
  const [lostReason, setLostReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enquiry || !open) return;
    setNote("");
    setStatus(enquiry.status);
    setFollowUpAt(toLocal(enquiry.follow_up_at));
    setLostReason(enquiry.lost_reason || "");
    setError("");
  }, [enquiry, open]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!note.trim() && status === enquiry?.status && !followUpAt) {
      setError("Add a note or change status / follow-up.");
      return;
    }
    if (status === "lost" && !lostReason.trim()) {
      setError("Add a lost reason.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await onSave({
        note: note.trim(),
        status,
        follow_up_at: followUpAt,
        lost_reason: lostReason.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add update.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick update</DialogTitle>
          <DialogDescription>
            {enquiry?.display_customer_name || enquiry?.customer_name || "Enquiry"}
            {enquiry?.display_phone ? ` · ${enquiry.display_phone}` : ""}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="update-note">What happened?</Label>
            <Textarea
              id="update-note"
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Called, WhatsApp sent, waiting for quote..."
              autoFocus
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as EnquiryStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENQUIRY_STATUSES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="update-followup">Next follow-up</Label>
              <Input
                id="update-followup"
                type="datetime-local"
                value={followUpAt}
                onChange={(event) => setFollowUpAt(event.target.value)}
              />
            </div>
          </div>

          {status === "lost" ? (
            <div className="space-y-2">
              <Label htmlFor="update-lost">Lost reason</Label>
              <Input
                id="update-lost"
                value={lostReason}
                onChange={(event) => setLostReason(event.target.value)}
                placeholder="Why did we lose this?"
              />
            </div>
          ) : null}

          {error ? (
            <p className="text-sm font-medium text-destructive">{error}</p>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
