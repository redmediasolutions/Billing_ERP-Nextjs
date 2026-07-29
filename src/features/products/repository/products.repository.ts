import { apiRequest } from "@/lib/api";
import type { Product, ProductInput } from "../types";

export const productsRepository = {
  list: (search?: string) => {
    const query = search
      ? `?search=${encodeURIComponent(search)}`
      : "";

    return apiRequest<Product[]>(`/products${query}`);
  },

  create: (input: ProductInput) =>
    apiRequest<Product>("/products", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  update: (id: number, input: ProductInput) =>
    apiRequest<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  remove: (id: number) =>
    apiRequest<void>(`/products/${id}`, {
      method: "DELETE",
    }),
};
