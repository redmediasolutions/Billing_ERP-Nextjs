"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { invoiceKeys } from "@/features/invoices/hooks/use-invoices";
import { customerKeys } from "@/features/customers/hooks/use-customers";

import { bookingsService } from "../services/bookings.service";
import type {
  BookingInput,
  BookingResourceInput,
  BookingResourceTypeInput,
  BookingStatusInput,
} from "../types";

export const bookingKeys = {
  all: ["bookings"] as const,
  list: () => [...bookingKeys.all, "list"] as const,
  summary: () => [...bookingKeys.all, "summary"] as const,
  calendar: (from: string, to: string) =>
    [...bookingKeys.all, "calendar", from, to] as const,
  detail: (id: number) => [...bookingKeys.all, "detail", id] as const,
  types: () => [...bookingKeys.all, "resource-types"] as const,
  resources: () => [...bookingKeys.all, "resources"] as const,
};

function invalidateBookings(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: bookingKeys.all });
}

export function useBookings() {
  return useQuery({
    queryKey: bookingKeys.list(),
    queryFn: bookingsService.list,
  });
}

export function useBookingSummary() {
  return useQuery({
    queryKey: bookingKeys.summary(),
    queryFn: bookingsService.summary,
  });
}

export function useBookingCalendar(from: string, to: string) {
  return useQuery({
    queryKey: bookingKeys.calendar(from, to),
    queryFn: () => bookingsService.calendar(from, to),
    enabled: Boolean(from && to),
  });
}

export function useBooking(id: number) {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => bookingsService.getById(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useBookingResourceTypes() {
  return useQuery({
    queryKey: bookingKeys.types(),
    queryFn: bookingsService.resourceTypes,
  });
}

export function useBookingResources() {
  return useQuery({
    queryKey: bookingKeys.resources(),
    queryFn: bookingsService.resources,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BookingInput) => bookingsService.create(input),
    onSuccess: () => {
      invalidateBookings(queryClient);
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: BookingInput }) =>
      bookingsService.update(id, input),
    onSuccess: () => invalidateBookings(queryClient),
  });
}

export function useChangeBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: BookingStatusInput }) =>
      bookingsService.changeStatus(id, input),
    onSuccess: () => invalidateBookings(queryClient),
  });
}

export function useConvertBookingToInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => bookingsService.convertToInvoice(id),
    onSuccess: () => {
      invalidateBookings(queryClient);
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
}

export function useDeleteBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => bookingsService.remove(id),
    onSuccess: () => invalidateBookings(queryClient),
  });
}

export function useCreateBookingResourceType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BookingResourceTypeInput) =>
      bookingsService.createResourceType(input),
    onSuccess: () => invalidateBookings(queryClient),
  });
}

export function useUpdateBookingResourceType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: BookingResourceTypeInput;
    }) => bookingsService.updateResourceType(id, input),
    onSuccess: () => invalidateBookings(queryClient),
  });
}

export function useCreateBookingResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BookingResourceInput) =>
      bookingsService.createResource(input),
    onSuccess: () => invalidateBookings(queryClient),
  });
}

export function useUpdateBookingResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: BookingResourceInput;
    }) => bookingsService.updateResource(id, input),
    onSuccess: () => invalidateBookings(queryClient),
  });
}
