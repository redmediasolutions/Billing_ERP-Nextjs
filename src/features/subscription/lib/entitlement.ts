import type { Tenant } from "@/features/tenant/types";
import { platformBilling } from "@/lib/platform-billing";

import { getPlanByCode } from "./plans";
import type {
  BillingCycle,
  SubscriptionEntitlement,
  SubscriptionStatus,
  TenantSubscription,
} from "../types";

/** Days after expiry when the company can still work before lock. */
export const GRACE_DAYS = 7;

/** Banner starts this many days before expiry (cycle-aware). */
export function bannerWithinDays(cycle: BillingCycle | null | undefined) {
  return cycle === "monthly" ? 7 : 15;
}

/** Popup once per day on these remaining days (cycle-aware). */
export function nagRemainingDays(
  cycle: BillingCycle | null | undefined
): readonly number[] {
  return cycle === "monthly" ? [5, 3, 1, 0] : [14, 7, 5, 3, 1, 0];
}

/** @deprecated use bannerWithinDays(cycle) */
export const BANNER_WITHIN_DAYS = 15;

function startOfLocalDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

export function parseDateOnly(value: string | null | undefined): Date | null {
  if (!value) return null;
  const slice = String(value).slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(slice);
  if (!match) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : startOfLocalDay(parsed);
  }
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export function formatDateOnly(value: string | null | undefined) {
  const date = parseDateOnly(value);
  if (!date) return "—";
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function toIsoDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return startOfLocalDay(next);
}

export function diffDays(from: Date, to: Date) {
  return Math.round(
    (startOfLocalDay(to).getTime() - startOfLocalDay(from).getTime()) /
      86_400_000
  );
}

export function daysUntil(dateStr: string | null | undefined, now = new Date()) {
  const target = parseDateOnly(dateStr);
  if (!target) return null;
  return diffDays(now, target);
}

export function addMonthsIso(dateStr: string, months: number) {
  const date = parseDateOnly(dateStr) ?? startOfLocalDay(new Date());
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return toIsoDate(next);
}

function asBool(value: unknown) {
  return value === true || value === 1 || value === "1";
}

function asNumber(value: unknown) {
  const next = Number(value);
  return Number.isFinite(next) ? next : null;
}

export function deriveStatus(input: {
  expiresOn: string | null;
  graceEndsOn: string | null;
  billingCycle?: BillingCycle | null;
  reportedStatus?: string | null;
  now?: Date;
}): SubscriptionStatus {
  const bannerDays = bannerWithinDays(input.billingCycle);
  const reported = String(input.reportedStatus || "").toLowerCase();
  if (reported === "cancelled") return "cancelled";
  if (reported === "locked" || reported === "suspended") return "locked";
  if (reported === "trial") {
    const remaining = daysUntil(input.expiresOn, input.now);
    if (remaining != null && remaining < 0) {
      return deriveStatus({
        ...input,
        reportedStatus: null,
        billingCycle: input.billingCycle,
      });
    }
    return "trial";
  }

  if (!input.expiresOn) return "unconfigured";

  const remaining = daysUntil(input.expiresOn, input.now);
  if (remaining == null) return "unconfigured";

  if (remaining > bannerDays) return "active";
  if (remaining >= 0) return "due_soon";

  const untilLock = daysUntil(input.graceEndsOn, input.now);
  if (untilLock != null && untilLock >= 0) return "grace";
  return "locked";
}

export function buildEntitlement(
  subscription: TenantSubscription | null | undefined
): SubscriptionEntitlement {
  const plan = getPlanByCode(subscription?.plan_code ?? null);
  const status = subscription?.status ?? "unconfigured";
  const expiresOn = subscription?.expires_on ?? null;
  const graceEndsOn = subscription?.grace_ends_on ?? null;
  const daysRemaining = subscription?.days_remaining ?? daysUntil(expiresOn);
  const daysUntilLock =
    status === "locked"
      ? 0
      : daysUntil(graceEndsOn) ??
        (daysRemaining != null ? daysRemaining + GRACE_DAYS : null);

  const canUseApp = status !== "locked" && status !== "cancelled";
  const isBlocking = status === "locked";
  const cycle = subscription?.billing_cycle ?? null;
  const bannerDays = bannerWithinDays(cycle);
  const nagDays = nagRemainingDays(cycle);

  const showBanner =
    status === "due_soon" ||
    status === "grace" ||
    status === "locked" ||
    status === "cancelled" ||
    (status === "trial" &&
      daysRemaining != null &&
      daysRemaining <= bannerDays);
  const showNag =
    status === "grace" ||
    status === "locked" ||
    (daysRemaining != null &&
      nagDays.includes(daysRemaining as (typeof nagDays)[number]));

  return {
    plan,
    planCode: subscription?.plan_code ?? null,
    status,
    expiresOn,
    graceEndsOn,
    daysRemaining,
    daysUntilLock,
    billingCycle: subscription?.billing_cycle ?? null,
    canUseApp,
    showBanner,
    showNag,
    isBlocking,
  };
}

