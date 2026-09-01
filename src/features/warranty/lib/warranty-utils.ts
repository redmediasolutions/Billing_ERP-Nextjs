import type {
  ClaimStatus,
  WarrantyEligibility,
  WarrantyRegistration,
  WarrantyStatus,
} from "../types";
import {
  CLAIM_STATUSES,
  COVERAGE_TYPES,
  OPEN_CLAIM_STATUSES,
  WARRANTY_STATUSES,
} from "../types";

export function toNum(value: unknown, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export function asBool(value: unknown) {
  return value === true || value === 1 || value === "1";
}

export function toDateInput(value: string | null | undefined) {
  if (!value) return "";
  const text = String(value).trim();
  if (!text) return "";
  return text.slice(0, 10);
}

export function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function addMonths(dateValue: string, months: number) {
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;
  date.setMonth(date.getMonth() + months);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function daysBetween(from: string, to: string) {
  const start = new Date(`${from.slice(0, 10)}T00:00:00`);
  const end = new Date(`${to.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

export function coverageFromDates(startsAt: string, endsAt: string) {
  const today = todayDate();
  const total = Math.max(1, daysBetween(startsAt, endsAt));
  const remaining = daysBetween(today, endsAt);
  const elapsed = daysBetween(startsAt, today);
  const percent = Math.max(
    0,
    Math.min(100, Math.round((1 - elapsed / total) * 100))
  );

  return {
    days_remaining: remaining,
    coverage_percent: percent,
    in_warranty: remaining >= 0 && today >= startsAt.slice(0, 10),
  };
}

export function statusLabel(status: string) {
  return (
    WARRANTY_STATUSES.find((item) => item.value === status)?.label || status
  );
}

export function claimStatusLabel(status: string) {
  return CLAIM_STATUSES.find((item) => item.value === status)?.label || status;
}

export function coverageLabel(type: string) {
  return (
    COVERAGE_TYPES.find((item) => item.value === type)?.label || type
  );
}

export function isOpenClaim(status: ClaimStatus) {
  return OPEN_CLAIM_STATUSES.includes(status);
}

export function isExpiringSoon(row: WarrantyRegistration, days = 30) {
  return (
    row.status === "active" &&
    row.days_remaining >= 0 &&
    row.days_remaining <= days
  );
}

export function liveStatus(row: WarrantyRegistration): WarrantyStatus {
  if (row.status === "voided" || row.status === "transferred") return row.status;
  if (row.status === "pending") return "pending";
  if (row.days_remaining < 0) return "expired";
  return "active";
}

export function buildEligibility(
  row: WarrantyRegistration | null,
  extra?: Partial<WarrantyEligibility>
): WarrantyEligibility {
  if (!row) {
    return {
      in_warranty: false,
      days_remaining: 0,
      open_claims: 0,
      claims_used: 0,
      max_claims: null,
      can_claim: false,
      reasons: ["No warranty is registered for this serial."],
      ...extra,
    };
  }

  const status = liveStatus(row);
  const reasons: string[] = [];
  const inWarranty = status === "active";

  if (status === "pending") reasons.push("Registration is still pending proof.");
  if (status === "expired") reasons.push("Coverage has ended.");
  if (status === "voided") reasons.push("This warranty was voided.");
  if (status === "transferred") {
    reasons.push("Ownership was transferred. Register the new owner first.");
  }
  if (row.open_claims > 0) {
    reasons.push("An open claim already exists for this serial.");
  }

  const canClaim = inWarranty && row.open_claims === 0;

  if (canClaim) reasons.push("Serial is in coverage and ready for a claim.");

  return {
    in_warranty: inWarranty,
    days_remaining: row.days_remaining,
    open_claims: row.open_claims,
    claims_used: row.claims_count,
    max_claims: extra?.max_claims ?? null,
    can_claim: canClaim,
    reasons,
    ...extra,
  };
}

export function formatShortDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function remainingCopy(days: number) {
  if (days < 0) return `Expired ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago`;
  if (days === 0) return "Expires today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}
