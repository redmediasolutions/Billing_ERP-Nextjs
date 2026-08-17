"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { CreatableSelect } from "@/components/forms/creatable-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useEmployees } from "@/features/employees/hooks/use-employees";
import { useVendors } from "@/features/vendors/hooks/use-vendors";

import {
  useCreateExpenseCategory,
  useExpenseCategories,
} from "../hooks/use-expenses";
import type { Expense, ExpenseInput } from "../types";
import { PAYMENT_MODES } from "../types";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function addMonth(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().slice(0, 10);
}

function computePreview(amount: number, taxRate: number, inclusive: boolean) {
  if (!amount || taxRate <= 0) {
    return { tax: 0, total: amount || 0 };
  }

  if (inclusive) {
    const tax = +(amount - amount / (1 + taxRate / 100)).toFixed(2);
    return { tax, total: amount };
  }

  const tax = +((amount * taxRate) / 100).toFixed(2);
  return { tax, total: +(amount + tax).toFixed(2) };
}

const emptyForm: ExpenseInput = {
  expense_name: "",
  expense_date: today(),
  amount: 0,
  tax_rate: 0,
  tax_inclusive: true,
  category_ref: null,
  vendor_ref: null,
  vendor_name: "",
  employee_ref: null,
  description: "",
  payment_mode: "UPI",
  payment_status: "paid",
  bill_number: "",
  receipt_url: "",
  is_recurring: false,
  recurrence_interval: "monthly",
  next_due_date: "",
  is_parts_purchase: false,
  is_parcel_charge: false,
  is_reimbursable: false,
};

