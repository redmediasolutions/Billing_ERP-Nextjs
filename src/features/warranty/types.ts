export type WarrantyStatus =
  | "pending"
  | "active"
  | "expired"
  | "voided"
  | "transferred";

export type WarrantySource =
  | "invoice"
  | "stock_sale"
  | "walk_in"
  | "dealer"
  | "manual";

export type CoverageType =
  | "manufacturer"
  | "extended"
  | "replacement"
  | "repair_only";

export type ClaimStatus =
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "in_repair"
  | "awaiting_parts"
  | "resolved_repair"
  | "resolved_replace"
  | "closed";

export type ClaimPriority = "low" | "medium" | "high";

export type ClaimIssueType =
  | "malfunction"
  | "manufacturing_defect"
  | "physical_damage"
  | "battery"
  | "software"
  | "other";

export type ClaimResolution =
  | "none"
  | "repair"
  | "replace"
  | "refund"
  | "reject";

export interface WarrantyPolicy {
  id: number;
  created_at: string;
  policy_name: string;
  product_ref: number | null;
  product_name: string | null;
  coverage_months: number;
  coverage_type: CoverageType;
  covers_parts: boolean;
  covers_labor: boolean;
  max_claims: number | null;
  terms: string | null;
  is_active: boolean;
}

export interface WarrantyPolicyInput {
  policy_name: string;
  product_ref: number | null;
  coverage_months: number;
  coverage_type: CoverageType;
  covers_parts: boolean;
  covers_labor: boolean;
  max_claims: number | null;
  terms: string;
  is_active?: boolean;
}

export interface ClaimUpdate {
  id: number;
  created_at: string;
  from_status: string | null;
  to_status: string;
  note: string | null;
  author: string | null;
}

export interface ClaimPart {
  id?: number;
  item_ref: number | null;
  item_name: string;
  quantity: number;
  unit_cost: number;
}

export interface WarrantyClaim {
  id: number;
  created_at: string;
  updated_at: string;
  tenant_id: number;
  reference: string;
  claim_number: string;
  registration_ref: number;
  warranty_number: string | null;
  serial_number: string | null;
  customer_ref: number | null;
  customer_name: string | null;
  display_customer_name: string | null;
  display_phone: string | null;
  product_name: string | null;
  issue_type: ClaimIssueType;
  issue_description: string | null;
  priority: ClaimPriority;
  status: ClaimStatus;
  resolution_type: ClaimResolution;
  assigned_to: number | null;
  assigned_to_name: string | null;
  replacement_stock_ref: number | null;
  replacement_serial: string | null;
  invoice_ref: number | null;
  invoice_number: string | null;
  reported_at: string;
  resolved_at: string | null;
  is_archived: boolean;
  parts: ClaimPart[];
  updates: ClaimUpdate[];
}

export interface ClaimPartInput {
  item_ref: number | null;
  item_name: string;
  quantity: number;
  unit_cost: number;
}

export interface WarrantyClaimInput {
  registration_ref: number | null;
  serial_number: string;
  issue_type: ClaimIssueType;
  issue_description: string;
  priority: ClaimPriority;
  assigned_to: number | null;
  replacement_stock_ref: number | null;
  replacement_serial: string;
  invoice_ref: number | null;
  parts: ClaimPartInput[];
}

export interface ClaimStatusInput {
  status: ClaimStatus;
  note?: string;
  resolution_type?: ClaimResolution;
  replacement_serial?: string;
  replacement_stock_ref?: number | null;
}

export interface WarrantyRegistration {
  id: number;
  created_at: string;
  updated_at: string;
  tenant_id: number;
  reference: string;
  warranty_number: string;
  customer_ref: number | null;
  customer_name: string | null;
  phone: string | null;
  email: string | null;
  display_customer_name: string | null;
  display_phone: string | null;
  display_email: string | null;
  product_ref: number | null;
  product_name: string | null;
  product_code: string | null;
  item_ref: number | null;
  item_name: string | null;
  stock_ref: number | null;
  serial_number: string;
  invoice_ref: number | null;
  invoice_number: string | null;
  vendor_ref: number | null;
  vendor_name: string | null;
  policy_ref: number | null;
  policy_name: string | null;
  coverage_type: CoverageType;
  coverage_months: number;
  purchase_date: string | null;
  registered_at: string;
  starts_at: string;
  ends_at: string;
  source: WarrantySource;
  status: WarrantyStatus;
  proof_note: string | null;
  notes: string | null;
  is_archived: boolean;
  days_remaining: number;
  coverage_percent: number;
  claims_count: number;
  open_claims: number;
  claims?: WarrantyClaim[];
}

