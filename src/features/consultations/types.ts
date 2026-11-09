export type ConsultationStatus = "draft" | "completed";

export interface Consultation {
  id: number;
  patient_id: number;
  appointment_id: number | null;
  doctor_id: number | null;
  invoice_id: number | null;
  consultation_number: string | null;
  consultation_date: string | null;
  chief_complaint: string | null;
  symptoms: string | null;
  diagnosis: string | null;
  notes: string | null;
  consultation_fee: number;
  status: ConsultationStatus;
  is_archived: boolean;
  created_at: string | null;
  updated_at: string | null;
  patient_name: string | null;
  patient_phone: string | null;
  gender: string | null;
  dob: string | null;
  blood_group: string | null;
  doctor_name: string | null;
  invoice_number: string | null;
  invoice_total: number;
  invoice_paid: number;
}

export interface ConsultationVitals {
  id?: number;
  blood_pressure: string | null;
  pulse: string | null;
  temperature: string | null;
  oxygen_saturation: string | null;
  weight: string | null;
  height: string | null;
  bmi: string | null;
  notes: string | null;
  created_at?: string | null;
}

export interface ConsultationProcedure {
  id: number;
  service_id: number | null;
  procedure_name: string | null;
  quantity: number;
  price: number;
  total: number;
  notes: string | null;
}

export interface ConsultationPrescription {
  id: number;
  medicine_id: number | null;
  medicine_name: string | null;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  instructions: string | null;
}

export interface ConsultationAttachment {
  id: number;
  file_key: string;
  file_type: string | null;
  title: string | null;
  created_at: string | null;
}

export interface ConsultationFollowupNote {
  id: number;
  followup_date: string | null;
  notes: string | null;
  created_at: string | null;
}

export interface ConsultationFollowupAppointment {
  id: number;
  appointment_datetime: string;
  doctor_name: string | null;
  reason: string | null;
  status: string;
}

export interface ConsultationDetail {
  consultation: Consultation;
  vitals: ConsultationVitals[];
  procedures: ConsultationProcedure[];
  prescriptions: ConsultationPrescription[];
  attachments: ConsultationAttachment[];
  followup_notes: ConsultationFollowupNote[];
  followups: ConsultationFollowupAppointment[];
}

export interface ConsultationNotesInput {
  chief_complaint: string;
  symptoms: string;
  diagnosis: string;
  notes: string;
  consultation_fee: number;
}

export interface ProcedureInput {
  service_id?: number | null;
  procedure_name?: string;
  quantity: number;
  price?: number | null;
  notes?: string;
}

export interface PrescriptionInput {
  medicine_id?: number | null;
  medicine_name?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}

export interface FollowupInput {
  followup_date: string;
  notes?: string;
  book_appointment?: boolean;
  doctor_name?: string;
}

export interface GenerateBillInput {
  discount?: number;
  extra_lines?: Array<{ item_id: number; quantity: number; batch_id?: number | null }>;
}

export const FREQUENCY_PRESETS = ["1-0-1", "1-1-1", "1-0-0", "0-0-1", "0-1-0", "SOS", "Once a week"];
