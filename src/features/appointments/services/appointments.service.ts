import { appointmentsRepository } from "../repository/appointments.repository";
import type { Appointment, AppointmentInput, AppointmentStatus, AppointmentView } from "../types";

const normalize = (a: Appointment): Appointment => ({
  ...a,
  is_archived: Boolean(a.is_archived),
  appointment_type: a.appointment_type === "followup" ? "followup" : "regular",
});

export const appointmentsService = {
  list: async (view: AppointmentView) => (await appointmentsRepository.list(view)).map(normalize),
  create: async (input: AppointmentInput) => normalize(await appointmentsRepository.create(input)),
  update: async (id: number, input: AppointmentInput) => normalize(await appointmentsRepository.update(id, input)),
  setStatus: async (id: number, status: AppointmentStatus) =>
    normalize(await appointmentsRepository.setStatus(id, status)),
  archive: (id: number, archived: boolean) => appointmentsRepository.archive(id, archived),
  fromEnquiry: async (
    enquiryId: number,
    input: { appointment_datetime: string; doctor_name?: string; reason?: string }
  ) => normalize(await appointmentsRepository.fromEnquiry(enquiryId, input)),
};
