"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  Check,
  CreditCard,
  Landmark,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTenant } from "@/features/tenant/hooks/use-tenant";
import { company } from "@/lib/company";

import { PlanAssignSheet } from "../addform/plan-assign-sheet";
import { RenewRequestSheet } from "../addform/renew-request-sheet";
import {
  useSubscription,
  useSubscriptionEntitlement,
  useSubscriptionInvoices,
} from "../hooks/use-subscription";
import {
  GRACE_DAYS,
  formatDateOnly,
  statusBadgeVariant,
  statusLabel,
} from "../lib/entitlement";
import { SUBSCRIPTION_PLANS, planPrice } from "../lib/plans";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function SubscriptionDashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <section className="w-full space-y-6 text-left">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Billing
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Subscription
          </h1>
        </div>
        <div className="flex h-48 items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading subscription...
        </div>
      </section>
    );
  }

  return <SubscriptionDashboardLoaded />;
}

function SubscriptionDashboardLoaded() {
  const { data: tenant } = useTenant();
  const { data: subscription, isLoading, error } = useSubscription();
  const { entitlement } = useSubscriptionEntitlement();
  const invoicesQuery = useSubscriptionInvoices();

  const [assignOpen, setAssignOpen] = useState(false);
  const [renewOpen, setRenewOpen] = useState(false);

  const optedCode = String(entitlement.planCode || "").toLowerCase();
  const invoices = invoicesQuery.data ?? [];

  const countdownLabel = useMemo(() => {
    if (entitlement.status === "locked") return "Workspace locked";
    if (entitlement.status === "grace") {
      const days = Math.max(entitlement.daysUntilLock ?? 0, 0);
      return days === 0
        ? "Locks today"
        : `${days} day${days === 1 ? "" : "s"} until lock`;
    }
    if (entitlement.daysRemaining == null) return "No expiry set";
    if (entitlement.daysRemaining < 0) return "Expired";
    if (entitlement.daysRemaining === 0) return "Expires today";
    return `${entitlement.daysRemaining} day${entitlement.daysRemaining === 1 ? "" : "s"} remaining`;
  }, [entitlement]);

  const kpis = [
    {
      title: "Licensed package",
      value: entitlement.plan?.name ?? subscription?.plan_name ?? "Not assigned",
      hint: entitlement.billingCycle
        ? `${entitlement.billingCycle} billing`
        : "Set the opted package on this company",
      icon: Sparkles,
    },
    {
      title: "Licence status",
      value: statusLabel(entitlement.status),
      hint:
        entitlement.status === "unconfigured"
          ? "Grandfathered until an expiry is saved"
          : `${GRACE_DAYS}-day grace after expiry`,
      icon: ShieldCheck,
    },
    {
      title: "Countdown",
      value: countdownLabel,
      hint: `Renews ${formatDateOnly(entitlement.expiresOn)}`,
      icon: CalendarClock,
    },
    {
      title: "Licensed amount",
      value:
        subscription?.amount != null
          ? money.format(subscription.amount)
          : "—",
      hint: subscription?.source === "api" ? "From billing API" : "Confirm on save",
      icon: CreditCard,
    },
  ];

  return (
    <section className="w-full space-y-6 text-left">
      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Billing
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Subscription
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Company licence for {tenant?.business_name || "this workspace"}.
            The opted package lives on the tenant record — reminders, grace,
            and lock follow the expiry date.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAssignOpen(true)}>
            Set licensed plan
          </Button>
          <Button onClick={() => setRenewOpen(true)}>Pay / renew</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading subscription...
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-destructive">
              Unable to load subscription.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {error instanceof Error ? error.message : "Check /tenant and /subscription."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title}>
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">{item.title}</p>
                      <h2 className="mt-2 truncate text-2xl font-bold tracking-tight">
                        {item.value}
                      </h2>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {item.hint}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between gap-3 text-base">
                  <span>Current licence</span>
                  <Badge variant={statusBadgeVariant(entitlement.status)}>
                    {statusLabel(entitlement.status)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <dl className="grid gap-3 sm:grid-cols-2">
                  <InfoRow
                    label="Opted package"
                    value={
                      entitlement.plan?.name ??
                      subscription?.plan_name ??
                      "Not assigned"
                    }
                  />
                  <InfoRow
                    label="Billing cycle"
                    value={
                      entitlement.billingCycle
                        ? entitlement.billingCycle === "yearly"
                          ? "Yearly"
                          : "Monthly"
                        : "—"
                    }
                  />
                  <InfoRow
                    label="Valid until"
                    value={formatDateOnly(entitlement.expiresOn)}
                  />
                  <InfoRow
                    label="Grace ends"
                    value={formatDateOnly(entitlement.graceEndsOn)}
                  />
                </dl>
                {entitlement.plan ? (
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {entitlement.plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No package is licensed yet. Use Set licensed plan after
                    the tenant opts for Starter, Professional, Business, or
                    Enterprise.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Landmark className="h-4 w-4" />
                  How to pay
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  Offline settlement, same as a typical ERP licence — UPI or
                  bank transfer, then accounts extends the expiry.
                </p>
                {tenant?.business_upi ? (
                  <p>
                    <span className="text-muted-foreground">UPI · </span>
                    {tenant.business_upi}
                  </p>
                ) : null}
                {tenant?.business_bank ? (
                  <p>
                    <span className="text-muted-foreground">Bank · </span>
                    {tenant.business_bank}
                  </p>
                ) : null}
                <p>
                  <span className="text-muted-foreground">Billing · </span>
                  {company.email}
                </p>
                <p>
                  <span className="text-muted-foreground">Phone · </span>
                  {company.phone}
                </p>
                <Button className="w-full" onClick={() => setRenewOpen(true)}>
                  Send payment notice
                </Button>
              </CardContent>
            </Card>
          </div>

          <div id="packages">
            <div className="mb-3">
              <h2 className="text-lg font-semibold tracking-tight">Packages</h2>
              <p className="text-sm text-muted-foreground">
                Highlighted card is the package this company has opted for.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {SUBSCRIPTION_PLANS.map((plan) => {
                const selected = optedCode === plan.code;
                const yearly = planPrice(plan, "yearly");
                const monthly = planPrice(plan, "monthly");
                return (
                  <Card
                    key={plan.code}
                    className={
                      selected
                        ? "ring-2 ring-primary"
                        : undefined
                    }
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle>{plan.name}</CardTitle>
                        {selected ? (
                          <Badge>Opted</Badge>
                        ) : plan.recommended ? (
                          <Badge variant="secondary">Popular</Badge>
                        ) : null}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {plan.tagline}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-2xl font-bold tracking-tight">
                        {plan.custom
                          ? "Custom"
                          : yearly != null
                            ? money.format(yearly)
                            : "—"}
                        {!plan.custom ? (
                          <span className="ml-1 text-xs font-normal text-muted-foreground">
                            / year
                          </span>
                        ) : null}
                      </p>
                      {monthly != null ? (
                        <p className="text-xs text-muted-foreground">
                          or {money.format(monthly)} monthly
                        </p>
                      ) : null}
                      <ul className="space-y-1.5">
                        {plan.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-start gap-2 text-xs text-muted-foreground"
                          >
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Licence invoices</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {invoicesQuery.isLoading ? (
                <div className="flex h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading invoices...
                </div>
              ) : invoices.length === 0 ? (
                <EmptyState
                  icon={CreditCard}
                  title="No licence invoices yet"
                  description="When GET /subscription/invoices is available, paid and pending licence bills will list here. Until then, keep the opted package and expiry on the tenant."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Billed</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.invoice_number}
                        </TableCell>
                        <TableCell>{formatDateOnly(invoice.billed_on)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDateOnly(invoice.period_start)} –{" "}
                          {formatDateOnly(invoice.period_end)}
                        </TableCell>
                        <TableCell>{money.format(invoice.amount)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              invoice.status === "paid"
                                ? "default"
                                : invoice.status === "overdue"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {invoice.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <PlanAssignSheet
        open={assignOpen}
        onOpenChange={setAssignOpen}
        current={subscription}
      />
      <RenewRequestSheet
        open={renewOpen}
        onOpenChange={setRenewOpen}
        current={subscription}
      />
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}
