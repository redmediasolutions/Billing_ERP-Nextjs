import { apiRequest } from "@/lib/api";
import type {
  ClaimStatusInput,
  WarrantyClaim,
  WarrantyClaimInput,
  WarrantyInput,
  WarrantyLookup,
  WarrantyPolicy,
  WarrantyPolicyInput,
  WarrantyRegistration,
  WarrantySummary,
} from "../types";

export const warrantyRepository = {
  list: () => apiRequest<WarrantyRegistration[]>("/warranties"),

  summary: () => apiRequest<WarrantySummary>("/warranties/summary"),

  lookup: (serial: string) =>
    apiRequest<WarrantyLookup>(
      `/warranties/lookup?serial=${encodeURIComponent(serial)}`
    ),

  getById: (id: number) =>
    apiRequest<WarrantyRegistration>(`/warranties/${id}`),

  create: (input: WarrantyInput) =>
    apiRequest<WarrantyRegistration>("/warranties", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  update: (id: number, input: WarrantyInput) =>
    apiRequest<WarrantyRegistration>(`/warranties/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  remove: (id: number) =>
    apiRequest<{ id: number }>(`/warranties/${id}`, {
      method: "DELETE",
    }),

  policies: () => apiRequest<WarrantyPolicy[]>("/warranties/policies"),

  createPolicy: (input: WarrantyPolicyInput) =>
    apiRequest<WarrantyPolicy>("/warranties/policies", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  updatePolicy: (id: number, input: WarrantyPolicyInput) =>
    apiRequest<{ id: number }>(`/warranties/policies/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  claims: () => apiRequest<WarrantyClaim[]>("/warranties/claims"),

  getClaim: (id: number) =>
    apiRequest<WarrantyClaim>(`/warranties/claims/${id}`),

  createClaim: (input: WarrantyClaimInput) =>
    apiRequest<WarrantyClaim>("/warranties/claims", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  updateClaim: (id: number, input: WarrantyClaimInput) =>
    apiRequest<WarrantyClaim>(`/warranties/claims/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  changeClaimStatus: (id: number, input: ClaimStatusInput) =>
    apiRequest<WarrantyClaim>(`/warranties/claims/${id}/status`, {
      method: "POST",
      body: JSON.stringify(input),
    }),

  removeClaim: (id: number) =>
    apiRequest<{ id: number }>(`/warranties/claims/${id}`, {
      method: "DELETE",
    }),
};
