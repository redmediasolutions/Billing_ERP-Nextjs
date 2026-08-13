"use client";

import { useMemo, useState } from "react";
import {
  HandCoins,
  Landmark,
  Loader2,
  MinusCircle,
  Plus,
  Search,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { matchesSearch } from "@/lib/erp-search";
import { useUrlSearchParam } from "@/lib/use-url-search";
import { useEmployees } from "@/features/employees/hooks/use-employees";
import {
  useAddDeduction,
  useAddLoan,
  usePayrollDashboard,
} from "../hooks/use-payroll";
import { TransactionFormModal } from "../addform/transaction-form-modal";
import { EmployeePayrollDetails } from "./employee-payroll-details";
import type { PayrollRow } from "../types";

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function PayrollDashboard() {
  const { data: payroll = [], isLoading, error } = usePayrollDashboard();
  const { data: employees = [] } = useEmployees();
  const { value: search, setSearch } = useUrlSearchParam();

  const addLoan = useAddLoan();
  const addDeduction = useAddDeduction();

  const [modalType, setModalType] = useState<"loan" | "deduction" | null>(null);

  const [selectedEmployee, setSelectedEmployee] =
    useState<PayrollRow | null>(null);

  const [actionError, setActionError] = useState("");

  const filteredPayroll = useMemo(() => {
    return payroll.filter((row) =>
      matchesSearch(search, [row.fullName])
    );
  }, [payroll, search]);

  const totalLoans = payroll.reduce(
    (sum, row) => sum + Number(row.totalLoans),
    0
  );

  const totalDeductions = payroll.reduce(
    (sum, row) => sum + Number(row.totalDeductions),
    0
  );

  const outstanding = payroll.reduce(
    (sum, row) => sum + Number(row.remaining),
    0
  );

  async function submitTransaction(data: {
    employeeId: number;
    amount: number;
    date: string;
    title: string;
    notes: string;
  }) {
    try {
      setActionError("");

      if (modalType === "loan") {
        await addLoan.mutateAsync({
          employee_id: data.employeeId,
          amount: data.amount,
          date: data.date,
          reason: data.title,
        });
      }

      if (modalType === "deduction") {
        await addDeduction.mutateAsync({
          employee_id: data.employeeId,
          amount: data.amount,
          date: data.date,
          source: data.title,
          notes: data.notes,
        });
      }

      setModalType(null);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Unable to save payroll transaction."
      );
    }
  }

  return (
    <section className="w-full space-y-6 text-left">
      {/* Header */}
      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Workforce Finance
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Payroll & Loans
          </h1>

          <p className="text-sm text-muted-foreground">
            Track employee loans, deductions, and outstanding balances.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <Button
            onClick={() => setModalType("deduction")}
            variant="outline"
            className="gap-2"
          >
            <MinusCircle className="h-4 w-4" />
            Add Deduction
          </Button>

          <Button
            onClick={() => setModalType("loan")}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Loan
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi
          label="Total Loan Value"
          value={money(totalLoans)}
          icon={<HandCoins className="h-6 w-6" />}
        />

        <Kpi
          label="Total Recovered"
          value={money(totalDeductions)}
          icon={<Landmark className="h-6 w-6" />}
        />

        <Kpi
          label="Outstanding Balance"
          value={money(outstanding)}
          icon={<Users className="h-6 w-6" />}
          highlight
        />
      </div>

      {/* Ledger Table Section */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Employee Loan Ledger
              </h2>

              <p className="text-xs text-muted-foreground">
                Click an employee to view loan and deduction history.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search employee..."
                className="pl-9"
              />
            </div>
          </div>

          {actionError && (
            <p className="text-sm font-medium text-destructive">{actionError}</p>
          )}

          <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[280px]">Employee</TableHead>
                  <TableHead>Total Loans</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-left text-muted-foreground"
                    >
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span>Loading payroll ledger...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-left text-destructive"
                    >
                      Unable to load payroll data.
                    </TableCell>
                  </TableRow>
                ) : filteredPayroll.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-left text-muted-foreground"
                    >
                      No employee loans or deductions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayroll.map((row) => (
                    <TableRow
                      key={row.id}
                      onClick={() => setSelectedEmployee(row)}
                      className="cursor-pointer transition-colors hover:bg-muted/50"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {row.fullName.slice(0, 2).toUpperCase()}
                          </div>

                          <span className="font-medium text-foreground">
                            {row.fullName}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="font-semibold text-foreground">
                        {money(row.totalLoans)}
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {money(row.totalDeductions)}
                      </TableCell>

                      <TableCell className="font-medium text-foreground">
                        {money(row.remaining)}
                      </TableCell>

                      <TableCell className="text-right">
                        <Badge variant="secondary" className="capitalize">
                          {row.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
        </CardContent>
      </Card>

      {modalType && (
        <TransactionFormModal
          type={modalType}
          employees={employees}
          onClose={() => setModalType(null)}
          onSubmit={submitTransaction}
        />
      )}

      {selectedEmployee && (
        <EmployeePayrollDetails
          employeeId={selectedEmployee.id}
          employeeName={selectedEmployee.fullName}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </section>
  );
}

function Kpi({
  label,
  value,
  icon,
  highlight = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-lg ${
            highlight
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              : "bg-primary/10 text-primary"
          }`}
        >
          {icon}
        </div>
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p
            className={`text-2xl font-bold tracking-tight ${
              highlight
                ? "text-amber-600 dark:text-amber-400"
                : "text-foreground"
            }`}
          >
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
