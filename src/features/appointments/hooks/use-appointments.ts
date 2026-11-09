"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { enquiryKeys } from "@/features/enquiries/hooks/use-enquiries";

import { appointmentsService } from "../services/appointments.service";
import type { AppointmentInput, AppointmentStatus, AppointmentView } from "../types";

export const appointmentKeys = {
  all: ["appointments"] as const,
  list: (view: AppointmentView) => [...appointmentKeys.all, "list", view] as const,
};

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    queryClient.invalidateQueries({ queryKey: ["clinic"] });
    queryClient.invalidateQueries({ queryKey: ["patients"] });
  };
}

export function useAppointments(view: AppointmentView) {
  return useQuery({
    queryKey: appointmentKeys.list(view),
    queryFn: () => appointmentsService.list(view),
  });
}

export function useSaveAppointment() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id?: number; input: AppointmentInput }) =>
      id ? appointmentsService.update(id, input) : appointmentsService.create(input),
    onSuccess: invalidate,
  });
}

export function useSetAppointmentStatus() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: AppointmentStatus }) =>
      appointmentsService.setStatus(id, status),
    onSuccess: invalidate,
  });
}

export function useArchiveAppointment() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, archived }: { id: number; archived: boolean }) =>
      appointmentsService.archive(id, archived),
    onSuccess: invalidate,
  });
}

export function useAppointmentFromEnquiry() {
  const invalidate = useInvalidate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      enquiryId,
      input,
    }: {
      enquiryId: number;
      input: { appointment_datetime: string; doctor_name?: string; reason?: string };
    }) => appointmentsService.fromEnquiry(enquiryId, input),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: enquiryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
