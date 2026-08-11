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
  downloadCsvFile,
  inDateRange,
  rowsToCsv,
  toIsoDate,
} from "@/lib/csv";
import { invoicesService } from "@/features/invoices/services/invoices.service";
import { estimatesService } from "@/features/estimates/services/estimates.service";

type ExportKind = "invoices" | "estimates";

interface CsvExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: ExportKind;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function monthStartIso() {
  const now = new Date();
  // Default to start of current year so typical ERP date ranges include older docs
  return new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
}

export function CsvExportDialog({
  open,
  onOpenChange,
  kind,
}: CsvExportDialogProps) {
  const [mode, setMode] = useState<"range" | "all">("range");
  const [from, setFrom] = useState(monthStartIso);
  const [to, setTo] = useState(todayIso);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const label = kind === "invoices" ? "Invoices" : "Estimates";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

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

      const stamp = mode === "all" ? "all" : `${from}_to_${to}`;
      const filename = `${kind}-export-${stamp}.csv`;

      if (kind === "invoices") {
        const invoices = await invoicesService.list();
        const filtered = invoices.filter((invoice) =>
          mode === "all"
            ? true
            : inDateRange(
                invoice.invoice_date || invoice.created_at,
                from,
                to
              )
        );

        const headers = [
          "Invoice Number",
          "Invoice Date",
          "Due Date",
          "Status",
          "Sales Channel",
          "Order Type",
          "Customer Name",
          "Billing Address",
          "Delivery Address",
          "Payment Terms",
          "Subtotal",
          "Discount",
          "Tax",
          "Grand Total",
          "Rounded Total",
          "Notes",
          "Created At",
        ];

        const rows = filtered.map((invoice) => ({
          "Invoice Number": invoice.invoice_number,
          "Invoice Date": toIsoDate(invoice.invoice_date),
          "Due Date": toIsoDate(invoice.due_date),
          Status: invoice.is_draft ? "Draft" : "Finalized",
          "Sales Channel": invoice.sales_channel || "",
          "Order Type": invoice.order_type || "",
          "Customer Name": invoice.customer_name || "",
          "Billing Address": invoice.custom_billing_address || "",
          "Delivery Address": invoice.custom_delivery_address || "",
          "Payment Terms": invoice.payment_terms || "",
          Subtotal: invoice.subtotal,
          Discount: invoice.discount_amount,
          Tax: invoice.tax_amount,
          "Grand Total": invoice.grand_total,
          "Rounded Total": invoice.rounded_total,
          Notes: invoice.notes || "",
          "Created At": invoice.created_at || "",
        }));

        if (rows.length === 0) {
          setError(
            mode === "all"
              ? "No invoices to export."
              : "No invoices found in this date range."
          );
          return;
        }

        downloadCsvFile(filename, rowsToCsv(headers, rows));
      } else {
        const estimates = await estimatesService.list();
        const filtered = estimates.filter((estimate) =>
          mode === "all"
            ? true
            : inDateRange(
                estimate.estimate_date || estimate.created_at,
                from,
                to
              )
        );

        const headers = [
          "Estimate Number",
          "Reference Number",
          "Estimate Date",
          "Valid Until",
          "Status",
          "Customer Name",
          "Billing Address",
          "Delivery Address",
          "Payment Terms",
          "Subtotal",
          "Discount",
          "Tax",
          "Grand Total",
          "Rounded Total",
          "Notes",
          "Created At",
        ];

        const rows = filtered.map((estimate) => ({
          "Estimate Number": estimate.estimate_number,
          "Reference Number": estimate.reference_number || "",
          "Estimate Date": toIsoDate(estimate.estimate_date),
          "Valid Until": toIsoDate(estimate.valid_until),
          Status: estimate.is_draft ? "Draft" : "Finalized",
          "Customer Name": estimate.customer_name || "",
          "Billing Address": estimate.custom_billing_address || "",
          "Delivery Address": estimate.custom_delivery_address || "",
          "Payment Terms": estimate.payment_terms || "",
          Subtotal: estimate.subtotal,
          Discount: estimate.total_discount,
          Tax: estimate.total_tax,
          "Grand Total": estimate.grand_total,
          "Rounded Total": estimate.rounded_total,
          Notes: estimate.notes || "",
          "Created At": estimate.created_at || "",
        }));

        if (rows.length === 0) {
          setError(
            mode === "all"
              ? "No estimates to export."
              : "No estimates found in this date range."
          );
          return;
        }

        downloadCsvFile(filename, rowsToCsv(headers, rows));
      }

      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to export CSV."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export {label} CSV</DialogTitle>
          <DialogDescription>
            Download a spreadsheet-ready CSV. Use a date range or export
            everything for this business.
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
            >
              Date range
            </Button>
            <Button
              type="button"
              variant={mode === "all" ? "default" : "outline"}
              onClick={() => setMode("all")}
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="export-to">End date</Label>
                <Input
                  id="export-to"
                  type="date"
                  value={to}
                  onChange={(event) => setTo(event.target.value)}
                />
              </div>
            </div>
          )}

          {mode === "all" && (
            <p className="text-sm text-muted-foreground">
              Exports every non-archived {label.toLowerCase()} for your
              tenant.
            </p>
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
