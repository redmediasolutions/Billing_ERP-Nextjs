export interface ClinicSettings {
  id: number;
  name: string;
  address: string;
  email: string;
  phone: string;
  logo: string;
  dr_name: string;
  clinic_enabled: boolean;
}

export interface ClinicSettingsInput {
  dr_name?: string;
  clinic_enabled?: boolean;
}

export interface ClinicDashboardAppointment {
  id: number;
  patient_id: number;
  patient_name: string | null;
  phone: string | null;
  doctor_name: string | null;
  appointment_datetime: string;
  reason: string | null;
  status: string;
  appointment_type: string;
}

export interface ClinicDashboard {
  user: { role: string | null };
  kpi: {
    patients_this_month: number;
    patients_this_week: number;
    total_patients: number;
    income_today: number;
    income_week: number;
    income_month: number;
    draft_consultations: number;
    unbilled_consultations: number;
    low_stock_medicines: number;
    expiring_batches: number;
  };
  limits: { low_stock: number; expiry_days: number };
  appointments: ClinicDashboardAppointment[];
}

export type ClinicBillLineType = "service" | "medicine";

export interface ClinicBillLine {
  key: string;
  type: ClinicBillLineType;
  item_id: number;
  name: string;
  batch_id: number | null;
  batch_label: string | null;
  qty: number;
  price: number;
  available: number | null;
}

export type ClinicPaymentMethod = "cash" | "upi" | "card" | "bank" | "cheque" | "other";

export interface ClinicPaymentInput {
  method: ClinicPaymentMethod;
  amount: number;
  reference_no?: string;
}

export interface ClinicBillInput {
  patient_id: number;
  bill_date?: string;
  discount?: number;
  notes?: string;
  items: Array<{
    type: ClinicBillLineType;
    service_id?: number;
    medicine_id?: number;
    medicine_batch_id?: number | null;
    qty: number;
    price: number;
  }>;
  payments: ClinicPaymentInput[];
  total: number;
  allow_no_payment: true;
}

export interface ClinicBillResult {
  invoice_id: number;
  invoice_number: string;
  bill_date: string;
  total: number;
  amount_paid: number;
  balance: number;
  status: "unpaid" | "partial" | "paid";
}
