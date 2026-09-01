"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Edit3,
  CreditCard,
  Loader2,
  MoreHorizontal,
  Plus,
  ScanLine,
  Search,
  ShieldCheck,
  ShieldAlert,
  Ticket,
  Trash2,
  Wrench,
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
import { useDebounce } from "@/lib/use-debounce";
import { useUrlParam, useUrlSearchParam } from "@/lib/use-url-search";

import { ClaimFormSheet } from "../addform/claim-form-sheet";
import { ClaimStatusDialog } from "../addform/claim-status-dialog";
import { PoliciesDialog } from "../addform/policies-dialog";
import { WarrantyFormSheet } from "../addform/warranty-form-sheet";
import {
  useChangeClaimStatus,
  useCreateWarranty,
  useCreateWarrantyClaim,
  useDeleteWarranty,
  useDeleteWarrantyClaim,
  useUpdateWarranty,
  useUpdateWarrantyClaim,
  useWarranties,
  useWarrantyClaims,
  useWarrantyLookup,
  useWarrantySummary,
} from "../hooks/use-warranty";
import {
  claimStatusLabel,
  coverageLabel,
  formatShortDate,
  isExpiringSoon,
  isOpenClaim,
  remainingCopy,
  statusLabel,
} from "../lib/warranty-utils";
import type {
  ClaimStatusInput,
  WarrantyClaim,
  WarrantyClaimInput,
  WarrantyInput,
  WarrantyRegistration,
} from "../types";
import { WarrantyCardDialog } from "./warranty-card-dialog";

type FilterKey =
  | "all"
  | "active"
  | "expiring"
  | "expired"
  | "pending"
  | "open_claims";

type ViewKey = "registrations" | "claims" | "lookup";

