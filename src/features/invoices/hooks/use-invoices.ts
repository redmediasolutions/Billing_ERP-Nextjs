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