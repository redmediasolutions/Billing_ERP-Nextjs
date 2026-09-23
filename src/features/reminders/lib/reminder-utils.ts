import type {
  Reminder,
  ReminderRecurrence,
  ReminderStatus,
  ReminderType,
} from "../types";
import { REMINDER_RECURRENCES, REMINDER_TYPES } from "../types";

export function toNum(value: unknown, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
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

export function typeLabel(type: string) {
  return REMINDER_TYPES.find((item) => item.value === type)?.label || type;
}

export function recurrenceLabel(recurrence: string, days?: number | null) {
  if (recurrence === "custom" && days) return `Every ${days} days`;
  return (
    REMINDER_RECURRENCES.find((item) => item.value === recurrence)?.label ||
    recurrence
  );
}

export function statusLabel(status: string) {
  const map: Record<string, string> = {
    scheduled: "Scheduled",
    due: "Due",
    overdue: "Overdue",
    snoozed: "Snoozed",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return map[status] || status;
}

export function formatShortDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function daysUntil(dueAt: string | null | undefined, now = new Date()) {
  if (!dueAt) return 0;
  const due = startOfDay(new Date(dueAt));
  const today = startOfDay(now);
  return Math.round((due.getTime() - today.getTime()) / 86_400_000);
}

export function isDueToday(reminder: Pick<Reminder, "due_at" | "status">) {
  if (!ACTIVE(reminder.status)) return false;
  return daysUntil(reminder.due_at) === 0;
}

export function isOverdue(reminder: Pick<Reminder, "due_at" | "status">) {
  if (!ACTIVE(reminder.status)) return false;
  if (reminder.status === "overdue") return true;
  return daysUntil(reminder.due_at) < 0;
}

export function isUpcoming(
  reminder: Pick<Reminder, "due_at" | "status" | "lead_days">,
  withinDays = 7
) {
  if (!ACTIVE(reminder.status)) return false;
  const days = daysUntil(reminder.due_at);
  return days > 0 && days <= Math.max(withinDays, reminder.lead_days || 0);
}

function ACTIVE(status: ReminderStatus | string) {
  return ["scheduled", "due", "overdue", "snoozed"].includes(status);
}

export function effectiveStatus(
  row: Pick<Reminder, "status" | "due_at" | "snoozed_until">
): ReminderStatus {
  const base = String(row.status || "scheduled") as ReminderStatus;
  if (base === "completed" || base === "cancelled") return base;

  const snoozedUntil = row.snoozed_until ? new Date(row.snoozed_until) : null;
  if (snoozedUntil && snoozedUntil.getTime() > Date.now()) {
    return "snoozed";
  }

  const days = daysUntil(row.due_at);
  if (days < 0) return "overdue";
  if (days === 0) return "due";
  return "scheduled";
}

export function recurrenceDays(
  recurrence: ReminderRecurrence,
  customDays: number | null
) {
  if (recurrence === "custom") return Math.max(1, toNum(customDays, 30));
  const preset = REMINDER_RECURRENCES.find((item) => item.value === recurrence);
  return preset?.days ?? 0;
}

export function advanceDueDate(
  dueAt: string,
  recurrence: ReminderRecurrence,
  recurrenceDaysValue: number | null
) {
  const base = new Date(dueAt);
  if (Number.isNaN(base.getTime())) return dueAt;

  const addDays = (days: number) => {
    const next = new Date(base);
    next.setDate(next.getDate() + days);
    return next;
  };

  const addMonths = (months: number) => {
    const next = new Date(base);
    next.setMonth(next.getMonth() + months);
    return next;
  };

  switch (recurrence) {
    case "daily":
      return addDays(1).toISOString();
    case "weekly":
      return addDays(7).toISOString();
    case "monthly":
      return addMonths(1).toISOString();
    case "quarterly":
      return addMonths(3).toISOString();
    case "semi_annual":
      return addMonths(6).toISOString();
    case "yearly":
      return addMonths(12).toISOString();
    case "custom":
      return addDays(recurrenceDays(recurrence, recurrenceDaysValue)).toISOString();
    default:
      return dueAt;
  }
}

export function typeBadgeClass(type: ReminderType | string) {
  if (type === "service") {
    return "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300";
  }
  if (type === "payment") {
    return "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300";
  }
  if (type === "renewal") {
    return "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300";
  }
  return "";
}

export function dueCopy(reminder: Pick<Reminder, "due_at" | "status">) {
  const days = daysUntil(reminder.due_at);
  if (reminder.status === "completed") return "Completed";
  if (reminder.status === "cancelled") return "Cancelled";
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `In ${days} days`;
}
