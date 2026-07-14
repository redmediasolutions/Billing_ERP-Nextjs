import { apiRequest } from "@/lib/api";
import type { Tenant } from "../types";

export const tenantRepository = {
  get: () => apiRequest<Tenant>("/tenant"),
};