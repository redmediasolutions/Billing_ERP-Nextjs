"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { invoiceKeys } from "@/features/invoices/hooks/use-invoices";
import { useTenant, tenantKeys } from "@/features/tenant/hooks/use-tenant";

import { clinicService } from "../services/clinic.service";
import type { ClinicBillInput, ClinicSettingsInput } from "../types";

export const clinicKeys = {
  all: ["clinic"] as const,
  settings: () => [...clinicKeys.all, "settings"] as const,
  dashboard: () => [...clinicKeys.all, "dashboard"] as const,
  nextBillNumber: () => [...clinicKeys.all, "next-bill-number"] as const,
};

/** true when the tenant has the Clinic modules switched on (tenants.clinic_enabled) */
export function useIsClinicTenant() {
  const { data: tenant, isLoading } = useTenant();
  return {
    isClinic: Number(tenant?.clinic_enabled ?? 0) === 1 || tenant?.clinic_enabled === true,
    isLoading,
    tenant,
  };
}

export function useClinicSettings() {
  return useQuery({
    queryKey: clinicKeys.settings(),
    queryFn: clinicService.settings,
  });
}

export function useUpdateClinicSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ClinicSettingsInput) => clinicService.updateSettings(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicKeys.all });
      queryClient.invalidateQueries({ queryKey: tenantKeys.current });
    },
  });
}

export function useClinicDashboard() {
  return useQuery({
    queryKey: clinicKeys.dashboard(),
    queryFn: clinicService.dashboard,
  });
}

export function useNextClinicBillNumber() {
  return useQuery({
    queryKey: clinicKeys.nextBillNumber(),
    queryFn: clinicService.nextBillNumber,
  });
}

export function useCreateClinicBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ClinicBillInput) => clinicService.createBill(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      queryClient.invalidateQueries({ queryKey: clinicKeys.all });
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}
