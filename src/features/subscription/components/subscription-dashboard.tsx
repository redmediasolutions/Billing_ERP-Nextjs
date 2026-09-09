"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  Check,
  CreditCard,
  Landmark,
  Loader2,
  ShieldCheck,
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
import { platformBilling } from "@/lib/platform-billing";

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

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function SubscriptionDashboard() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <SubscriptionLoading />;
  }

  return <SubscriptionDashboardLoaded />;
}

function SubscriptionLoading() {
  return (
    <section className="w-full space-y-6 text-left">
      <Header />
      <div className="flex h-48 items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading licence...
      </div>
    </section>
  );
}

function SubscriptionDashboardLoaded() {
  const { data: tenant } = useTenant();
  const { data: subscription, isLoading, error } = useSubscription();
  const { entitlement } = useSubscriptionEntitlement();
  const invoicesQuery = useSubscriptionInvoices();
  const [renewOpen, setRenewOpen] = useState(false);

  const invoices = invoicesQuery.data ?? [];
  const renewalFee =
    subscription?.amount != null ? money.format(subscription.amount) : "—";

  const countdownLabel = useMemo(() => {
    if (entitlement.status === "locked") return "Software locked";
    if (entitlement.status === "grace") {
      const days = Math.max(entitlement.daysUntilLock ?? 0, 0);
      return days === 0
        ? "Locks today"
        : `${days} day${days === 1 ? "" : "s"} until lock`;
    }
    if (entitlement.daysRemaining == null) return "No expiry on file";
    if (entitlement.daysRemaining < 0) return "Expired";
    if (entitlement.daysRemaining === 0) return "Expires today";
    return `${entitlement.daysRemaining} day${entitlement.daysRemaining === 1 ? "" : "s"} left`;
  }, [entitlement]);

  const urgent =
    entitlement.status === "due_soon" ||
    entitlement.status === "grace" ||
    entitlement.status === "locked";

  return (
    <section className="w-full space-y-6 text-left">
      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
        <Header businessName={tenant?.business_name} />

        <Button onClick={() => setRenewOpen(true)} className="gap-2">
          <CreditCard className="h-4 w-4" />
          Pay / renew
        </Button>
      </div>

      {urgent ? (
        <Card className="border-amber-500/40 bg-amber-500/10">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" />
            <div className="text-sm">
              <p className="font-semibold">
                {entitlement.status === "locked"
                  ? "Your ERP licence has expired"
                  : "Renewal required soon"}
              </p>
              <p className="mt-1 text-muted-foreground">
                {entitlement.status === "locked"
                  ? `Pay ${platformBilling.providerName} to unlock ${tenant?.business_name || "your workspace"}.`
                  : `Licence ends ${formatDateOnly(entitlement.expiresOn)}. After ${GRACE_DAYS} days grace the software locks.`}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {isLoading ? (
        <div className="flex h-48 items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading licence...
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-destructive">
              Unable to load licence details.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {error instanceof Error ? error.message : "Try again later."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi
              title="Your package"
              value={subscription?.plan_name ?? "Not assigned"}
              hint={
                subscription?.billing_cycle
                  ? `${subscription.billing_cycle} billing`
                  : "Assigned by " + platformBilling.providerName
              }
              icon={ShieldCheck}
            />
            <Kpi
              title="Status"
              value={statusLabel(entitlement.status)}
              hint={`${GRACE_DAYS}-day grace after expiry`}
              icon={ShieldCheck}
            />
            <Kpi
              title="Countdown"
              value={countdownLabel}
              hint={`Valid until ${formatDateOnly(entitlement.expiresOn)}`}
              icon={CalendarClock}
            />
            <Kpi
              title="Your renewal fee"
              value={renewalFee}
              hint="Custom price for your company"
              icon={CreditCard}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between gap-3 text-base">
                  <span>Licence details</span>
                  <Badge variant={statusBadgeVariant(entitlement.status)}>
                    {statusLabel(entitlement.status)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <dl className="grid gap-3 sm:grid-cols-2">
                  <Info label="Package" value={subscription?.plan_name ?? "—"} />
                  <Info
                    label="Billing cycle"
                    value={
                      subscription?.billing_cycle === "yearly"
                        ? "Yearly"
                        : subscription?.billing_cycle === "monthly"
                          ? "Monthly"
                          : "—"
                    }
                  />
                  <Info
                    label="Valid until"
                    value={formatDateOnly(entitlement.expiresOn)}
                  />
                  <Info
                    label="Grace ends"
                    value={formatDateOnly(entitlement.graceEndsOn)}
                  />
                  <Info label="Renewal fee" value={renewalFee} />
                  <Info
                    label="Provider"
                    value={platformBilling.providerName}
                  />
                </dl>

                {entitlement.plan?.features?.length ? (
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
                    {platformBilling.providerName} has not assigned a package
                    yet. Contact {platformBilling.email}.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Landmark className="h-4 w-4" />
                  Pay {platformBilling.providerName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  Transfer the renewal fee above, then tap Pay / renew and send
                  your payment reference.
                </p>
                <p>
                  <span className="text-muted-foreground">UPI · </span>
                  {platformBilling.upi}
                </p>
                <p>
                  <span className="text-muted-foreground">Bank · </span>
                  {platformBilling.bank}
                </p>
                <p>
                  <span className="text-muted-foreground">Email · </span>
                  {platformBilling.email}
                </p>
                <p>
                  <span className="text-muted-foreground">Phone · </span>
                  {platformBilling.phone}
                </p>
                <Button className="w-full" onClick={() => setRenewOpen(true)}>
                  I have paid — notify billing
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Licence invoices</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {invoicesQuery.isLoading ? (
                <div className="flex h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : invoices.length === 0 ? (
                <EmptyState
                  icon={CreditCard}
                  title="No licence invoices yet"
                  description={`Past renewals from ${platformBilling.providerName} will appear here.`}
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

      <RenewRequestSheet
        open={renewOpen}
        onOpenChange={setRenewOpen}
        current={subscription}
      />
    </section>
  );
}

function Header({ businessName }: { businessName?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Billing
      </p>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Software licence
      </h1>
      <p className="max-w-2xl text-sm text-muted-foreground">
        {businessName || "Your company"} uses Billing ERP under a licence from{" "}
        {platformBilling.providerName}. Renewal reminders and lock are based on
        the expiry date we set for you.
      </p>
    </div>
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
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{title}</p>
          <h2 className="mt-2 truncate text-2xl font-bold tracking-tight">
            {value}
          </h2>
          <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>
        </div>
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}
