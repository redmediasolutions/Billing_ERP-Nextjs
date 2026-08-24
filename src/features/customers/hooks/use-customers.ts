"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { customersService } from "../services/customers.service";
import type { CustomerInput } from "../types";

export const customerKeys = {
  all: ["customers"] as const,
  list: () => [...customerKeys.all, "list"] as const,
};

export function useCustomers() {
  return useQuery({
    queryKey: customerKeys.list(),
    queryFn: customersService.list,
  });
}

export function useCustomerSearch(query: string) {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: [...customerKeys.list(), "search", normalizedQuery],
    queryFn: () => customersService.search(normalizedQuery),
    enabled: normalizedQuery.length >= 2,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CustomerInput) =>
      customersService.create(input),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: customerKeys.all,
      });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: CustomerInput;
    }) => customersService.update(id, input),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: customerKeys.all,
      });
    },
  });
}

export function useArchiveCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => customersService.archive(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: customerKeys.all,
      });
    },
  });
}
