export type ReminderType =
  | "service"
  | "payment"
  | "renewal"
  | "general"
  | "warranty"
  | "booking";

export type ReminderRecurrence =
  | "none"
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "semi_annual"
  | "yearly"
  | "custom";

export type ReminderStatus =
  | "scheduled"
  | "due"
  | "overdue"
  | "snoozed"
  | "completed"
  | "cancelled";

export type ReminderPriority = "low" | "medium" | "high";

export type ReminderSource =
  | "manual"
  | "invoice_sync"
  | "item_default"
  | "booking"
  | "warranty";

export type ReminderLogAction =
  | "created"
  | "updated"
  | "completed"
  | "snoozed"
  | "rescheduled"
  | "note"
  | "auto_sync"
  | "cancelled";

export interface ReminderLog {
  id: number;
  created_at: string;
  action: ReminderLogAction | string;
  note: string | null;
  author: string | null;
  due_at: string | null;
}

export interface Reminder {
  id: number;
  created_at: string;
  updated_at: string;
  tenant_id: number;
  reference: string;
  reminder_number: string;
  reminder_type: ReminderType;
  title: string;
  description: string | null;
  customer_ref: number | null;
  customer_name: string | null;
  phone: string | null;
  email: string | null;
  display_customer_name: string | null;
  display_phone: string | null;
  item_ref: number | null;
  item_name: string | null;
  invoice_ref: number | null;
  invoice_number: string | null;
  booking_ref: number | null;
  booking_number: string | null;
  warranty_ref: number | null;
  warranty_number: string | null;
  assigned_to: number | null;
  assigned_to_name: string | null;
  due_at: string;
  lead_days: number;
  recurrence: ReminderRecurrence;
  recurrence_days: number | null;
  last_completed_at: string | null;
  snoozed_until: string | null;
  amount_due: number | null;
  renewal_label: string | null;
  status: ReminderStatus;
  source: ReminderSource;
  is_archived: boolean;
  days_until_due: number;
  is_actionable: boolean;
  logs: ReminderLog[];
}

export interface ReminderInput {
  reminder_type: ReminderType;
  title: string;
  description: string;
  customer_ref: number | null;
  customer_name: string;
  phone: string;
  email: string;
  item_ref: number | null;
  invoice_ref: number | null;
  booking_ref: number | null;
  warranty_ref: number | null;
  assigned_to: number | null;
  due_at: string;
  lead_days: number;
  recurrence: ReminderRecurrence;
  recurrence_days: number | null;
  amount_due: number | null;
  renewal_label: string;
  status?: ReminderStatus;
  create_customer?: boolean;
}

export interface ReminderActionInput {
  note?: string;
  completed_at?: string;
}

export interface ReminderSnoozeInput {
  snoozed_until: string;
  note?: string;
}

export interface ReminderSummary {
  total: number;
  due_today: number;
  overdue: number;
  upcoming_7d: number;
  service: number;
  payment: number;
  renewal: number;
  completed_this_month: number;
  by_type: Array<{ reminder_type: string; total: number }>;
  by_status: Array<{ status: string; total: number }>;
}

export interface ReminderSyncResult {
  created: number;
  updated: number;
  skipped: number;
}

export const REMINDER_TYPES: Array<{
  value: ReminderType;
  label: string;
  hint: string;
}> = [
  {
    value: "service",
    label: "Service",
    hint: "AMC, installation follow-up, periodic maintenance",
  },
  {
    value: "payment",
    label: "Payment",
    hint: "Collect pending invoice or fee",
  },
  {
    value: "renewal",
    label: "Renewal",
    hint: "Domain, licence, subscription, contract",
  },
  {
    value: "general",
    label: "General",
    hint: "Any one-off follow-up",
  },
  {
    value: "warranty",
    label: "Warranty",
    hint: "Linked to a warranty registration",
  },
  {
    value: "booking",
    label: "Booking",
    hint: "Follow-up after an appointment or stay",
  },
];

export const REMINDER_RECURRENCES: Array<{
  value: ReminderRecurrence;
  label: string;
  days?: number;
}> = [
  { value: "none", label: "One time" },
  { value: "daily", label: "Daily", days: 1 },
  { value: "weekly", label: "Weekly", days: 7 },
  { value: "monthly", label: "Monthly", days: 30 },
  { value: "quarterly", label: "Quarterly", days: 90 },
  { value: "semi_annual", label: "Every 6 months", days: 182 },
  { value: "yearly", label: "Yearly", days: 365 },
  { value: "custom", label: "Custom interval" },
];

export const REMINDER_STATUSES: Array<{
  value: ReminderStatus;
  label: string;
}> = [
  { value: "scheduled", label: "Scheduled" },
  { value: "due", label: "Due" },
  { value: "overdue", label: "Overdue" },
  { value: "snoozed", label: "Snoozed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export const REMINDER_PRIORITIES: Array<{
  value: ReminderPriority;
  label: string;
}> = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export const ACTIVE_REMINDER_STATUSES: ReminderStatus[] = [
  "scheduled",
  "due",
  "overdue",
  "snoozed",
];
