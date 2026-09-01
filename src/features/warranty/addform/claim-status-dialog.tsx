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

import { claimStatusLabel } from "../lib/warranty-utils";
import type {
  ClaimResolution,
  ClaimStatus,
  ClaimStatusInput,
  WarrantyClaim,
} from "../types";
import { CLAIM_RESOLUTIONS, CLAIM_STATUSES } from "../types";

export function ClaimStatusDialog({
  claim,
  open,
  onClose,
  onSave,
}: {
  claim: WarrantyClaim | null;
  open: boolean;
  onClose: () => void;
  onSave: (input: ClaimStatusInput) => Promise<void>;
}) {
  const [status, setStatus] = useState<ClaimStatus>("submitted");
  const [resolution, setResolution] = useState<ClaimResolution>("none");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!claim || !open) return;
    setStatus(claim.status);
    setResolution(claim.resolution_type || "none");
    setNote("");
    setError("");
  }, [claim, open]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!note.trim() && status === claim?.status) {
      setError("Add a note or change the status.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await onSave({
        status,
        note: note.trim(),
        resolution_type: resolution,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update claim.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Move claim</DialogTitle>
            <DialogDescription>
              {claim
                ? `${claim.claim_number} · currently ${claimStatusLabel(claim.status)}`
                : "Update claim workflow"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as ClaimStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLAIM_STATUSES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Resolution</Label>
            <Select
              value={resolution}
              onValueChange={(value) =>
                setResolution(value as ClaimResolution)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLAIM_RESOLUTIONS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="claim-note">Note</Label>
            <Textarea
              id="claim-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="What did the tech find? What should the customer know?"
            />
          </div>

          {error ? (
            <p className="text-sm font-medium text-destructive">{error}</p>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
