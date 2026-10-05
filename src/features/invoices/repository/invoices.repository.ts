import { apiRequest } from "@/lib/api";
import type { Invoice, InvoiceInput, InvoicePaymentInput } from "../types";

export const invoicesRepository = {
  list: () => apiRequest<Invoice[]>("/invoices"),

  getById: (id: number) =>
    apiRequest<Invoice>(`/invoices/${id}`),

  create: (input: InvoiceInput) =>
    apiRequest<Invoice>("/invoices", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  update: (id: number, input: InvoiceInput) =>
    apiRequest<Invoice>(`/invoices/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  remove: (id: number) =>
    apiRequest<void>(`/invoices/${id}`, {
      method: "DELETE",
    }),

  recordPayment: (id: number, input: InvoicePaymentInput) =>
    apiRequest<Invoice>(`/invoices/${id}/payments`, {
      method: "POST",
      body: JSON.stringify(input),
    }),

  removePayment: (invoiceId: number, paymentId: number) =>
    apiRequest<Invoice>(`/invoices/${invoiceId}/payments/${paymentId}`, {
      method: "DELETE",
    }),
};