import { warrantyRepository } from "../repository/warranty.repository";
import {
  asBool,
  coverageFromDates,
  toDateInput,
  toNum,
} from "../lib/warranty-utils";
import type {
  ClaimPart,
  ClaimStatus,
  ClaimUpdate,
  CoverageType,
  WarrantyClaim,
  WarrantyClaimInput,
  WarrantyEligibility,
  WarrantyInput,
  WarrantyLookup,
  WarrantyPolicy,
  WarrantyPolicyInput,
  WarrantyRegistration,
  WarrantySource,
  WarrantyStatus,
  WarrantySummary,
} from "../types";

const STATUSES: WarrantyStatus[] = [
  "pending",
  "active",
  "expired",
  "voided",
  "transferred",
];

const SOURCES: WarrantySource[] = [
  "invoice",
  "stock_sale",
  "walk_in",
  "dealer",
  "manual",
];

const COVERAGES: CoverageType[] = [
  "manufacturer",
  "extended",
  "replacement",
  "repair_only",
];

function asStatus(value: unknown, fallback: WarrantyStatus): WarrantyStatus {
  const next = String(value || fallback) as WarrantyStatus;
  return STATUSES.includes(next) ? next : fallback;
}

function asSource(value: unknown): WarrantySource {
  const next = String(value || "manual") as WarrantySource;
  return SOURCES.includes(next) ? next : "manual";
}

function asCoverage(value: unknown): CoverageType {
  const next = String(value || "manufacturer") as CoverageType;
  return COVERAGES.includes(next) ? next : "manufacturer";
}

function parseList<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function normalizePolicy(row: WarrantyPolicy): WarrantyPolicy {
  return {
    ...row,
    product_ref: row.product_ref ? Number(row.product_ref) : null,
    coverage_months: toNum(row.coverage_months, 12),
    coverage_type: asCoverage(row.coverage_type),
    covers_parts: asBool(row.covers_parts),
    covers_labor: asBool(row.covers_labor),
    max_claims:
      row.max_claims == null || row.max_claims === ("" as never)
        ? null
        : toNum(row.max_claims),
    is_active: asBool(row.is_active),
  };
}

function normalizeClaim(claim: WarrantyClaim): WarrantyClaim {
  const parts = parseList<ClaimPart>(claim.parts).map((part) => ({
    ...part,
    item_ref: part.item_ref ? Number(part.item_ref) : null,
    quantity: toNum(part.quantity, 1),
    unit_cost: toNum(part.unit_cost),
  }));
  const updates = parseList<ClaimUpdate>(
    (claim as WarrantyClaim & { updates_json?: unknown }).updates ||
      (claim as WarrantyClaim & { updates_json?: unknown }).updates_json
  );

  return {
    ...claim,
    registration_ref: Number(claim.registration_ref),
    customer_ref: claim.customer_ref ? Number(claim.customer_ref) : null,
    assigned_to: claim.assigned_to ? Number(claim.assigned_to) : null,
    replacement_stock_ref: claim.replacement_stock_ref
      ? Number(claim.replacement_stock_ref)
      : null,
    invoice_ref: claim.invoice_ref ? Number(claim.invoice_ref) : null,
    status: String(claim.status || "submitted") as ClaimStatus,
    is_archived: asBool(claim.is_archived),
    parts,
    updates,
  };
}

function normalizeRegistration(
  row: WarrantyRegistration & { claims_json?: unknown }
): WarrantyRegistration {
  const starts = toDateInput(row.starts_at);
  const ends = toDateInput(row.ends_at);
  const coverage = coverageFromDates(starts, ends);
  const claims = parseList<WarrantyClaim>(row.claims || row.claims_json).map(
    normalizeClaim
  );
  const claimsCount = toNum(row.claims_count, claims.length);
  const openClaims = toNum(
    row.open_claims,
    claims.filter((claim) =>
      [
        "submitted",
        "under_review",
        "approved",
        "in_repair",
        "awaiting_parts",
      ].includes(claim.status)
    ).length
  );

  let status = asStatus(row.status, "active");
  if (status === "active" && coverage.days_remaining < 0) status = "expired";

  return {
    ...row,
    customer_ref: row.customer_ref ? Number(row.customer_ref) : null,
    product_ref: row.product_ref ? Number(row.product_ref) : null,
    item_ref: row.item_ref ? Number(row.item_ref) : null,
    stock_ref: row.stock_ref ? Number(row.stock_ref) : null,
    invoice_ref: row.invoice_ref ? Number(row.invoice_ref) : null,
    vendor_ref: row.vendor_ref ? Number(row.vendor_ref) : null,
    policy_ref: row.policy_ref ? Number(row.policy_ref) : null,
    coverage_type: asCoverage(row.coverage_type),
    coverage_months: toNum(row.coverage_months, 12),
    purchase_date: toDateInput(row.purchase_date) || null,
    registered_at: toDateInput(row.registered_at),
    starts_at: starts,
    ends_at: ends,
    source: asSource(row.source),
    status,
    is_archived: asBool(row.is_archived),
    days_remaining: toNum(row.days_remaining, coverage.days_remaining),
    coverage_percent: toNum(row.coverage_percent, coverage.coverage_percent),
    claims_count: claimsCount,
    open_claims: openClaims,
    display_customer_name:
      row.display_customer_name || row.customer_name || null,
    display_phone: row.display_phone || row.phone || null,
    display_email: row.display_email || row.email || null,
    claims,
  };
}