export interface WarrantyInput {
  customer_ref: number | null;
  customer_name: string;
  phone: string;
  email: string;
  product_ref: number | null;
  item_ref: number | null;
  stock_ref: number | null;
  serial_number: string;
  invoice_ref: number | null;
  vendor_ref: number | null;
  policy_ref: number | null;
  coverage_type: CoverageType;
  coverage_months: number;
  purchase_date: string;
  starts_at: string;
  ends_at: string;
  source: WarrantySource;
  status: WarrantyStatus;
  proof_note: string;
  notes: string;
  create_customer?: boolean;
}

export interface WarrantyEligibility {
  in_warranty: boolean;
  days_remaining: number;
  open_claims: number;
  claims_used: number;
  max_claims: number | null;
  can_claim: boolean;
  reasons: string[];
}

export interface WarrantyLookup {
  serial: string;
  stock: {
    id: number;
    product_serial: string;
    product_id: number | null;
    product_name: string | null;
    status: string | null;
    invoice_id: number | null;
    invoice_number: string | null;
    sale_price: number | string | null;
    sold_at: string | null;
  } | null;
  product: {
    id: number;
    product_name: string;
    product_code: string | null;
  } | null;
  invoice: {
    id: number;
    invoice_number: string;
    customer_id: number | null;
    invoice_date: string | null;
  } | null;
  customer: {
    id: number;
    customer_name: string;
    customer_display_name: string | null;
    customer_phone: string | null;
    customer_email: string | null;
  } | null;
  registration: WarrantyRegistration | null;
  policy: WarrantyPolicy | null;
  eligibility: WarrantyEligibility;
}

export interface WarrantySummary {
  total: number;
  active: number;
  pending: number;
  expired: number;
  expiring_soon: number;
  open_claims: number;
  claims_this_month: number;
  resolved_this_month: number;
  by_status: Array<{ status: string; total: number }>;
  by_coverage: Array<{ coverage_type: string; total: number }>;
}

export const WARRANTY_STATUSES: Array<{
  value: WarrantyStatus;
  label: string;
}> = [
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "voided", label: "Voided" },
  { value: "transferred", label: "Transferred" },
];

export const WARRANTY_SOURCES: Array<{
  value: WarrantySource;
  label: string;
}> = [
  { value: "invoice", label: "Invoice" },
  { value: "stock_sale", label: "Serial stock sale" },
  { value: "walk_in", label: "Walk-in / retail" },
  { value: "dealer", label: "Dealer" },
  { value: "manual", label: "Manual" },
];

export const COVERAGE_TYPES: Array<{
  value: CoverageType;
  label: string;
  hint: string;
}> = [
  {
    value: "manufacturer",
    label: "Manufacturer",
    hint: "Standard factory coverage",
  },
  {
    value: "extended",
    label: "Extended",
    hint: "Paid extra months after factory",
  },
  {
    value: "replacement",
    label: "Replacement",
    hint: "Swap the unit if it fails",
  },
  {
    value: "repair_only",
    label: "Repair only",
    hint: "Labour / parts, no replacement",
  },
];

export const CLAIM_STATUSES: Array<{
  value: ClaimStatus;
  label: string;
}> = [
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "in_repair", label: "In repair" },
  { value: "awaiting_parts", label: "Awaiting parts" },
  { value: "resolved_repair", label: "Repaired" },
  { value: "resolved_replace", label: "Replaced" },
  { value: "closed", label: "Closed" },
];

export const CLAIM_PRIORITIES: Array<{
  value: ClaimPriority;
  label: string;
}> = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export const CLAIM_ISSUE_TYPES: Array<{
  value: ClaimIssueType;
  label: string;
}> = [
  { value: "malfunction", label: "Malfunction" },
  { value: "manufacturing_defect", label: "Manufacturing defect" },
  { value: "physical_damage", label: "Physical damage" },
  { value: "battery", label: "Battery" },
  { value: "software", label: "Software" },
  { value: "other", label: "Other" },
];

export const CLAIM_RESOLUTIONS: Array<{
  value: ClaimResolution;
  label: string;
}> = [
  { value: "none", label: "Not decided" },
  { value: "repair", label: "Repair" },
  { value: "replace", label: "Replace" },
  { value: "refund", label: "Refund" },
  { value: "reject", label: "Reject" },
];

export const OPEN_CLAIM_STATUSES: ClaimStatus[] = [
  "submitted",
  "under_review",
  "approved",
  "in_repair",
  "awaiting_parts",
];
