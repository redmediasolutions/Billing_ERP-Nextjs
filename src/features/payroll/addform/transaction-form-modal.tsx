"use client";

import { FormEvent, useState } from "react";
import { Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import type { Employee } from "@/features/employees/types";

type TransactionType = "loan" | "deduction";

type TransactionFormData = {
  employeeId: number;
  amount: number;
  date: string;
  title: string;
  notes: string;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function TransactionFormModal({
  type,
  employees,
  onClose,
  onSubmit,
}: {
  type: TransactionType;
  employees: Employee[];
  onClose: () => void;
  onSubmit: (data: TransactionFormData) => Promise<void>;
}) {
  const [employeeId, setEmployeeId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isLoan = type === "loan";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!employeeId) {
      setError("Please select an employee.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    if (!title.trim()) {
      setError(
        isLoan
          ? "Loan reason is required."
          : "Deduction source is required."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      await onSubmit({
        employeeId: Number(employeeId),
        amount: Number(amount),
        date,
        title: title.trim(),
        notes: notes.trim(),
      });

      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save transaction."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-zinc-800 bg-[#1e1e24] text-white">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-2xl">
            {isLoan ? "Add Employee Loan" : "Add Deduction"}
          </DialogTitle>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-zinc-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <Field label="Employee *">
            <select
              value={employeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
              disabled={employees.length === 0 || saving}
              className="h-12 w-full rounded-md border border-zinc-700 bg-[#151517] px-3 text-white outline-none focus:border-[#ffcc00] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {employees.length === 0
                  ? "No employees available"
                  : "Select employee"}
              </option>

              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.full_name}
                  {employee.empId ? ` (${employee.empId})` : ""}
                </option>
              ))}
            </select>

            {employees.length === 0 ? (
              <p className="mt-2 text-xs text-amber-300">
                Add an employee before creating a loan or deduction.
              </p>
            ) : null}
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Amount (₹) *">
              <Input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                disabled={saving}
                className="border-zinc-700 bg-[#151517]"
              />
            </Field>

            <Field label="Date *">
              <Input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                disabled={saving}
                className="border-zinc-700 bg-[#151517]"
              />
            </Field>
          </div>

          <Field label={isLoan ? "Loan Reason *" : "Deduction Source *"}>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={saving}
              placeholder={
                isLoan
                  ? "e.g. Personal emergency loan"
                  : "e.g. Salary advance recovery"
              }
              className="border-zinc-700 bg-[#151517]"
            />
          </Field>

          {!isLoan ? (
            <Field label="Notes">
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                disabled={saving}
                placeholder="Optional deduction notes..."
                className="min-h-24 border-zinc-700 bg-[#151517]"
              />
            </Field>
          ) : null}

          {error ? (
            <p className="rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-300">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-3 border-t border-zinc-800 pt-5">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={onClose}
              className="border-zinc-600 bg-transparent"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={saving || employees.length === 0}
              className="bg-[#ffcc00] font-bold text-black hover:bg-yellow-400"
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}

              {isLoan ? "Add Loan" : "Add Deduction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-2 block text-xs font-bold uppercase text-zinc-400">
        {label}
      </Label>
      {children}
    </div>
  );
}