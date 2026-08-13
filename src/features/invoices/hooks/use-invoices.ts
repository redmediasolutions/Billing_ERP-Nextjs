"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { invoicesService } from "../services/invoices.service";
import type { InvoiceInput } from "../types";

export const invoiceKeys = {
  all: ["invoices"] as const,
  list: () => [...invoiceKeys.all, "list"] as const,
  detail: (id: number) => [...invoiceKeys.all, id] as const,
};

export function useInvoices() {
  return useQuery({
    queryKey: invoiceKeys.list(),
    queryFn: invoicesService.list,
  });
}

export function useInvoice(id: number) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => invoicesService.getById(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: InvoiceInput) =>
      invoicesService.create(input),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: invoiceKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: ["inventory"],
      });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: InvoiceInput;
    }) => invoicesService.update(id, input),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: invoiceKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: invoiceKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      invoicesService.remove(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: invoiceKeys.all,
      });
    },
  });
}