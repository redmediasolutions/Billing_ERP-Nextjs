export type BillingCycle = "monthly" | "yearly";

export type SubscriptionStatus =
  | "unconfigured"
  | "trial"
  | "active"
  | "due_soon"
  | "grace"
  | "locked"
  | "cancelled";

export type PlanCode = "starter" | "professional" | "business" | "enterprise";

export interface SubscriptionPlan {
  code: PlanCode;
  name: string;
  tagline: string;
  monthly: number | null;
  yearly: number | null;
  recommended?: boolean;
  custom?: boolean;
  features: string[];
}

export interface SubscriptionInvoice {
  id: number;
  invoice_number: string;
  billed_on: string;
  period_start: string | null;
  period_end: string | null;
  amount: number;
  status: "paid" | "unpaid" | "overdue" | "void";
  plan_code: string | null;
  billing_cycle: BillingCycle | null;
  notes: string | null;
}

export interface TenantSubscription {
  plan_code: PlanCode | string | null;
  plan_name: string | null;
  billing_cycle: BillingCycle | null;
  status: SubscriptionStatus;
  started_on: string | null;
  expires_on: string | null;
  grace_ends_on: string | null;
  days_remaining: number | null;
  amount: number | null;
  currency: string;
  auto_renew: boolean;
  seats: number | null;
  source: "api" | "tenant";
}

export interface SubscriptionAssignInput {
  plan_code: PlanCode;
  billing_cycle: BillingCycle;
  expires_on: string;
  started_on?: string;
  status?: "trial" | "active" | "cancelled";
  amount?: number | null;
  notes?: string;
}

export interface SubscriptionRenewRequestInput {
  plan_code: PlanCode;
  billing_cycle: BillingCycle;
  notes?: string;
}

export interface SubscriptionEntitlement {
  plan: SubscriptionPlan | null;
  planCode: PlanCode | string | null;
  status: SubscriptionStatus;
  expiresOn: string | null;
  graceEndsOn: string | null;
  daysRemaining: number | null;
  daysUntilLock: number | null;
  billingCycle: BillingCycle | null;
  canUseApp: boolean;
  showBanner: boolean;
  showNag: boolean;
  isBlocking: boolean;
}
