import { apiRequest } from "@/lib/api";
import type { Item, ItemInput } from "../types";

export const itemsRepository = {
  list: (search?: string) => {
    const query = search
      ? `?search=${encodeURIComponent(search)}`
      : "";

    return apiRequest<Item[]>(`/items${query}`);
  },

  create: (input: ItemInput) =>
    apiRequest<Item>("/items", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  update: (id: number, input: ItemInput) =>
    apiRequest<Item>(`/items/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  remove: (id: number) =>
    apiRequest<void>(`/items/${id}`, {
      method: "DELETE",
    }),
};