import { apiRequest } from "@/lib/api";
import type {
  Booking,
  BookingAvailability,
  BookingInput,
  BookingResource,
  BookingResourceInput,
  BookingResourceType,
  BookingResourceTypeInput,
  BookingStatusInput,
  BookingSummary,
  ConvertBookingResult,
} from "../types";

export const bookingsRepository = {
  list: () => apiRequest<Booking[]>("/bookings"),

  summary: () => apiRequest<BookingSummary>("/bookings/summary"),

  calendar: (from: string, to: string) =>
    apiRequest<Booking[]>(
      `/bookings/calendar?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
    ),

  getById: (id: number) => apiRequest<Booking>(`/bookings/${id}`),

  create: (input: BookingInput) =>
    apiRequest<Booking>("/bookings", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  update: (id: number, input: BookingInput) =>
    apiRequest<Booking>(`/bookings/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  changeStatus: (id: number, input: BookingStatusInput) =>
    apiRequest<Booking>(`/bookings/${id}/status`, {
      method: "POST",
      body: JSON.stringify(input),
    }),

  convertToInvoice: (id: number) =>
    apiRequest<ConvertBookingResult>(`/bookings/${id}/invoice`, {
      method: "POST",
    }),

  remove: (id: number) =>
    apiRequest<{ id: number }>(`/bookings/${id}`, {
      method: "DELETE",
    }),

  availability: (input: {
    starts_at: string;
    ends_at: string;
    occupancy?: number;
    ignore_booking_id?: number;
    lines: Array<{ resource_ref: number | null; occupancy?: number }>;
  }) =>
    apiRequest<BookingAvailability>("/bookings/availability", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  resourceTypes: () =>
    apiRequest<BookingResourceType[]>("/bookings/resource-types"),

  createResourceType: (input: BookingResourceTypeInput) =>
    apiRequest<Pick<BookingResourceType, "id" | "type_label">>(
      "/bookings/resource-types",
      {
        method: "POST",
        body: JSON.stringify(input),
      }
    ),

  updateResourceType: (id: number, input: BookingResourceTypeInput) =>
    apiRequest<{ id: number }>(`/bookings/resource-types/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  resources: () => apiRequest<BookingResource[]>("/bookings/resources"),

  createResource: (input: BookingResourceInput) =>
    apiRequest<BookingResource>("/bookings/resources", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  updateResource: (id: number, input: BookingResourceInput) =>
    apiRequest<BookingResource>(`/bookings/resources/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
};
