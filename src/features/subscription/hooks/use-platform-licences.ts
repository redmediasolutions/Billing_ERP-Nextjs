"use client";

import { useEffect, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { platformSubscriptionService } from "../services/platform-subscription.service";
import type { PlatformLicenceInput } from "../types";

export const platformLicenceKeys = {
  all: ["platform-licences"] as const,
  list: () => [...platformLicenceKeys.all, "list"] as const,
  renewRequests: () => [...platformLicenceKeys.all, "renew-requests"] as const,
};

function useClientReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return ready;
}

export function usePlatformLicences() {
  const ready = useClientReady();
  return useQuery({
    queryKey: platformLicenceKeys.list(),
    queryFn: platformSubscriptionService.list,
    enabled: ready,
    staleTime: 30_000,
  });
}

export function usePlatformRenewRequests() {
  const ready = useClientReady();
  return useQuery({
    queryKey: platformLicenceKeys.renewRequests(),
    queryFn: platformSubscriptionService.renewRequests,
    enabled: ready,
    staleTime: 15_000,
  });
}

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: platformLicenceKeys.all });
}

export function useAssignPlatformLicence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PlatformLicenceInput) =>
      platformSubscriptionService.assign(input),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useMarkRenewRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number;
      status: "processed" | "rejected";
    }) => platformSubscriptionService.markRenewRequest(id, status),
    onSuccess: () => invalidateAll(queryClient),
  });
}
