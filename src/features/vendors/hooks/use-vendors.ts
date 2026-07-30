"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { vendorRepository } from "../repository/vendor-repository";
import type { VendorInput } from "../types/vendor.types";

const VENDORS_QUERY_KEY = ["vendors"];

export function useVendors() {
  return useQuery({
    queryKey: VENDORS_QUERY_KEY,
    queryFn: vendorRepository.getAll,
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: VendorInput) => vendorRepository.create(input),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: VENDORS_QUERY_KEY,
      }),
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: VendorInput;
    }) => vendorRepository.update(id, input),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: VENDORS_QUERY_KEY,
      }),
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => vendorRepository.remove(id),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: VENDORS_QUERY_KEY,
      }),
  });
}