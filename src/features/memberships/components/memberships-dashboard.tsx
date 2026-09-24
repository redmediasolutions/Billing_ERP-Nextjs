"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  CreditCard,
  Loader2,
  Plus,
  Search,
} from "lucide-react";

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
import { ApiError } from "@/lib/api";
import { matchesSearch } from "@/lib/erp-search";
import { useUrlParam, useUrlSearchParam } from "@/lib/use-url-search";

import { EnrollmentFormSheet } from "../addform/enrollment-form-sheet";
import { PlanFormSheet } from "../addform/plan-form-sheet";
import { MembershipRowActionsMenu } from "./membership-row-actions-menu";
import {
  useChangeMembershipStatus,
  useCreateMembershipEnrollment,
  useCreateMembershipPlan,
  useDeleteMembershipEnrollment,
  useMembershipCheckIn,
  useMembershipEnrollments,
  useMembershipInvoice,
  useMembershipPlans,
  useMembershipSummary,
  useScheduleMembershipRenewal,
  useUpdateMembershipEnrollment,
  useUpdateMembershipPlan,
} from "../hooks/use-memberships";
import {
  cycleLabel,
  formatShortDate,
  isExpiringSoon,
  statusBadgeClass,
  statusLabel,
} from "../lib/membership-utils";
import type {
  MembershipEnrollment,
  MembershipEnrollmentInput,
  MembershipPlan,
  MembershipPlanInput,
} from "../types";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

type FilterKey =
  | "all"
  | "active"
  | "expiring"
  | "expired"
  | "paused"
  | "pending";

type ViewKey = "members" | "plans";

