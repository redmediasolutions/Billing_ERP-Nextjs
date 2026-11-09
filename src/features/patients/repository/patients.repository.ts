import { apiRequest } from "@/lib/api";
import { CLINIC_API } from "@/features/clinic/repository/clinic.repository";

import type { Patient, PatientDetail, PatientInput } from "../types";

export const patientsRepository = {
  list: (archived = false) =>
    apiRequest<Patient[]>(`${CLINIC_API}/patients${archived ? "?archived=1" : ""}`),

  getById: (id: number) => apiRequest<PatientDetail>(`${CLINIC_API}/patients/${id}`),

  create: (input: PatientInput) =>
    apiRequest<Patient>(`${CLINIC_API}/patients`, {
      method: "POST",
      body: JSON.stringify(input),
    }),

  update: (id: number, input: PatientInput) =>
    apiRequest<Patient>(`${CLINIC_API}/patients/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  archive: (id: number) =>
    apiRequest<null>(`${CLINIC_API}/patients/${id}/archive`, { method: "PUT" }),

  restore: (id: number) =>
    apiRequest<null>(`${CLINIC_API}/patients/${id}/restore`, { method: "PUT" }),
};
