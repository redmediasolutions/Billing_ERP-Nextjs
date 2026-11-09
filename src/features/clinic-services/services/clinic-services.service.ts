import { clinicServicesRepository } from "../repository/clinic-services.repository";
import type { ClinicService, ClinicServiceInput } from "../types";

const normalize = (s: ClinicService): ClinicService => ({
  ...s,
  cost: Number(s.cost || 0),
  tax_rate: Number(s.tax_rate || 0),
});

export const clinicServicesService = {
  list: async () => (await clinicServicesRepository.list()).map(normalize),
  create: async (input: ClinicServiceInput) => normalize(await clinicServicesRepository.create(input)),
  update: async (id: number, input: ClinicServiceInput) =>
    normalize(await clinicServicesRepository.update(id, input)),
  remove: (id: number) => clinicServicesRepository.remove(id),
};
