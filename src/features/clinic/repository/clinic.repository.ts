import { apiRequest } from "@/lib/api";

import type {
  ClinicBillInput,
  ClinicBillResult,
  ClinicDashboard,
  ClinicSettings,
  ClinicSettingsInput,
} from "../types";

// Clinic modules are mounted by the ERP backend under /api/v1
// (Modules/clinic, same layout as the Anwy Med backend).
export const CLINIC_API = "/api/v1";

export const clinicRepository = {
  settings: () => apiRequest<ClinicSettings>(`${CLINIC_API}/clinic/settings`),

  updateSettings: (input: ClinicSettingsInput) =>
    apiRequest<null>(`${CLINIC_API}/clinic/settings`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  dashboard: () => apiRequest<ClinicDashboard>(`${CLINIC_API}/dashboard`),

  nextBillNumber: () =>
    apiRequest<{ invoice_number: string }>(`${CLINIC_API}/billing/next-number`),

  createBill: (input: ClinicBillInput) =>
    apiRequest<ClinicBillResult>(`${CLINIC_API}/billing`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
};
