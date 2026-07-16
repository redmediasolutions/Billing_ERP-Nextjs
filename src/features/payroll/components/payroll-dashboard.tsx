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
  const { data: payroll = [], isLoading, error } =
    usePayrollDashboard();

  const { data: employees = [] } = useEmployees();

  const addLoan = useAddLoan();
  const addDeduction = useAddDeduction();

  const [search, setSearch] = useState("");
  const [modalType, setModalType] = useState<
    "loan" | "deduction" | null
  >(null);

  const [selectedEmployee, setSelectedEmployee] =
    useState<PayrollRow | null>(null);

  const [actionError, setActionError] = useState("");

  const filteredPayroll = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return payroll;

    return payroll.filter((row) =>
      row.fullName.toLowerCase().includes(term)
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
    <section className="min-h-screen bg-[#111113] p-5 pt-20 text-white lg:p-8 lg:pt-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#FFCC00]">
            Workforce Finance
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Payroll & Loans
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Track employee loans, deductions, and outstanding balances.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => setModalType("deduction")}
            variant="outline"
            className="border-zinc-600 bg-[#1e1e24]"
          >
            <MinusCircle className="mr-2 h-4 w-4" />
            Add Deduction
          </Button>

          <Button
            onClick={() => setModalType("loan")}
            className="bg-[#FFCC00] font-bold text-black hover:bg-yellow-400"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Loan
          </Button>
        </div>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-3">
        <Kpi
          label="Total Loan Value"
          value={money(totalLoans)}
          icon={<HandCoins />}
        />

        <Kpi
          label="Total Recovered"
          value={money(totalDeductions)}
          icon={<Landmark />}
        />

        <Kpi
          label="Outstanding Balance"
          value={money(outstanding)}
          icon={<Users />}
          highlight
        />
      </div>

      <Card className="mt-7 border-zinc-800 bg-[#1e1e24] text-white">
        <CardContent className="p-0">
          <div className="flex flex-col gap-4 border-b border-zinc-800 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold">
                Employee Loan Ledger
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Click an employee to view loan and deduction history.
              </p>
            </div>

            <div className="relative w-full md:w-[320px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

              <Input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search employee..."
                className="border-zinc-700 bg-[#151517] pl-10"
              />
            </div>
          </div>

          {actionError && (
            <p className="mx-5 mt-5 rounded-xl border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-300">
              {actionError}
            </p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-zinc-800 text-xs uppercase text-zinc-400">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Total Loans</th>
                  <th className="px-6 py-4">Deductions</th>
                  <th className="px-6 py-4">Remaining</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-14 text-center text-zinc-400"
                    >
                      <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin" />
                      Loading payroll ledger...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-14 text-center text-red-300"
                    >
                      Unable to load payroll data.
                    </td>
                  </tr>
                ) : filteredPayroll.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-14 text-center text-zinc-500"
                    >
                      No employee loans or deductions found.
                    </td>
                  </tr>
                ) : (
                  filteredPayroll.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() =>
                        setSelectedEmployee(row)
                      }
                      className="cursor-pointer border-b border-zinc-800/70 transition hover:bg-zinc-800/30"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFCC00]/15 font-bold text-[#FFCC00]">
                            {row.fullName
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>

                          <span className="font-bold">
                            {row.fullName}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-5 font-semibold">
                        {money(row.totalLoans)}
                      </td>

                      <td className="px-6 py-5 font-semibold text-emerald-400">
                        {money(row.totalDeductions)}
                      </td>

                      <td className="px-6 py-5 text-lg font-black text-[#FFCC00]">
                        {money(row.remaining)}
                      </td>

                      <td className="px-6 py-5">
                        <Badge
                          className={
                            row.status === "Active"
                              ? "bg-yellow-500/15 text-yellow-300 hover:bg-yellow-500/15"
                              : "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15"
                          }
                        >
                          {row.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
    <Card className="border-zinc-800 bg-[#1e1e24] text-white">
      <CardContent className="p-5">
        <div className="mb-4 text-[#FFCC00]">
          {icon}
        </div>

        <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
          {label}
        </p>

        <p
          className={`mt-2 text-3xl font-bold ${
            highlight ? "text-[#FFCC00]" : "text-white"
          }`}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}