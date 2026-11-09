import { apiRequest } from "@/lib/api";
import { CLINIC_API } from "@/features/clinic/repository/clinic.repository";

import type { Appointment, AppointmentInput, AppointmentStatus, AppointmentView } from "../types";

const json = (method: string, body?: unknown): RequestInit => ({
  method,
  body: body === undefined ? undefined : JSON.stringify(body),
});

export const appointmentsRepository = {
  list: (view: AppointmentView) =>
    apiRequest<Appointment[]>(`${CLINIC_API}/appointments${view === "all" ? "" : `?view=${view}`}`),

  create: (input: AppointmentInput) =>
    apiRequest<Appointment>(`${CLINIC_API}/appointments`, json("POST", input)),

  update: (id: number, input: AppointmentInput) =>
    apiRequest<Appointment>(`${CLINIC_API}/appointments/${id}`, json("PUT", input)),

  setStatus: (id: number, status: AppointmentStatus) =>
    apiRequest<Appointment>(`${CLINIC_API}/appointments/${id}/status`, json("PUT", { status })),

  archive: (id: number, archived: boolean) =>
    apiRequest<null>(`${CLINIC_API}/appointments/${id}/${archived ? "archive" : "restore"}`, json("PUT")),

  /** ERP enquiry -> appointment (creates the patient if the enquiry has none) */
  fromEnquiry: (enquiryId: number, input: { appointment_datetime: string; doctor_name?: string; reason?: string }) =>
    apiRequest<Appointment>(`${CLINIC_API}/enquiries/${enquiryId}/convert`, json("POST", input)),
};
