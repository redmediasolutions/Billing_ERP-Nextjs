"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { customerKeys } from "@/features/customers/hooks/use-customers";

import { warrantyService } from "../services/warranty.service";
import type {
  ClaimStatusInput,
  WarrantyClaimInput,
  WarrantyInput,
  WarrantyPolicyInput,
} from "../types";

export const warrantyKeys = {
  all: ["warranties"] as const,
  list: () => [...warrantyKeys.all, "list"] as const,
  summary: () => [...warrantyKeys.all, "summary"] as const,
  policies: () => [...warrantyKeys.all, "policies"] as const,
  claims: () => [...warrantyKeys.all, "claims"] as const,
  detail: (id: number) => [...warrantyKeys.all, "detail", id] as const,
  lookup: (serial: string) => [...warrantyKeys.all, "lookup", serial] as const,
};

function invalidateWarranties(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: warrantyKeys.all });
}

export function useWarranties() {
  return useQuery({
    queryKey: warrantyKeys.list(),
    queryFn: warrantyService.list,
  });
}

export function useWarrantySummary() {
  return useQuery({
    queryKey: warrantyKeys.summary(),
    queryFn: warrantyService.summary,
  });
}

export function useWarrantyPolicies() {
  return useQuery({
    queryKey: warrantyKeys.policies(),
    queryFn: warrantyService.policies,
  });
}

export function useWarrantyClaims() {
  return useQuery({
    queryKey: warrantyKeys.claims(),
    queryFn: warrantyService.claims,
  });
}

export function useWarrantyLookup(serial: string) {
  const normalized = serial.trim();

  return useQuery({
    queryKey: warrantyKeys.lookup(normalized),
    queryFn: () => warrantyService.lookup(normalized),
    enabled: normalized.length >= 3,
  });
}

export function useCreateWarranty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: WarrantyInput) => warrantyService.create(input),
    onSuccess: () => {
      invalidateWarranties(queryClient);
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
}

export function useUpdateWarranty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: WarrantyInput }) =>
      warrantyService.update(id, input),
    onSuccess: () => invalidateWarranties(queryClient),
  });
}

export function useDeleteWarranty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => warrantyService.remove(id),
    onSuccess: () => invalidateWarranties(queryClient),
  });
}

export function useCreateWarrantyPolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: WarrantyPolicyInput) =>
      warrantyService.createPolicy(input),
    onSuccess: () => invalidateWarranties(queryClient),
  });
}

export function useUpdateWarrantyPolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: WarrantyPolicyInput;
    }) => warrantyService.updatePolicy(id, input),
    onSuccess: () => invalidateWarranties(queryClient),
  });
}

export function useCreateWarrantyClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: WarrantyClaimInput) =>
      warrantyService.createClaim(input),
    onSuccess: () => invalidateWarranties(queryClient),
  });
}

export function useUpdateWarrantyClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: WarrantyClaimInput;
    }) => warrantyService.updateClaim(id, input),
    onSuccess: () => invalidateWarranties(queryClient),
  });
}

export function useChangeClaimStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ClaimStatusInput }) =>
      warrantyService.changeClaimStatus(id, input),
    onSuccess: () => invalidateWarranties(queryClient),
  });
}

export function useDeleteWarrantyClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => warrantyService.removeClaim(id),
    onSuccess: () => invalidateWarranties(queryClient),
  });
}
