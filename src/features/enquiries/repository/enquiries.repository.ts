import { apiRequest } from "@/lib/api";
import type {
  Enquiry,
  EnquiryChannel,
  EnquiryChannelInput,
  EnquiryInput,
  EnquirySummary,
  EnquiryUpdateInput,
} from "../types";

export const enquiriesRepository = {
  list: () => apiRequest<Enquiry[]>("/enquiries"),

  summary: () => apiRequest<EnquirySummary>("/enquiries/summary"),

  create: (input: EnquiryInput) =>
    apiRequest<Enquiry>("/enquiries", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  update: (id: number, input: EnquiryInput) =>
    apiRequest<Enquiry>(`/enquiries/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  addUpdate: (id: number, input: EnquiryUpdateInput) =>
    apiRequest<Enquiry>(`/enquiries/${id}/updates`, {
      method: "POST",
      body: JSON.stringify(input),
    }),

  remove: (id: number) =>
    apiRequest<{ id: number }>(`/enquiries/${id}`, {
      method: "DELETE",
    }),

  channels: () => apiRequest<EnquiryChannel[]>("/enquiries/channels"),

  createChannel: (input: EnquiryChannelInput) =>
    apiRequest<Pick<EnquiryChannel, "id" | "channel_name">>("/enquiries/channels", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  updateChannel: (id: number, input: EnquiryChannelInput) =>
    apiRequest<{ id: number }>(`/enquiries/channels/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
};
