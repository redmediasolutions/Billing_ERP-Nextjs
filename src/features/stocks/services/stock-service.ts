import { apiRequest } from "@/lib/api";

import type {
  CustomerOption,
  SellStockInput,
  Stock,
  StockInput,
  StockUpdateInput,
} from "../types/stock.types";

export const stockService = {
  getAll: (search = "", status = "") =>
    apiRequest<Stock[]>(
      `/stocks?search=${encodeURIComponent(
        search
      )}&status=${encodeURIComponent(status)}`
    ),

  generateSerial: () =>
    apiRequest<{ serial: string }>("/stocks/generate-serial"),

  getCustomers: () =>
    apiRequest<CustomerOption[]>("/customers"),

  create: (input: StockInput) =>
    apiRequest<{
      purchase_id: number;
      added_stock_count: number;
    }>("/stocks", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  update: (id: number, input: StockUpdateInput) =>
    apiRequest<{ id: number }>(`/stocks/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  sell: (id: number, input: SellStockInput) =>
    apiRequest<{
      invoice_id: number;
      invoice_number: string;
    }>(`/stocks/${id}/sell`, {
      method: "POST",
      body: JSON.stringify(input),
    }),

  remove: (id: number) =>
    apiRequest<{ id: number }>(`/stocks/${id}`, {
      method: "DELETE",
    }),
};