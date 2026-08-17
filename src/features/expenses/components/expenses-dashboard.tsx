"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  IndianRupee,
  Copy,
  Edit3,
  FolderOpen,
  Loader2,
  MoreHorizontal,
  Package,
  Plus,
  Repeat,
  Search,
  Trash2,
  Truck,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { matchesSearch } from "@/lib/erp-search";
import { useUrlParam, useUrlSearchParam } from "@/lib/use-url-search";

import { ExpenseCategoriesDialog } from "../addform/expense-categories-dialog";
import { ExpenseFormSheet } from "../addform/expense-form-sheet";
import {
  useCreateExpense,
  useDeleteExpense,
  useExpenseSummary,
  useExpenses,
  useUpdateExpense,
} from "../hooks/use-expenses";
import type { Expense, ExpenseInput } from "../types";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

type FilterKey = "all" | "month" | "unpaid" | "parts" | "parcel" | "recurring";

function isThisMonth(dateStr: string) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const now = new Date();
  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

export function ExpensesDashboard() {
  const { data: expenses = [], isLoading, error } = useExpenses();
  const { data: summary } = useExpenseSummary();
  const { value: search, setSearch } = useUrlSearchParam();
  const filter = (useUrlParam("filter") || "all") as FilterKey;

  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  const [formOpen, setFormOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [actionError, setActionError] = useState("");

  const lastExpense = expenses[0] ?? null;

  const filtered = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesQuery = matchesSearch(search, [
        expense.expense_name,
        expense.category_name,
        expense.display_vendor_name,
        expense.vendor_name,
        expense.payment_mode,
        expense.bill_number,
        expense.employee_name,
      ]);

      if (!matchesQuery) return false;
      if (filter === "month") return isThisMonth(expense.expense_date);
      if (filter === "unpaid") return expense.payment_status === "unpaid";
      if (filter === "parts") return expense.is_parts_purchase;
      if (filter === "parcel") return expense.is_parcel_charge;
      if (filter === "recurring") return expense.is_recurring;
      return true;
    });
  }, [expenses, filter, search]);

  function openCreate(seed?: Expense | null) {
    setEditing(
      seed
        ? {
            ...seed,
            id: 0,
            expense_date: new Date().toISOString().slice(0, 10),
            payment_status: "paid",
          }
        : null
    );
    setActionError("");
    setFormOpen(true);
  }

  function openEdit(expense: Expense) {
    setEditing(expense);
    setActionError("");
    setFormOpen(true);
  }

  async function saveExpense(input: ExpenseInput) {
    if (editing && editing.id) {
      await updateExpense.mutateAsync({ id: editing.id, input });
    } else {
      await createExpense.mutateAsync(input);
    }
    setFormOpen(false);
    setEditing(null);
  }

  async function markPaid(expense: Expense) {
    try {
      setActionError("");
      await updateExpense.mutateAsync({
        id: expense.id,
        input: {
          expense_name: expense.expense_name,
          expense_date: expense.expense_date,
          amount: expense.amount,
          tax_rate: expense.tax_rate,
          tax_inclusive: expense.tax_inclusive,
          category_ref: expense.category_ref,
          vendor_ref: expense.vendor_ref,
          vendor_name: expense.vendor_name || "",
          employee_ref: expense.employee_ref,
          description: expense.description || "",
          payment_mode: expense.payment_mode || "UPI",
          payment_status: "paid",
          bill_number: expense.bill_number || "",
          receipt_url: expense.receipt_url || "",
          is_recurring: expense.is_recurring,
          recurrence_interval: expense.recurrence_interval || "monthly",
          next_due_date: expense.next_due_date || "",
          is_parts_purchase: expense.is_parts_purchase,
          is_parcel_charge: expense.is_parcel_charge,
          is_reimbursable: expense.is_reimbursable,
        },
      });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to mark paid.");
    }
  }

  async function removeExpense(expense: Expense) {
    const confirmed = window.confirm(`Archive "${expense.expense_name}"?`);
    if (!confirmed) return;

    try {
      setActionError("");
      await deleteExpense.mutateAsync(expense.id);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Unable to archive expense."
      );
    }
  }

  const filters: Array<{ key: FilterKey; label: string; href: string }> = [
    { key: "all", label: "All", href: "/dashboard/expenses" },
    { key: "month", label: "This month", href: "/dashboard/expenses?filter=month" },
    { key: "unpaid", label: "Unpaid", href: "/dashboard/expenses?filter=unpaid" },
    { key: "parts", label: "Parts", href: "/dashboard/expenses?filter=parts" },
    { key: "parcel", label: "Parcel", href: "/dashboard/expenses?filter=parcel" },
    {
      key: "recurring",
      label: "Recurring",
      href: "/dashboard/expenses?filter=recurring",
    },
  ];

  return (
    <section className="w-full space-y-6 text-left">
      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Accounts
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Expenses
          </h1>
          <p className="text-sm text-muted-foreground">
            Log spend in one pass — categories, vendors, GST, and flags without
            extra screens.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setCategoriesOpen(true)}
          >
            <FolderOpen className="h-4 w-4" />
            Categories
          </Button>
          <Button className="gap-2" onClick={() => openCreate()}>
            <Plus className="h-4 w-4" />
            Add expense
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="This month"
          value={money.format(summary?.this_month ?? 0)}
          hint={`Last month ${money.format(summary?.last_month ?? 0)}`}
          icon={IndianRupee}
        />
        <KpiCard
          title="Unpaid"
          value={money.format(summary?.unpaid ?? 0)}
          hint="Still to be settled"
          icon={Repeat}
        />
        <KpiCard
          title="Parts this month"
          value={money.format(summary?.parts_this_month ?? 0)}
          hint="Spare parts flagged"
          icon={Package}
        />
        <KpiCard
          title="Parcel this month"
          value={money.format(summary?.parcel_this_month ?? 0)}
          hint="Courier charges flagged"
          icon={Truck}
        />
      </div>

      {summary?.by_category?.length ? (
        <div className="flex flex-wrap gap-2">
          {summary.by_category.map((row) => (
            <Badge key={row.category_name} variant="secondary">
              {row.category_name}: {money.format(row.total)}
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, vendor, bill no..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <Button
              key={item.key}
              size="sm"
              variant={filter === item.key ? "default" : "outline"}
              asChild
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </div>
      </div>

      {actionError ? (
        <p className="text-sm font-medium text-destructive">{actionError}</p>
      ) : null}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Loading expenses...
            </div>
          ) : error ? (
            <div className="flex h-64 flex-col items-start justify-center gap-2 p-6 text-left">
              <p className="text-sm font-medium text-destructive">
                Unable to load expenses.
              </p>
              <p className="max-w-xl text-xs text-muted-foreground">
                {(() => {
                  const apiMessage =
                    error instanceof Error ? error.message.trim() : "";
                  const isGeneric =
                    !apiMessage ||
                    /^unable to load expenses\.?$/i.test(apiMessage) ||
                    /^something went wrong\.?$/i.test(apiMessage);

                  if (!isGeneric) return apiMessage;

                  return "Check that /expenses is mounted on the server, the expense tables exist in MySQL, and pm2 was restarted.";
                })()}
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={IndianRupee}
              title={
                search || filter !== "all"
                  ? "No expenses match your filters"
                  : "No expenses yet"
              }
              description={
                search || filter !== "all"
                  ? "Clear search or filters to see all expenses."
                  : "Add the first one — categories will be created for you."
              }
              actionLabel={
                search || filter !== "all" ? undefined : "Add First Expense"
              }
              onAction={
                search || filter !== "all" ? undefined : () => openCreate()
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expense</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{expense.expense_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {expense.expense_date
                            ? new Date(expense.expense_date).toLocaleDateString(
                                "en-IN"
                              )
                            : "—"}
                          {expense.bill_number ? ` · ${expense.bill_number}` : ""}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {expense.is_parts_purchase ? (
                            <Badge variant="outline">Parts</Badge>
                          ) : null}
                          {expense.is_parcel_charge ? (
                            <Badge variant="outline">Parcel</Badge>
                          ) : null}
                          {expense.is_recurring ? (
                            <Badge variant="secondary">Recurring</Badge>
                          ) : null}
                          {expense.is_reimbursable ? (
                            <Badge variant="secondary">
                              {expense.employee_name || "Reimburse"}
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {expense.category_name || "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {expense.display_vendor_name || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm">{expense.payment_mode || "—"}</p>
                        <Badge
                          variant={
                            expense.payment_status === "unpaid"
                              ? "outline"
                              : "secondary"
                          }
                        >
                          {expense.payment_status === "unpaid" ? "Unpaid" : "Paid"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {money.format(expense.total_amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(expense)}>
                            <Edit3 className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openCreate(expense)}>
                            <Copy className="h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          {expense.payment_status === "unpaid" ? (
                            <DropdownMenuItem onClick={() => markPaid(expense)}>
                              <IndianRupee className="h-4 w-4" />
                              Mark paid
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => removeExpense(expense)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Archive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ExpenseFormSheet
        open={formOpen}
        expense={editing}
        lastExpense={lastExpense}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={saveExpense}
      />

      <ExpenseCategoriesDialog
        open={categoriesOpen}
        onClose={() => setCategoriesOpen(false)}
      />
    </section>
  );
}

function KpiCard({
  title,
  value,
  hint,
  icon: Icon,
}: {
  title: string;
  value: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}
