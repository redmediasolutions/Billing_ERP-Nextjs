import { apiRequest } from "@/lib/api";
import type {
  PlatformLicenceInput,
  PlatformTenantLicence,
  SubscriptionRenewRequest,
  TenantSubscription,
} from "../types";

export const platformSubscriptionRepository = {
  list: () => apiRequest<PlatformTenantLicence[]>("/platform/subscriptions"),

  renewRequests: () =>
    apiRequest<SubscriptionRenewRequest[]>("/platform/subscriptions/renew-requests"),

  assign: (input: PlatformLicenceInput) =>
    apiRequest<TenantSubscription>(`/platform/subscriptions/${input.tenant_id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  markRenewRequest: (id: number, status: "processed" | "rejected") =>
    apiRequest<{ id: number }>(`/platform/subscriptions/renew-requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};
