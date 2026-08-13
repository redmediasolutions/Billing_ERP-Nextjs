import { apiRequest } from "@/lib/api";
import type { Item } from "../types";

export type ItemApiPayload = {
  item_name: string;
  hsn_code: string;
  item_cost: number;
  tax_rate: number;
  item_cost_narration: string;
  item_description: string;
  category: string;
  item_image: string | null;
  track_inventory: 0 | 1;
  is_batch_tracked: 0 | 1;
  walk_in_price: number;
  cloud_kitchen_price: number;
};

export const itemsRepository = {
  list: (search?: string) => {
    const query = search
      ? `?search=${encodeURIComponent(search)}`
      : "";

    return apiRequest<Item[]>(`/items${query}`);
  },

  getById: (id: number) => apiRequest<Item>(`/items/${id}`),

  create: (input: ItemApiPayload) =>
    apiRequest<Item>("/items", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  update: (id: number, input: ItemApiPayload) =>
    apiRequest<Item>(`/items/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  remove: (id: number) =>
    apiRequest<void>(`/items/${id}`, {
      method: "DELETE",
    }),
};