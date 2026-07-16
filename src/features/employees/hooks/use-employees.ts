"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { employeesService } from "../services/employees.service";
import type { EmployeeInput } from "../types";

export const employeeKeys = {
  all: ["employees"] as const,
  list: () => [...employeeKeys.all, "list"] as const,
  departments: () =>
    [...employeeKeys.all, "departments"] as const,
};

export function useEmployees() {
  return useQuery({
    queryKey: employeeKeys.list(),
    queryFn: employeesService.list,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: EmployeeInput) =>
      employeesService.create(input),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: employeeKeys.all,
      });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: EmployeeInput;
    }) => employeesService.update(id, input),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: employeeKeys.all,
      });
    },
  });
}


export function useDepartments() {
  return useQuery({
    queryKey: employeeKeys.departments(),
    queryFn: employeesService.departments,
  });
}


export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      employeesService.remove(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: employeeKeys.all,
      });
    },
  });
}