export function WarrantyDashboard() {
  const { data: warranties = [], isLoading, error } = useWarranties();
  const { data: claims = [], isLoading: claimsLoading } = useWarrantyClaims();
  const { data: summary } = useWarrantySummary();
  const { value: search, setSearch } = useUrlSearchParam();
  const filter = (useUrlParam("filter") || "all") as FilterKey;
  const view = (useUrlParam("view") || "registrations") as ViewKey;

  const createWarranty = useCreateWarranty();
  const updateWarranty = useUpdateWarranty();
  const deleteWarranty = useDeleteWarranty();
  const createClaim = useCreateWarrantyClaim();
  const updateClaim = useUpdateWarrantyClaim();
  const changeClaimStatus = useChangeClaimStatus();
  const deleteClaim = useDeleteWarrantyClaim();

  const [formOpen, setFormOpen] = useState(false);
  const [policiesOpen, setPoliciesOpen] = useState(false);
  const [editing, setEditing] = useState<WarrantyRegistration | null>(null);
  const [card, setCard] = useState<WarrantyRegistration | null>(null);
  const [claimFormOpen, setClaimFormOpen] = useState(false);
  const [claimRegistration, setClaimRegistration] =
    useState<WarrantyRegistration | null>(null);
  const [editingClaim, setEditingClaim] = useState<WarrantyClaim | null>(null);
  const [statusClaim, setStatusClaim] = useState<WarrantyClaim | null>(null);
  const [presetSerial, setPresetSerial] = useState("");
  const [lookupSerial, setLookupSerial] = useState("");
  const [actionError, setActionError] = useState("");

  const debouncedLookup = useDebounce(lookupSerial, 350);
  const { data: lookup, isFetching: lookupLoading } =
    useWarrantyLookup(debouncedLookup);

  const filteredWarranties = useMemo(() => {
    return warranties.filter((row) => {
      const matchesQuery = matchesSearch(search, [
        row.warranty_number,
        row.serial_number,
        row.display_customer_name,
        row.customer_name,
        row.display_phone,
        row.phone,
        row.product_name,
        row.invoice_number,
      ]);
      if (!matchesQuery) return false;
      if (filter === "active") return row.status === "active";
      if (filter === "expiring") return isExpiringSoon(row);
      if (filter === "expired") return row.status === "expired";
      if (filter === "pending") return row.status === "pending";
      if (filter === "open_claims") return row.open_claims > 0;
      return true;
    });
  }, [filter, search, warranties]);

  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      const matchesQuery = matchesSearch(search, [
        claim.claim_number,
        claim.serial_number,
        claim.display_customer_name,
        claim.customer_name,
        claim.product_name,
        claim.issue_description,
        claim.warranty_number,
      ]);
      if (!matchesQuery) return false;
      if (filter === "open_claims") return isOpenClaim(claim.status);
      return true;
    });
  }, [claims, filter, search]);

  function openCreate(serial = "") {
    setEditing(null);
    setPresetSerial(serial);
    setActionError("");
    setFormOpen(true);
  }

  function openClaim(row: WarrantyRegistration | null = null) {
    setEditingClaim(null);
    setClaimRegistration(row);
    setClaimFormOpen(true);
  }

  async function saveWarranty(input: WarrantyInput) {
    if (editing?.id) {
      await updateWarranty.mutateAsync({ id: editing.id, input });
    } else {
      await createWarranty.mutateAsync(input);
    }
    setFormOpen(false);
    setEditing(null);
    setPresetSerial("");
  }

  async function saveClaim(input: WarrantyClaimInput) {
    if (editingClaim?.id) {
      await updateClaim.mutateAsync({ id: editingClaim.id, input });
    } else {
      await createClaim.mutateAsync(input);
    }
    setClaimFormOpen(false);
    setEditingClaim(null);
    setClaimRegistration(null);
  }

  async function saveClaimStatus(input: ClaimStatusInput) {
    if (!statusClaim) return;
    await changeClaimStatus.mutateAsync({ id: statusClaim.id, input });
    setStatusClaim(null);
  }

  async function removeWarranty(row: WarrantyRegistration) {
    const confirmed = window.confirm(
      `Archive warranty ${row.warranty_number}?`
    );
    if (!confirmed) return;
    try {
      setActionError("");
      await deleteWarranty.mutateAsync(row.id);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Unable to archive warranty."
      );
    }
  }

  async function removeClaim(claim: WarrantyClaim) {
    const confirmed = window.confirm(`Archive claim ${claim.claim_number}?`);
    if (!confirmed) return;
    try {
      setActionError("");
      await deleteClaim.mutateAsync(claim.id);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Unable to archive claim."
      );
    }
  }

  const filters: Array<{ key: FilterKey; label: string; href: string }> = [
    { key: "all", label: "All", href: "/dashboard/warranty" },
    {
      key: "active",
      label: "Active",
      href: "/dashboard/warranty?filter=active",
    },
    {
      key: "expiring",
      label: "Expiring",
      href: "/dashboard/warranty?filter=expiring",
    },
    {
      key: "expired",
      label: "Expired",
      href: "/dashboard/warranty?filter=expired",
    },
    {
      key: "open_claims",
      label: "Open claims",
      href: "/dashboard/warranty?filter=open_claims&view=claims",
    },
  ];

  return (
    <section className="w-full space-y-6 text-left">
      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            After-sales
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Warranty
          </h1>
          <p className="text-sm text-muted-foreground">
            Register serials from stock or invoices, check coverage instantly,
            and run repair / replace claims from one desk.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setPoliciesOpen(true)}
          >
            <ShieldCheck className="h-4 w-4" />
            Policies
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => openClaim(null)}
          >
            <Ticket className="h-4 w-4" />
            New claim
          </Button>
          <Button className="gap-2" onClick={() => openCreate()}>
            <Plus className="h-4 w-4" />
            Register
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Active coverage"
          value={String(summary?.active ?? 0)}
          hint={`${summary?.expiring_soon ?? 0} expiring in 30 days`}
          icon={ShieldCheck}
        />
        <KpiCard
          title="Expiring soon"
          value={String(summary?.expiring_soon ?? 0)}
          hint={`${summary?.expired ?? 0} already expired`}
          icon={ShieldAlert}
        />
        <KpiCard
          title="Open claims"
          value={String(summary?.open_claims ?? 0)}
          hint={`${summary?.claims_this_month ?? 0} filed this month`}
          icon={Ticket}
        />
        <KpiCard
          title="Resolved this month"
          value={String(summary?.resolved_this_month ?? 0)}
          hint={`${summary?.pending ?? 0} pending proof`}
          icon={Wrench}
        />
      </div>

      <Card>
        <CardContent className="space-y-3 p-4 sm:p-5">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ScanLine className="h-4 w-4 text-primary" />
            Serial lookup
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={lookupSerial}
              onChange={(event) => setLookupSerial(event.target.value)}
              placeholder="Scan or type a serial to see coverage, owner, and invoice…"
              className="h-11 pl-9 font-mono"
            />
          </div>
          {debouncedLookup.length >= 3 ? (
            lookupLoading ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking serial…
              </p>
            ) : lookup?.registration ? (
              <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">
                    {lookup.registration.product_name || "Registered product"}{" "}
                    <Badge className="ml-2">
                      {statusLabel(lookup.registration.status)}
                    </Badge>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {lookup.registration.warranty_number} ·{" "}
                    {lookup.registration.display_customer_name ||
                      lookup.registration.customer_name ||
                      "Owner"}{" "}
                    · {remainingCopy(lookup.registration.days_remaining)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {lookup.eligibility.reasons[0]}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCard(lookup.registration)}
                  >
                    Warranty card
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => openClaim(lookup.registration)}
                  >
                    File claim
                  </Button>
                </div>
              </div>
            ) : lookup?.stock ? (
              <div className="flex flex-col gap-3 rounded-xl border border-dashed p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">
                    Serial found in stock · not registered
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {lookup.stock.product_name || "Product"} ·{" "}
                    {lookup.stock.status}
                    {lookup.invoice?.invoice_number
                      ? ` · ${lookup.invoice.invoice_number}`
                      : ""}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => openCreate(lookup.serial || lookupSerial)}
                >
                  Register this serial
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 rounded-xl border border-dashed p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  No stock or warranty matches this serial. You can still
                  register it manually.
                </p>
                <Button size="sm" onClick={() => openCreate(lookupSerial)}>
                  Register anyway
                </Button>
              </div>
            )
          ) : null}
        </CardContent>
      </Card>

      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search serial, owner, invoice..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={view !== "claims" ? "default" : "outline"}
            asChild
          >
            <Link href="/dashboard/warranty">Registrations</Link>
          </Button>
          <Button
            size="sm"
            variant={view === "claims" ? "default" : "outline"}
            asChild
          >
            <Link href="/dashboard/warranty?view=claims">Claims</Link>
          </Button>
          {filters.map((item) => (
            <Button
              key={item.key}
              size="sm"
              variant={filter === item.key ? "secondary" : "outline"}
              asChild
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </div>
      </div>

      {actionError ? (
        <p className="text-sm font-medium text-destructive">{actionError}</p>
      ) : null}

      {view === "claims" ? (
        <ClaimsTable
          claims={filteredClaims}
          isLoading={claimsLoading}
          search={search}
          onEdit={(claim) => {
            setEditingClaim(claim);
            setClaimRegistration(
              warranties.find((row) => row.id === claim.registration_ref) ||
                null
            );
            setClaimFormOpen(true);
          }}
          onStatus={setStatusClaim}
          onRemove={removeClaim}
        />
      ) : (
        <RegistrationsTable
          rows={filteredWarranties}
          isLoading={isLoading}
          error={error}
          search={search}
          filter={filter}
          onCreate={() => openCreate()}
          onEdit={(row) => {
            setEditing(row);
            setFormOpen(true);
          }}
          onCard={setCard}
          onClaim={openClaim}
          onRemove={removeWarranty}
        />
      )}

      <WarrantyFormSheet
        open={formOpen}
        warranty={editing}
        presetSerial={presetSerial}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
          setPresetSerial("");
        }}
        onSave={saveWarranty}
      />

      <ClaimFormSheet
        open={claimFormOpen}
        claim={editingClaim}
        registration={claimRegistration}
        onClose={() => {
          setClaimFormOpen(false);
          setEditingClaim(null);
          setClaimRegistration(null);
        }}
        onSave={saveClaim}
      />

      <ClaimStatusDialog
        open={Boolean(statusClaim)}
        claim={statusClaim}
        onClose={() => setStatusClaim(null)}
        onSave={saveClaimStatus}
      />

      <WarrantyCardDialog
        open={Boolean(card)}
        warranty={card}
        onClose={() => setCard(null)}
        onClaim={
          card
            ? () => {
                const row = card;
                setCard(null);
                openClaim(row);
              }
            : undefined
        }
      />

      <PoliciesDialog
        open={policiesOpen}
        onClose={() => setPoliciesOpen(false)}
      />
    </section>
  );
}

