import { apiRequest } from "@/lib/api";
import { CLINIC_API } from "@/features/clinic/repository/clinic.repository";

import type {
  Consultation,
  ConsultationDetail,
  ConsultationNotesInput,
  ConsultationVitals,
  FollowupInput,
  GenerateBillInput,
  PrescriptionInput,
  ProcedureInput,
} from "../types";

const base = `${CLINIC_API}/consultations`;
const json = (method: string, body?: unknown): RequestInit => ({
  method,
  body: body === undefined ? undefined : JSON.stringify(body),
});

export const consultationsRepository = {
  list: (params: { archived?: boolean; status?: string; patient_id?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.archived) q.set("archived", "1");
    if (params.status) q.set("status", params.status);
    if (params.patient_id) q.set("patient_id", String(params.patient_id));
    const qs = q.toString();
    return apiRequest<Consultation[]>(`${base}${qs ? `?${qs}` : ""}`);
  },

  getById: (id: number) => apiRequest<ConsultationDetail>(`${base}/${id}`),

  start: (input: { patient_id: number; appointment_id?: number | null }) =>
    apiRequest<{ resumed: boolean; consultation: Consultation }>(`${base}/start`, json("POST", input)),

  update: (id: number, input: ConsultationNotesInput) =>
    apiRequest<Consultation>(`${base}/${id}`, json("PUT", input)),

  saveVitals: (id: number, input: Partial<ConsultationVitals>) =>
    apiRequest<null>(`${base}/${id}/vitals`, json("POST", input)),

  addProcedure: (id: number, input: ProcedureInput) =>
    apiRequest<{ procedure_id: number }>(`${base}/${id}/procedures`, json("POST", input)),

  deleteProcedure: (procedureId: number) =>
    apiRequest<null>(`${CLINIC_API}/consultation-procedures/${procedureId}`, json("DELETE")),

  addPrescription: (id: number, input: PrescriptionInput) =>
    apiRequest<{ prescription_id: number }>(`${base}/${id}/prescriptions`, json("POST", input)),

  deletePrescription: (prescriptionId: number) =>
    apiRequest<null>(`${CLINIC_API}/consultation-prescriptions/${prescriptionId}`, json("DELETE")),

  addFollowup: (id: number, input: FollowupInput) =>
    apiRequest<{ followup_id: number; appointment_id: number | null }>(
      `${base}/${id}/followup`,
      json("POST", input)
    ),

  setState: (id: number, action: "complete" | "reopen" | "archive" | "restore") =>
    apiRequest<Consultation>(`${base}/${id}/${action}`, json("PUT")),

  generateBill: (id: number, input: GenerateBillInput) =>
    apiRequest<{ invoice_id: number; invoice_number: string; total: number }>(
      `${base}/${id}/generate-bill`,
      json("POST", input)
    ),

  uploadUrl: (id: number, input: { fileName: string; contentType: string }) =>
    apiRequest<{ uploadUrl: string; fileKey: string }>(`${base}/${id}/upload-url`, json("POST", input)),

  saveAttachment: (id: number, input: { file_key: string; file_type: string; title: string }) =>
    apiRequest<{ attachment_id: number }>(`${base}/${id}/attachments`, json("POST", input)),

  deleteAttachment: (attachmentId: number) =>
    apiRequest<null>(`${CLINIC_API}/consultation-attachments/${attachmentId}`, json("DELETE")),

  viewUrl: (fileKey: string) =>
    apiRequest<{ viewUrl: string }>(`${CLINIC_API}/files/view-url`, json("POST", { fileKey })),
};
