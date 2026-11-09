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

import { useClinicSettings, useUpdateClinicSettings } from "../hooks/use-clinic";
import { errorMessage } from "../lib/clinic-format";

export function ClinicSettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: settings } = useClinicSettings();
  const update = useUpdateClinicSettings();
  const [drName, setDrName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setDrName(settings?.dr_name || "");
      setError("");
    }
  }, [open, settings?.dr_name]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      await update.mutateAsync({ dr_name: drName.trim() });
      onClose();
    } catch (err) {
      setError(errorMessage(err, "Unable to save."));
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Clinic settings</DialogTitle>
          <DialogDescription>
            The doctor&apos;s name is used on prescriptions, new appointments and
            WhatsApp reminders. Clinic name, address and logo come from your
            business profile.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="dr_name">Doctor name</Label>
            <Input id="dr_name" placeholder="Dr. ..." value={drName} onChange={(e) => setDrName(e.target.value)} />
          </div>
          {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={update.isPending}>
              {update.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
