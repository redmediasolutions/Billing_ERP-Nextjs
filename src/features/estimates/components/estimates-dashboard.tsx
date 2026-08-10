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
import { useUrlSearchParam } from "@/lib/use-url-search";
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
  useDeleteEstimate,
  useEstimates,
} from "../hooks/use-estimates";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export function EstimatesDashboard() {
  const router = useRouter();
  const { value: search, setSearch } = useUrlSearchParam();
  const { data: estimates = [], isLoading, error } = useEstimates();
  const deleteEstimate = useDeleteEstimate();

  const filteredEstimates = useMemo(() => {
    return estimates.filter((estimate) =>
      matchesSearch(search, [
        estimate.estimate_number,
        estimate.customer_name,
        estimate.reference,
        estimate.reference_number,
      ])
    );
  }, [estimates, search]);

  const draftCount = estimates.filter(
    (estimate) => estimate.is_draft
  ).length;

  const expiringSoon = estimates.filter((estimate) => {
    if (!estimate.valid_until) return false;

    const expiry = new Date(estimate.valid_until);
    const today = new Date();
    const inSevenDays = new Date();

    inSevenDays.setDate(today.getDate() + 7);

    return expiry >= today && expiry <= inSevenDays;
  }).length;

  async function removeEstimate(id: number) {
    if (!window.confirm("Archive this estimate?")) return;

    await deleteEstimate.mutateAsync(id);
  }

  return (
    <div className="w-full space-y-8 text-left">
      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Sales
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Estimates
          </h1>
          <p className="text-sm text-muted-foreground">
            View and manage your recent quotes.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Kpi label="Total Estimates" value={filteredEstimates.length} />
        <Kpi label="Draft Estimates" value={draftCount} />
        <Kpi label="Expiring Soon" value={expiringSoon} danger />
      </div>

      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search estimates, customers, or references..."
          className="pl-9"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estimate Directory</CardTitle>
          <CardDescription>
            All estimates created in the system.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estimate #</TableHead>
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
                        <span>Loading estimates...</span>
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
                      Unable to load estimates.
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading && !error && filteredEstimates.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-32 text-left text-muted-foreground"
                    >
                      {search
                        ? "No estimates match your search."
                        : "No estimates created yet."}
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading &&
                  filteredEstimates.map((estimate) => (
                    <TableRow
                      key={estimate.id}
                      className="cursor-pointer transition-colors hover:bg-muted/50"
                      onClick={() =>
                        router.push(`/dashboard/estimates/${estimate.id}`)
                      }
                    >
                      <TableCell className="font-medium text-foreground">
                        {estimate.estimate_number}
                      </TableCell>

                      <TableCell className="text-foreground">
                        {estimate.customer_name ?? "Unknown customer"}
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {estimate.estimate_date
                          ? new Date(estimate.estimate_date).toLocaleDateString(
                              "en-IN"
                            )
                          : "—"}
                      </TableCell>

                      <TableCell className="font-semibold text-foreground">
                        {money.format(estimate.rounded_total)}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={estimate.is_draft ? "secondary" : "default"}
                          className={
                            estimate.is_draft
                              ? ""
                              : "bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700"
                          }
                        >
                          {estimate.is_draft ? "Draft" : "Finalized"}
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
                                `/dashboard/estimates/${estimate.id}/edit`
                              )
                            }
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            title="Edit estimate"
                          >
                            <Edit3 className="h-4 w-4" />
                            <span className="sr-only">Edit estimate</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={deleteEstimate.isPending}
                            onClick={() => removeEstimate(estimate.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Archive estimate</span>
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
  danger = false,
}: {
  label: string;
  value: string | number;
  danger?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            {label}
          </p>
          <p
            className={`text-2xl font-bold tracking-tight ${
              danger ? "text-destructive" : "text-foreground"
            }`}
          >
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
