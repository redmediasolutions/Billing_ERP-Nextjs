"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlarmClock,
  BellRing,
  CalendarClock,
  CheckCircle2,
  Edit3,
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
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
import { ApiError } from "@/lib/api";
import { useUrlParam, useUrlSearchParam } from "@/lib/use-url-search";

import { ReminderFormSheet } from "../addform/reminder-form-sheet";
import {
  ReminderCompleteDialog,
  ReminderSnoozeDialog,
} from "../addform/reminder-action-dialog";
import {
  useCompleteReminder,
  useCreateReminder,
  useDeleteReminder,
  useReminders,
  useReminderSummary,
  useSnoozeReminder,
  useSyncInvoiceReminders,
  useUpdateReminder,
} from "../hooks/use-reminders";
import {
  dueCopy,
  formatDateTime,
  isDueToday,
  isOverdue,
  isUpcoming,
  recurrenceLabel,
  statusLabel,
  typeBadgeClass,
  typeLabel,
} from "../lib/reminder-utils";
import type { Reminder, ReminderInput } from "../types";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

type FilterKey =
  | "all"
  | "today"
  | "overdue"
  | "upcoming"
  | "service"
  | "payment"
  | "renewal"
  | "completed";

export function RemindersDashboard() {
  const { data: reminders = [], isLoading, error } = useReminders();
  const { data: summary } = useReminderSummary();
  const { value: search, setSearch } = useUrlSearchParam();
  const filter = (useUrlParam("filter") || "all") as FilterKey;

  const createReminder = useCreateReminder();
  const updateReminder = useUpdateReminder();
  const deleteReminder = useDeleteReminder();
  const completeReminder = useCompleteReminder();
  const snoozeReminder = useSnoozeReminder();
  const syncInvoices = useSyncInvoiceReminders();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Reminder | null>(null);
  const [preset, setPreset] = useState<Partial<ReminderInput> | undefined>();
  const [completing, setCompleting] = useState<Reminder | null>(null);
  const [snoozing, setSnoozing] = useState<Reminder | null>(null);
  const [actionError, setActionError] = useState("");
  const [syncMessage, setSyncMessage] = useState("");

  const filtered = useMemo(() => {
    return reminders.filter((row) => {
      const matchesQuery = matchesSearch(search, [
        row.title,
        row.description,
        row.display_customer_name,
        row.customer_name,
        row.display_phone,
        row.phone,
        row.item_name,
        row.invoice_number,
        row.renewal_label,
        row.reminder_number,
      ]);

      if (!matchesQuery) return false;
      if (filter === "today") return isDueToday(row);
      if (filter === "overdue") return isOverdue(row);
      if (filter === "upcoming") return isUpcoming(row);
      if (filter === "service") return row.reminder_type === "service";
      if (filter === "payment") return row.reminder_type === "payment";
      if (filter === "renewal") return row.reminder_type === "renewal";
      if (filter === "completed") return row.status === "completed";
      if (row.status === "completed" || row.status === "cancelled") {
        return filter === "all";
      }
      return true;
    });
  }, [filter, reminders, search]);

  function openCreate(presetInput?: Partial<ReminderInput>) {
    setEditing(null);
    setPreset(presetInput);
    setActionError("");
    setFormOpen(true);
  }

  async function saveReminder(input: ReminderInput) {
    if (editing?.id) {
      await updateReminder.mutateAsync({ id: editing.id, input });
    } else {
      await createReminder.mutateAsync(input);
    }
    setFormOpen(false);
    setEditing(null);
    setPreset(undefined);
  }

  async function runSyncInvoices() {
    try {
      setActionError("");
      setSyncMessage("");
      const result = await syncInvoices.mutateAsync();
      setSyncMessage(
        `Synced invoices: ${result.created} new, ${result.updated} updated, ${result.skipped} unchanged.`
      );
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Invoice sync failed."
      );
    }
  }

  const statCards = [
    {
      label: "Due today",
      value: summary?.due_today ?? 0,
      icon: BellRing,
      href: "/dashboard/renewals?filter=today",
    },
    {
      label: "Overdue",
      value: summary?.overdue ?? 0,
      icon: AlarmClock,
      href: "/dashboard/renewals?filter=overdue",
      alert: (summary?.overdue ?? 0) > 0,
    },
    {
      label: "Next 7 days",
      value: summary?.upcoming_7d ?? 0,
      icon: CalendarClock,
      href: "/dashboard/renewals?filter=upcoming",
    },
    {
      label: "Service",
      value: summary?.service ?? 0,
      icon: Wrench,
      href: "/dashboard/renewals?filter=service",
    },
  ];

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Renewals</h1>
          <p className="text-sm text-muted-foreground">
            Service schedules, fee collection, renewals — linked to customers,
            invoices, and items.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={runSyncInvoices}
            disabled={syncInvoices.isPending}
          >
            {syncInvoices.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Sync overdue invoices
          </Button>
          <Button onClick={() => openCreate()}>
            <Plus className="mr-2 h-4 w-4" />
            New renewal
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.href}>
              <Card
                className={`transition hover:-translate-y-0.5 hover:shadow-md ${
                  card.alert ? "border-amber-300 dark:border-amber-800" : ""
                }`}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                    <p className="text-2xl font-bold">{card.value}</p>
                  </div>
                  <div
                    className={`rounded-xl p-2 ${
                      card.alert
                        ? "bg-amber-500/10 text-amber-600"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {(actionError || syncMessage) && (
        <p
          className={`text-sm ${
            actionError ? "text-destructive" : "text-muted-foreground"
          }`}
        >
          {actionError || syncMessage}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search renewals, customers, invoices…"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            ["all", "All"],
            ["today", "Today"],
            ["overdue", "Overdue"],
            ["upcoming", "Upcoming"],
            ["service", "Service"],
            ["payment", "Payment"],
            ["renewal", "Renewal"],
          ].map(([key, label]) => (
            <Link
              key={key}
              href={`/dashboard/renewals?filter=${key}`}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                filter === key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading renewals...
        </div>
      ) : error ? (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-6 text-sm">
            <p className="font-medium text-destructive">Unable to load renewals.</p>
            <p className="mt-2 text-muted-foreground">
              {error instanceof ApiError
                ? error.message
                : error instanceof Error
                  ? error.message
                  : "Check that /reminders is mounted on the API, returns { success, data }, and tenant auth matches enquiries."}
            </p>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BellRing}
          title={
            search || filter !== "all"
              ? "No renewals match your filters"
              : "No renewals yet"
          }
          description="Create a service schedule after installation, sync overdue invoices, or set a domain renewal."
          actionLabel="New renewal"
          onAction={() => openCreate()}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Renewal</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Repeat</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="max-w-[240px]">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{row.title}</span>
                          <Badge
                            variant="outline"
                            className={typeBadgeClass(row.reminder_type)}
                          >
                            {typeLabel(row.reminder_type)}
                          </Badge>
                          <Badge
                            variant={
                              row.status === "overdue" ? "destructive" : "secondary"
                            }
                          >
                            {statusLabel(row.status)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {row.reminder_number}
                          {row.item_name ? ` · ${row.item_name}` : ""}
                          {row.renewal_label ? ` · ${row.renewal_label}` : ""}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {row.invoice_ref && (
                            <Link
                              href={`/dashboard/invoices/${row.invoice_ref}`}
                              className="text-primary hover:underline"
                            >
                              {row.invoice_number || "Invoice"}
                            </Link>
                          )}
                          {row.amount_due != null && row.amount_due > 0 && (
                            <span>{money.format(row.amount_due)}</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {row.display_customer_name ||
                          row.customer_name ||
                          "—"}
                      </div>
                      {row.display_phone && (
                        <div className="text-xs text-muted-foreground">
                          {row.display_phone}
                        </div>
                      )}
                      {row.assigned_to_name && (
                        <div className="text-xs text-muted-foreground">
                          → {row.assigned_to_name}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDateTime(row.due_at)}</div>
                      <div
                        className={`text-xs ${
                          isOverdue(row)
                            ? "text-destructive"
                            : "text-muted-foreground"
                        }`}
                      >
                        {dueCopy(row)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {recurrenceLabel(row.recurrence, row.recurrence_days)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditing(row);
                              setPreset(undefined);
                              setFormOpen(true);
                            }}
                          >
                            <Edit3 className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {row.status !== "completed" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => setCompleting(row)}
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Mark done
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setSnoozing(row)}
                              >
                                <AlarmClock className="mr-2 h-4 w-4" />
                                Snooze
                              </DropdownMenuItem>
                            </>
                          )}
                          {row.reminder_type === "payment" && !row.invoice_ref && (
                            <DropdownMenuItem
                              onClick={() =>
                                openCreate({
                                  reminder_type: "payment",
                                  title: row.title,
                                })
                              }
                            >
                              Link invoice
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={async () => {
                              if (
                                !window.confirm(
                                  `Delete renewal "${row.title}"?`
                                )
                              ) {
                                return;
                              }
                              await deleteReminder.mutateAsync(row.id);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <ReminderFormSheet
        open={formOpen}
        reminder={editing}
        preset={preset}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
          setPreset(undefined);
        }}
        onSave={saveReminder}
      />

      <ReminderCompleteDialog
        reminder={completing}
        open={Boolean(completing)}
        onClose={() => setCompleting(null)}
        onSave={async (note) => {
          if (!completing) return;
          await completeReminder.mutateAsync({
            id: completing.id,
            input: { note },
          });
          setCompleting(null);
        }}
      />

      <ReminderSnoozeDialog
        reminder={snoozing}
        open={Boolean(snoozing)}
        onClose={() => setSnoozing(null)}
        onSave={async (input) => {
          if (!snoozing) return;
          await snoozeReminder.mutateAsync({ id: snoozing.id, input });
          setSnoozing(null);
        }}
      />
    </div>
  );
}
