import type {
  MembershipBillingCycle,
  MembershipEnrollment,
  MembershipStatus,
} from "../types";
import { MEMBERSHIP_BILLING_CYCLES, MEMBERSHIP_STATUSES } from "../types";

export function toNum(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function asBool(value: unknown) {
  return value === true || value === 1 || value === "1";
}

export function toDateInput(value: string | null | undefined) {
  if (!value) return "";
  const text = String(value).trim();
  if (!text) return "";
  if (text.includes("T")) return text.slice(0, 16);
  if (text.includes(" ")) return text.replace(" ", "T").slice(0, 16);
  return `${text}T09:00`.slice(0, 16);
}

export function toDateOnly(value: string | null | undefined) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

export function statusLabel(status: string) {
  return (
    MEMBERSHIP_STATUSES.find((s) => s.value === status)?.label || status
  );
}

export function cycleLabel(cycle: string) {
  return (
    MEMBERSHIP_BILLING_CYCLES.find((c) => c.value === cycle)?.label || cycle
  );
}

export function formatShortDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function daysUntilEnd(endsAt: string) {
  const end = new Date(toDateOnly(endsAt));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - today.getTime()) / 86_400_000);
}

export function isExpiringSoon(
  row: Pick<MembershipEnrollment, "ends_at" | "status">,
  withinDays = 14
) {
  if (row.status !== "active" && row.status !== "paused") return false;
  const days = daysUntilEnd(row.ends_at);
  return days >= 0 && days <= withinDays;
}

export function isExpired(row: Pick<MembershipEnrollment, "ends_at" | "status">) {
  if (row.status === "expired" || row.status === "cancelled") return true;
  return daysUntilEnd(row.ends_at) < 0;
}

export function effectiveStatus(
  row: Pick<MembershipEnrollment, "status" | "ends_at">
): MembershipStatus {
  const base = String(row.status || "pending") as MembershipStatus;
  if (base === "cancelled" || base === "expired") return base;
  if (base === "active" && daysUntilEnd(row.ends_at) < 0) return "expired";
  return base;
}

export function addBillingPeriod(
  from: string,
  cycle: MembershipBillingCycle,
  durationDays: number | null
) {
  const base = new Date(from);
  if (Number.isNaN(base.getTime())) return from;
  const next = new Date(base);
  const addDays = (d: number) => next.setDate(next.getDate() + d);
  const addMonths = (m: number) => next.setMonth(next.getMonth() + m);

  switch (cycle) {
    case "monthly":
      addMonths(1);
      break;
    case "quarterly":
      addMonths(3);
      break;
    case "yearly":
      addMonths(12);
      break;
    case "session_pack":
    case "custom":
      addDays(Math.max(1, durationDays || 30));
      break;
    default:
      addMonths(1);
  }
  return next.toISOString().slice(0, 10);
}

export function statusBadgeClass(status: MembershipStatus | string) {
  if (status === "active") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300";
  }
  if (status === "paused") {
    return "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300";
  }
  if (status === "expired" || status === "cancelled") {
    return "border-border bg-muted text-muted-foreground";
  }
  return "";
}
