"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { estimatesService } from "../services/estimates.service";
import type { EstimateInput } from "../types";

export const estimateKeys = {
  all: ["estimates"] as const,
  list: () => [...estimateKeys.all, "list"] as const,
  detail: (id: number) => [...estimateKeys.all, id] as const,
  customers: () => [...estimateKeys.all, "customers"] as const,
  items: () => [...estimateKeys.all, "catalog-items"] as const,
};

export function useEstimates() {
  return useQuery({
    queryKey: estimateKeys.list(),
    queryFn: estimatesService.list,
  });
}

export function useCustomers() {
  return useQuery({
    queryKey: estimateKeys.customers(),
    queryFn: estimatesService.getCustomers,
  });
}

export function useCatalogItems(enabled = true) {
  return useQuery({
    queryKey: estimateKeys.items(),
    queryFn: estimatesService.getItems,
    enabled,
  });
}

export function useCreateEstimate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: EstimateInput) =>
      estimatesService.create(input),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: estimateKeys.all,
      });
    },
  });
}

export function useDeleteEstimate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      estimatesService.remove(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: estimateKeys.all,
      });
    },
  });
}