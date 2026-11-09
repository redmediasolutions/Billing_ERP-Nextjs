"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { clinicServicesService } from "../services/clinic-services.service";
import type { ClinicServiceInput } from "../types";

export const clinicServiceKeys = {
  all: ["clinic-services"] as const,
  list: () => [...clinicServiceKeys.all, "list"] as const,
};

export function useClinicServices() {
  return useQuery({ queryKey: clinicServiceKeys.list(), queryFn: clinicServicesService.list });
}

export function useSaveClinicService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id?: number; input: ClinicServiceInput }) =>
      id ? clinicServicesService.update(id, input) : clinicServicesService.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clinicServiceKeys.all }),
  });
}

export function useDeleteClinicService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => clinicServicesService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clinicServiceKeys.all }),
  });
}
