"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Edit3, Loader2, Plus, Search, Stethoscope, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useUrlSearchParam } from "@/lib/use-url-search";
import { errorMessage, money } from "@/features/clinic/lib/clinic-format";

import { ServiceFormDialog } from "../addform/service-form-dialog";
import {
  useClinicServices,
  useDeleteClinicService,
  useSaveClinicService,
} from "../hooks/use-clinic-services";
import type { ClinicService, ClinicServiceInput } from "../types";

export function ServicesDashboard() {
  const searchParams = useSearchParams();
  const { data: services = [], isLoading, error } = useClinicServices();
  const { value: search, setSearch } = useUrlSearchParam();
  const save = useSaveClinicService();
  const remove = useDeleteClinicService();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ClinicService | null>(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (searchParams.get("create") === "1") {
      setEditing(null);
      setFormOpen(true);
    }
  }, [searchParams]);

  const filtered = useMemo(
    () => services.filter((s) => matchesSearch(search, [s.name, s.description, s.item_code])),
    [services, search]
  );

  const hasConsultationService = services.some((s) => /consultation/i.test(s.name));

  async function submit(input: ClinicServiceInput) {
    await save.mutateAsync({ id: editing?.id, input });
    setFormOpen(false);
    setEditing(null);
  }

  async function del(service: ClinicService) {
    if (!window.confirm(`Delete "${service.name}"? Old bills keep their lines.`)) return;
    try {
      setActionError("");
      await remove.mutateAsync(service.id);
    } catch (err) {
      setActionError(errorMessage(err, "Unable to delete service."));
    }
  }

  return (
    <section className="w-full space-y-6 text-left">
      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Clinic</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Services</h1>
          <p className="text-sm text-muted-foreground">
            Consultation fees and procedures. They also appear in Items for invoices.
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> New service
        </Button>
      </div>

      {!isLoading && !hasConsultationService ? (
        <Card className="border-amber-200 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/30">
          <CardContent className="flex flex-col gap-3 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span>
              Add a service named <span className="font-semibold">Consultation</span> so its fee is
              billed automatically from a consultation.
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              Add consultation fee
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search services..."
          className="pl-9"
        />
      </div>

      {actionError ? <p className="text-sm font-medium text-destructive">{actionError}</p> : null}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" /> Loading services...
            </div>
          ) : error ? (
            <p className="p-6 text-sm font-medium text-destructive">{errorMessage(error, "Unable to load services.")}</p>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Stethoscope}
              title={search ? "No services match" : "No services yet"}
              description="Create the services and procedures your clinic charges for."
              actionLabel={search ? undefined : "Add First Service"}
              onAction={search ? undefined : () => setFormOpen(true)}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead className="text-right">Fee</TableHead>
                  <TableHead className="text-right">GST</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <p className="font-medium">{service.name}</p>
                      {service.description ? (
                        <p className="max-w-md truncate text-xs text-muted-foreground">{service.description}</p>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">{service.item_code || "—"}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{money.format(service.cost)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {service.tax_rate ? `${service.tax_rate}%` : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            setEditing(service);
                            setFormOpen(true);
                          }}
                        >
                          <Edit3 className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => void del(service)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ServiceFormDialog
        open={formOpen}
        service={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={submit}
      />
    </section>
  );
}
