import { ApiError, apiRequest } from "@/lib/api";
import type {
  SubscriptionAssignInput,
  SubscriptionInvoice,
  SubscriptionRenewRequestInput,
  TenantSubscription,
} from "../types";

export const subscriptionRepository = {
  get: () => apiRequest<TenantSubscription>("/subscription"),

  invoices: () => apiRequest<SubscriptionInvoice[]>("/subscription/invoices"),

  assign: (input: SubscriptionAssignInput) =>
    apiRequest<TenantSubscription>("/subscription", {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  requestRenewal: (input: SubscriptionRenewRequestInput) =>
    apiRequest<{ id?: number; message?: string }>("/subscription/renew-request", {
      method: "POST",
      body: JSON.stringify(input),
    }),
};

export function isMissingSubscriptionApi(error: unknown) {
  return (
    error instanceof ApiError &&
    (error.status === 404 || error.status === 405 || error.status === 501)
  );
}
