"use client";

import { Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEmployeePayroll } from "../hooks/use-payroll";

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function EmployeePayrollDetails({
  employeeId,
  employeeName,
  onClose,
}: {
  employeeId: number;
  employeeName: string;
  onClose: () => void;
}) {
  const { data, isLoading, error } =
    useEmployeePayroll(employeeId);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="form-dialog">
        <DialogHeader>
          <DialogTitle>{employeeName}</DialogTitle>

          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        {isLoading ? (
          <div className="payroll-details__loading">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : error || !data ? (
          <p className="payroll-details__error">
            Unable to load employee payroll details.
          </p>
        ) : (
          <div className="payroll-details">
            <div className="payroll-details__summary">
              <Summary
                label="Total Loans"
                value={money(data.summary.totalLoans)}
              />

              <Summary
                label="Total Deductions"
                value={money(data.summary.totalDeductions)}
              />

              <Summary
                label="Outstanding Balance"
                value={money(data.summary.remaining)}
                highlight
              />
            </div>

            <TransactionTable
              title="Loan History"
              rows={data.loans}
              titleKey="reason"
            />

            <TransactionTable
              title="Deduction History"
              rows={data.deductions}
              titleKey="source"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Summary({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="payroll-details__summary-card">
      <p className="payroll-details__summary-label">{label}</p>

      <p
        className={`payroll-details__summary-value${
          highlight ? " payroll-kpi__value--highlight" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

type TransactionRow = {
  id: number;
  date: string;
  amount: number | string;
  reason?: string | null;
  source?: string | null;
};

function TransactionTable({
  title,
  rows,
  titleKey,
}: {
  title: string;
  rows: TransactionRow[];
  titleKey: "reason" | "source";
}) {
  return (
    <div className="payroll-details__table-block">
      <div className="payroll-details__table-head">
        <h3 className="payroll-details__table-title">{title}</h3>
      </div>

      <table className="payroll-details__table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Details</th>
            <th style={{ textAlign: "right" }}>Amount</th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={3} className="payroll-details__summary-label" style={{ textAlign: "center", padding: 24 }}>
                No records found.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="payroll-details__row">
                <td>
                  {row.date
                    ? new Date(row.date).toLocaleDateString("en-IN")
                    : "—"}
                </td>

                <td>{row[titleKey] || "—"}</td>

                <td className="payroll-details__amount">
                  {money(Number(row.amount || 0))}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}