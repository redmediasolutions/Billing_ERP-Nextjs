"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CalendarDays,
  CalendarPlus,
  ClipboardList,
  IndianRupee,
  Loader2,
  Pill,
  ReceiptText,
  Settings2,
  Stethoscope,
  UserPlus,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { statusLabel, statusTone } from "@/features/appointments/lib/appointment-utils";
import { useStartConsultation } from "@/features/consultations/hooks/use-consultations";

import { ClinicSettingsDialog } from "../addform/clinic-settings-dialog";
import { useClinicDashboard, useIsClinicTenant } from "../hooks/use-clinic";
import { errorMessage, formatTime, money, toneClass } from "../lib/clinic-format";

export function ClinicOverview() {
  const router = useRouter();
  const { data, isLoading, error } = useClinicDashboard();
  const { tenant } = useIsClinicTenant();
  const start = useStartConsultation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [actionError, setActionError] = useState("");

  const k = data?.kpi;

  async function consult(patientId: number, appointmentId: number) {
    try {
      setActionError("");
      const r = await start.mutateAsync({ patient_id: patientId, appointment_id: appointmentId });
      router.push(`/dashboard/consultations/${r.consultation.id}`);
    } catch (err) {
      setActionError(errorMessage(err, "Unable to start consultation."));
    }
  }

  return (
    <section className="w-full space-y-6 text-left">
      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Clinic</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {tenant?.dr_name ? `Good day, ${tenant.dr_name}` : "Clinic overview"}
          </h1>
          <p className="text-sm text-muted-foreground">Today&apos;s patients, collections and pharmacy alerts.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="icon" title="Clinic settings" onClick={() => setSettingsOpen(true)}>
            <Settings2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/dashboard/patients?create=1">
              <UserPlus className="h-4 w-4" /> Patient
            </Link>
          </Button>
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/dashboard/appointments?create=1">
              <CalendarPlus className="h-4 w-4" /> Appointment
            </Link>
          </Button>
          <Button className="gap-2" asChild>
            <Link href="/dashboard/clinic/billing">
              <ReceiptText className="h-4 w-4" /> New bill
            </Link>
          </Button>
        </div>
      </div>

      {error ? <p className="text-sm font-medium text-destructive">{errorMessage(error, "Unable to load clinic dashboard.")}</p> : null}
      {actionError ? <p className="text-sm font-medium text-destructive">{actionError}</p> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi title="Collected today" value={money.format(k?.income_today || 0)} hint={`${money.format(k?.income_week || 0)} this week`} icon={IndianRupee} loading={isLoading} />
        <Kpi title="This month" value={money.format(k?.income_month || 0)} hint="payments received" icon={ReceiptText} loading={isLoading} />
        <Kpi title="Patients this month" value={String(k?.patients_this_month || 0)} hint={`${k?.patients_this_week || 0} paid this week`} icon={Users} loading={isLoading} />
        <Kpi title="Registered patients" value={String(k?.total_patients || 0)} hint="active" icon={Stethoscope} loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <CalendarDays className="h-4 w-4 text-muted-foreground" /> Today&apos;s appointments
              </h2>
              <Button size="sm" variant="ghost" asChild>
                <Link href="/dashboard/appointments">View all</Link>
              </Button>
            </div>
            {isLoading ? (
              <div className="flex h-32 items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading...
              </div>
            ) : !data?.appointments.length ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No appointments today.</p>
            ) : (
              <div className="divide-y rounded-lg border border-border divide-border">
                {data.appointments.map((a) => {
                  const open = a.status === "scheduled" || a.status === "confirmed";
                  return (
                    <div key={a.id} className="flex items-center justify-between gap-3 p-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="w-16 shrink-0 text-sm font-semibold">{formatTime(a.appointment_datetime)}</span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{a.patient_name || "Patient"}</p>
                          <p className="truncate text-xs text-muted-foreground">{a.reason || a.phone || "—"}</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge variant="outline" className={toneClass[statusTone(a.status)]}>
                          {statusLabel(a.status)}
                        </Badge>
                        {open ? (
                          <Button size="sm" className="gap-1" disabled={start.isPending} onClick={() => void consult(a.patient_id, a.id)}>
                            <Stethoscope className="h-3.5 w-3.5" /> Consult
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Alert
            href="/dashboard/consultations?filter=draft"
            icon={ClipboardList}
            title="Consultations in progress"
            value={k?.draft_consultations || 0}
          />
          <Alert
            href="/dashboard/consultations?filter=unbilled"
            icon={ReceiptText}
            title="Completed but not billed"
            value={k?.unbilled_consultations || 0}
            warn
          />
          <Alert
            href="/dashboard/medicines?filter=low"
            icon={Pill}
            title={`Medicines at ${data?.limits.low_stock ?? 10} or fewer`}
            value={k?.low_stock_medicines || 0}
            warn
          />
          <Alert
            href="/dashboard/medicines?filter=expiring"
            icon={AlertTriangle}
            title={`Batches expiring in ${data?.limits.expiry_days ?? 60} days`}
            value={k?.expiring_batches || 0}
            warn
          />
        </div>
      </div>

      <ClinicSettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </section>
  );
}

function Kpi({
  title,
  value,
  hint,
  icon: Icon,
  loading,
}: {
  title: string;
  value: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{loading ? "…" : value}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}

function Alert({
  href,
  icon: Icon,
  title,
  value,
  warn,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: number;
  warn?: boolean;
}) {
  return (
    <Link href={href} className="block">
      <Card className="transition-colors hover:bg-accent/50">
        <CardContent className="flex items-center justify-between gap-3 p-4">
          <span className="flex items-center gap-3 text-sm">
            <Icon className="h-4 w-4 text-muted-foreground" /> {title}
          </span>
          <Badge variant="outline" className={warn && value > 0 ? toneClass.amber : ""}>
            {value}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}