export function subscriptionFromTenant(
  tenant: Tenant | null | undefined
): TenantSubscription | null {
  if (!tenant) return null;

  const expiresOn = tenant.subscription_expiry
    ? String(tenant.subscription_expiry).slice(0, 10)
    : null;
  const startedOn = tenant.subscription_started_on
    ? String(tenant.subscription_started_on).slice(0, 10)
    : null;
  const expiryDate = parseDateOnly(expiresOn);
  const graceEndsOn = expiryDate
    ? toIsoDate(addDays(expiryDate, GRACE_DAYS))
    : null;
  const plan = getPlanByCode(tenant.subscription_plan);
  const cycle =
    tenant.subscription_cycle === "monthly" ||
    tenant.subscription_cycle === "yearly"
      ? tenant.subscription_cycle
      : null;
  const status = deriveStatus({
    expiresOn,
    graceEndsOn,
    billingCycle: cycle,
    reportedStatus: tenant.subscription_status,
  });

  return {
    plan_code: plan?.code ?? tenant.subscription_plan,
    plan_name: plan?.name ?? tenant.subscription_plan,
    billing_cycle: cycle,
    status,
    started_on: startedOn,
    expires_on: expiresOn,
    grace_ends_on: graceEndsOn,
    days_remaining: daysUntil(expiresOn),
    amount: asNumber(tenant.subscription_amount),
    currency: "INR",
    auto_renew: asBool(tenant.subscription_auto_renew),
    seats: asNumber(tenant.subscription_seats),
    source: "tenant",
  };
}

export function normalizeSubscription(
  raw: Partial<TenantSubscription> & Record<string, unknown>,
  fallback?: TenantSubscription | null
): TenantSubscription {
  const expiresOn =
    (raw.expires_on as string | null) ||
    fallback?.expires_on ||
    null;
  const expiryDate = parseDateOnly(expiresOn);
  const graceEndsOn =
    (raw.grace_ends_on as string | null) ||
    fallback?.grace_ends_on ||
    (expiryDate
      ? toIsoDate(addDays(expiryDate, GRACE_DAYS))
      : null);
  const planCode =
    (raw.plan_code as string | null) || fallback?.plan_code || null;
  const plan = getPlanByCode(planCode);
  const cycle = (raw.billing_cycle ||
    fallback?.billing_cycle ||
    null) as BillingCycle | null;
  const status = deriveStatus({
    expiresOn,
    graceEndsOn,
    billingCycle: cycle,
    reportedStatus:
      (raw.status as string | null) ||
      (raw.subscription_status as string | null) ||
      fallback?.status,
  });

  return {
    plan_code: plan?.code ?? planCode,
    plan_name:
      (raw.plan_name as string | null) ||
      plan?.name ||
      fallback?.plan_name ||
      planCode,
    billing_cycle: cycle,
    status,
    started_on:
      (raw.started_on as string | null) || fallback?.started_on || null,
    expires_on: expiresOn,
    grace_ends_on: graceEndsOn,
    days_remaining:
      asNumber(raw.days_remaining) ?? daysUntil(expiresOn),
    amount: asNumber(raw.amount) ?? fallback?.amount ?? null,
    currency: String(raw.currency || fallback?.currency || "INR"),
    auto_renew: asBool(raw.auto_renew ?? fallback?.auto_renew),
    seats: asNumber(raw.seats) ?? fallback?.seats ?? null,
    source: "api",
  };
}

export function statusLabel(status: SubscriptionStatus) {
  switch (status) {
    case "trial":
      return "Trial";
    case "active":
      return "Active";
    case "due_soon":
      return "Renewal due";
    case "grace":
      return "Grace period";
    case "locked":
      return "Locked";
    case "cancelled":
      return "Cancelled";
    default:
      return "Not licensed";
  }
}

export function statusBadgeVariant(status: SubscriptionStatus) {
  switch (status) {
    case "active":
      return "default" as const;
    case "trial":
      return "secondary" as const;
    case "due_soon":
    case "grace":
      return "outline" as const;
    case "locked":
    case "cancelled":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}

export function extendOneBillingPeriod(
  expiresOn: string | null,
  cycle: BillingCycle
) {
  const today = startOfLocalDay(new Date());
  const current = parseDateOnly(expiresOn);
  const base =
    current && current.getTime() > today.getTime() ? current : today;
  return addMonthsIso(toIsoDate(base), cycle === "yearly" ? 12 : 1);
}

export function cycleLabel(cycle: BillingCycle | null | undefined) {
  if (cycle === "monthly") return "monthly";
  if (cycle === "yearly") return "yearly";
  return "licence";
}

export function nagCopy(entitlement: SubscriptionEntitlement) {
  const planName = entitlement.plan?.name ?? "your ERP licence";
  const cycle = cycleLabel(entitlement.billingCycle);

  if (entitlement.status === "locked") {
    return {
      title: "This workspace is locked",
      description: `Your licence fee was not received. ${platformBilling.providerName} is frozen until your subscription is renewed.`,
      cta: "Pay now",
    };
  }

  if (entitlement.status === "grace") {
    const days = Math.max(entitlement.daysUntilLock ?? 0, 0);
    return {
      title:
        days === 0
          ? "Last day of grace — app locks tonight"
          : `Grace period: ${days} day${days === 1 ? "" : "s"} until lock`,
      description: `Your ${planName} licence expired on ${formatDateOnly(entitlement.expiresOn)}. Pay ${platformBilling.providerName} to keep using the ERP.`,
      cta: "Renew now",
    };
  }

  const days = entitlement.daysRemaining ?? 0;
  return {
    title:
      days === 0
        ? `Your ${cycle} licence expires today`
        : `In ${days} day${days === 1 ? "" : "s"} your ERP will lock if renewal isn't paid`,
    description: `Your ${planName} (${cycle}) licence ends on ${formatDateOnly(entitlement.expiresOn)}. Pay ${platformBilling.providerName} before the ${GRACE_DAYS}-day grace period ends or the software locks.`,
    cta: "Pay now",
  };
}
