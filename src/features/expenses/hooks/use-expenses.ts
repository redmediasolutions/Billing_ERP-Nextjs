"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { expensesService } from "../services/expenses.service";
import type { ExpenseCategoryInput, ExpenseInput } from "../types";

export const expenseKeys = {
  all: ["expenses"] as const,
  list: () => [...expenseKeys.all, "list"] as const,
  summary: () => [...expenseKeys.all, "summary"] as const,
  categories: () => [...expenseKeys.all, "categories"] as const,
};

export function useExpenses() {
  return useQuery({
    queryKey: expenseKeys.list(),
    queryFn: expensesService.list,
  });
}

export function useExpenseSummary() {
  return useQuery({
    queryKey: expenseKeys.summary(),
    queryFn: expensesService.summary,
  });
}

export function useExpenseCategories() {
  return useQuery({
    queryKey: expenseKeys.categories(),
    queryFn: expensesService.categories,
  });
}

function invalidateExpenses(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: expenseKeys.all });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ExpenseInput) => expensesService.create(input),
    onSuccess: () => invalidateExpenses(queryClient),
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ExpenseInput }) =>
      expensesService.update(id, input),
    onSuccess: () => invalidateExpenses(queryClient),
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => expensesService.remove(id),
    onSuccess: () => invalidateExpenses(queryClient),
  });
}

export function useCreateExpenseCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ExpenseCategoryInput) =>
      expensesService.createCategory(input),
    onSuccess: () => invalidateExpenses(queryClient),
  });
}

export function useUpdateExpenseCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: ExpenseCategoryInput;
    }) => expensesService.updateCategory(id, input),
    onSuccess: () => invalidateExpenses(queryClient),
  });
}
