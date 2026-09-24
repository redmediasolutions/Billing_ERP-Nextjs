export type MembershipBillingCycle =
  | "monthly"
  | "quarterly"
  | "yearly"
  | "custom"
  | "session_pack";

export type MembershipStatus =
  | "pending"
  | "active"
  | "paused"
  | "expired"
  | "cancelled";

export type MembershipVisitModel = "unlimited" | "per_period" | "session_pack";

export interface MembershipPlan {
  id: number;
  created_at: string;
  updated_at: string;
  tenant_id: number;
  reference: string;
  plan_code: string;
  plan_name: string;
  description: string | null;
  billing_cycle: MembershipBillingCycle;
  duration_days: number | null;
  price: number;
  item_ref: number | null;
  item_name: string | null;
  visit_model: MembershipVisitModel;
  visits_per_period: number | null;
  grace_days: number;
  auto_renew_default: boolean;
  is_active: boolean;
}

export interface MembershipPlanInput {
  plan_name: string;
  description: string;
  billing_cycle: MembershipBillingCycle;
  duration_days: number | null;
  price: number;
  item_ref: number | null;
  visit_model: MembershipVisitModel;
  visits_per_period: number | null;
  grace_days: number;
  auto_renew_default: boolean;
  is_active?: boolean;
}

export interface MembershipCheckIn {
  id: number;
  created_at: string;
  enrollment_ref: number;
  checked_in_at: string;
  source: string | null;
  note: string | null;
}

export interface MembershipEnrollment {
  id: number;
  created_at: string;
  updated_at: string;
  tenant_id: number;
  reference: string;
  member_number: string;
  customer_ref: number | null;
  customer_name: string | null;
  phone: string | null;
  email: string | null;
  display_customer_name: string | null;
  display_phone: string | null;
  plan_ref: number;
  plan_name: string | null;
  plan_code: string | null;
  billing_cycle: MembershipBillingCycle | null;
  status: MembershipStatus;
  starts_at: string;
  ends_at: string;
  next_billing_at: string | null;
  auto_renew: boolean;
  visits_used: number;
  visits_limit: number | null;
  period_starts_at: string | null;
  last_invoice_ref: number | null;
  last_invoice_number: string | null;
  entry_invoice_ref: number | null;
  entry_invoice_number: string | null;
  reminder_ref: number | null;
  notes: string | null;
  is_archived: boolean;
  days_remaining: number;
  visits_remaining: number | null;
  can_check_in: boolean;
  recent_check_ins: MembershipCheckIn[];
}

export interface MembershipEnrollmentInput {
  customer_ref: number | null;
  customer_name: string;
  phone: string;
  email: string;
  plan_ref: number;
  status: MembershipStatus;
  starts_at: string;
  ends_at: string;
  next_billing_at: string;
  auto_renew: boolean;
  entry_invoice_ref: number | null;
  notes: string;
  create_customer?: boolean;
}

export interface MembershipStatusInput {
  status: MembershipStatus;
  note?: string;
  ends_at?: string;
}

export interface MembershipCheckInInput {
  note?: string;
  source?: string;
}

export interface MembershipSummary {
  total_enrollments: number;
  active: number;
  expiring_soon: number;
  expired: number;
  paused: number;
  pending: number;
  check_ins_today: number;
  active_plans: number;
  estimated_mrr: number;
}

export interface MembershipInvoiceResult {
  invoice_id: number;
  invoice_number: string;
  enrollment_id: number;
}

export interface MembershipRenewalResult {
  reminder_id: number;
  enrollment_id: number;
}

export const MEMBERSHIP_STATUSES: Array<{
  value: MembershipStatus;
  label: string;
}> = [
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "expired", label: "Expired" },
  { value: "cancelled", label: "Cancelled" },
];

export const MEMBERSHIP_BILLING_CYCLES: Array<{
  value: MembershipBillingCycle;
  label: string;
  days?: number;
}> = [
  { value: "monthly", label: "Monthly", days: 30 },
  { value: "quarterly", label: "Quarterly", days: 90 },
  { value: "yearly", label: "Yearly", days: 365 },
  { value: "custom", label: "Custom duration" },
  { value: "session_pack", label: "Session pack" },
];

export const VISIT_MODELS: Array<{
  value: MembershipVisitModel;
  label: string;
  hint: string;
}> = [
  {
    value: "unlimited",
    label: "Unlimited visits",
    hint: "Gym / club style access",
  },
  {
    value: "per_period",
    label: "Visits per billing period",
    hint: "e.g. 12 classes per month",
  },
  {
    value: "session_pack",
    label: "Fixed session pack",
    hint: "Count down until pack is used",
  },
];
