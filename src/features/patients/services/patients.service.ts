import { patientsRepository } from "../repository/patients.repository";
import type { Patient, PatientDetail, PatientInput } from "../types";

function normalize<T extends Patient>(p: T): T {
  return {
    ...p,
    is_archived: Boolean(p.is_archived),
    consultation_count: Number(p.consultation_count || 0),
  };
}

function clean(input: PatientInput): PatientInput {
  return {
    ...input,
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email.trim(),
    address: input.address.trim(),
  };
}

export const patientsService = {
  async list(archived = false) {
    return (await patientsRepository.list(archived)).map(normalize);
  },

  async getById(id: number): Promise<PatientDetail> {
    const p = await patientsRepository.getById(id);
    return {
      ...normalize(p),
      invoices: (p.invoices || []).map((i) => ({
        ...i,
        total: Number(i.total || 0),
        amount_paid: Number(i.amount_paid || 0),
      })),
      consultations: p.consultations || [],
      appointments: p.appointments || [],
    };
  },

  create: async (input: PatientInput) =>
    normalize(await patientsRepository.create(clean(input))),

  update: async (id: number, input: PatientInput) =>
    normalize(await patientsRepository.update(id, clean(input))),

  archive: (id: number) => patientsRepository.archive(id),

  restore: (id: number) => patientsRepository.restore(id),
};
