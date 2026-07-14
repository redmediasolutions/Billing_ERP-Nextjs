import { tenantRepository } from "../repository/tenant.repository";

export const tenantService = {
  get: () => tenantRepository.get(),
};