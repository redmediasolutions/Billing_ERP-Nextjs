"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  CalendarClock,
  Edit3,
  IndianRupee,
  Loader2,
  Plus,
  Search,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { platformBilling } from "@/lib/platform-billing";
import { useUrlSearchParam } from "@/lib/use-url-search";

import { TenantLicenceSheet } from "../addform/tenant-licence-sheet";
import {
  useMarkRenewRequest,
  usePlatformLicences,
  usePlatformRenewRequests,
} from "../hooks/use-platform-licences";
import {
  formatDateOnly,
  statusBadgeVariant,
  statusLabel,
} from "../lib/entitlement";
import type { PlatformTenantLicence } from "../types";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function PlatformLicencesDashboard() {
  const { data: tenants = [], isLoading, error } = usePlatformLicences();
  const renewQuery = usePlatformRenewRequests();
  const markRenew = useMarkRenewRequest();
  const { value: search, setSearch } = useUrlSearchParam();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<PlatformTenantLicence | null>(null);
  const [actionError, setActionError] = useState("");

  const openRequests = renewQuery.data ?? [];

  const filtered = useMemo(() => {
    return tenants.filter((row) =>
      matchesSearch(search, [
        row.business_name,
        row.reference,
        row.plan_name,
        row.plan_code,
      ])
    );
  }, [tenants, search]);

  const expiringSoon = tenants.filter(
    (row) =>
      row.days_remaining != null &&
      row.days_remaining >= 0 &&
      row.days_remaining <= 15
  ).length;

  const locked = tenants.filter((row) => row.status === "locked").length;

  function openCreate() {
    setEditing(null);
    setSheetOpen(true);
  }

  function openEdit(row: PlatformTenantLicence) {
    setEditing(row);
    setSheetOpen(true);
  }

  async function processRequest(id: number, status: "processed" | "rejected") {
    setActionError("");
    try {
      await markRenew.mutateAsync({ id, status });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action failed.");
    }
  }

  return (
    <section className="w-full space-y-6 text-left">
      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Platform
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Tenant licences
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {platformBilling.providerName} console — assign packages, set a
            custom price per company, and extend expiry after payment.
          </p>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Assign licence
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi title="Tenants" value={String(tenants.length)} icon={Building2} />
        <Kpi
          title="Expiring ≤ 15 days"
          value={String(expiringSoon)}
          icon={CalendarClock}
          alert={expiringSoon > 0}
        />
        <Kpi
          title="Locked"
          value={String(locked)}
          icon={IndianRupee}
          alert={locked > 0}
        />
      </div>

      {openRequests.length > 0 ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Renewal requests ({openRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-0">
            {renewQuery.isLoading ? (
              <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading requests...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {openRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">
                        {req.business_name || `Tenant #${req.tenant_id}`}
                      </TableCell>
                      <TableCell>{req.plan_code || "—"}</TableCell>
                      <TableCell>
                        {req.amount != null ? money.format(req.amount) : "—"}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {req.notes || "—"}
                      </TableCell>
                      <TableCell>
                        {new Date(req.created_at).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={markRenew.isPending}
                            onClick={() => processRequest(req.id, "rejected")}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={markRenew.isPending}
                            onClick={() => processRequest(req.id, "processed")}
                          >
                            Mark done
                          </Button>
                          <Button
                            size="sm"
                            disabled={markRenew.isPending}
                            onClick={() => {
                              const row = tenants.find(
                                (t) => t.tenant_id === req.tenant_id
                              );
                              if (row) openEdit(row);
                            }}
                          >
                            Extend licence
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
      ) : null}

      {error ? (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-4 text-sm">
            <p className="font-medium text-destructive">
              Tenant list API is not available.
            </p>
            <p className="mt-1 text-muted-foreground">
              {error instanceof Error ? error.message : "Request failed."}{" "}
              Create{" "}
              <code className="text-xs">
                src/middleware/platform-admin.middleware.js
              </code>{" "}
              on the server, then{" "}
              <code className="text-xs">pm2 restart billing-erp</code>. Until
              then, use Assign licence and type the tenant ID manually.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {actionError ? (
        <p className="text-sm font-medium text-destructive">{actionError}</p>
      ) : null}

      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search company, plan..."
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading tenants...
            </div>
          ) : error ? (
            <div className="p-6 text-sm text-destructive">
              {error instanceof Error ? error.message : "Unable to load tenants."}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No tenants"
              description="Assign the first ERP licence to a company."
              actionLabel="Assign licence"
              onAction={openCreate}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Custom fee</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => (
                  <TableRow key={row.tenant_id}>
                    <TableCell>
                      <p className="font-medium">{row.business_name}</p>
                      {row.reference ? (
                        <p className="text-xs text-muted-foreground">
                          {row.reference}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      {row.plan_name || "—"}
                      {row.billing_cycle ? (
                        <p className="text-xs text-muted-foreground">
                          {row.billing_cycle}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      {row.amount != null ? money.format(row.amount) : "—"}
                    </TableCell>
                    <TableCell>{formatDateOnly(row.expires_on)}</TableCell>
                    <TableCell>
                      {row.days_remaining == null
                        ? "—"
                        : row.days_remaining < 0
                          ? "Expired"
                          : row.days_remaining}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(row.status)}>
                        {statusLabel(row.status)}
                      </Badge>
                      {row.open_renew_requests > 0 ? (
                        <Badge variant="outline" className="ml-1">
                          {row.open_renew_requests} req
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1"
                        onClick={() => openEdit(row)}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <TenantLicenceSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        tenants={tenants}
        editing={editing}
      />
    </section>
  );
}

function Kpi({
  title,
  value,
  icon: Icon,
  alert = false,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  alert?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h2 className="mt-2 text-2xl font-bold">{value}</h2>
        </div>
        <div
          className={`rounded-2xl p-3 ${
            alert
              ? "bg-amber-500/10 text-amber-600"
              : "bg-primary/10 text-primary"
          }`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}