function RegistrationsTable({
  rows,
  isLoading,
  error,
  search,
  filter,
  onCreate,
  onEdit,
  onCard,
  onClaim,
  onRemove,
}: {
  rows: WarrantyRegistration[];
  isLoading: boolean;
  error: unknown;
  search: string;
  filter: string;
  onCreate: () => void;
  onEdit: (row: WarrantyRegistration) => void;
  onCard: (row: WarrantyRegistration) => void;
  onClaim: (row: WarrantyRegistration) => void;
  onRemove: (row: WarrantyRegistration) => void;
}) {
  return (
    <Card>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Loading warranties...
          </div>
        ) : error ? (
          <div className="flex h-64 flex-col items-start justify-center gap-2 p-6 text-left">
            <p className="text-sm font-medium text-destructive">
              Unable to load warranties.
            </p>
            <p className="max-w-xl text-xs text-muted-foreground">
              {error instanceof Error &&
              error.message?.trim() &&
              !/^something went wrong\.?$/i.test(error.message)
                ? error.message
                : "Check that /warranties is mounted on the API, the warranty tables exist, and the process was restarted."}
            </p>
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title={
              search || filter !== "all"
                ? "No warranties match your filters"
                : "No warranties yet"
            }
            description={
              search || filter !== "all"
                ? "Clear search or filters to see every registered serial."
                : "Scan a sold serial or pick an invoice to activate the first digital warranty card."
            }
            actionLabel={
              search || filter !== "all" ? undefined : "Register warranty"
            }
            onAction={search || filter !== "all" ? undefined : onCreate}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serial / product</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Coverage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <p className="font-mono text-sm">{row.serial_number}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.product_name || row.item_name || "—"}
                      {row.invoice_number ? ` · ${row.invoice_number}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {row.warranty_number}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">
                      {row.display_customer_name || row.customer_name || "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {row.display_phone || row.phone || "—"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">
                      {coverageLabel(row.coverage_type)} · {row.coverage_months}
                      m
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatShortDate(row.starts_at)} →{" "}
                      {formatShortDate(row.ends_at)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {remainingCopy(row.days_remaining)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <Badge
                        variant={
                          row.status === "active"
                            ? "default"
                            : row.status === "expired" || row.status === "voided"
                              ? "outline"
                              : "secondary"
                        }
                      >
                        {statusLabel(row.status)}
                      </Badge>
                      {row.open_claims > 0 ? (
                        <Badge variant="destructive">
                          {row.open_claims} open
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onCard(row)}>
                          <CreditCard className="h-4 w-4" />
                          Warranty card
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onClaim(row)}>
                          <Ticket className="h-4 w-4" />
                          File claim
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(row)}>
                          <Edit3 className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => onRemove(row)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function ClaimsTable({
  claims,
  isLoading,
  search,
  onEdit,
  onStatus,
  onRemove,
}: {
  claims: WarrantyClaim[];
  isLoading: boolean;
  search: string;
  onEdit: (claim: WarrantyClaim) => void;
  onStatus: (claim: WarrantyClaim) => void;
  onRemove: (claim: WarrantyClaim) => void;
}) {
  return (
    <Card>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Loading claims...
          </div>
        ) : claims.length === 0 ? (
          <EmptyState
            icon={Ticket}
            title={search ? "No claims match" : "No claims yet"}
            description="File a claim from a registered serial. The desk checks coverage before the ticket is created."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Claim</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell>
                    <p className="font-medium">{claim.claim_number}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {claim.serial_number}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {claim.display_customer_name || claim.customer_name}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="max-w-[280px] truncate text-sm">
                      {claim.issue_description || claim.issue_type}
                    </p>
                    <Badge variant="outline">{claim.priority}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {claim.assigned_to_name || "Unassigned"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        claim.status === "rejected" || claim.status === "closed"
                          ? "outline"
                          : isOpenClaim(claim.status)
                            ? "secondary"
                            : "default"
                      }
                    >
                      {claimStatusLabel(claim.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onStatus(claim)}>
                          <Wrench className="h-4 w-4" />
                          Move status
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(claim)}>
                          <Edit3 className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => onRemove(claim)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function KpiCard({
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
