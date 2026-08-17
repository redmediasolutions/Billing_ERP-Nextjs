"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { enquiriesService } from "../services/enquiries.service";
import type {
  EnquiryChannelInput,
  EnquiryInput,
  EnquiryUpdateInput,
} from "../types";

export const enquiryKeys = {
  all: ["enquiries"] as const,
  list: () => [...enquiryKeys.all, "list"] as const,
  summary: () => [...enquiryKeys.all, "summary"] as const,
  channels: () => [...enquiryKeys.all, "channels"] as const,
};

function invalidateEnquiries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: enquiryKeys.all });
}

export function useEnquiries() {
  return useQuery({
    queryKey: enquiryKeys.list(),
    queryFn: enquiriesService.list,
  });
}

export function useEnquirySummary() {
  return useQuery({
    queryKey: enquiryKeys.summary(),
    queryFn: enquiriesService.summary,
  });
}

export function useEnquiryChannels() {
  return useQuery({
    queryKey: enquiryKeys.channels(),
    queryFn: enquiriesService.channels,
  });
}

export function useCreateEnquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: EnquiryInput) => enquiriesService.create(input),
    onSuccess: () => invalidateEnquiries(queryClient),
  });
}

export function useUpdateEnquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: EnquiryInput }) =>
      enquiriesService.update(id, input),
    onSuccess: () => invalidateEnquiries(queryClient),
  });
}

export function useAddEnquiryUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: EnquiryUpdateInput;
    }) => enquiriesService.addUpdate(id, input),
    onSuccess: () => invalidateEnquiries(queryClient),
  });
}

export function useDeleteEnquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => enquiriesService.remove(id),
    onSuccess: () => invalidateEnquiries(queryClient),
  });
}

export function useCreateEnquiryChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: EnquiryChannelInput) =>
      enquiriesService.createChannel(input),
    onSuccess: () => invalidateEnquiries(queryClient),
  });
}

export function useUpdateEnquiryChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: EnquiryChannelInput;
    }) => enquiriesService.updateChannel(id, input),
    onSuccess: () => invalidateEnquiries(queryClient),
  });
}