export function MembershipsDashboard() {
  const router = useRouter();
  const { data: enrollments = [], isLoading, error } = useMembershipEnrollments();
  const { data: plans = [], isLoading: plansLoading } = useMembershipPlans();
  const { data: summary } = useMembershipSummary();
  const { value: search, setSearch } = useUrlSearchParam();
  const filter = (useUrlParam("filter") || "all") as FilterKey;
  const view = (useUrlParam("view") || "members") as ViewKey;

  const createPlan = useCreateMembershipPlan();
  const updatePlan = useUpdateMembershipPlan();
  const createEnrollment = useCreateMembershipEnrollment();
  const updateEnrollment = useUpdateMembershipEnrollment();
  const changeStatus = useChangeMembershipStatus();
  const checkIn = useMembershipCheckIn();
  const createInvoice = useMembershipInvoice();
  const scheduleRenewal = useScheduleMembershipRenewal();
  const deleteEnrollment = useDeleteMembershipEnrollment();

  const [planFormOpen, setPlanFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [enrollFormOpen, setEnrollFormOpen] = useState(false);
  const [editingEnrollment, setEditingEnrollment] =
    useState<MembershipEnrollment | null>(null);
  const [actionError, setActionError] = useState("");

  const filtered = useMemo(() => {
    return enrollments.filter((row) => {
      const matchesQuery = matchesSearch(search, [
        row.member_number,
        row.display_customer_name,
        row.customer_name,
        row.display_phone,
        row.phone,
        row.plan_name,
        row.notes,
      ]);
      if (!matchesQuery) return false;
      if (filter === "active") return row.status === "active";
      if (filter === "expiring") return isExpiringSoon(row);
      if (filter === "expired") return row.status === "expired";
      if (filter === "paused") return row.status === "paused";
      if (filter === "pending") return row.status === "pending";
      return true;
    });
  }, [enrollments, filter, search]);

  async function savePlan(input: MembershipPlanInput) {
    if (editingPlan?.id) {
      await updatePlan.mutateAsync({ id: editingPlan.id, input });
    } else {
      await createPlan.mutateAsync(input);
    }
    setPlanFormOpen(false);
    setEditingPlan(null);
  }

  async function saveEnrollment(input: MembershipEnrollmentInput) {
    if (editingEnrollment?.id) {
      await updateEnrollment.mutateAsync({ id: editingEnrollment.id, input });
    } else {
      await createEnrollment.mutateAsync(input);
    }
    setEnrollFormOpen(false);
    setEditingEnrollment(null);
  }

  async function billMember(row: MembershipEnrollment) {
    try {
      setActionError("");
      const result = await createInvoice.mutateAsync(row.id);
      router.push(`/dashboard/invoices/${result.invoice_id}`);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Could not create invoice."
      );
    }
  }

  const statCards = [
    {
      label: "Active members",
      value: summary?.active ?? 0,
      href: "/dashboard/memberships?filter=active",
    },
    {
      label: "Expiring soon",
      value: summary?.expiring_soon ?? 0,
      href: "/dashboard/memberships?filter=expiring",
    },
    {
      label: "Check-ins today",
      value: summary?.check_ins_today ?? 0,
      href: "/dashboard/memberships",
    },
    {
      label: "Est. MRR",
      value: money.format(summary?.estimated_mrr ?? 0),
      href: "/dashboard/memberships?view=plans",
    },
  ];

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Memberships</h1>
          <p className="text-sm text-muted-foreground">
            Plans, enrollments, check-ins — linked to customers, invoices, and
            renewals.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setEditingPlan(null);
              setPlanFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New plan
          </Button>
          <Button
            onClick={() => {
              setEditingEnrollment(null);
              setEnrollFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Enroll member
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="transition hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <p className="text-2xl font-bold">{card.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {actionError && (
        <p className="text-sm text-destructive">{actionError}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {[
          ["members", "Members"],
          ["plans", "Plans"],
        ].map(([key, label]) => (
          <Link
            key={key}
            href={`/dashboard/memberships?view=${key}`}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              view === key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {view === "plans" ? (
        plansLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : plans.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No plans yet"
            description="Create membership plans with pricing and visit rules."
            actionLabel="New plan"
            onAction={() => setPlanFormOpen(true)}
          />
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead>Cycle</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Visits</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>
                        <div className="font-medium">{plan.plan_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {plan.plan_code}
                          {plan.item_name ? ` · ${plan.item_name}` : ""}
                        </div>
                      </TableCell>
                      <TableCell>{cycleLabel(plan.billing_cycle)}</TableCell>
                      <TableCell>{money.format(plan.price)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {plan.visit_model === "unlimited"
                          ? "Unlimited"
                          : plan.visits_per_period ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingPlan(plan);
                            setPlanFormOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search members, phone, plan…"
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {[
                ["all", "All"],
                ["active", "Active"],
                ["expiring", "Expiring"],
                ["expired", "Expired"],
                ["paused", "Paused"],
              ].map(([key, label]) => (
                <Link
                  key={key}
                  href={`/dashboard/memberships?filter=${key}`}
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${
                    filter === key
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading memberships...
            </div>
          ) : error ? (
            <Card className="border-destructive/40">
              <CardContent className="p-6 text-sm">
                <p className="font-medium text-destructive">
                  Unable to load memberships.
                </p>
                <p className="mt-2 text-muted-foreground">
                  {error instanceof ApiError
                    ? error.message
                    : "Mount /memberships on the API and run the SQL migration."}
                </p>
              </CardContent>
            </Card>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={BadgeCheck}
              title="No members match"
              description="Enroll a customer on a plan to start tracking access and renewals."
              actionLabel="Enroll member"
              onAction={() => setEnrollFormOpen(true)}
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Valid until</TableHead>
                      <TableHead>Visits</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <div className="font-medium">
                            {row.display_customer_name || row.customer_name || "—"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {row.member_number}
                            {row.display_phone ? ` · ${row.display_phone}` : ""}
                          </div>
                          <Badge
                            variant="outline"
                            className={`mt-1 ${statusBadgeClass(row.status)}`}
                          >
                            {statusLabel(row.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>{row.plan_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {row.billing_cycle
                              ? cycleLabel(row.billing_cycle)
                              : ""}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>{formatShortDate(row.ends_at)}</div>
                          <div className="text-xs text-muted-foreground">
                            {row.days_remaining >= 0
                              ? `${row.days_remaining}d left`
                              : "Expired"}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {row.visits_limit == null
                            ? "Unlimited"
                            : `${row.visits_used}/${row.visits_limit}`}
                        </TableCell>
                        <TableCell className="text-right">
                          <MembershipRowActionsMenu
                            row={row}
                            onEdit={() => {
                              setEditingEnrollment(row);
                              setEnrollFormOpen(true);
                            }}
                            onCheckIn={() => checkIn.mutate({ id: row.id })}
                            onCreateInvoice={() => billMember(row)}
                            onScheduleRenewal={() =>
                              scheduleRenewal.mutate(row.id)
                            }
                            onPause={() =>
                              changeStatus.mutate({
                                id: row.id,
                                input: { status: "paused" },
                              })
                            }
                            onResume={() =>
                              changeStatus.mutate({
                                id: row.id,
                                input: { status: "active" },
                              })
                            }
                            onArchive={async () => {
                              if (
                                !window.confirm(
                                  `Remove membership ${row.member_number}?`
                                )
                              ) {
                                return;
                              }
                              await deleteEnrollment.mutateAsync(row.id);
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <PlanFormSheet
        open={planFormOpen}
        plan={editingPlan}
        onClose={() => {
          setPlanFormOpen(false);
          setEditingPlan(null);
        }}
        onSave={savePlan}
      />

      <EnrollmentFormSheet
        open={enrollFormOpen}
        enrollment={editingEnrollment}
        plans={plans}
        onClose={() => {
          setEnrollFormOpen(false);
          setEditingEnrollment(null);
        }}
        onSave={saveEnrollment}
      />
    </div>
  );
}
