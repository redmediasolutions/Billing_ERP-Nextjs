import { apiRequest } from "@/lib/api";
import type {
  MembershipCheckIn,
  MembershipEnrollment,
  MembershipEnrollmentInput,
  MembershipInvoiceResult,
  MembershipPlan,
  MembershipPlanInput,
  MembershipRenewalResult,
  MembershipStatusInput,
  MembershipSummary,
} from "../types";

export const membershipsRepository = {
  plans: () => apiRequest<MembershipPlan[]>("/memberships/plans"),

  createPlan: (input: MembershipPlanInput) =>
    apiRequest<MembershipPlan>("/memberships/plans", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  updatePlan: (id: number, input: MembershipPlanInput) =>
    apiRequest<MembershipPlan>(`/memberships/plans/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  enrollments: () => apiRequest<MembershipEnrollment[]>("/memberships/enrollments"),

  summary: () => apiRequest<MembershipSummary>("/memberships/summary"),

  getEnrollment: (id: number) =>
    apiRequest<MembershipEnrollment>(`/memberships/enrollments/${id}`),

  createEnrollment: (input: MembershipEnrollmentInput) =>
    apiRequest<MembershipEnrollment>("/memberships/enrollments", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  updateEnrollment: (id: number, input: MembershipEnrollmentInput) =>
    apiRequest<MembershipEnrollment>(`/memberships/enrollments/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  changeStatus: (id: number, input: MembershipStatusInput) =>
    apiRequest<MembershipEnrollment>(`/memberships/enrollments/${id}/status`, {
      method: "POST",
      body: JSON.stringify(input),
    }),

  checkIn: (id: number, input: { note?: string; source?: string } = {}) =>
    apiRequest<{ enrollment: MembershipEnrollment; check_in: MembershipCheckIn }>(
      `/memberships/enrollments/${id}/check-in`,
      {
        method: "POST",
        body: JSON.stringify(input),
      }
    ),

  createInvoice: (id: number) =>
    apiRequest<MembershipInvoiceResult>(
      `/memberships/enrollments/${id}/invoice`,
      {
        method: "POST",
        body: JSON.stringify({}),
      }
    ),

  scheduleRenewal: (id: number) =>
    apiRequest<MembershipRenewalResult>(
      `/memberships/enrollments/${id}/schedule-renewal`,
      {
        method: "POST",
        body: JSON.stringify({}),
      }
    ),

  removeEnrollment: (id: number) =>
    apiRequest<{ id: number }>(`/memberships/enrollments/${id}`, {
      method: "DELETE",
    }),
};
