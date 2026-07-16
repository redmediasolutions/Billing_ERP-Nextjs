"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { payrollService } from "../services/payroll.service";
import type {
  DeductionInput,
  LoanInput,
} from "../types";

import type { RemunerationInput } from "../types";

export const payrollKeys = {
  all: ["payroll"] as const,
  dashboard: () =>
    [...payrollKeys.all, "dashboard"] as const,
  employee: (employeeId: number) =>
    [...payrollKeys.all, "employee", employeeId] as const,
};

export function usePayrollDashboard() {
  return useQuery({
    queryKey: payrollKeys.dashboard(),
    queryFn: payrollService.dashboard,
  });
}

export function useEmployeePayroll(
  employeeId: number | null
) {
  return useQuery({
    queryKey: payrollKeys.employee(employeeId || 0),
    queryFn: () => payrollService.details(employeeId as number),
    enabled: Boolean(employeeId),
  });
}

export function useAddLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoanInput) =>
      payrollService.addLoan(input),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: payrollKeys.all,
      });
    },
  });
}

export function useAddDeduction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DeductionInput) =>
      payrollService.addDeduction(input),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: payrollKeys.all,
      });
    },
  });
}

export function useEmployeeRemuneration(employeeId: number) {
  return useQuery({
    queryKey: ["payroll", "remuneration", employeeId],
    queryFn: () => payrollService.getRemuneration(employeeId),
    enabled: employeeId > 0,
  });
}

export function useSaveRemuneration(employeeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RemunerationInput) =>
      payrollService.saveRemuneration(employeeId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["payroll", "remuneration", employeeId],
      });
    },
  });
}