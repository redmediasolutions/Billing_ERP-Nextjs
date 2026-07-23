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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isLoan ? "Add Employee Loan" : "Add Deduction"}
          </DialogTitle>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="transaction-form">
          <Field label="Employee *">
            <select
              value={employeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
              disabled={employees.length === 0 || saving}
              className="transaction-form__select"
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
              <p className="transaction-form__hint">
                Add an employee before creating a loan or deduction.
              </p>
            ) : null}
          </Field>

          <div className="transaction-form__grid">
            <Field label="Amount (₹) *">
              <Input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                disabled={saving}
              />
            </Field>

            <Field label="Date *">
              <Input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                disabled={saving}
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
            />
          </Field>

          {!isLoan ? (
            <Field label="Notes">
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                disabled={saving}
                placeholder="Optional deduction notes..."
              />
            </Field>
          ) : null}

          {error ? <p className="form-error">{error}</p> : null}

          <div className="form-actions">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={saving || employees.length === 0}
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
    <div className="form-field">
      <Label className="form-field__label">{label}</Label>
      {children}
    </div>
  );
}