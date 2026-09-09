"use client";

import { useEffect, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { tenantKeys, useTenant } from "@/features/tenant/hooks/use-tenant";

import { buildEntitlement } from "../lib/entitlement";
import { subscriptionService } from "../services/subscription.service";
import type { SubscriptionRenewRequestInput } from "../types";

export const subscriptionKeys = {
  all: ["subscription"] as const,
  current: () => [...subscriptionKeys.all, "current"] as const,
  invoices: () => [...subscriptionKeys.all, "invoices"] as const,
};

function useClientReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return ready;
}

export function useSubscription() {
  const ready = useClientReady();
  const tenantQuery = useTenant();
  const tenantReady = Boolean(tenantQuery.data);

  const query = useQuery({
    queryKey: [
      ...subscriptionKeys.current(),
      tenantQuery.data?.id ?? "none",
    ],
    queryFn: () => subscriptionService.get(tenantQuery.data),
    enabled: ready && tenantReady,
    staleTime: 60 * 1000,
    retry: 1,
  });

  return {
    ...query,
    isLoading:
      !ready ||
      (tenantQuery.isLoading && !tenantReady) ||
      (tenantReady && query.isLoading),
    error: tenantReady ? query.error : tenantQuery.error,
  };
}

export function useSubscriptionEntitlement() {
  const query = useSubscription();
  return {
    ...query,
    entitlement: buildEntitlement(query.data),
  };
}

export function useSubscriptionInvoices() {
  const ready = useClientReady();
  return useQuery({
    queryKey: subscriptionKeys.invoices(),
    queryFn: subscriptionService.invoices,
    enabled: ready,
    staleTime: 60 * 1000,
  });
}

export function useRequestSubscriptionRenewal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubscriptionRenewRequestInput) =>
      subscriptionService.requestRenewal(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
    },
  });
}
