import { ApiError, apiRequest } from "@/lib/api";
import type {
  SubscriptionInvoice,
  SubscriptionRenewRequestInput,
  TenantSubscription,
} from "../types";

export const subscriptionRepository = {
  get: () => apiRequest<TenantSubscription>("/subscription"),

  invoices: () => apiRequest<SubscriptionInvoice[]>("/subscription/invoices"),

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
