import { apiRequest } from "@/lib/api";
import type { Customer, CustomerInput } from "../types";

export const customersRepository = {
  list: () => apiRequest<Customer[]>("/customers"),

  search: (query: string) =>
    apiRequest<Customer[]>(
      `/customers?search=${encodeURIComponent(query)}&limit=10`
    ),

  getWalkIn: () => apiRequest<Customer>("/customers/walk-in"),

  create: (input: CustomerInput) =>
    apiRequest<Customer>("/customers", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  update: (id: number, input: CustomerInput) =>
    apiRequest<Customer>(`/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  archive: (id: number) =>
    apiRequest<void>(`/customers/${id}`, {
      method: "DELETE",
    }),
};
