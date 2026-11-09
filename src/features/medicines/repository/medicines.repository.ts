import { apiRequest } from "@/lib/api";
import { CLINIC_API } from "@/features/clinic/repository/clinic.repository";

import type {
  Medicine,
  MedicineBatch,
  MedicineBatchInput,
  MedicineDetail,
  MedicineInput,
} from "../types";

const json = (method: string, body?: unknown): RequestInit => ({
  method,
  body: body === undefined ? undefined : JSON.stringify(body),
});

export const medicinesRepository = {
  list: () => apiRequest<Medicine[]>(`${CLINIC_API}/medicines`),

  getById: (id: number) => apiRequest<MedicineDetail>(`${CLINIC_API}/medicines/${id}`),

  availableBatches: (medicineId?: number) =>
    apiRequest<MedicineBatch[]>(
      `${CLINIC_API}/medicine-batches${medicineId ? `?medicine_id=${medicineId}` : ""}`
    ),

  create: (input: MedicineInput) =>
    apiRequest<Medicine>(`${CLINIC_API}/medicines`, json("POST", input)),

  update: (id: number, input: MedicineInput) =>
    apiRequest<Medicine>(`${CLINIC_API}/medicines/${id}`, json("PUT", input)),

  archive: (id: number) => apiRequest<null>(`${CLINIC_API}/medicines/${id}`, json("DELETE")),

  addBatch: (input: MedicineBatchInput) =>
    apiRequest<{ batch_id: number }>(`${CLINIC_API}/medicine-batches`, json("POST", input)),

  updateBatch: (id: number, input: Omit<MedicineBatchInput, "medicine_id"> & { quantity?: number }) =>
    apiRequest<MedicineBatch>(`${CLINIC_API}/medicine-batches/${id}`, json("PUT", input)),

  adjustStock: (id: number, input: { type: "add" | "deduct"; quantity: number }) =>
    apiRequest<{ new_stock: number }>(`${CLINIC_API}/medicine-batches/${id}/stock`, json("PUT", input)),
};
