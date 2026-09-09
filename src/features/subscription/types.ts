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

/** Licence assigned by the platform vendor to the logged-in tenant company. */
export interface TenantSubscription {
  plan_code: PlanCode | string | null;
  plan_name: string | null;
  billing_cycle: BillingCycle | null;
  status: SubscriptionStatus;
  started_on: string | null;
  expires_on: string | null;
  grace_ends_on: string | null;
  days_remaining: number | null;
  /** Custom licence fee set for this tenant — not the public catalogue. */
  amount: number | null;
  currency: string;
  auto_renew: boolean;
  seats: number | null;
  source: "api" | "tenant";
}

export interface SubscriptionRenewRequestInput {
  notes?: string;
}

export interface SubscriptionRenewRequest {
  id: number;
  tenant_id: number;
  business_name: string | null;
  plan_code: string | null;
  billing_cycle: BillingCycle | null;
  amount: number | null;
  notes: string | null;
  status: "open" | "processed" | "rejected";
  created_at: string;
}

/** One row in the platform operator licence console. */
export interface PlatformTenantLicence {
  tenant_id: number;
  business_name: string;
  reference: string | null;
  plan_code: string | null;
  plan_name: string | null;
  billing_cycle: BillingCycle | null;
  status: SubscriptionStatus;
  started_on: string | null;
  expires_on: string | null;
  grace_ends_on: string | null;
  days_remaining: number | null;
  amount: number | null;
  subscription_status: string | null;
  open_renew_requests: number;
}

export interface PlatformLicenceInput {
  tenant_id: number;
  plan_code: PlanCode;
  billing_cycle: BillingCycle;
  expires_on: string;
  started_on?: string;
  status?: "trial" | "active" | "cancelled";
  /** Required — custom licence fee for this company. */
  amount: number;
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
