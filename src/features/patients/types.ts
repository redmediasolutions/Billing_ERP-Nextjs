// A patient is an ERP customer + a clinic profile (same id as the customer).

export type PatientGender = "male" | "female" | "other";

export interface Patient {
  id: number;
  name: string;
  display_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  gender: string | null;
  dob: string | null;
  blood_group: string | null;
  is_archived: boolean;
  archived_at: string | null;
  registered_at: string | null;
  last_visit: string | null;
  consultation_count: number;
}

export interface PatientInput {
  name: string;
  phone: string;
  email: string;
  address: string;
  gender: string;
  dob: string;
  blood_group: string;
  /** link an existing ERP customer instead of creating a new one */
  customer_id?: number;
}

export interface PatientInvoiceRow {
  id: number;
  invoice_number: string;
  invoice_date: string | null;
  total: number;
  amount_paid: number;
  is_draft: number;
}

export interface PatientConsultationRow {
  id: number;
  consultation_number: string | null;
  consultation_date: string | null;
  chief_complaint: string | null;
  diagnosis: string | null;
  status: string;
  invoice_id: number | null;
}

export interface PatientAppointmentRow {
  id: number;
  appointment_datetime: string;
  doctor_name: string | null;
  reason: string | null;
  status: string;
  appointment_type: string;
}

export interface PatientDetail extends Patient {
  invoices: PatientInvoiceRow[];
  consultations: PatientConsultationRow[];
  appointments: PatientAppointmentRow[];
}

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
