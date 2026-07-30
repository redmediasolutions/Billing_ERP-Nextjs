import { apiRequest } from "@/lib/api";
import type {
  Product,
  ProductInput,
} from "../types/product.types";

export const productService = {
  getAll: (search = "") =>
    apiRequest<Product[]>(
      `/products?search=${encodeURIComponent(search)}`
    ),

  create: (input: ProductInput) =>
    apiRequest<{ id: number }>("/products", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  update: (id: number, input: ProductInput) =>
    apiRequest<{ id: number }>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  remove: (id: number) =>
    apiRequest<{ id: number }>(`/products/${id}`, {
      method: "DELETE",
    }),
};