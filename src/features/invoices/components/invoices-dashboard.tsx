"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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

export function InvoicesDashboard() {
  const router = useRouter();

  const { data: invoices = [], isLoading, error } = useInvoices();
  const deleteInvoice = useDeleteInvoice();

  const draftCount = invoices.filter(
    (invoice) => invoice.is_draft
  ).length;

  const totalValue = invoices.reduce(
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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

        <Button asChild className="gap-2 self-start sm:self-auto">
          <Link href="/dashboard/invoices/new">
            <Plus className="h-4 w-4" />
            New Invoice
          </Link>
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Kpi label="Total Invoices" value={invoices.length} />
        <Kpi label="Draft Invoices" value={draftCount} />
        <Kpi label="Invoice Value" value={money.format(totalValue)} />
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Directory</CardTitle>
          <CardDescription>
            All invoices created in the system.
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
                      className="h-32 text-center text-muted-foreground"
                    >
                      <div className="flex items-center justify-center gap-2">
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
                      className="h-32 text-center text-destructive"
                    >
                      Unable to load invoices.
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading && !error && invoices.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-32 text-center text-muted-foreground"
                    >
                      No invoices created yet.
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading &&
                  invoices.map((invoice) => (
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
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={deleteInvoice.isPending}
                          onClick={() => removeInvoice(invoice.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete invoice</span>
                        </Button>
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
