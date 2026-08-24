"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  Edit3,
  FileText,
  Loader2,
  Search,
  Trash2,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CsvExportDialog } from "@/components/export/csv-export-dialog";
import { ResizableSplit } from "@/components/layout/resizable-split";
import { InvoicePreviewPanel } from "@/features/documents/components/invoice-preview-panel";
import { matchesSearch } from "@/lib/erp-search";
import { useUrlParam, useUrlSearchParam } from "@/lib/use-url-search";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  useInvoices,
  useDeleteInvoice,
} from "../hooks/use-invoices";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

function isOverdue(invoice: { due_date: string | null; is_draft: boolean }) {
  if (invoice.is_draft || !invoice.due_date) return false;

  const due = new Date(invoice.due_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return due < today;
}

export function InvoicesDashboard() {
  const router = useRouter();
  const { value: search, setSearch } = useUrlSearchParam();
  const statusFilter = useUrlParam("status");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  const { data: invoices = [], isLoading, error } = useInvoices();
  const deleteInvoice = useDeleteInvoice();

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesQuery = matchesSearch(search, [
        invoice.invoice_number,
        invoice.customer_display_name || invoice.customer_name,
        invoice.reference,
      ]);

      if (!matchesQuery) return false;

      if (statusFilter === "draft") return invoice.is_draft;
      if (statusFilter === "finalized") return !invoice.is_draft;
      if (statusFilter === "overdue") return isOverdue(invoice);

      return true;
    });
  }, [invoices, search, statusFilter]);

  const draftCount = invoices.filter((invoice) => invoice.is_draft).length;

  const totalValue = filteredInvoices.reduce(
    (sum, invoice) => sum + invoice.rounded_total,
    0
  );

  async function removeInvoice(id: number) {
    if (
      !window.confirm(
        "Archive this invoice? Stock will be automatically restored."
      )
    ) {
      return;
    }

    await deleteInvoice.mutateAsync(id);

    if (selectedId === id) setSelectedId(null);
  }

  return (
    <div className="w-full text-left">
      {selectedId !== null ? (
        <ResizableSplit
          storageKey="erp-invoice-preview-width"
          left={<InvoiceListPane />}
          right={
            <InvoicePreviewPanel
              invoiceId={selectedId}
              onClose={() => setSelectedId(null)}
            />
          }
        />
      ) : (
        <InvoiceListPane />
      )}

      <CsvExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        kind="invoices"
      />

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );

  function InvoiceListPane() {
    return (
        <div className="min-w-0 space-y-6">
          <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sales
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Invoices
              </h1>
              <p className="text-sm text-muted-foreground">
                Click a row to preview. Drag the divider to resize.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => setExportOpen(true)}
              className="gap-2 self-start"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <Kpi label="Total Invoices" value={filteredInvoices.length} />
            <Kpi label="Draft Invoices" value={draftCount} />
            <Kpi label="Invoice Value" value={money.format(totalValue)} />
          </div>

          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search invoices, customers, or references..."
              className="pl-9"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Invoice Directory</CardTitle>
              <CardDescription>
                {statusFilter
                  ? `Showing ${statusFilter} invoices.`
                  : "Select an invoice to preview on the right."}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {isLoading && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="h-32 text-left text-muted-foreground"
                        >
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            <span>Loading invoices...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {!isLoading && error && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="h-32 text-left text-destructive"
                        >
                          Unable to load invoices.
                        </TableCell>
                      </TableRow>
                    )}

                    {!isLoading && !error && filteredInvoices.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="p-0">
                          <EmptyState
                            icon={FileText}
                            title={
                              search || statusFilter
                                ? "No invoices match your filters"
                                : "No invoices yet"
                            }
                            description={
                              search || statusFilter
                                ? "Try a different search or clear status filters."
                                : "Create your first invoice to start tracking sales."
                            }
                            actionLabel={
                              search || statusFilter
                                ? undefined
                                : "Create First Invoice"
                            }
                            onAction={
                              search || statusFilter
                                ? undefined
                                : () => router.push("/dashboard/invoices/new")
                            }
                          />
                        </TableCell>
                      </TableRow>
                    )}

                    {!isLoading &&
                      filteredInvoices.map((invoice) => (
                        <TableRow
                          key={invoice.id}
                          className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                            selectedId === invoice.id ? "bg-muted/70" : ""
                          }`}
                          onClick={() => setSelectedId(invoice.id)}
                        >
                          <TableCell className="font-medium text-foreground">
                            {invoice.invoice_number}
                          </TableCell>

                          <TableCell className="text-foreground">
                            {invoice.customer_display_name || invoice.customer_name || "Unknown customer"}
                          </TableCell>

                          <TableCell className="text-muted-foreground">
                            {invoice.invoice_date
                              ? new Date(
                                  invoice.invoice_date
                                ).toLocaleDateString("en-IN")
                              : "—"}
                          </TableCell>

                          <TableCell className="font-semibold text-foreground">
                            {money.format(invoice.rounded_total)}
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant={
                                invoice.is_draft ? "secondary" : "default"
                              }
                              className={
                                invoice.is_draft
                                  ? ""
                                  : "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                              }
                            >
                              {invoice.is_draft ? "Draft" : "Finalized"}
                            </Badge>
                          </TableCell>

                          <TableCell
                            className="text-right"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  router.push(
                                    `/dashboard/invoices/${invoice.id}/edit`
                                  )
                                }
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                title="Edit invoice"
                              >
                                <Edit3 className="h-4 w-4" />
                                <span className="sr-only">Edit invoice</span>
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={deleteInvoice.isPending}
                                onClick={() => removeInvoice(invoice.id)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Archive invoice</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
            </CardContent>
          </Card>
        </div>
    );
  }
}

function Kpi({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {value}
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FileText className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}
