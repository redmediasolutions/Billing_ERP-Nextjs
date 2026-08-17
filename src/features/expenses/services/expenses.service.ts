import { expensesRepository } from "../repository/expenses.repository";
import type {
  Expense,
  ExpenseCategory,
  ExpenseCategoryInput,
  ExpenseInput,
  ExpenseSummary,
} from "../types";

function asBool(value: unknown) {
  return value === true || value === 1 || value === "1";
}

function asNumber(value: unknown) {
  const next = Number(value);
  return Number.isFinite(next) ? next : 0;
}

function normalizeExpense(expense: Expense): Expense {
  return {
    ...expense,
    amount: asNumber(expense.amount),
    tax_rate: asNumber(expense.tax_rate),
    tax_amount: asNumber(expense.tax_amount),
    total_amount: asNumber(expense.total_amount),
    tax_inclusive: asBool(expense.tax_inclusive),
    is_recurring: asBool(expense.is_recurring),
    is_parts_purchase: asBool(expense.is_parts_purchase),
    is_parcel_charge: asBool(expense.is_parcel_charge),
    is_reimbursable: asBool(expense.is_reimbursable),
    is_archived: asBool(expense.is_archived),
    expense_date: String(expense.expense_date || "").slice(0, 10),
    next_due_date: expense.next_due_date
      ? String(expense.next_due_date).slice(0, 10)
      : null,
  };
}

function normalizeCategory(category: ExpenseCategory): ExpenseCategory {
  return {
    ...category,
    is_active: asBool(category.is_active),
    is_system: asBool(category.is_system),
  };
}

function normalizeSummary(summary: ExpenseSummary): ExpenseSummary {
  return {
    this_month: asNumber(summary.this_month),
    last_month: asNumber(summary.last_month),
    unpaid: asNumber(summary.unpaid),
    parts_this_month: asNumber(summary.parts_this_month),
    parcel_this_month: asNumber(summary.parcel_this_month),
    recurring_due: asNumber(summary.recurring_due),
    expense_count: asNumber(summary.expense_count),
    by_category: (summary.by_category || []).map((row) => ({
      category_name: row.category_name,
      total: asNumber(row.total),
    })),
  };
}

export const expensesService = {
  async list() {
    const expenses = await expensesRepository.list();
    return expenses.map(normalizeExpense);
  },

  async summary() {
    const summary = await expensesRepository.summary();
    return normalizeSummary(summary);
  },

  async create(input: ExpenseInput) {
    const expense = await expensesRepository.create(input);
    return normalizeExpense(expense);
  },

  async update(id: number, input: ExpenseInput) {
    const expense = await expensesRepository.update(id, input);
    return normalizeExpense(expense);
  },

  remove: (id: number) => expensesRepository.remove(id),

  async categories() {
    const categories = await expensesRepository.categories();
    return categories.map(normalizeCategory);
  },

  createCategory: (input: ExpenseCategoryInput) =>
    expensesRepository.createCategory(input),

  updateCategory: (id: number, input: ExpenseCategoryInput) =>
    expensesRepository.updateCategory(id, input),
};
