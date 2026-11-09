import { apiRequest } from "@/lib/api";
import { CLINIC_API } from "@/features/clinic/repository/clinic.repository";

import type { ClinicService, ClinicServiceInput } from "../types";

export const clinicServicesRepository = {
  list: () => apiRequest<ClinicService[]>(`${CLINIC_API}/services`),

  create: (input: ClinicServiceInput) =>
    apiRequest<ClinicService>(`${CLINIC_API}/services`, {
      method: "POST",
      body: JSON.stringify(input),
    }),

  update: (id: number, input: ClinicServiceInput) =>
    apiRequest<ClinicService>(`${CLINIC_API}/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  remove: (id: number) =>
    apiRequest<null>(`${CLINIC_API}/services/${id}`, { method: "DELETE" }),
};
