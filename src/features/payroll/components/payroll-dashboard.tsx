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
    <section className="payroll-dashboard">
      <div className="payroll-dashboard__header">
        <div>
          <p className="payroll-dashboard__eyebrow">
            Workforce Finance
          </p>

          <h1 className="payroll-dashboard__title">
            Payroll & Loans
          </h1>

          <p className="payroll-dashboard__intro">
            Track employee loans, deductions, and outstanding balances.
          </p>
        </div>

        <div className="payroll-dashboard__actions">
          <Button
            onClick={() => setModalType("deduction")}
            variant="outline"
            className="payroll-dashboard__secondary-action"
          >
            <MinusCircle className="mr-2 h-4 w-4" />
            Add Deduction
          </Button>

          <Button
            onClick={() => setModalType("loan")}
            className="payroll-dashboard__primary-action"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Loan
          </Button>
        </div>
      </div>

      <div className="payroll-dashboard__kpis">
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

      <Card className="payroll-ledger">
        <CardContent style={{ padding: 0 }}>
          <div className="payroll-ledger__head">
            <div>
              <h2 className="payroll-ledger__title">
                Employee Loan Ledger
              </h2>

              <p className="payroll-ledger__subtitle">
                Click an employee to view loan and deduction history.
              </p>
            </div>

            <div className="payroll-ledger__search">
              <Search className="payroll-ledger__search-icon" />

              <Input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search employee..."
                className="payroll-ledger__search-input"
              />
            </div>
          </div>

          {actionError && (
            <p className="payroll-ledger__error">{actionError}</p>
          )}

          <div className="payroll-ledger__table-scroll">
            <table className="payroll-ledger__table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Total Loans</th>
                  <th>Deductions</th>
                  <th>Remaining</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="payroll-ledger__state">
                      <Loader2 className="payroll-ledger__spinner" />
                      Loading payroll ledger...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="payroll-ledger__state payroll-ledger__state--error">
                      Unable to load payroll data.
                    </td>
                  </tr>
                ) : filteredPayroll.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="payroll-ledger__state">
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
                      className="payroll-ledger__row"
                    >
                      <td>
                        <div className="payroll-ledger__employee">
                          <div className="payroll-ledger__avatar">
                            {row.fullName
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>

                          <span className="payroll-ledger__name">
                            {row.fullName}
                          </span>
                        </div>
                      </td>

                      <td style={{ fontWeight: 700 }}>
                        {money(row.totalLoans)}
                      </td>

                      <td className="payroll-ledger__deductions">
                        {money(row.totalDeductions)}
                      </td>

                      <td className="payroll-ledger__remaining">
                        {money(row.remaining)}
                      </td>

                      <td>
                        <Badge className="payroll-ledger__badge">
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
    <Card className="payroll-kpi">
      <CardContent>
        <div className="payroll-kpi__icon">{icon}</div>

        <p className="payroll-kpi__label">{label}</p>

        <p
          className={`payroll-kpi__value${
            highlight ? " payroll-kpi__value--highlight" : ""
          }`}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}