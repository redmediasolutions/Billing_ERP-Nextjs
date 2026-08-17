import { apiRequest } from "@/lib/api";
import type {
  Expense,
  ExpenseCategory,
  ExpenseCategoryInput,
  ExpenseInput,
  ExpenseSummary,
} from "../types";

export const expensesRepository = {
  list: () => apiRequest<Expense[]>("/expenses"),

  summary: () => apiRequest<ExpenseSummary>("/expenses/summary"),

  create: (input: ExpenseInput) =>
    apiRequest<Expense>("/expenses", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  update: (id: number, input: ExpenseInput) =>
    apiRequest<Expense>(`/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  remove: (id: number) =>
    apiRequest<{ id: number }>(`/expenses/${id}`, {
      method: "DELETE",
    }),

  categories: () =>
    apiRequest<ExpenseCategory[]>("/expenses/categories"),

  createCategory: (input: ExpenseCategoryInput) =>
    apiRequest<Pick<ExpenseCategory, "id" | "category_name">>("/expenses/categories", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  updateCategory: (id: number, input: ExpenseCategoryInput) =>
    apiRequest<{ id: number }>(`/expenses/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
};
