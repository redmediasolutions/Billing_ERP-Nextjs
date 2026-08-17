export type EnquiryStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal"
  | "won"
  | "lost";

export type EnquiryPriority = "low" | "medium" | "high";

export type EnquiryUpdateType = "created" | "note" | "status" | "follow_up";

export interface EnquiryUpdate {
  id: string;
  at: string;
  type: EnquiryUpdateType | string;
  note: string | null;
  status?: string | null;
  follow_up_at?: string | null;
  author?: string | null;
}

export interface EnquiryChannel {
  id: number;
  created_at: string;
  channel_name: string;
  is_active: boolean;
  is_system: boolean;
  sort_order: number;
}

export interface Enquiry {
  id: number;
  created_at: string;
  updated_at: string;
  tenant_id: number;
  reference: string;
  customer_ref: number | null;
  customer_name: string | null;
  phone: string | null;
  email: string | null;
  channel: string | null;
  channel_ref: number | null;
  status: EnquiryStatus;
  priority: EnquiryPriority;
  source_detail: string | null;
  enquiry_data: string | null;
  estimated_value: number | null;
  assigned_to: number | null;
  call_datetime: string | null;
  follow_up_at: string | null;
  follow_up_note: string | null;
  lost_reason: string | null;
  updates: EnquiryUpdate[];
  is_archived: boolean;
  display_customer_name: string | null;
  display_phone: string | null;
  display_email: string | null;
  channel_name: string | null;
  assigned_to_name: string | null;
}

export interface EnquiryInput {
  customer_ref: number | null;
  customer_name: string;
  phone: string;
  email: string;
  channel_ref: number | null;
  channel: string;
  status: EnquiryStatus;
  priority: EnquiryPriority;
  source_detail: string;
  enquiry_data: string;
  estimated_value: number | null;
  assigned_to: number | null;
  call_datetime: string;
  follow_up_at: string;
  follow_up_note: string;
  lost_reason: string;
  create_customer?: boolean;
}

export interface EnquiryUpdateInput {
  note?: string;
  status?: EnquiryStatus;
  follow_up_at?: string;
  follow_up_note?: string;
  lost_reason?: string;
}

export interface EnquiryChannelInput {
  channel_name: string;
  is_active?: boolean;
}

export interface EnquirySummary {
  total: number;
  status_new: number;
  open_pipeline: number;
  won: number;
  lost: number;
  overdue_followups: number;
  due_today: number;
  this_month: number;
  pipeline_value: number;
  by_channel: Array<{ channel: string; total: number }>;
  by_status: Array<{ status: string; total: number }>;
}

export const ENQUIRY_STATUSES: Array<{
  value: EnquiryStatus;
  label: string;
}> = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal", label: "Proposal" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

export const ENQUIRY_PRIORITIES: Array<{
  value: EnquiryPriority;
  label: string;
}> = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];
