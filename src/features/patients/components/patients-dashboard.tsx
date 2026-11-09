"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  CalendarPlus,
  Edit3,
  HeartPulse,
  Loader2,
  MoreHorizontal,
  Phone,

  ReceiptText,
  Search,
  Stethoscope,
  UserPlus,
  Users,
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
import {
  ageFrom,
  errorMessage,
  formatDate,
  initials,
} from "@/features/clinic/lib/clinic-format";

import { PatientFormSheet } from "../addform/patient-form-sheet";
import { PatientDetailSheet } from "./patient-detail-sheet";
import {
  useArchivePatient,
  useCreatePatient,
  usePatients,
  useUpdatePatient,
} from "../hooks/use-patients";
import type { Patient, PatientInput } from "../types";

export function PatientsDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const archivedView = useUrlParam("view") === "archived";
  const { data: patients = [], isLoading, error } = usePatients(archivedView);
  const { value: search, setSearch } = useUrlSearchParam();

  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();
  const archivePatient = useArchivePatient();
  const startConsultation = useStartConsultation();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (searchParams.get("create") === "1") {
      setEditing(null);
      setFormOpen(true);
    }
    const open = Number(searchParams.get("patient"));
    if (open > 0) setViewingId(open);
  }, [searchParams]);

  const filtered = useMemo(
    () =>
      patients.filter((p) =>
        matchesSearch(search, [p.name, p.display_name, p.phone, p.email, p.address])
      ),
    [patients, search]
  );

  const thisMonth = new Date().toISOString().slice(0, 7);
  const visitedThisMonth = patients.filter((p) => (p.last_visit || "").startsWith(thisMonth)).length;
  const newThisMonth = patients.filter((p) => (p.registered_at || "").startsWith(thisMonth)).length;

  async function save(input: PatientInput) {
    if (editing) {
      await updatePatient.mutateAsync({ id: editing.id, input });
    } else {
      await createPatient.mutateAsync(input);
    }
    setFormOpen(false);
    setEditing(null);
  }

  async function toggleArchive(patient: Patient) {
    const archiving = !patient.is_archived;
    if (archiving && !window.confirm(`Archive "${patient.name}"? They will also be hidden from Customers.`)) {
      return;
    }
    try {
      setActionError("");
      await archivePatient.mutateAsync({ id: patient.id, archived: archiving });
    } catch (err) {
      setActionError(errorMessage(err, "Unable to update patient."));
    }
  }

  async function consult(patientId: number) {
    try {
      setActionError("");
      const result = await startConsultation.mutateAsync({ patient_id: patientId });
      router.push(`/dashboard/consultations/${result.consultation.id}`);
    } catch (err) {
      setActionError(errorMessage(err, "Unable to start consultation."));
    }
  }

  return (
    <section className="w-full space-y-6 text-left">
      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Clinic
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Patients</h1>
          <p className="text-sm text-muted-foreground">
            Patient records, visit history and bills — shared with Customers.
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <UserPlus className="h-4 w-4" />
          Register patient
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard title="Registered patients" value={String(archivedView ? "—" : patients.length)} icon={Users} />
        <KpiCard title="Visited this month" value={String(visitedThisMonth)} icon={Stethoscope} />
        <KpiCard title="New this month" value={String(newThisMonth)} icon={HeartPulse} />
      </div>

      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, email..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={archivedView ? "outline" : "default"} asChild>
            <Link href="/dashboard/patients">Active</Link>
          </Button>
          <Button size="sm" variant={archivedView ? "default" : "outline"} asChild>
            <Link href="/dashboard/patients?view=archived">Archived</Link>
          </Button>
        </div>
      </div>

      {actionError ? <p className="text-sm font-medium text-destructive">{actionError}</p> : null}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Loading patients...
            </div>
          ) : error ? (
            <div className="flex h-64 flex-col justify-center gap-2 p-6">
              <p className="text-sm font-medium text-destructive">Unable to load patients.</p>
              <p className="text-xs text-muted-foreground">{errorMessage(error, "")}</p>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title={search ? "No patients match your search" : archivedView ? "No archived patients" : "No patients yet"}
              description={
                search
                  ? "Try a different name or phone number."
                  : "Register a patient to book appointments and start consultations."
              }
              actionLabel={search || archivedView ? undefined : "Register First Patient"}
              onAction={search || archivedView ? undefined : () => setFormOpen(true)}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[280px]">Patient</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Profile</TableHead>
                  <TableHead>Last visit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((patient) => {
                  const age = ageFrom(patient.dob);
                  return (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <button
                          type="button"
                          className="flex items-center gap-3 text-left"
                          onClick={() => setViewingId(patient.id)}
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {initials(patient.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground hover:underline">{patient.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {patient.consultation_count} consultation{patient.consultation_count === 1 ? "" : "s"}
                            </p>
                          </div>
                        </button>
                      </TableCell>
                      <TableCell>
                        {patient.phone ? (
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" /> {patient.phone}
                          </span>
                        ) : (
                          <span className="text-xs italic text-muted-foreground">No phone</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {patient.gender ? <Badge variant="secondary" className="capitalize">{patient.gender}</Badge> : null}
                          {age !== null ? <Badge variant="secondary">{age} yrs</Badge> : null}
                          {patient.blood_group ? <Badge variant="outline">{patient.blood_group}</Badge> : null}
                          {!patient.gender && age === null && !patient.blood_group ? (
                            <span className="text-xs text-muted-foreground">—</span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {patient.last_visit ? formatDate(patient.last_visit) : "Never"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {!archivedView ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="hidden gap-1.5 md:inline-flex"
                              disabled={startConsultation.isPending}
                              onClick={() => void consult(patient.id)}
                            >
                              <Stethoscope className="h-3.5 w-3.5" /> Consult
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
                              <DropdownMenuItem onClick={() => setViewingId(patient.id)}>
                                <Users className="mr-2 h-4 w-4" /> History
                              </DropdownMenuItem>
                              {!archivedView ? (
                                <>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/appointments?create=1&patient=${patient.id}`}>
                                      <CalendarPlus className="mr-2 h-4 w-4" /> Book appointment
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/clinic/billing?patient=${patient.id}`}>
                                      <ReceiptText className="mr-2 h-4 w-4" /> New bill
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setEditing(patient);
                                      setFormOpen(true);
                                    }}
                                  >
                                    <Edit3 className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                </>
                              ) : null}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => void toggleArchive(patient)}>
                                {patient.is_archived ? (
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

      <PatientFormSheet
        open={formOpen}
        patient={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={save}
      />

      <PatientDetailSheet
        patientId={viewingId}
        onClose={() => setViewingId(null)}
        onBook={(id) => router.push(`/dashboard/appointments?create=1&patient=${id}`)}
        onStartConsultation={(id) => void consult(id)}
      />
    </section>
  );
}

function KpiCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

