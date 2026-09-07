import type { Tenant } from "@/features/tenant/types";
import { ApiError } from "@/lib/api";

import {
  isMissingSubscriptionApi,
  subscriptionRepository,
} from "../repository/subscription.repository";
import {
  normalizeSubscription,
  subscriptionFromTenant,
} from "../lib/entitlement";
import type {
  SubscriptionAssignInput,
  SubscriptionInvoice,
  SubscriptionRenewRequestInput,
  TenantSubscription,
} from "../types";

function asNumber(value: unknown) {
  const next = Number(value);
  return Number.isFinite(next) ? next : 0;
}

function normalizeInvoice(invoice: SubscriptionInvoice): SubscriptionInvoice {
  return {
    ...invoice,
    amount: asNumber(invoice.amount),
    billed_on: String(invoice.billed_on || "").slice(0, 10),
    period_start: invoice.period_start
      ? String(invoice.period_start).slice(0, 10)
      : null,
    period_end: invoice.period_end
      ? String(invoice.period_end).slice(0, 10)
      : null,
  };
}

export const subscriptionService = {
  async get(tenant?: Tenant | null): Promise<TenantSubscription | null> {
    const fromTenant = subscriptionFromTenant(tenant);

    try {
      const remote = await subscriptionRepository.get();
      return normalizeSubscription(
        remote as TenantSubscription & Record<string, unknown>,
        fromTenant
      );
    } catch (error) {
      if (fromTenant) return fromTenant;
      if (isMissingSubscriptionApi(error)) return fromTenant;
      throw error;
    }
  },

  async invoices(): Promise<SubscriptionInvoice[]> {
    try {
      const invoices = await subscriptionRepository.invoices();
      return invoices.map(normalizeInvoice);
    } catch (error) {
      if (
        isMissingSubscriptionApi(error) ||
        (error instanceof ApiError && error.status === 401)
      ) {
        return [];
      }
      throw error;
    }
  },

  async assign(input: SubscriptionAssignInput) {
    const remote = await subscriptionRepository.assign(input);
    return normalizeSubscription(
      remote as TenantSubscription & Record<string, unknown>
    );
  },

  requestRenewal: (input: SubscriptionRenewRequestInput) =>
    subscriptionRepository.requestRenewal(input),
};
