export type BookingKind = "appointment" | "stay" | "event";

export type BookingStatus =
  | "draft"
  | "held"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "no_show"
  | "cancelled";

export type BookingTimeModel = "timed" | "overnight" | "all_day";

export interface BookingResourceType {
  id: number;
  created_at: string;
  type_key: string;
  type_label: string;
  time_model: BookingTimeModel;
  default_duration_min: number | null;
  allows_staff: boolean;
  is_active: boolean;
  is_system: boolean;
  sort_order: number;
}

export interface BookingResource {
  id: number;
  created_at: string;
  reference: string;
  resource_name: string;
  resource_code: string | null;
  type_ref: number;
  type_key: string | null;
  type_label: string | null;
  time_model: BookingTimeModel | null;
  item_ref: number | null;
  item_name: string | null;
  employee_ref: number | null;
  employee_name: string | null;
  capacity: number;
  buffer_before_min: number;
  buffer_after_min: number;
  color: string | null;
  notes: string | null;
  is_active: boolean;
  is_archived: boolean;
}

export interface BookingLine {
  id: string;
  resource_ref: number | null;
  resource_name: string | null;
  item_ref: number | null;
  employee_ref: number | null;
  employee_name: string | null;
  line_name: string;
  hsn_code: string;
  unit: string;
  description: string;
  quantity: number;
  occupancy: number;
  unit_price: number;
  amount_before_tax: number;
  tax_rate: number;
  tax_amount: number;
  line_discount: number;
  line_total: number;
  line_starts_at: string | null;
  line_ends_at: string | null;
}

export interface BookingStatusLog {
  id: number;
  created_at: string;
  from_status: string | null;
  to_status: string;
  note: string | null;
  author: string | null;
}

export interface Booking {
  id: number;
  created_at: string;
  updated_at: string;
  tenant_id: number;
  reference: string;
  booking_number: string;
  booking_kind: BookingKind;
  status: BookingStatus;
  customer_ref: number | null;
  customer_name: string | null;
  phone: string | null;
  email: string | null;
  enquiry_ref: number | null;
  employee_ref: number | null;
  employee_name: string | null;
  invoice_ref: number | null;
  invoice_number: string | null;
  party_size: number;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
  source: string | null;
  deposit_amount: number;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  grand_total: number;
  notes: string | null;
  cancel_reason: string | null;
  cancelled_at: string | null;
  is_archived: boolean;
  display_customer_name: string | null;
  display_phone: string | null;
  display_email: string | null;
  lines: BookingLine[];
  status_logs?: BookingStatusLog[];
}

export interface BookingLineInput {
  resource_ref: number | null;
  item_ref: number | null;
  employee_ref: number | null;
  line_name: string;
  hsn_code: string;
  unit: string;
  description: string;
  quantity: number;
  occupancy: number;
  unit_price: number;
  tax_rate: number;
  line_discount: number;
  line_starts_at: string;
  line_ends_at: string;
}

export interface BookingInput {
  booking_kind: BookingKind;
  status: BookingStatus;
  customer_ref: number | null;
  customer_name: string;
  phone: string;
  email: string;
  enquiry_ref: number | null;
  employee_ref: number | null;
  party_size: number;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
  source: string;
  deposit_amount: number;
  discount_amount: number;
  notes: string;
  create_customer?: boolean;
  lines: BookingLineInput[];
}

export interface BookingStatusInput {
  status: BookingStatus;
  note?: string;
  cancel_reason?: string;
}

export interface BookingResourceTypeInput {
  type_key: string;
  type_label: string;
  time_model: BookingTimeModel;
  default_duration_min?: number | null;
  allows_staff?: boolean;
  is_active?: boolean;
}

export interface BookingResourceInput {
  resource_name: string;
  resource_code: string;
  type_ref: number;
  item_ref: number | null;
  employee_ref: number | null;
  capacity: number;
  buffer_before_min: number;
  buffer_after_min: number;
  color: string;
  notes: string;
  is_active?: boolean;
}

export interface BookingConflict {
  resource_ref: number;
  resource_name?: string;
  capacity?: number;
  already_booked?: number;
  requested?: number;
  message: string;
  clashes?: Array<{
    booking_number: string;
    status: string;
    customer_name: string | null;
    starts_at: string;
    ends_at: string;
  }>;
}

export interface BookingAvailability {
  ok: boolean;
  conflicts: BookingConflict[];
}

export interface BookingSummary {
  total: number;
  today: number;
  upcoming: number;
  in_progress: number;
  arriving_today: number;
  departing_today: number;
  unbilled: number;
  this_month_value: number;
  by_kind: Array<{ booking_kind: string; total: number }>;
  by_status: Array<{ status: string; total: number }>;
}

export interface ConvertBookingResult {
  booking: Booking;
  invoice_id: number;
  invoice_number?: string;
}

export const BOOKING_KINDS: Array<{
  value: BookingKind;
  label: string;
  hint: string;
}> = [
  {
    value: "appointment",
    label: "Appointment",
    hint: "Spa, salon, clinic — start time and duration",
  },
  {
    value: "stay",
    label: "Stay",
    hint: "Hotel, lodge — check-in to check-out nights",
  },
  {
    value: "event",
    label: "Event",
    hint: "Hall or venue — date with a time window",
  },
];

export const BOOKING_STATUSES: Array<{
  value: BookingStatus;
  label: string;
  appointment: string;
  stay: string;
}> = [
  { value: "draft", label: "Draft", appointment: "Draft", stay: "Draft" },
  { value: "held", label: "Held", appointment: "Held", stay: "On hold" },
  {
    value: "confirmed",
    label: "Confirmed",
    appointment: "Confirmed",
    stay: "Confirmed",
  },
  {
    value: "in_progress",
    label: "In progress",
    appointment: "Arrived",
    stay: "Checked in",
  },
  {
    value: "completed",
    label: "Completed",
    appointment: "Completed",
    stay: "Checked out",
  },
  { value: "no_show", label: "No show", appointment: "No show", stay: "No show" },
  {
    value: "cancelled",
    label: "Cancelled",
    appointment: "Cancelled",
    stay: "Cancelled",
  },
];

export const BOOKING_SOURCES = [
  "Walk-in",
  "Phone",
  "WhatsApp",
  "Online",
  "Front desk",
] as const;

export const TIME_MODELS: Array<{
  value: BookingTimeModel;
  label: string;
}> = [
  { value: "timed", label: "Timed slot (salon / spa)" },
  { value: "overnight", label: "Overnight (hotel / lodge)" },
  { value: "all_day", label: "All day (venue)" },
];
