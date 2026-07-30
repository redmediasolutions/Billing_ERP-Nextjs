import { apiRequest } from "@/lib/api";
import type { Vendor, VendorInput } from "../types/vendor.types";

export const vendorService = {
  getAll: () => apiRequest<Vendor[]>("/vendors"),

  create: (input: VendorInput) =>
    apiRequest<{ id: number }>("/vendors", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  update: (id: number, input: VendorInput) =>
    apiRequest<{ id: number }>(`/vendors/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  remove: (id: number) =>
    apiRequest<{ id: number }>(`/vendors/${id}`, {
      method: "DELETE",
    }),
};