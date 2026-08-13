"use client";

import { FormEvent, useState } from "react";
import { Download, Loader2 } from "lucide-react";

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
  exportEstimatesCsv,
  exportInvoicesCsv,
} from "@/lib/document-csv-export";

type ExportKind = "invoices" | "estimates";

interface CsvExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: ExportKind;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function yearStartIso() {
  const now = new Date();
  return new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
}

export function CsvExportDialog({
  open,
  onOpenChange,
  kind,
}: CsvExportDialogProps) {
  const [mode, setMode] = useState<"range" | "all">("range");
  const [from, setFrom] = useState(yearStartIso);
  const [to, setTo] = useState(todayIso);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const label = kind === "invoices" ? "Invoices" : "Estimates";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setProgress("");

    if (mode === "range") {
      if (!from || !to) {
        setError("Choose both start and end dates.");
        return;
      }

      if (from > to) {
        setError("Start date must be on or before the end date.");
        return;
      }
    }

    try {
      setLoading(true);

      const options = {
        mode,
        from: mode === "range" ? from : undefined,
        to: mode === "range" ? to : undefined,
        onProgress: setProgress,
      };

      if (kind === "invoices") {
        await exportInvoicesCsv(options);
      } else {
        await exportEstimatesCsv(options);
      }

      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to export CSV."
      );
    } finally {
      setLoading(false);
      setProgress("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export {label} CSV</DialogTitle>
          <DialogDescription>
            Downloads one row per line item, including item name, qty, rate,
            tax, and totals.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="space-y-5"
        >
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={mode === "range" ? "default" : "outline"}
              onClick={() => setMode("range")}
              disabled={loading}
            >
              Date range
            </Button>
            <Button
              type="button"
              variant={mode === "all" ? "default" : "outline"}
              onClick={() => setMode("all")}
              disabled={loading}
            >
              Full data
            </Button>
          </div>

          {mode === "range" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="export-from">Start date</Label>
                <Input
                  id="export-from"
                  type="date"
                  value={from}
                  onChange={(event) => setFrom(event.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="export-to">End date</Label>
                <Input
                  id="export-to"
                  type="date"
                  value={to}
                  onChange={(event) => setTo(event.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {mode === "all" && (
            <p className="text-sm text-muted-foreground">
              Exports every non-archived {label.toLowerCase()} and their
              line items for your tenant.
            </p>
          )}

          {progress && (
            <p className="text-sm text-muted-foreground">{progress}</p>
          )}

          {error && (
            <p className="text-sm font-medium text-destructive">{error}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {loading ? "Exporting..." : "Download CSV"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
