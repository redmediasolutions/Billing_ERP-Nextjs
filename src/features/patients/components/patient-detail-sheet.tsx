"use client";

import Link from "next/link";
import {
  CalendarPlus,
  ClipboardList,
  Loader2,
  ReceiptText,
  Stethoscope,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import {
  ResizableSheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/resizable-sheet-content";
import {
  ageFrom,
  formatDate,
  formatDateTime,
  money,
  toneClass,
} from "@/features/clinic/lib/clinic-format";

import { usePatient } from "../hooks/use-patients";

export function PatientDetailSheet({
  patientId,
  onClose,
  onBook,
  onStartConsultation,
}: {
  patientId: number | null;
  onClose: () => void;
  onBook?: (patientId: number) => void;
  onStartConsultation?: (patientId: number) => void;
}) {
  const { data: patient, isLoading } = usePatient(patientId);
  const age = ageFrom(patient?.dob);

  const totalBilled = (patient?.invoices || []).reduce((s, i) => s + i.total, 0);
  const totalPaid = (patient?.invoices || []).reduce((s, i) => s + i.amount_paid, 0);

  return (
    <Sheet open={Boolean(patientId)} onOpenChange={(v) => !v && onClose()}>
      <ResizableSheetContent
        defaultWidth={600}
        minWidth={420}
        maxWidth={980}
        storageKey="patient-detail-width"
        className="flex w-full flex-col gap-0 p-0"
      >
        <SheetHeader className="border-b p-6 pb-4 border-border">
          <SheetTitle>{patient?.name || "Patient"}</SheetTitle>
          <SheetDescription>
            {[
              patient?.phone,
              patient?.gender,
              age !== null ? `${age} yrs` : null,
              patient?.blood_group,
            ]
              .filter(Boolean)
              .join(" · ") || "Patient history"}
          </SheetDescription>
          {patient ? (
            <div className="flex flex-wrap gap-2 pt-2">
              {onStartConsultation ? (
                <Button size="sm" className="gap-1.5" onClick={() => onStartConsultation(patient.id)}>
                  <Stethoscope className="h-3.5 w-3.5" /> Start consultation
                </Button>
              ) : null}
              {onBook ? (
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onBook(patient.id)}>
                  <CalendarPlus className="h-3.5 w-3.5" /> Book appointment
                </Button>
              ) : null}
              <Button size="sm" variant="outline" className="gap-1.5" asChild>
                <Link href={`/dashboard/clinic/billing?patient=${patient.id}`}>
                  <ReceiptText className="h-3.5 w-3.5" /> New bill
                </Link>
              </Button>
            </div>
          ) : null}
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {isLoading || !patient ? (
            <div className="flex h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading history...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                <Stat label="Visits" value={String(patient.consultations.length)} />
                <Stat label="Billed" value={money.format(totalBilled)} />
                <Stat label="Balance" value={money.format(Math.max(totalBilled - totalPaid, 0))} />
              </div>

              <Section icon={Stethoscope} title="Consultations">
                {patient.consultations.length === 0 ? (
                  <Empty text="No consultations yet." />
                ) : (
                  patient.consultations.map((c) => (
                    <Link
                      key={c.id}
                      href={`/dashboard/consultations/${c.id}`}
                      className="flex items-start justify-between gap-3 rounded-lg border p-3 hover:bg-accent border-border"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {c.diagnosis || c.chief_complaint || "Consultation"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {c.consultation_number} · {formatDateTime(c.consultation_date)}
                        </p>
                      </div>
                      <Badge variant="outline" className={c.status === "completed" ? toneClass.green : toneClass.amber}>
                        {c.status}
                      </Badge>
                    </Link>
                  ))
                )}
              </Section>

              <Section icon={ClipboardList} title="Appointments">
                {patient.appointments.length === 0 ? (
                  <Empty text="No appointments." />
                ) : (
                  patient.appointments.slice(0, 10).map((a) => (
                    <div key={a.id} className="flex items-center justify-between rounded-lg border p-3 border-border">
                      <div>
                        <p className="text-sm font-medium">{formatDateTime(a.appointment_datetime)}</p>
                        <p className="text-xs text-muted-foreground">
                          {a.reason || (a.appointment_type === "followup" ? "Follow-up" : "Visit")}
                          {a.doctor_name ? ` · ${a.doctor_name}` : ""}
                        </p>
                      </div>
                      <Badge variant="secondary">{a.status.replace("_", " ")}</Badge>
                    </div>
                  ))
                )}
              </Section>

              <Section icon={ReceiptText} title="Invoices">
                {patient.invoices.length === 0 ? (
                  <Empty text="No invoices." />
                ) : (
                  patient.invoices.map((i) => {
                    const due = Math.max(i.total - i.amount_paid, 0);
                    return (
                      <Link
                        key={i.id}
                        href={`/dashboard/invoices/${i.id}`}
                        className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent border-border"
                      >
                        <div>
                          <p className="text-sm font-medium">{i.invoice_number}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(i.invoice_date)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{money.format(i.total)}</p>
                          <p className={`text-xs ${due > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                            {due > 0 ? `${money.format(due)} due` : "Paid"}
                          </p>
                        </div>
                      </Link>
                    );
                  })
                )}
              </Section>

              {patient.address ? (
                <p className="text-xs text-muted-foreground">Address: {patient.address}</p>
              ) : null}
            </>
          )}
        </div>
      </ResizableSheetContent>
    </Sheet>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3 border-border">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold tracking-tight">{value}</p>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground">{text}</p>;
}
