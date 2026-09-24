import { membershipsRepository } from "../repository/memberships.repository";
import { createMembershipInvoice } from "../lib/membership-invoice";
import {
  asBool,
  daysUntilEnd,
  effectiveStatus,
  toDateInput,
  toDateOnly,
  toNum,
} from "../lib/membership-utils";
import type {
  MembershipBillingCycle,
  MembershipCheckIn,
  MembershipEnrollment,
  MembershipEnrollmentInput,
  MembershipPlan,
  MembershipPlanInput,
  MembershipStatus,
  MembershipSummary,
  MembershipVisitModel,
} from "../types";

const STATUSES: MembershipStatus[] = [
  "pending",
  "active",
  "paused",
  "expired",
  "cancelled",
];

const CYCLES: MembershipBillingCycle[] = [
  "monthly",
  "quarterly",
  "yearly",
  "custom",
  "session_pack",
];

const VISIT_MODELS: MembershipVisitModel[] = [
  "unlimited",
  "per_period",
  "session_pack",
];

function asStatus(value: unknown, fallback: MembershipStatus): MembershipStatus {
  const next = String(value || fallback) as MembershipStatus;
  return STATUSES.includes(next) ? next : fallback;
}

function asCycle(value: unknown): MembershipBillingCycle {
  const next = String(value || "monthly") as MembershipBillingCycle;
  return CYCLES.includes(next) ? next : "monthly";
}

function asVisitModel(value: unknown): MembershipVisitModel {
  const next = String(value || "unlimited") as MembershipVisitModel;
  return VISIT_MODELS.includes(next) ? next : "unlimited";
}

function normalizePlan(row: MembershipPlan): MembershipPlan {
  return {
    ...row,
    price: toNum(row.price),
    duration_days:
      row.duration_days == null ? null : toNum(row.duration_days),
    item_ref: row.item_ref ? Number(row.item_ref) : null,
    visits_per_period:
      row.visits_per_period == null ? null : toNum(row.visits_per_period),
    grace_days: toNum(row.grace_days, 0),
    auto_renew_default: asBool(row.auto_renew_default),
    is_active: asBool(row.is_active),
    billing_cycle: asCycle(row.billing_cycle),
    visit_model: asVisitModel(row.visit_model),
  };
}

function normalizeCheckIn(row: MembershipCheckIn): MembershipCheckIn {
  return {
    ...row,
    enrollment_ref: Number(row.enrollment_ref),
    checked_in_at: toDateInput(row.checked_in_at),
  };
}

function normalizeEnrollment(
  row: MembershipEnrollment & { recent_check_ins_json?: unknown }
): MembershipEnrollment {
  let recent: MembershipCheckIn[] = [];
  const raw = row.recent_check_ins || row.recent_check_ins_json;
  if (Array.isArray(raw)) recent = raw.map(normalizeCheckIn);
  else if (typeof raw === "string" && String(raw).trim()) {
    try {
      const parsed = JSON.parse(raw);
      recent = Array.isArray(parsed) ? parsed.map(normalizeCheckIn) : [];
    } catch {
      recent = [];
    }
  }

  const status = effectiveStatus({
    status: asStatus(row.status, "pending"),
    ends_at: row.ends_at,
  });

  const visitsLimit =
    row.visits_limit == null ? null : toNum(row.visits_limit);
  const visitsUsed = toNum(row.visits_used);
  const visitsRemaining =
    visitsLimit == null ? null : Math.max(0, visitsLimit - visitsUsed);

  return {
    ...row,
    customer_ref: row.customer_ref ? Number(row.customer_ref) : null,
    plan_ref: Number(row.plan_ref),
    status,
    auto_renew: asBool(row.auto_renew),
    visits_used: visitsUsed,
    visits_limit: visitsLimit,
    visits_remaining: visitsRemaining,
    last_invoice_ref: row.last_invoice_ref
      ? Number(row.last_invoice_ref)
      : null,
    entry_invoice_ref: row.entry_invoice_ref
      ? Number(row.entry_invoice_ref)
      : null,
    reminder_ref: row.reminder_ref ? Number(row.reminder_ref) : null,
    is_archived: asBool(row.is_archived),
    starts_at: toDateInput(row.starts_at),
    ends_at: toDateOnly(row.ends_at) || toDateInput(row.ends_at).slice(0, 10),
    next_billing_at: row.next_billing_at
      ? toDateOnly(row.next_billing_at)
      : null,
    period_starts_at: row.period_starts_at
      ? toDateOnly(row.period_starts_at)
      : null,
    days_remaining: toNum(row.days_remaining, daysUntilEnd(row.ends_at)),
    can_check_in: asBool(row.can_check_in),
    billing_cycle: row.billing_cycle ? asCycle(row.billing_cycle) : null,
    display_customer_name:
      row.display_customer_name || row.customer_name || null,
    display_phone: row.display_phone || row.phone || null,
    recent_check_ins: recent,
  };
}

