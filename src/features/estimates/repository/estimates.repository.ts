import { apiRequest } from "@/lib/api";
import type {
  CatalogItem,
  Customer,
  Estimate,
  EstimateInput,
} from "../types";

export const estimatesRepository = {
  list: () => apiRequest<Estimate[]>("/estimates"),

  getById: (id: number) =>
    apiRequest<Estimate>(`/estimates/${id}`),

  create: (input: EstimateInput) =>
    apiRequest<Estimate>("/estimates", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  update: (id: number, input: EstimateInput) =>
    apiRequest<Estimate>(`/estimates/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  remove: (id: number) =>
    apiRequest<void>(`/estimates/${id}`, {
      method: "DELETE",
    }),

  getCustomers: () =>
    apiRequest<Customer[]>("/customers"),

  getItems: () =>
    apiRequest<CatalogItem[]>("/items"),
};