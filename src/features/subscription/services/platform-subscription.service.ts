import { platformSubscriptionRepository } from "../repository/platform-subscription.repository";
import { normalizeSubscription } from "../lib/entitlement";
import type {
  PlatformLicenceInput,
  PlatformTenantLicence,
  SubscriptionRenewRequest,
  TenantSubscription,
} from "../types";

function asNumber(value: unknown) {
  const next = Number(value);
  return Number.isFinite(next) ? next : 0;
}

function normalizeLicence(row: PlatformTenantLicence): PlatformTenantLicence {
  return {
    ...row,
    tenant_id: asNumber(row.tenant_id),
    amount: row.amount == null ? null : asNumber(row.amount),
    days_remaining:
      row.days_remaining == null ? null : asNumber(row.days_remaining),
    open_renew_requests: asNumber(row.open_renew_requests),
    started_on: row.started_on ? String(row.started_on).slice(0, 10) : null,
    expires_on: row.expires_on ? String(row.expires_on).slice(0, 10) : null,
    grace_ends_on: row.grace_ends_on
      ? String(row.grace_ends_on).slice(0, 10)
      : null,
  };
}

function normalizeRenewRequest(
  row: SubscriptionRenewRequest
): SubscriptionRenewRequest {
  return {
    ...row,
    id: asNumber(row.id),
    tenant_id: asNumber(row.tenant_id),
    amount: row.amount == null ? null : asNumber(row.amount),
    created_at: String(row.created_at || ""),
  };
}

export const platformSubscriptionService = {
  async list() {
    const rows = await platformSubscriptionRepository.list();
    return rows.map(normalizeLicence);
  },

  async renewRequests() {
    const rows = await platformSubscriptionRepository.renewRequests();
    return rows.map(normalizeRenewRequest);
  },

  async assign(input: PlatformLicenceInput) {
    const remote = await platformSubscriptionRepository.assign(input);
    return normalizeSubscription(
      remote as TenantSubscription & Record<string, unknown>
    );
  },

  markRenewRequest: platformSubscriptionRepository.markRenewRequest,
};