function normalizeSummary(summary: MembershipSummary): MembershipSummary {
  return {
    total_enrollments: toNum(summary.total_enrollments),
    active: toNum(summary.active),
    expiring_soon: toNum(summary.expiring_soon),
    expired: toNum(summary.expired),
    paused: toNum(summary.paused),
    pending: toNum(summary.pending),
    check_ins_today: toNum(summary.check_ins_today),
    active_plans: toNum(summary.active_plans),
    estimated_mrr: toNum(summary.estimated_mrr),
  };
}

export const membershipsService = {
  async plans() {
    const rows = await membershipsRepository.plans();
    return rows.map(normalizePlan);
  },

  async createPlan(input: MembershipPlanInput) {
    const row = await membershipsRepository.createPlan(input);
    return normalizePlan(row);
  },

  async updatePlan(id: number, input: MembershipPlanInput) {
    const row = await membershipsRepository.updatePlan(id, input);
    return normalizePlan(row);
  },

  async enrollments() {
    const rows = await membershipsRepository.enrollments();
    return rows.map(normalizeEnrollment);
  },

  async summary() {
    const summary = await membershipsRepository.summary();
    return normalizeSummary(summary);
  },

  async getEnrollment(id: number) {
    const row = await membershipsRepository.getEnrollment(id);
    return normalizeEnrollment(row);
  },

  async createEnrollment(input: MembershipEnrollmentInput) {
    const row = await membershipsRepository.createEnrollment(input);
    return normalizeEnrollment(row);
  },

  async updateEnrollment(id: number, input: MembershipEnrollmentInput) {
    const row = await membershipsRepository.updateEnrollment(id, input);
    return normalizeEnrollment(row);
  },

  async changeStatus(
    id: number,
    input: Parameters<typeof membershipsRepository.changeStatus>[1]
  ) {
    const row = await membershipsRepository.changeStatus(id, input);
    return normalizeEnrollment(row);
  },

  async checkIn(
    id: number,
    input: Parameters<typeof membershipsRepository.checkIn>[1]
  ) {
    const result = await membershipsRepository.checkIn(id, input);
    return {
      enrollment: normalizeEnrollment(result.enrollment),
      check_in: normalizeCheckIn(result.check_in),
    };
  },

  async createInvoice(id: number) {
    const enrollment = await membershipsRepository.getEnrollment(id);
    const normalized = normalizeEnrollment(enrollment);
    const plans = await membershipsRepository.plans();
    const plan = plans.find((row) => row.id === normalized.plan_ref);
    if (!plan) {
      throw new Error("Membership plan not found.");
    }

    return createMembershipInvoice(normalized, normalizePlan(plan));
  },

  scheduleRenewal: (id: number) => membershipsRepository.scheduleRenewal(id),

  removeEnrollment: (id: number) => membershipsRepository.removeEnrollment(id),
};
