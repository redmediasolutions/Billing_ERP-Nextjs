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
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto border-zinc-800 bg-[#1e1e24] text-white">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-2xl">
            {employeeName}
          </DialogTitle>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-zinc-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center p-12 text-zinc-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : error || !data ? (
          <p className="p-6 text-red-300">
            Unable to load employee payroll details.
          </p>
        ) : (
          <div className="space-y-6 pt-3">
            <div className="grid gap-4 md:grid-cols-3">
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
    <div className="rounded-xl border border-zinc-800 bg-[#151517] p-4">
      <p className="text-xs font-bold uppercase text-zinc-500">
        {label}
      </p>

      <p
        className={`mt-2 text-xl font-black ${
          highlight ? "text-[#FFCC00]" : "text-white"
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
    <div className="overflow-hidden rounded-xl border border-zinc-800">
      <div className="border-b border-zinc-800 bg-[#151517] px-5 py-4">
        <h3 className="font-bold">{title}</h3>
      </div>

      <table className="w-full text-left text-sm">
        <thead className="border-b border-zinc-800 text-xs uppercase text-zinc-500">
          <tr>
            <th className="px-5 py-3">Date</th>
            <th className="px-5 py-3">Details</th>
            <th className="px-5 py-3 text-right">Amount</th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={3} className="p-6 text-center text-zinc-500">
                No records found.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-zinc-800/70 last:border-0"
              >
                <td className="px-5 py-4 text-zinc-400">
                  {row.date
                    ? new Date(row.date).toLocaleDateString("en-IN")
                    : "—"}
                </td>

                <td className="px-5 py-4 font-medium">
                  {row[titleKey] || "—"}
                </td>

                <td className="px-5 py-4 text-right font-bold text-[#FFCC00]">
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