import { apiRequest } from "@/lib/api";
import type { Brand, BrandInput } from "../types/brand.types";

export const brandService = {
  getAll: () => apiRequest<Brand[]>("/brands"),

  create: (input: BrandInput) =>
    apiRequest<{ id: number }>("/brands", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  update: (id: number, input: BrandInput) =>
    apiRequest<{ id: number }>(`/brands/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  remove: (id: number) =>
    apiRequest<{ id: number }>(`/brands/${id}`, {
      method: "DELETE",
    }),
};