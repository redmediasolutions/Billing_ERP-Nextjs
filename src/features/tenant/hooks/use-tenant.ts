"use client";

import { useQuery } from "@tanstack/react-query";
import { tenantService } from "../services/tenant.service";

export const tenantKeys = {
  current: ["tenant", "current"] as const,
};

export function useTenant() {
  return useQuery({
    queryKey: tenantKeys.current,
    queryFn: tenantService.get,
    staleTime: 5 * 60 * 1000,
  });
}