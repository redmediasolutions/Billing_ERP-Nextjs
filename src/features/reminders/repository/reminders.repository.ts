import { apiRequest } from "@/lib/api";
import type {
  Reminder,
  ReminderActionInput,
  ReminderInput,
  ReminderSnoozeInput,
  ReminderSummary,
  ReminderSyncResult,
} from "../types";

export const remindersRepository = {
  list: () => apiRequest<Reminder[]>("/reminders"),

  summary: () => apiRequest<ReminderSummary>("/reminders/summary"),

  getById: (id: number) => apiRequest<Reminder>(`/reminders/${id}`),

  create: (input: ReminderInput) =>
    apiRequest<Reminder>("/reminders", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  update: (id: number, input: ReminderInput) =>
    apiRequest<Reminder>(`/reminders/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  remove: (id: number) =>
    apiRequest<{ id: number }>(`/reminders/${id}`, {
      method: "DELETE",
    }),

  complete: (id: number, input: ReminderActionInput = {}) =>
    apiRequest<Reminder>(`/reminders/${id}/complete`, {
      method: "POST",
      body: JSON.stringify(input),
    }),

  snooze: (id: number, input: ReminderSnoozeInput) =>
    apiRequest<Reminder>(`/reminders/${id}/snooze`, {
      method: "POST",
      body: JSON.stringify(input),
    }),

  syncInvoices: () =>
    apiRequest<ReminderSyncResult>("/reminders/sync-invoices", {
      method: "POST",
      body: JSON.stringify({}),
    }),

  fromInvoice: (invoiceId: number, input: Partial<ReminderInput> = {}) =>
    apiRequest<Reminder>(`/reminders/from-invoice/${invoiceId}`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
};