function normalizeEligibility(row: WarrantyEligibility): WarrantyEligibility {
  return {
    in_warranty: asBool(row.in_warranty),
    days_remaining: toNum(row.days_remaining),
    open_claims: toNum(row.open_claims),
    claims_used: toNum(row.claims_used),
    max_claims: row.max_claims == null ? null : toNum(row.max_claims),
    can_claim: asBool(row.can_claim),
    reasons: Array.isArray(row.reasons) ? row.reasons : [],
  };
}

function normalizeLookup(row: WarrantyLookup): WarrantyLookup {
  return {
    ...row,
    serial: row.serial || "",
    registration: row.registration
      ? normalizeRegistration(row.registration)
      : null,
    policy: row.policy ? normalizePolicy(row.policy) : null,
    eligibility: normalizeEligibility(row.eligibility),
  };
}

function normalizeSummary(summary: WarrantySummary): WarrantySummary {
  return {
    total: toNum(summary.total),
    active: toNum(summary.active),
    pending: toNum(summary.pending),
    expired: toNum(summary.expired),
    expiring_soon: toNum(summary.expiring_soon),
    open_claims: toNum(summary.open_claims),
    claims_this_month: toNum(summary.claims_this_month),
    resolved_this_month: toNum(summary.resolved_this_month),
    by_status: summary.by_status || [],
    by_coverage: summary.by_coverage || [],
  };
}

export const warrantyService = {
  async list() {
    const rows = await warrantyRepository.list();
    return rows.map(normalizeRegistration);
  },

  async summary() {
    const summary = await warrantyRepository.summary();
    return normalizeSummary(summary);
  },

  async lookup(serial: string) {
    const row = await warrantyRepository.lookup(serial);
    return normalizeLookup(row);
  },

  async getById(id: number) {
    const row = await warrantyRepository.getById(id);
    return normalizeRegistration(row);
  },

  async create(input: WarrantyInput) {
    const row = await warrantyRepository.create(input);
    return normalizeRegistration(row);
  },

  async update(id: number, input: WarrantyInput) {
    const row = await warrantyRepository.update(id, input);
    return normalizeRegistration(row);
  },

  remove: (id: number) => warrantyRepository.remove(id),

  async policies() {
    const rows = await warrantyRepository.policies();
    return rows.map(normalizePolicy);
  },

  async createPolicy(input: WarrantyPolicyInput) {
    const row = await warrantyRepository.createPolicy(input);
    return normalizePolicy(row);
  },

  updatePolicy: (id: number, input: WarrantyPolicyInput) =>
    warrantyRepository.updatePolicy(id, input),

  async claims() {
    const rows = await warrantyRepository.claims();
    return rows.map(normalizeClaim);
  },

  async getClaim(id: number) {
    const row = await warrantyRepository.getClaim(id);
    return normalizeClaim(row);
  },

  async createClaim(input: WarrantyClaimInput) {
    const row = await warrantyRepository.createClaim(input);
    return normalizeClaim(row);
  },

  async updateClaim(id: number, input: WarrantyClaimInput) {
    const row = await warrantyRepository.updateClaim(id, input);
    return normalizeClaim(row);
  },

  async changeClaimStatus(
    id: number,
    input: Parameters<typeof warrantyRepository.changeClaimStatus>[1]
  ) {
    const row = await warrantyRepository.changeClaimStatus(id, input);
    return normalizeClaim(row);
  },

  removeClaim: (id: number) => warrantyRepository.removeClaim(id),
};
