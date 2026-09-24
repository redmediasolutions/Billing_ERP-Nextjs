"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { invoiceKeys } from "@/features/invoices/hooks/use-invoices";
import { reminderKeys } from "@/features/reminders/hooks/use-reminders";

import { membershipsService } from "../services/memberships.service";
import type {
  MembershipEnrollmentInput,
  MembershipPlanInput,
  MembershipStatusInput,
} from "../types";

export const membershipKeys = {
  all: ["memberships"] as const,
  plans: () => [...membershipKeys.all, "plans"] as const,
  enrollments: () => [...membershipKeys.all, "enrollments"] as const,
  summary: () => [...membershipKeys.all, "summary"] as const,
};

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: membershipKeys.all });
}

export function useMembershipPlans() {
  return useQuery({
    queryKey: membershipKeys.plans(),
    queryFn: membershipsService.plans,
  });
}

export function useMembershipEnrollments() {
  return useQuery({
    queryKey: membershipKeys.enrollments(),
    queryFn: membershipsService.enrollments,
  });
}

export function useMembershipSummary() {
  return useQuery({
    queryKey: membershipKeys.summary(),
    queryFn: membershipsService.summary,
  });
}

export function useCreateMembershipPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: MembershipPlanInput) =>
      membershipsService.createPlan(input),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useUpdateMembershipPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: MembershipPlanInput }) =>
      membershipsService.updatePlan(id, input),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useCreateMembershipEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: MembershipEnrollmentInput) =>
      membershipsService.createEnrollment(input),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useUpdateMembershipEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: MembershipEnrollmentInput;
    }) => membershipsService.updateEnrollment(id, input),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useChangeMembershipStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: MembershipStatusInput }) =>
      membershipsService.changeStatus(id, input),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useMembershipCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      note,
    }: {
      id: number;
      note?: string;
    }) => membershipsService.checkIn(id, { note, source: "desk" }),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useMembershipInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => membershipsService.createInvoice(id),
    onSuccess: () => {
      invalidateAll(queryClient);
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
}

export function useScheduleMembershipRenewal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => membershipsService.scheduleRenewal(id),
    onSuccess: () => {
      invalidateAll(queryClient);
      queryClient.invalidateQueries({ queryKey: reminderKeys.all });
    },
  });
}

export function useDeleteMembershipEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => membershipsService.removeEnrollment(id),
    onSuccess: () => invalidateAll(queryClient),
  });
}