function fromExpense(expense: Expense): ExpenseInput {
  return {
    expense_name: expense.expense_name || "",
    expense_date: expense.expense_date?.slice(0, 10) || today(),
    amount: expense.amount || 0,
    tax_rate: expense.tax_rate || 0,
    tax_inclusive: expense.tax_inclusive,
    category_ref: expense.category_ref,
    vendor_ref: expense.vendor_ref,
    vendor_name: expense.display_vendor_name || expense.vendor_name || "",
    employee_ref: expense.employee_ref,
    description: expense.description || "",
    payment_mode: expense.payment_mode || "UPI",
    payment_status: expense.payment_status === "unpaid" ? "unpaid" : "paid",
    bill_number: expense.bill_number || "",
    receipt_url: expense.receipt_url || "",
    is_recurring: expense.is_recurring,
    recurrence_interval: expense.recurrence_interval || "monthly",
    next_due_date: expense.next_due_date || "",
    is_parts_purchase: expense.is_parts_purchase,
    is_parcel_charge: expense.is_parcel_charge,
    is_reimbursable: expense.is_reimbursable,
  };
}

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export function ExpenseFormSheet({
  open,
  expense,
  lastExpense,
  onClose,
  onSave,
}: {
  open: boolean;
  expense: Expense | null;
  lastExpense?: Expense | null;
  onClose: () => void;
  onSave: (input: ExpenseInput) => Promise<void>;
}) {
  const { data: categories = [], isLoading: loadingCategories } =
    useExpenseCategories();
  const createCategory = useCreateExpenseCategory();
  const { data: vendors = [] } = useVendors();
  const { data: employees = [] } = useEmployees();

  const [form, setForm] = useState<ExpenseInput>(emptyForm);
  const [amountText, setAmountText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEditing = Boolean(expense?.id);
  const activeCategories = categories.filter((category) => category.is_active);

  useEffect(() => {
    if (!open) return;

    if (expense) {
      const next = fromExpense(expense);
      setForm(next);
      setAmountText(next.amount ? String(next.amount) : "");
      setError("");
      return;
    }

    const defaults: ExpenseInput = {
      ...emptyForm,
      expense_date: today(),
      payment_mode: lastExpense?.payment_mode || "UPI",
      tax_rate: lastExpense?.tax_rate || 0,
      tax_inclusive: lastExpense?.tax_inclusive ?? true,
    };

    setForm(defaults);
    setAmountText("");
    setError("");
  }, [expense, open]);

  const preview = useMemo(
    () => computePreview(Number(amountText) || 0, form.tax_rate, form.tax_inclusive),
    [amountText, form.tax_inclusive, form.tax_rate]
  );

  const vendorSuggestions = useMemo(() => {
    const names = new Set<string>();
    vendors.forEach((vendor) => {
      if (vendor.vendor_name) names.add(vendor.vendor_name);
    });
    return Array.from(names);
  }, [vendors]);

  function setValue<K extends keyof ExpenseInput>(
    key: K,
    value: ExpenseInput[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleCreateCategory(label: string) {
    const created = await createCategory.mutateAsync({
      category_name: label,
    });
    return { value: created.id, label: created.category_name || label };
  }

  function applyVendorName(name: string) {
    const match = vendors.find(
      (vendor) => vendor.vendor_name.toLowerCase() === name.trim().toLowerCase()
    );
    setForm((current) => ({
      ...current,
      vendor_name: name,
      vendor_ref: match ? match.id : null,
    }));
  }

  function toggleFlag(
    flag: "is_parts_purchase" | "is_parcel_charge" | "is_recurring" | "is_reimbursable"
  ) {
    setForm((current) => {
      const next = { ...current, [flag]: !current[flag] };

      if (flag === "is_parts_purchase" && next.is_parts_purchase) {
        const parts = activeCategories.find(
          (category) => category.category_name === "Parts Purchase"
        );
        if (parts && !current.category_ref) next.category_ref = parts.id;
        if (!current.expense_name.trim()) next.expense_name = "Parts purchase";
      }

      if (flag === "is_parcel_charge" && next.is_parcel_charge) {
        const parcel = activeCategories.find(
          (category) => category.category_name === "Courier & Parcel"
        );
        if (parcel && !current.category_ref) next.category_ref = parcel.id;
        if (!current.expense_name.trim()) next.expense_name = "Parcel / courier";
      }

      if (flag === "is_recurring" && next.is_recurring && !current.next_due_date) {
        next.next_due_date = addMonth(current.expense_date || today());
      }

      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const amount = Number(amountText);
    if (!amount || amount <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    if (!form.expense_name.trim()) {
      setError("What is this expense for?");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await onSave({
        ...form,
        amount,
        expense_name: form.expense_name.trim(),
        vendor_name: form.vendor_name.trim(),
        next_due_date: form.is_recurring
          ? form.next_due_date || addMonth(form.expense_date)
          : "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save expense.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit expense" : "Add expense"}</SheetTitle>
          <SheetDescription>
            Amount, category, and vendor can all be set here. New categories are
            created without leaving this form.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="expense-amount">Amount *</Label>
              <Input
                id="expense-amount"
                inputMode="decimal"
                value={amountText}
                onChange={(event) => setAmountText(event.target.value)}
                placeholder="0.00"
                autoFocus
                className="h-11 text-lg font-semibold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense-date">Date</Label>
              <Input
                id="expense-date"
                type="date"
                value={form.expense_date}
                onChange={(event) => setValue("expense_date", event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-name">What is this for? *</Label>
            <Input
              id="expense-name"
              value={form.expense_name}
              onChange={(event) => setValue("expense_name", event.target.value)}
              placeholder="e.g. Shop rent April, Blue Dart parcel"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <CreatableSelect
                value={form.category_ref}
                options={activeCategories.map((category) => ({
                  value: category.id,
                  label: category.category_name,
                }))}
                onChange={(value) =>
                  setValue("category_ref", value ? Number(value) : null)
                }
                onCreate={handleCreateCategory}
                placeholder="Select or create"
                loading={loadingCategories}
                selectClassName={selectClassName}
                inputClassName={selectClassName}
                emptyLabel="No categories yet"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-vendor">Vendor</Label>
              <Input
                id="expense-vendor"
                list="expense-vendor-list"
                value={form.vendor_name}
                onChange={(event) => applyVendorName(event.target.value)}
                placeholder="Type or pick a vendor"
              />
              <datalist id="expense-vendor-list">
                {vendorSuggestions.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Payment mode</Label>
              <Select
                value={form.payment_mode || "UPI"}
                onValueChange={(value) => setValue("payment_mode", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Payment mode" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_MODES.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {mode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.payment_status}
                onValueChange={(value) =>
                  setValue("payment_status", value === "unpaid" ? "unpaid" : "paid")
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <FlagButton
              active={form.is_parts_purchase}
              onClick={() => toggleFlag("is_parts_purchase")}
              label="Parts purchase"
            />
            <FlagButton
              active={form.is_parcel_charge}
              onClick={() => toggleFlag("is_parcel_charge")}
              label="Parcel charge"
            />
            <FlagButton
              active={form.is_recurring}
              onClick={() => toggleFlag("is_recurring")}
              label="Recurring"
            />
            <FlagButton
              active={form.is_reimbursable}
              onClick={() => toggleFlag("is_reimbursable")}
              label="Staff reimbursement"
            />
          </div>

          {form.is_recurring ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Repeats</Label>
                <Select
                  value={form.recurrence_interval}
                  onValueChange={(value) =>
                    setValue(
                      "recurrence_interval",
                      value as ExpenseInput["recurrence_interval"]
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="next-due">Next due</Label>
                <Input
                  id="next-due"
                  type="date"
                  value={form.next_due_date}
                  onChange={(event) => setValue("next_due_date", event.target.value)}
                />
              </div>
            </div>
          ) : null}

          {form.is_reimbursable ? (
            <div className="space-y-2">
              <Label>Employee</Label>
              <Select
                value={form.employee_ref ? String(form.employee_ref) : "none"}
                onValueChange={(value) =>
                  setValue("employee_ref", value === "none" ? null : Number(value))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select employee</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={String(employee.id)}>
                      {employee.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="tax-rate">GST %</Label>
              <Input
                id="tax-rate"
                inputMode="decimal"
                value={form.tax_rate || ""}
                onChange={(event) =>
                  setValue("tax_rate", Number(event.target.value) || 0)
                }
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>GST in amount</Label>
              <Button
                type="button"
                variant={form.tax_inclusive ? "default" : "outline"}
                className="w-full"
                onClick={() => setValue("tax_inclusive", !form.tax_inclusive)}
              >
                {form.tax_inclusive ? "Inclusive" : "Exclusive"}
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Total</Label>
              <p className="flex h-9 items-center text-sm font-medium">
                {preview.total.toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                })}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bill-number">Bill / ref no.</Label>
              <Input
                id="bill-number"
                value={form.bill_number}
                onChange={(event) => setValue("bill_number", event.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receipt-url">Receipt URL</Label>
              <Input
                id="receipt-url"
                value={form.receipt_url}
                onChange={(event) => setValue("receipt_url", event.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-notes">Notes</Label>
            <Textarea
              id="expense-notes"
              rows={3}
              value={form.description}
              onChange={(event) => setValue("description", event.target.value)}
              placeholder="Anything the team should remember"
            />
          </div>

          {error ? (
            <p className="text-sm font-medium text-destructive">{error}</p>
          ) : null}

          <SheetFooter className="mt-auto gap-2 sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isEditing ? "Save changes" : "Save expense"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function FlagButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "default" : "outline"}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}
