"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Edit3,
  FileText,
  Loader2,
  Search,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  const { data: invoices = [], isLoading, error } = useInvoices();
  const deleteInvoice = useDeleteInvoice();

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesQuery = matchesSearch(search, [
        invoice.invoice_number,
        invoice.customer_name,
        invoice.reference,
      ]);

      if (!matchesQuery) return false;

      if (statusFilter === "draft") return invoice.is_draft;
      if (statusFilter === "finalized") return !invoice.is_draft;
      if (statusFilter === "overdue") return isOverdue(invoice);

      return true;
    });
  }, [invoices, search, statusFilter]);

  const draftCount = invoices.filter(
    (invoice) => invoice.is_draft
  ).length;

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
  }

  return (
    <div className="w-full space-y-8 text-left">
      {/* Page Header */}
      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Sales
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Invoices
          </h1>
          <p className="text-sm text-muted-foreground">
            Create invoices and manage billing records.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
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

      {/* Main Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Directory</CardTitle>
          <CardDescription>
            {statusFilter
              ? `Showing ${statusFilter} invoices.`
              : "All invoices created in the system."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
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
                    <TableCell
                      colSpan={6}
                      className="h-32 text-left text-muted-foreground"
                    >
                      {search || statusFilter
                        ? "No invoices match your search or filters."
                        : "No invoices created yet."}
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading &&
                  filteredInvoices.map((invoice) => (
                    <TableRow
                      key={invoice.id}
                      className="cursor-pointer transition-colors hover:bg-muted/50"
                      onClick={() =>
                        router.push(`/dashboard/invoices/${invoice.id}`)
                      }
                    >
                      <TableCell className="font-medium text-foreground">
                        {invoice.invoice_number}
                      </TableCell>

                      <TableCell className="text-foreground">
                        {invoice.customer_name ?? "Unknown customer"}
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {invoice.invoice_date
                          ? new Date(invoice.invoice_date).toLocaleDateString(
                              "en-IN"
                            )
                          : "—"}
                      </TableCell>

                      <TableCell className="font-semibold text-foreground">
                        {money.format(invoice.rounded_total)}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={invoice.is_draft ? "secondary" : "default"}
                          className={
                            invoice.is_draft
                              ? ""
                              : "bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700"
                          }
                        >
                          {invoice.is_draft ? "Draft" : "Finalized"}
                        </Badge>
                      </TableCell>

                      <TableCell
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
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
          <p className="text-xs font-medium text-muted-foreground">
            {label}
          </p>
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
