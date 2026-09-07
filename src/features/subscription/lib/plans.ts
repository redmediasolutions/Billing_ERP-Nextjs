import type { PlanCode, SubscriptionPlan } from "../types";

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    code: "starter",
    name: "Starter",
    tagline: "POS and invoicing for a single outlet",
    monthly: 1999,
    yearly: 19990,
    features: [
      "POS billing",
      "GST invoices",
      "Customer master",
      "1 business location",
      "Email support",
    ],
  },
  {
    code: "professional",
    name: "Professional",
    tagline: "Inventory and estimates for growing stores",
    monthly: 3999,
    yearly: 39990,
    recommended: true,
    features: [
      "Everything in Starter",
      "Estimates and serial stock",
      "Expenses and vendors",
      "Inventory and brands",
      "Priority chat support",
    ],
  },
  {
    code: "business",
    name: "Business",
    tagline: "Full ERP for service and sales teams",
    monthly: 6999,
    yearly: 69990,
    features: [
      "Everything in Professional",
      "Bookings and enquiries",
      "Warranty and claims",
      "Employees and payroll",
      "Reports pack",
    ],
  },
  {
    code: "enterprise",
    name: "Enterprise",
    tagline: "Custom rollout, SLA, and dedicated success",
    monthly: null,
    yearly: null,
    custom: true,
    features: [
      "Everything in Business",
      "Custom modules and limits",
      "Dedicated onboarding",
      "Named account manager",
      "SLA-backed support",
    ],
  },
];

export function getPlanByCode(
  code: string | null | undefined
): SubscriptionPlan | null {
  if (!code) return null;
  const normalized = code.trim().toLowerCase();
  return (
    SUBSCRIPTION_PLANS.find((plan) => plan.code === normalized) ?? null
  );
}

export function resolvePlanCode(
  value: string | null | undefined
): PlanCode | string | null {
  const plan = getPlanByCode(value);
  return plan?.code ?? (value?.trim() || null);
}

export function planPrice(
  plan: SubscriptionPlan,
  cycle: "monthly" | "yearly"
): number | null {
  return cycle === "yearly" ? plan.yearly : plan.monthly;
}
