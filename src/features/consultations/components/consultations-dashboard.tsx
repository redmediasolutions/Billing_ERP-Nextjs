"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  FilePenLine,
  Loader2,
  Plus,
  ReceiptText,
  Search,
  Stethoscope,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { PatientPickerField } from "@/features/patients/components/patient-picker-field";
import type { Patient } from "@/features/patients/types";
import {
  errorMessage,
  formatDateTime,
  money,
  toneClass,
} from "@/features/clinic/lib/clinic-format";

import { useConsultations, useStartConsultation } from "../hooks/use-consultations";

type Filter = "all" | "draft" | "completed" | "unbilled" | "archived";

export function ConsultationsDashboard() {
  const router = useRouter();
  const filterParam = (useUrlParam("filter") || "all") as Filter;
  const filter: Filter = ["all", "draft", "completed", "unbilled", "archived"].includes(filterParam) ? filterParam : "all";
  const { value: search, setSearch } = useUrlSearchParam();
  const { data: rows = [], isLoading, error } = useConsultations({ archived: filter === "archived" });
  const start = useStartConsultation();

  const [startOpen, setStartOpen] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [startError, setStartError] = useState("");

  const filtered = useMemo(
    () =>
      rows
        .filter((c) => {
          if (filter === "draft") return c.status === "draft";
          if (filter === "completed") return c.status === "completed";
          if (filter === "unbilled") return c.status === "completed" && !c.invoice_id;
          return true;
        })
        .filter((c) =>
          matchesSearch(search, [
            c.patient_name,
            c.patient_phone,
            c.consultation_number,
            c.chief_complaint,
            c.diagnosis,
            c.invoice_number,
          ])
        ),
    [rows, filter, search]
  );

  const drafts = rows.filter((c) => c.status === "draft").length;
  const unbilled = rows.filter((c) => c.status === "completed" && !c.invoice_id).length;
  const billedTotal = rows.reduce((s, c) => s + (c.invoice_id ? c.invoice_total : 0), 0);

  async function begin() {
    if (!patient) return;
    try {
      setStartError("");
      const r = await start.mutateAsync({ patient_id: patient.id });
      setStartOpen(false);
      router.push(`/dashboard/consultations/${r.consultation.id}`);
    } catch (err) {
      setStartError(errorMessage(err, "Unable to start consultation."));
    }
  }

  const filters: Array<{ key: Filter; label: string }> = [
    { key: "all", label: "All" },
    { key: "draft", label: "In progress" },
    { key: "completed", label: "Completed" },
    { key: "unbilled", label: "Not billed" },
    { key: "archived", label: "Archived" },
  ];

  return (
    <section className="w-full space-y-6 text-left">
      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Clinic</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Consultations</h1>
          <p className="text-sm text-muted-foreground">
            Notes, vitals, prescriptions and procedures — billed straight to Invoices.
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setPatient(null);
            setStartError("");
            setStartOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Start consultation
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi title="In progress" value={String(drafts)} icon={FilePenLine} />
        <Kpi title="Completed, not billed" value={String(unbilled)} icon={ClipboardList} />
        <Kpi title="Billed (listed)" value={money.format(billedTotal)} icon={ReceiptText} />
      </div>

      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient, diagnosis, number..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Button key={f.key} size="sm" variant={filter === f.key ? "default" : "outline"} asChild>
              <Link href={f.key === "all" ? "/dashboard/consultations" : `/dashboard/consultations?filter=${f.key}`}>
                {f.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-56 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" /> Loading consultations...
            </div>
          ) : error ? (
            <p className="p-6 text-sm font-medium text-destructive">{errorMessage(error, "Unable to load consultations.")}</p>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Stethoscope}
              title={search || filter !== "all" ? "Nothing matches" : "No consultations yet"}
              description="Start a consultation from an appointment, a patient, or here."
              actionLabel={search || filter !== "all" ? undefined : "Start Consultation"}
              onAction={search || filter !== "all" ? undefined : () => setStartOpen(true)}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Complaint / diagnosis</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Bill</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow
                    key={c.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/dashboard/consultations/${c.id}`)}
                  >
                    <TableCell>
                      <p className="font-medium">{c.patient_name || "Patient"}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.consultation_number}
                        {c.patient_phone ? ` · ${c.patient_phone}` : ""}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="max-w-[300px] truncate text-sm">{c.diagnosis || c.chief_complaint || "—"}</p>
                      {c.doctor_name ? <p className="text-xs text-muted-foreground">{c.doctor_name}</p> : null}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDateTime(c.consultation_date)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={c.status === "completed" ? toneClass.green : toneClass.amber}>
                        {c.status === "completed" ? "Completed" : "In progress"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      {c.invoice_id ? (
                        <Link href={`/dashboard/invoices/${c.invoice_id}`} className="text-sm font-medium hover:underline">
                          {c.invoice_number}
                          <span className="block text-xs text-muted-foreground">
                            {money.format(c.invoice_total)}
                            {c.invoice_total - c.invoice_paid > 0.009 ? " · due" : " · paid"}
                          </span>
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">Not billed</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={startOpen} onOpenChange={setStartOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Start consultation</DialogTitle>
            <DialogDescription>Walk-in patient without an appointment.</DialogDescription>
          </DialogHeader>
          <PatientPickerField value={patient} onChange={setPatient} autoFocus />
          {startError ? <p className="text-sm font-medium text-destructive">{startError}</p> : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setStartOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void begin()} disabled={!patient || start.isPending}>
              {start.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Start
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function Kpi({
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
