"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  CalendarCheck2,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock,
  Edit3,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Search,
  Stethoscope,
  UserX,
  XCircle,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { matchesSearch } from "@/lib/erp-search";
import { useUrlParam, useUrlSearchParam } from "@/lib/use-url-search";
import { useStartConsultation } from "@/features/consultations/hooks/use-consultations";
import { usePatient } from "@/features/patients/hooks/use-patients";
import {
  errorMessage,
  formatDate,
  formatTime,
  isToday,
  toneClass,
} from "@/features/clinic/lib/clinic-format";

import {
  AppointmentFormSheet,
  type AppointmentSaveRequest,
} from "../addform/appointment-form-sheet";
import {
  useAppointmentFromEnquiry,
  useAppointments,
  useArchiveAppointment,
  useSaveAppointment,
  useSetAppointmentStatus,
} from "../hooks/use-appointments";
import { statusLabel, statusTone } from "../lib/appointment-utils";
import type { Appointment, AppointmentStatus, AppointmentView } from "../types";

const VIEWS: Array<{ key: AppointmentView; label: string }> = [
  { key: "today", label: "Today" },
  { key: "upcoming", label: "Upcoming" },
  { key: "all", label: "All" },
  { key: "archived", label: "Archived" },
];

export function AppointmentsDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = useUrlParam("view") as AppointmentView;
  const view: AppointmentView = VIEWS.some((v) => v.key === viewParam) ? viewParam : "today";
  const { value: search, setSearch } = useUrlSearchParam();

  const { data: appointments = [], isLoading, error } = useAppointments(view);
  const { data: todayList = [] } = useAppointments("today");
  const { data: upcoming = [] } = useAppointments("upcoming");

  const save = useSaveAppointment();
  const fromEnquiry = useAppointmentFromEnquiry();
  const setStatus = useSetAppointmentStatus();
  const archive = useArchiveAppointment();
  const startConsultation = useStartConsultation();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const prefillPatientId = Number(searchParams.get("patient")) || null;
  const { data: prefillPatient } = usePatient(prefillPatientId);

  useEffect(() => {
    if (searchParams.get("create") === "1") {
      setEditing(null);
      setFormOpen(true);
    }
  }, [searchParams]);

  const filtered = useMemo(
    () =>
      appointments.filter((a) =>
        matchesSearch(search, [a.patient_name, a.phone, a.reason, a.doctor_name, a.notes])
      ),
    [appointments, search]
  );

  const waiting = todayList.filter((a) => a.status === "scheduled" || a.status === "confirmed").length;
  const done = todayList.filter((a) => a.status === "completed").length;
  const unconfirmed = upcoming.filter((a) => a.status === "scheduled").length;

  async function handleSave(request: AppointmentSaveRequest) {
    if (request.kind === "enquiry") {
      await fromEnquiry.mutateAsync({ enquiryId: request.enquiryId, input: request.input });
    } else {
      await save.mutateAsync({ id: editing?.id, input: request.input });
    }
    setFormOpen(false);
    setEditing(null);
    if (searchParams.get("create") || searchParams.get("patient")) {
      router.replace(`/dashboard/appointments${view === "today" ? "" : `?view=${view}`}`);
    }
  }

  async function changeStatus(a: Appointment, status: AppointmentStatus) {
    try {
      setActionError("");
      setMessage("");
      const updated = await setStatus.mutateAsync({ id: a.id, status });
      if (status === "confirmed") {
        setMessage(
          updated.whatsapp_sent
            ? `Confirmed. WhatsApp sent to ${a.patient_name}.`
            : `Confirmed. WhatsApp was not sent (no valid mobile or MSG91 not set up on the server).`
        );
      }
    } catch (err) {
      setActionError(errorMessage(err, "Unable to update status."));
    }
  }

  async function consult(a: Appointment) {
    if (a.started_consultation_id) {
      router.push(`/dashboard/consultations/${a.started_consultation_id}`);
      return;
    }
    try {
      setActionError("");
      const r = await startConsultation.mutateAsync({ patient_id: a.patient_id, appointment_id: a.id });
      router.push(`/dashboard/consultations/${r.consultation.id}`);
    } catch (err) {
      setActionError(errorMessage(err, "Unable to start consultation."));
    }
  }

  async function toggleArchive(a: Appointment) {
    try {
      setActionError("");
      await archive.mutateAsync({ id: a.id, archived: !a.is_archived });
    } catch (err) {
      setActionError(errorMessage(err, "Unable to update appointment."));
    }
  }

  const showDate = view !== "today";

  return (
    <section className="w-full space-y-6 text-left">
      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Clinic</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Appointments</h1>
          <p className="text-sm text-muted-foreground">
            Today&apos;s queue, upcoming visits and follow-ups with WhatsApp confirmations.
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Book appointment
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi title="Today" value={String(todayList.length)} hint={`${done} seen`} icon={CalendarDays} />
        <Kpi title="Waiting" value={String(waiting)} hint="scheduled or confirmed" icon={Clock} />
        <Kpi title="Upcoming" value={String(upcoming.length)} hint="from now" icon={CalendarClock} />
        <Kpi title="Not confirmed" value={String(unconfirmed)} hint="upcoming, still scheduled" icon={MessageCircle} />
      </div>

      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient, phone, reason..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {VIEWS.map((v) => (
            <Button key={v.key} size="sm" variant={view === v.key ? "default" : "outline"} asChild>
              <Link href={v.key === "today" ? "/dashboard/appointments" : `/dashboard/appointments?view=${v.key}`}>
                {v.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>

      {message ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          {message}
        </p>
      ) : null}
      {actionError ? <p className="text-sm font-medium text-destructive">{actionError}</p> : null}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-56 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" /> Loading appointments...
            </div>
          ) : error ? (
            <p className="p-6 text-sm font-medium text-destructive">{errorMessage(error, "Unable to load appointments.")}</p>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={CalendarCheck2}
              title={search ? "No appointments match" : view === "today" ? "No appointments today" : "No appointments"}
              description="Book an appointment for a patient or straight from an enquiry."
              actionLabel={search || view === "archived" ? undefined : "Book Appointment"}
              onAction={search || view === "archived" ? undefined : () => setFormOpen(true)}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">{showDate ? "When" : "Time"}</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Visit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a) => {
                  const open = a.status === "scheduled" || a.status === "confirmed";
                  return (
                    <TableRow key={a.id}>
                      <TableCell>
                        <p className="font-semibold">{formatTime(a.appointment_datetime)}</p>
                        {showDate ? (
                          <p className="text-xs text-muted-foreground">
                            {isToday(a.appointment_datetime) ? "Today" : formatDate(a.appointment_datetime)}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <Link href={`/dashboard/patients?patient=${a.patient_id}`} className="font-medium hover:underline">
                          {a.patient_name || "Patient"}
                        </Link>
                        <p className="text-xs text-muted-foreground">{a.phone || "No phone"}</p>
                      </TableCell>
                      <TableCell>
                        <p className="max-w-[260px] truncate text-sm">{a.reason || "—"}</p>
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {a.appointment_type === "followup" ? (
                            <Badge variant="secondary">Follow-up</Badge>
                          ) : null}
                          {a.enquiry_id ? <Badge variant="secondary">From enquiry</Badge> : null}
                          {a.doctor_name ? (
                            <span className="text-xs text-muted-foreground">{a.doctor_name}</span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={toneClass[statusTone(a.status)]}>
                          {statusLabel(a.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {!a.is_archived && a.status === "scheduled" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="hidden gap-1.5 md:inline-flex"
                              disabled={setStatus.isPending}
                              onClick={() => void changeStatus(a, "confirmed")}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Confirm
                            </Button>
                          ) : null}
                          {!a.is_archived && (open || a.started_consultation_id) ? (
                            <Button
                              size="sm"
                              className="gap-1.5"
                              disabled={startConsultation.isPending}
                              onClick={() => void consult(a)}
                            >
                              <Stethoscope className="h-3.5 w-3.5" />
                              {a.started_consultation_id ? "Open" : "Consult"}
                            </Button>
                          ) : null}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {!a.is_archived ? (
                                <>
                                  {a.status === "scheduled" ? (
                                    <DropdownMenuItem onClick={() => void changeStatus(a, "confirmed")}>
                                      <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm + WhatsApp
                                    </DropdownMenuItem>
                                  ) : null}
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setEditing(a);
                                      setFormOpen(true);
                                    }}
                                  >
                                    <Edit3 className="mr-2 h-4 w-4" /> Reschedule / edit
                                  </DropdownMenuItem>
                                  {a.status !== "completed" ? (
                                    <DropdownMenuItem onClick={() => void changeStatus(a, "completed")}>
                                      <CalendarCheck2 className="mr-2 h-4 w-4" /> Mark completed
                                    </DropdownMenuItem>
                                  ) : null}
                                  {open ? (
                                    <>
                                      <DropdownMenuItem onClick={() => void changeStatus(a, "no_show")}>
                                        <UserX className="mr-2 h-4 w-4" /> No-show
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => void changeStatus(a, "cancelled")}>
                                        <XCircle className="mr-2 h-4 w-4" /> Cancel
                                      </DropdownMenuItem>
                                    </>
                                  ) : (
                                    <DropdownMenuItem onClick={() => void changeStatus(a, "scheduled")}>
                                      <CalendarClock className="mr-2 h-4 w-4" /> Back to scheduled
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                </>
                              ) : null}
                              <DropdownMenuItem onClick={() => void toggleArchive(a)}>
                                {a.is_archived ? (
                                  <>
                                    <ArchiveRestore className="mr-2 h-4 w-4" /> Restore
                                  </>
                                ) : (
                                  <>
                                    <Archive className="mr-2 h-4 w-4" /> Archive
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AppointmentFormSheet
        open={formOpen}
        appointment={editing}
        initialPatient={editing ? null : prefillPatient || null}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />
    </section>
  );
}

function Kpi({
  title,
  value,
  hint,
  icon: Icon,
}: {
  title: string;
  value: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}
