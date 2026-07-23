"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, WalletCards, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { Employee } from "@/features/employees/types";
import type { RemunerationInput } from "../types";
import {
  useEmployeeRemuneration,
  useSaveRemuneration,
} from "../hooks/use-payroll";

const emptyForm: RemunerationInput = {
  basic_pay: 0,
  hra: 0,
  bonus: 0,
  overtime: 0,
  pf_deduction: 0,
  professional_tax: 0,
  advance: 0,
  lop: 0,
  esi: 0,
};

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

export function RemunerationFormModal({
  employee,
  onClose,
}: {
  employee: Employee;
  onClose: () => void;
}) {
  const [form, setForm] = useState<RemunerationInput>(emptyForm);
  const [error, setError] = useState("");

  const { data, isLoading } = useEmployeeRemuneration(employee.id);
  const saveRemuneration = useSaveRemuneration(employee.id);

  useEffect(() => {
    if (!data?.remuneration) return;

    const salary = data.remuneration;

    setForm({
      basic_pay: Number(salary.basic_pay || 0),
      hra: Number(salary.hra || 0),
      bonus: Number(salary.bonus || 0),
      overtime: Number(salary.overtime || 0),
      pf_deduction: Number(salary.pf_deduction || 0),
      professional_tax: Number(salary.professional_tax || 0),
      advance: Number(salary.advance || 0),
      lop: Number(salary.lop || 0),
      esi: Number(salary.esi || 0),
    });
  }, [data]);

  const totals = useMemo(() => {
    const gross =
      form.basic_pay + form.hra + form.bonus + form.overtime;

    const deductions =
      form.pf_deduction +
      form.professional_tax +
      form.esi +
      form.lop +
      form.advance;

    return {
      gross,
      deductions,
      net: Math.max(0, gross - deductions),
    };
  }, [form]);

  function updateField(field: keyof RemunerationInput, value: string) {
    setForm((current) => ({
      ...current,
      [field]: Math.max(0, Number(value) || 0),
    }));
  }

  async function handleSave() {
    if (form.basic_pay <= 0) {
      setError("Basic pay must be greater than zero.");
      return;
    }

    try {
      setError("");
      await saveRemuneration.mutateAsync(form);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save remuneration."
      );
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="form-dialog">
        <DialogHeader>
          <DialogTitle>
            <WalletCards className="h-6 w-6" />
            Set Monthly Salary
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

        <div className="remuneration-form__employee">
          <p className="remuneration-form__employee-name">{employee.full_name}</p>
          <p className="remuneration-form__employee-id">
            Employee ID: {employee.empId || "Not assigned"}
          </p>
        </div>

        {isLoading ? (
          <div className="remuneration-form__loading">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="remuneration-form">
            <section>
              <h3 className="remuneration-form__section-title">
                Earnings
              </h3>

              <div className="remuneration-form__grid">
                <SalaryInput
                  label="Basic Pay *"
                  value={form.basic_pay}
                  onChange={(value) => updateField("basic_pay", value)}
                />
                <SalaryInput
                  label="HRA"
                  value={form.hra}
                  onChange={(value) => updateField("hra", value)}
                />
                <SalaryInput
                  label="Bonus"
                  value={form.bonus}
                  onChange={(value) => updateField("bonus", value)}
                />
                <SalaryInput
                  label="Overtime"
                  value={form.overtime}
                  onChange={(value) => updateField("overtime", value)}
                />
              </div>
            </section>

            <section>
              <h3 className="remuneration-form__section-title">
                Monthly Deductions
              </h3>

              <div className="remuneration-form__grid">
                <SalaryInput
                  label="PF Deduction"
                  value={form.pf_deduction}
                  onChange={(value) =>
                    updateField("pf_deduction", value)
                  }
                />
                <SalaryInput
                  label="Professional Tax"
                  value={form.professional_tax}
                  onChange={(value) =>
                    updateField("professional_tax", value)
                  }
                />
                <SalaryInput
                  label="ESI"
                  value={form.esi}
                  onChange={(value) => updateField("esi", value)}
                />
                <SalaryInput
                  label="Advance Recovery"
                  value={form.advance}
                  onChange={(value) => updateField("advance", value)}
                />
                <SalaryInput
                  label="LOP Deduction"
                  value={form.lop}
                  onChange={(value) => updateField("lop", value)}
                />
              </div>
            </section>

            <div className="remuneration-form__totals">
              <Total label="Gross Salary" value={money(totals.gross)} />
              <Total
                label="Total Deductions"
                value={money(totals.deductions)}
              />
              <Total
                label="Net Monthly Salary"
                value={money(totals.net)}
                highlight
              />
            </div>

            {error ? <p className="form-error">{error}</p> : null}

            <div className="form-actions">
              <Button
                type="button"
                variant="outline"
                disabled={saveRemuneration.isPending}
                onClick={onClose}
              >
                Cancel
              </Button>

              <Button
                type="button"
                disabled={saveRemuneration.isPending}
                onClick={handleSave}
              >
                {saveRemuneration.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Save Monthly Salary
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SalaryInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: string) => void;
}) {
  return (
    <div className="form-field">
      <Label className="form-field__label">{label} (₹)</Label>

      <Input
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function Total({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="remuneration-form__total-label">{label}</p>
      <p
        className={`remuneration-form__total-value${
          highlight ? " remuneration-form__total-value--highlight" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}