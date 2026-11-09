export type AppointmentStatus = "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
export type AppointmentType = "regular" | "followup";

export interface Appointment {
  id: number;
  patient_id: number;
  patient_name: string | null;
  phone: string | null;
  doctor_name: string | null;
  appointment_datetime: string;
  reason: string | null;
  notes: string | null;
  status: AppointmentStatus;
  appointment_type: AppointmentType;
  consultation_id: number | null;
  enquiry_id: number | null;
  started_consultation_id: number | null;
  is_archived: boolean;
  archived_at: string | null;
  created_at: string | null;
  whatsapp_sent?: boolean;
}

export interface AppointmentInput {
  patient_id: number;
  appointment_datetime: string;
  doctor_name: string;
  reason: string;
  notes: string;
  appointment_type?: AppointmentType;
}

export type AppointmentView = "all" | "today" | "upcoming" | "archived";

export const APPOINTMENT_STATUSES: Array<{ value: AppointmentStatus; label: string }> = [
  { value: "scheduled", label: "Scheduled" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "no_show", label: "No-show" },
  { value: "cancelled", label: "Cancelled" },
];
