"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  CheckCircle2,
  ClipboardPen,
  Loader2,
  ReceiptText,
  RotateCcw,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useIsClinicTenant } from "@/features/clinic/hooks/use-clinic";
import {
  ageFrom,
  errorMessage,
  formatDateTime,
  money,
  toneClass,
} from "@/features/clinic/lib/clinic-format";

import { GenerateBillDialog } from "../addform/generate-bill-dialog";
import { useConsultation, useConsultationActions } from "../hooks/use-consultations";
import { printPrescription } from "../lib/print-prescription";
import type { ConsultationNotesInput, GenerateBillInput } from "../types";
import {
  AttachmentsSection,
  FollowupSection,
  PrescriptionsSection,
  ProceduresSection,
  SectionCard,
  VitalsSection,
} from "./consultation-sections";

export function ConsultationWorkspace({ consultationId }: { consultationId: number }) {
  const router = useRouter();
  const { data: detail, isLoading, error } = useConsultation(consultationId);
  const actions = useConsultationActions(consultationId);
  const { tenant } = useIsClinicTenant();

  const [notes, setNotes] = useState<ConsultationNotesInput>({
    chief_complaint: "",
    symptoms: "",
    diagnosis: "",
    notes: "",
    consultation_fee: 0,
  });
  const [notesMsg, setNotesMsg] = useState("");
  const [billOpen, setBillOpen] = useState(false);
  const [actionError, setActionError] = useState("");

  const c = detail?.consultation;

  useEffect(() => {
    if (!c) return;
    setNotes({
      chief_complaint: c.chief_complaint || "",
      symptoms: c.symptoms || "",
      diagnosis: c.diagnosis || "",
      notes: c.notes || "",
      consultation_fee: c.consultation_fee || 0,
    });
  }, [c?.id, c?.updated_at]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading consultation...
      </div>
    );
  }

  if (error || !detail || !c) {
    return (
      <div className="space-y-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/consultations">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Consultations
          </Link>
        </Button>
        <p className="text-sm font-medium text-destructive">{errorMessage(error, "Consultation not found.")}</p>
      </div>
    );
  }

  const locked = c.status === "completed" || c.is_archived;
  const billed = Boolean(c.invoice_id);
  const age = ageFrom(c.dob);

  async function saveNotes(event: FormEvent) {
    event.preventDefault();
    try {
      setNotesMsg("");
      await actions.update.mutateAsync(notes);
      setNotesMsg("Saved");
    } catch (err) {
      setNotesMsg(errorMessage(err, "Unable to save."));
    }
  }

  async function runState(action: "complete" | "reopen" | "archive" | "restore") {
    try {
      setActionError("");
      if (action === "complete") {
        await actions.update.mutateAsync(notes); // don't lose unsaved notes
      }
      await actions.setState.mutateAsync(action);
    } catch (err) {
      setActionError(errorMessage(err, "Unable to update consultation."));
    }
  }

  async function generateBill(input: GenerateBillInput) {
    // save notes first so the fee typed on screen is billed
    await actions.update.mutateAsync(notes);
    const result = await actions.generateBill.mutateAsync(input);
    setBillOpen(false);
    router.push(`/dashboard/invoices/${result.invoice_id}`);
  }

  function print() {
    printPrescription({
      clinicName: tenant?.business_name || "Clinic",
      clinicAddress: tenant?.business_address,
      clinicPhone: tenant?.business_phone,
      doctorName: c?.doctor_name || tenant?.dr_name,
      consultation: { ...c!, ...notes },
      vitals: detail?.vitals[0],
      prescriptions: detail?.prescriptions || [],
    });
  }

  return (
    <section className="w-full space-y-6 text-left">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" className="-ml-2" asChild>
            <Link href="/dashboard/consultations">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Consultations
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{c.patient_name || "Patient"}</h1>
            <Badge variant="outline" className={c.status === "completed" ? toneClass.green : toneClass.amber}>
              {c.status === "completed" ? "Completed" : "In progress"}
            </Badge>
            {c.is_archived ? <Badge variant="secondary">Archived</Badge> : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {[
              c.consultation_number,
              formatDateTime(c.consultation_date),
              c.patient_phone,
              c.gender,
              age !== null ? `${age} yrs` : null,
              c.blood_group,
              c.doctor_name,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {billed ? (
            <Button variant="outline" className="gap-2" asChild>
              <Link href={`/dashboard/invoices/${c.invoice_id}`}>
                <ReceiptText className="h-4 w-4" />
                {c.invoice_number} · {money.format(c.invoice_total)}
                {c.invoice_total - c.invoice_paid > 0.009 ? " (due)" : " (paid)"}
              </Link>
            </Button>
          ) : !c.is_archived ? (
            <Button variant="outline" className="gap-2" onClick={() => setBillOpen(true)}>
              <ReceiptText className="h-4 w-4" /> Generate bill
            </Button>
          ) : null}
          {c.is_archived ? (
            <Button variant="outline" className="gap-2" onClick={() => void runState("restore")}>
              <ArchiveRestore className="h-4 w-4" /> Restore
            </Button>
          ) : c.status === "completed" ? (
            <Button variant="outline" className="gap-2" onClick={() => void runState("reopen")}>
              <RotateCcw className="h-4 w-4" /> Reopen
            </Button>
          ) : (
            <Button className="gap-2" onClick={() => void runState("complete")} disabled={actions.setState.isPending}>
              <CheckCircle2 className="h-4 w-4" /> Complete
            </Button>
          )}
          {!c.is_archived ? (
            <Button
              variant="ghost"
              size="icon"
              title="Archive"
              onClick={() => {
                if (window.confirm("Archive this consultation?")) void runState("archive");
              }}
            >
              <Archive className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>

      {actionError ? <p className="text-sm font-medium text-destructive">{actionError}</p> : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <SectionCard icon={ClipboardPen} title="Clinical notes">
            <form onSubmit={saveNotes} className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Chief complaint</Label>
                  <Textarea
                    rows={2}
                    disabled={locked}
                    value={notes.chief_complaint}
                    onChange={(e) => setNotes({ ...notes, chief_complaint: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Symptoms</Label>
                  <Textarea
                    rows={2}
                    disabled={locked}
                    value={notes.symptoms}
                    onChange={(e) => setNotes({ ...notes, symptoms: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Diagnosis</Label>
                <Input
                  disabled={locked}
                  value={notes.diagnosis}
                  onChange={(e) => setNotes({ ...notes, diagnosis: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Advice / notes</Label>
                <Textarea
                  rows={3}
                  disabled={locked}
                  value={notes.notes}
                  onChange={(e) => setNotes({ ...notes, notes: e.target.value })}
                />
              </div>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="w-40 space-y-1">
                  <Label className="text-xs">Consultation fee (₹)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    disabled={locked || billed}
                    value={notes.consultation_fee}
                    onChange={(e) => setNotes({ ...notes, consultation_fee: Number(e.target.value) })}
                  />
                </div>
                {!locked ? (
                  <div className="flex items-center gap-3">
                    {notesMsg ? <span className="text-xs text-muted-foreground">{notesMsg}</span> : null}
                    <Button type="submit" size="sm" disabled={actions.update.isPending}>
                      {actions.update.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                      Save notes
                    </Button>
                  </div>
                ) : null}
              </div>
            </form>
          </SectionCard>

          <VitalsSection detail={detail} actions={actions} locked={locked} />
          <PrescriptionsSection detail={detail} actions={actions} locked={locked} onPrint={print} />
        </div>

        <div className="space-y-6">
          <ProceduresSection detail={detail} actions={actions} locked={locked || billed} />
          <FollowupSection detail={detail} actions={actions} defaultDoctor={c.doctor_name || tenant?.dr_name || ""} />
          <AttachmentsSection detail={detail} actions={actions} />
        </div>
      </div>

      <GenerateBillDialog
        open={billOpen}
        detail={detail}
        onClose={() => setBillOpen(false)}
        onConfirm={generateBill}
      />
    </section>
  );
}
