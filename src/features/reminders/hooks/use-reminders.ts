"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { remindersService } from "../services/reminders.service";
import type {
  ReminderActionInput,
  ReminderInput,
  ReminderSnoozeInput,
} from "../types";

export const reminderKeys = {
  all: ["reminders"] as const,
  list: () => [...reminderKeys.all, "list"] as const,
  summary: () => [...reminderKeys.all, "summary"] as const,
  detail: (id: number) => [...reminderKeys.all, "detail", id] as const,
};

function invalidateReminders(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: reminderKeys.all });
}

export function useReminders() {
  return useQuery({
    queryKey: reminderKeys.list(),
    queryFn: remindersService.list,
  });
}

export function useReminderSummary() {
  return useQuery({
    queryKey: reminderKeys.summary(),
    queryFn: remindersService.summary,
  });
}

export function useReminder(id: number | null) {
  return useQuery({
    queryKey: reminderKeys.detail(id ?? 0),
    queryFn: () => remindersService.getById(id as number),
    enabled: Boolean(id),
  });
}

export function useCreateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ReminderInput) => remindersService.create(input),
    onSuccess: () => invalidateReminders(queryClient),
  });
}

export function useUpdateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ReminderInput }) =>
      remindersService.update(id, input),
    onSuccess: () => invalidateReminders(queryClient),
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => remindersService.remove(id),
    onSuccess: () => invalidateReminders(queryClient),
  });
}

export function useCompleteReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input?: ReminderActionInput;
    }) => remindersService.complete(id, input),
    onSuccess: () => invalidateReminders(queryClient),
  });
}

export function useSnoozeReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: ReminderSnoozeInput;
    }) => remindersService.snooze(id, input),
    onSuccess: () => invalidateReminders(queryClient),
  });
}

export function useSyncInvoiceReminders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => remindersService.syncInvoices(),
    onSuccess: () => invalidateReminders(queryClient),
  });
}

export function useCreateReminderFromInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      invoiceId,
      input,
    }: {
      invoiceId: number;
      input?: Partial<ReminderInput>;
    }) => remindersService.fromInvoice(invoiceId, input),
    onSuccess: () => invalidateReminders(queryClient),
  });
}
