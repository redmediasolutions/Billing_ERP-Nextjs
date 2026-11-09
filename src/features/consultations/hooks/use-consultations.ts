"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { invoiceKeys } from "@/features/invoices/hooks/use-invoices";

import { consultationsService } from "../services/consultations.service";
import type {
  ConsultationNotesInput,
  ConsultationVitals,
  FollowupInput,
  GenerateBillInput,
  PrescriptionInput,
  ProcedureInput,
} from "../types";

export const consultationKeys = {
  all: ["consultations"] as const,
  list: (filter: string) => [...consultationKeys.all, "list", filter] as const,
  detail: (id: number) => [...consultationKeys.all, "detail", id] as const,
};

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: consultationKeys.all });
    queryClient.invalidateQueries({ queryKey: ["patients"] });
    queryClient.invalidateQueries({ queryKey: ["appointments"] });
    queryClient.invalidateQueries({ queryKey: ["clinic"] });
  };
}

export function useConsultations(filter: { archived?: boolean; status?: string } = {}) {
  return useQuery({
    queryKey: consultationKeys.list(JSON.stringify(filter)),
    queryFn: () => consultationsService.list(filter),
  });
}

export function useConsultation(id: number) {
  return useQuery({
    queryKey: consultationKeys.detail(id),
    queryFn: () => consultationsService.getById(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useStartConsultation() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: { patient_id: number; appointment_id?: number | null }) =>
      consultationsService.start(input),
    onSuccess: invalidate,
  });
}

/** All edits on one consultation screen. */
export function useConsultationActions(id: number) {
  const invalidate = useInvalidate();
  const queryClient = useQueryClient();
  const opts = { onSuccess: invalidate };

  return {
    update: useMutation({
      mutationFn: (input: ConsultationNotesInput) => consultationsService.update(id, input),
      ...opts,
    }),
    saveVitals: useMutation({
      mutationFn: (input: Partial<ConsultationVitals>) => consultationsService.saveVitals(id, input),
      ...opts,
    }),
    addProcedure: useMutation({
      mutationFn: (input: ProcedureInput) => consultationsService.addProcedure(id, input),
      ...opts,
    }),
    deleteProcedure: useMutation({
      mutationFn: (procedureId: number) => consultationsService.deleteProcedure(procedureId),
      ...opts,
    }),
    addPrescription: useMutation({
      mutationFn: (input: PrescriptionInput) => consultationsService.addPrescription(id, input),
      ...opts,
    }),
    deletePrescription: useMutation({
      mutationFn: (prescriptionId: number) => consultationsService.deletePrescription(prescriptionId),
      ...opts,
    }),
    addFollowup: useMutation({
      mutationFn: (input: FollowupInput) => consultationsService.addFollowup(id, input),
      ...opts,
    }),
    setState: useMutation({
      mutationFn: (action: "complete" | "reopen" | "archive" | "restore") =>
        consultationsService.setState(id, action),
      ...opts,
    }),
    generateBill: useMutation({
      mutationFn: (input: GenerateBillInput) => consultationsService.generateBill(id, input),
      onSuccess: () => {
        invalidate();
        queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
        queryClient.invalidateQueries({ queryKey: ["medicines"] });
      },
    }),
    uploadAttachment: useMutation({
      mutationFn: ({ file, title }: { file: File; title: string }) =>
        consultationsService.uploadAttachment(id, file, title),
      ...opts,
    }),
    deleteAttachment: useMutation({
      mutationFn: (attachmentId: number) => consultationsService.deleteAttachment(attachmentId),
      ...opts,
    }),
  };
}
