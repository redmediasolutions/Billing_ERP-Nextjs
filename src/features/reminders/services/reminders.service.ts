import { remindersRepository } from "../repository/reminders.repository";
import {
  asBool,
  daysUntil,
  effectiveStatus,
  toDateInput,
  toNum,
} from "../lib/reminder-utils";
import type {
  Reminder,
  ReminderInput,
  ReminderLog,
  ReminderRecurrence,
  ReminderStatus,
  ReminderSummary,
  ReminderType,
} from "../types";

const TYPES: ReminderType[] = [
  "service",
  "payment",
  "renewal",
  "general",
  "warranty",
  "booking",
];

const RECURRENCES: ReminderRecurrence[] = [
  "none",
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "semi_annual",
  "yearly",
  "custom",
];

function asType(value: unknown): ReminderType {
  const next = String(value || "general") as ReminderType;
  return TYPES.includes(next) ? next : "general";
}

function asRecurrence(value: unknown): ReminderRecurrence {
  const next = String(value || "none") as ReminderRecurrence;
  return RECURRENCES.includes(next) ? next : "none";
}

function parseLogs(raw: unknown): ReminderLog[] {
  if (Array.isArray(raw)) return raw as ReminderLog[];
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

function normalizeReminder(
  row: Reminder & { logs_json?: unknown }
): Reminder {
  const status = effectiveStatus({
    status: String(row.status || "scheduled") as ReminderStatus,
    due_at: row.due_at,
    snoozed_until: row.snoozed_until,
  });

  return {
    ...row,
    reminder_type: asType(row.reminder_type),
    recurrence: asRecurrence(row.recurrence),
    recurrence_days:
      row.recurrence_days == null ? null : toNum(row.recurrence_days),
    lead_days: toNum(row.lead_days, 3),
    customer_ref: row.customer_ref ? Number(row.customer_ref) : null,
    item_ref: row.item_ref ? Number(row.item_ref) : null,
    invoice_ref: row.invoice_ref ? Number(row.invoice_ref) : null,
    booking_ref: row.booking_ref ? Number(row.booking_ref) : null,
    warranty_ref: row.warranty_ref ? Number(row.warranty_ref) : null,
    assigned_to: row.assigned_to ? Number(row.assigned_to) : null,
    amount_due:
      row.amount_due == null || row.amount_due === ("" as never)
        ? null
        : toNum(row.amount_due),
    due_at: toDateInput(row.due_at),
    last_completed_at: row.last_completed_at
      ? toDateInput(row.last_completed_at)
      : null,
    snoozed_until: row.snoozed_until ? toDateInput(row.snoozed_until) : null,
    status,
    is_archived: asBool(row.is_archived),
    days_until_due: toNum(row.days_until_due, daysUntil(row.due_at)),
    is_actionable: asBool(row.is_actionable ?? ACTIVE(status)),
    display_customer_name:
      row.display_customer_name || row.customer_name || null,
    display_phone: row.display_phone || row.phone || null,
    logs: parseLogs(row.logs ?? row.logs_json),
  };
}

function ACTIVE(status: ReminderStatus) {
  return ["scheduled", "due", "overdue", "snoozed"].includes(status);
}

function normalizeSummary(summary: ReminderSummary): ReminderSummary {
  return {
    total: toNum(summary.total),
    due_today: toNum(summary.due_today),
    overdue: toNum(summary.overdue),
    upcoming_7d: toNum(summary.upcoming_7d),
    service: toNum(summary.service),
    payment: toNum(summary.payment),
    renewal: toNum(summary.renewal),
    completed_this_month: toNum(summary.completed_this_month),
    by_type: summary.by_type || [],
    by_status: summary.by_status || [],
  };
}

export const remindersService = {
  async list() {
    const rows = await remindersRepository.list();
    return rows.map(normalizeReminder);
  },

  async summary() {
    const summary = await remindersRepository.summary();
    return normalizeSummary(summary);
  },

  async getById(id: number) {
    const row = await remindersRepository.getById(id);
    return normalizeReminder(row);
  },

  async create(input: ReminderInput) {
    const row = await remindersRepository.create(input);
    return normalizeReminder(row);
  },

  async update(id: number, input: ReminderInput) {
    const row = await remindersRepository.update(id, input);
    return normalizeReminder(row);
  },

  remove: (id: number) => remindersRepository.remove(id),

  async complete(id: number, input: Parameters<typeof remindersRepository.complete>[1]) {
    const row = await remindersRepository.complete(id, input);
    return normalizeReminder(row);
  },

  async snooze(id: number, input: Parameters<typeof remindersRepository.snooze>[1]) {
    const row = await remindersRepository.snooze(id, input);
    return normalizeReminder(row);
  },

  syncInvoices: () => remindersRepository.syncInvoices(),

  async fromInvoice(
    invoiceId: number,
    input: Partial<ReminderInput> = {}
  ) {
    const row = await remindersRepository.fromInvoice(invoiceId, input);
    return normalizeReminder(row);
  },
};
