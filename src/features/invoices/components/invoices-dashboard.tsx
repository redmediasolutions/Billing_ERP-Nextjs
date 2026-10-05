"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Download,
  Edit3,
  FileText,
  IndianRupee,
  Loader2,
  Search,
  Trash2,
  Wallet,
} from "lucide-react";

import { ConfirmDialog } from "@/components/confirm-dialog";
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

import { RecordPaymentSheet } from "../addform/record-payment-sheet";
import {
  useInvoices,
  useDeleteInvoice,
} from "../hooks/use-invoices";
import {
  collectionLabel,
  collectionStatus,
  invoiceBalance,
  invoicePaid,
  invoicePayable,
  matchesCollectionFilter,
  type InvoiceCollectionStatus,
} from "../lib/invoice-payment";
import type { Invoice } from "../types";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export function InvoicesDashboard() {
  const router = useRouter();
  const { value: search, setSearch } = useUrlSearchParam();
  const statusFilter = useUrlParam("status");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{
    id: number;
    number: string;
  } | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);

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

      return matchesCollectionFilter(invoice, statusFilter);
    });
  }, [invoices, search, statusFilter]);

  const issued = invoices.filter((invoice) => !invoice.is_draft);
  const collected = issued.reduce((sum, invoice) => sum + invoicePaid(invoice), 0);
  const outstanding = issued.reduce((sum, invoice) => sum + invoiceBalance(invoice), 0);
  const overdue = issued.reduce(
    (sum, invoice) =>
      collectionStatus(invoice) === "overdue" ? sum + invoiceBalance(invoice) : sum,
    0
  );

  async function confirmDeleteInvoice() {
    if (!pendingDelete) return;

    await deleteInvoice.mutateAsync(pendingDelete.id);

    if (selectedId === pendingDelete.id) setSelectedId(null);
    setPendingDelete(null);
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

      <RecordPaymentSheet
        invoice={paymentInvoice}
        open={paymentInvoice !== null}
        onOpenChange={(next) => {
          if (!next) setPaymentInvoice(null);
        }}
      />

      <CsvExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        kind="invoices"
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this invoice?"
        description={`Are you sure you want to archive ${pendingDelete?.number || "this invoice"}? Stock will be restored if it was finalized.`}
        confirmLabel="Yes, delete"
        pending={deleteInvoice.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void confirmDeleteInvoice()}
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
                Click a row to preview.
                <span className="hidden lg:inline"> Drag the divider to resize.</span>
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

          <div className="grid gap-4 sm:grid-cols-3">
            <Kpi
              label="Collected"
              value={money.format(collected)}
              hint="Received on finalized invoices"
              icon={Wallet}
            />
            <Kpi
              label="Outstanding"
              value={money.format(outstanding)}
              hint="Still to collect"
              icon={IndianRupee}
            />
            <Kpi
              label="Overdue"
              value={money.format(overdue)}
              hint="Balance past the due date"
              icon={AlertTriangle}
            />
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
                            <div>{money.format(invoicePayable(invoice))}</div>
                            {!invoice.is_draft && (
                              <p className="text-xs font-normal text-muted-foreground">
                                Received {money.format(invoicePaid(invoice))}
                                {" · "}
                                Due {money.format(invoiceBalance(invoice))}
                              </p>
                            )}
                          </TableCell>

                          <TableCell>
                            <CollectionBadge invoice={invoice} />
                          </TableCell>

                          <TableCell
                            className="text-right"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={invoice.is_draft}
                                title={
                                  invoice.is_draft
                                    ? "Finalize the invoice before recording a payment"
                                    : "Record payment"
                                }
                                onClick={() => setPaymentInvoice(invoice)}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              >
                                <Wallet className="h-4 w-4" />
                                <span className="sr-only">Record payment</span>
                              </Button>
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
                                onClick={() =>
                                  setPendingDelete({
                                    id: invoice.id,
                                    number: invoice.invoice_number,
                                  })
                                }
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
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof FileText;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 p-6">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {value}
          </p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}

function CollectionBadge({ invoice }: { invoice: Invoice }) {
  const status = collectionStatus(invoice);
  return (
    <Badge variant="secondary" className={badgeClass(status)}>
      {collectionLabel(status)}
    </Badge>
  );
}

function badgeClass(status: InvoiceCollectionStatus) {
  if (status === "paid") {
    return "bg-emerald-600 text-white hover:bg-emerald-700";
  }
  if (status === "partial") {
    return "bg-amber-500 text-white hover:bg-amber-600";
  }
  if (status === "overdue") {
    return "bg-destructive text-white hover:bg-destructive/90";
  }
  return "";
}
