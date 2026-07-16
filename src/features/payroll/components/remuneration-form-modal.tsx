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
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border-zinc-800 bg-[#1e1e24] text-white">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <WalletCards className="h-6 w-6 text-[#ffcc00]" />
            Set Monthly Salary
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

        <div className="rounded-xl border border-zinc-800 bg-[#151517] p-4">
          <p className="font-bold text-white">{employee.full_name}</p>
          <p className="mt-1 text-sm text-zinc-400">
            Employee ID: {employee.empId || "Not assigned"}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[#ffcc00]" />
          </div>
        ) : (
          <div className="space-y-6">
            <section>
              <h3 className="mb-4 font-bold text-[#ffcc00]">
                Earnings
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
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
              <h3 className="mb-4 font-bold text-red-300">
                Monthly Deductions
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
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

            <div className="grid gap-3 rounded-xl border border-zinc-800 bg-[#151517] p-5 md:grid-cols-3">
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

            {error ? (
              <p className="rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-300">
                {error}
              </p>
            ) : null}

            <div className="flex justify-end gap-3 border-t border-zinc-800 pt-5">
              <Button
                type="button"
                variant="outline"
                disabled={saveRemuneration.isPending}
                onClick={onClose}
                className="border-zinc-600 bg-transparent"
              >
                Cancel
              </Button>

              <Button
                type="button"
                disabled={saveRemuneration.isPending}
                onClick={handleSave}
                className="bg-[#ffcc00] font-bold text-black hover:bg-yellow-400"
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
    <div>
      <Label className="mb-2 block text-xs font-bold uppercase text-zinc-400">
        {label} (₹)
      </Label>

      <Input
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border-zinc-700 bg-[#151517]"
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
      <p className="text-xs font-bold uppercase text-zinc-500">{label}</p>
      <p
        className={`mt-2 text-lg font-black ${
          highlight ? "text-[#ffcc00]" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}