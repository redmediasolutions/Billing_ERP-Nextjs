"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CalendarClock, Loader2, PhoneCall, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import {
  ResizableSheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/resizable-sheet-content";
import { Textarea } from "@/components/ui/textarea";
import { useEnquiries } from "@/features/enquiries/hooks/use-enquiries";
import { PatientPickerField } from "@/features/patients/components/patient-picker-field";
import type { Patient } from "@/features/patients/types";
import { useIsClinicTenant } from "@/features/clinic/hooks/use-clinic";
import {
  errorMessage,
  fromLocalInput,
  nextSlotInput,
  toLocalInput,
} from "@/features/clinic/lib/clinic-format";

import type { Appointment, AppointmentInput, AppointmentType } from "../types";

export type AppointmentSaveRequest =
  | { kind: "patient"; input: AppointmentInput }
  | {
      kind: "enquiry";
      enquiryId: number;
      input: { appointment_datetime: string; doctor_name?: string; reason?: string };
    };

export function AppointmentFormSheet({
  open,
  appointment,
  initialPatient,
  onClose,
  onSave,
}: {
  open: boolean;
  appointment: Appointment | null;
  initialPatient?: Patient | null;
  onClose: () => void;
  onSave: (request: AppointmentSaveRequest) => Promise<void>;
}) {
  const { tenant } = useIsClinicTenant();
  const { data: enquiries = [] } = useEnquiries();

  const [source, setSource] = useState<"patient" | "enquiry">("patient");
  const [patient, setPatient] = useState<Patient | null>(null);
  const [enquiryId, setEnquiryId] = useState<string>("");
  const [when, setWhen] = useState("");
  const [doctor, setDoctor] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState<AppointmentType>("regular");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const openEnquiries = useMemo(
    () => enquiries.filter((e) => e.status !== "won" && e.status !== "lost"),
    [enquiries]
  );

  useEffect(() => {
    if (!open) return;
    setError("");
    setSource("patient");
    setEnquiryId("");
    if (appointment) {
      setPatient({
        id: appointment.patient_id,
        name: appointment.patient_name || "Patient",
        phone: appointment.phone,
      } as Patient);
      setWhen(toLocalInput(appointment.appointment_datetime));
      setDoctor(appointment.doctor_name || "");
      setReason(appointment.reason || "");
      setNotes(appointment.notes || "");
      setType(appointment.appointment_type);
    } else {
      setPatient(initialPatient || null);
      setWhen(nextSlotInput());
      setDoctor(tenant?.dr_name || "");
      setReason("");
      setNotes("");
      setType("regular");
    }
  }, [open, appointment, initialPatient, tenant?.dr_name]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!when) {
      setError("Choose the date and time.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      if (source === "enquiry" && !appointment) {
        if (!enquiryId) {
          setError("Choose the enquiry.");
          return;
        }
        await onSave({
          kind: "enquiry",
          enquiryId: Number(enquiryId),
          input: {
            appointment_datetime: fromLocalInput(when),
            doctor_name: doctor.trim(),
            reason: reason.trim(),
          },
        });
      } else {
        if (!patient) {
          setError("Choose the patient.");
          return;
        }
        await onSave({
          kind: "patient",
          input: {
            patient_id: patient.id,
            appointment_datetime: fromLocalInput(when),
            doctor_name: doctor.trim(),
            reason: reason.trim(),
            notes: notes.trim(),
            appointment_type: type,
          },
        });
      }
    } catch (err) {
      setError(errorMessage(err, "Unable to save appointment."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <ResizableSheetContent
        defaultWidth={520}
        minWidth={400}
        maxWidth={880}
        storageKey="appointment-sheet-width"
        className="flex w-full flex-col gap-0 p-0"
      >
        <SheetHeader className="border-b p-6 pb-4 border-border">
          <SheetTitle>{appointment ? "Reschedule appointment" : "Book appointment"}</SheetTitle>
          <SheetDescription>
            Confirming an appointment sends the patient a WhatsApp confirmation.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={submit} className="flex-1 space-y-6 overflow-y-auto p-6">
          {!appointment ? (
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
              <button
                type="button"
                onClick={() => setSource("patient")}
                className={`flex items-center justify-center gap-2 rounded-md py-1.5 text-sm font-medium ${
                  source === "patient" ? "bg-background shadow-sm" : "text-muted-foreground"
                }`}
              >
                <User className="h-4 w-4" /> Patient
              </button>
              <button
                type="button"
                onClick={() => setSource("enquiry")}
                className={`flex items-center justify-center gap-2 rounded-md py-1.5 text-sm font-medium ${
                  source === "enquiry" ? "bg-background shadow-sm" : "text-muted-foreground"
                }`}
              >
                <PhoneCall className="h-4 w-4" /> From enquiry
              </button>
            </div>
          ) : null}

          {source === "patient" || appointment ? (
            <div className="space-y-1.5">
              <Label>Patient *</Label>
              <PatientPickerField value={patient} onChange={setPatient} disabled={Boolean(appointment)} />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="appt_enquiry">Open enquiry *</Label>
              <Select
                value={enquiryId}
                onValueChange={(v) => {
                  setEnquiryId(v);
                  const e = openEnquiries.find((x) => String(x.id) === v);
                  if (e && !reason) setReason(e.enquiry_data || "");
                }}
              >
                <SelectTrigger id="appt_enquiry" className="w-full">
                  <SelectValue placeholder={openEnquiries.length ? "Choose enquiry" : "No open enquiries"} />
                </SelectTrigger>
                <SelectContent>
                  {openEnquiries.map((e) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {(e.display_customer_name || e.customer_name || "Unknown") +
                        (e.display_phone || e.phone ? ` · ${e.display_phone || e.phone}` : "") +
                        (e.enquiry_data ? ` — ${e.enquiry_data.slice(0, 40)}` : "")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The enquiry is marked won and the lead is registered as a patient.
              </p>
            </div>
          )}

          <Separator />

          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" /> Slot
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="appt_when">Date &amp; time *</Label>
                <Input
                  id="appt_when"
                  type="datetime-local"
                  required
                  value={when}
                  onChange={(e) => setWhen(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="appt_doctor">Doctor</Label>
                <Input
                  id="appt_doctor"
                  placeholder="Dr. name"
                  value={doctor}
                  onChange={(e) => setDoctor(e.target.value)}
                />
              </div>
            </div>
            {source === "patient" && !appointment ? (
              <div className="space-y-1.5">
                <Label htmlFor="appt_type">Visit type</Label>
                <Select value={type} onValueChange={(v) => setType(v as AppointmentType)}>
                  <SelectTrigger id="appt_type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">New visit</SelectItem>
                    <SelectItem value="followup">Follow-up</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            <div className="space-y-1.5">
              <Label htmlFor="appt_reason">Reason</Label>
              <Input
                id="appt_reason"
                placeholder="e.g. Fever, review, dressing"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            {source === "patient" || appointment ? (
              <div className="space-y-1.5">
                <Label htmlFor="appt_notes">Notes</Label>
                <Textarea id="appt_notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            ) : null}
          </div>

          {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

          <SheetFooter className="border-t px-0 pt-4 border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {appointment ? "Save changes" : "Book appointment"}
            </Button>
          </SheetFooter>
        </form>
      </ResizableSheetContent>
    </Sheet>
  );
}
