"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { customerKeys } from "@/features/customers/hooks/use-customers";

import { patientsService } from "../services/patients.service";
import type { PatientInput } from "../types";

export const patientKeys = {
  all: ["patients"] as const,
  list: (archived = false) => [...patientKeys.all, "list", archived] as const,
  detail: (id: number) => [...patientKeys.all, "detail", id] as const,
};

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: patientKeys.all });
  // patients are ERP customers
  queryClient.invalidateQueries({ queryKey: customerKeys.all });
}

export function usePatients(archived = false) {
  return useQuery({
    queryKey: patientKeys.list(archived),
    queryFn: () => patientsService.list(archived),
  });
}

export function usePatient(id: number | null) {
  return useQuery({
    queryKey: patientKeys.detail(id || 0),
    queryFn: () => patientsService.getById(id as number),
    enabled: Boolean(id && id > 0),
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PatientInput) => patientsService.create(input),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: PatientInput }) =>
      patientsService.update(id, input),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useArchivePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, archived }: { id: number; archived: boolean }) =>
      archived ? patientsService.archive(id) : patientsService.restore(id),
    onSuccess: () => invalidate(queryClient),
  });
}
