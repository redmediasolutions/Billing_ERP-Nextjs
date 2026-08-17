"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlarmClock,
  Edit3,
  Inbox,
  Loader2,
  MessageSquarePlus,
  MoreHorizontal,
  Phone,
  Plus,
  Radio,
  Search,
  Target,
  Trash2,
  Trophy,
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

import { EnquiryChannelsDialog } from "../addform/enquiry-channels-dialog";
import { EnquiryFormSheet } from "../addform/enquiry-form-sheet";
import { EnquiryUpdateDialog } from "../addform/enquiry-update-dialog";
import {
  useAddEnquiryUpdate,
  useCreateEnquiry,
  useDeleteEnquiry,
  useEnquiries,
  useEnquirySummary,
  useUpdateEnquiry,
} from "../hooks/use-enquiries";
import type {
  Enquiry,
  EnquiryInput,
  EnquiryStatus,
  EnquiryUpdateInput,
} from "../types";
import { ENQUIRY_STATUSES } from "../types";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

type FilterKey =
  | "all"
  | "today"
  | "overdue"
  | "new"
  | "open"
  | "won"
  | "lost";

function statusLabel(status: string) {
  return (
    ENQUIRY_STATUSES.find((item) => item.value === status)?.label || status
  );
}

function isOverdue(enquiry: Enquiry) {
  if (!enquiry.follow_up_at) return false;
  if (enquiry.status === "won" || enquiry.status === "lost") return false;
  return new Date(enquiry.follow_up_at).getTime() < Date.now();
}

function isDueToday(enquiry: Enquiry) {
  if (!enquiry.follow_up_at) return false;
  if (enquiry.status === "won" || enquiry.status === "lost") return false;
  const due = new Date(enquiry.follow_up_at);
  const now = new Date();
  return (
    due.getFullYear() === now.getFullYear() &&
    due.getMonth() === now.getMonth() &&
    due.getDate() === now.getDate()
  );
}

function priorityClass(priority: string) {
  if (priority === "high") {
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-400";
  }
  if (priority === "low") return "";
  return "";
}

export function EnquiriesDashboard() {
  const { data: enquiries = [], isLoading, error } = useEnquiries();
  const { data: summary } = useEnquirySummary();
  const { value: search, setSearch } = useUrlSearchParam();
  const filter = (useUrlParam("filter") || "all") as FilterKey;

  const createEnquiry = useCreateEnquiry();
  const updateEnquiry = useUpdateEnquiry();
  const addUpdate = useAddEnquiryUpdate();
  const deleteEnquiry = useDeleteEnquiry();

  const [formOpen, setFormOpen] = useState(false);
  const [channelsOpen, setChannelsOpen] = useState(false);
  const [editing, setEditing] = useState<Enquiry | null>(null);
  const [updating, setUpdating] = useState<Enquiry | null>(null);
  const [actionError, setActionError] = useState("");

  const filtered = useMemo(() => {
    return enquiries.filter((enquiry) => {
      const matchesQuery = matchesSearch(search, [
        enquiry.display_customer_name,
        enquiry.customer_name,
        enquiry.display_phone,
        enquiry.phone,
        enquiry.enquiry_data,
        enquiry.channel,
        enquiry.channel_name,
        enquiry.source_detail,
        enquiry.assigned_to_name,
      ]);

      if (!matchesQuery) return false;
      if (filter === "today") return isDueToday(enquiry);
      if (filter === "overdue") return isOverdue(enquiry);
      if (filter === "new") return enquiry.status === "new";
      if (filter === "open") {
        return ["contacted", "qualified", "proposal"].includes(enquiry.status);
      }
      if (filter === "won") return enquiry.status === "won";
      if (filter === "lost") return enquiry.status === "lost";
      return true;
    });
  }, [enquiries, filter, search]);

  function openCreate() {
    setEditing(null);
    setActionError("");
    setFormOpen(true);
  }

  function openEdit(enquiry: Enquiry) {
    setEditing(enquiry);
    setActionError("");
    setFormOpen(true);
  }

  async function saveEnquiry(input: EnquiryInput) {
    if (editing?.id) {
      await updateEnquiry.mutateAsync({ id: editing.id, input });
    } else {
      await createEnquiry.mutateAsync(input);
    }
    setFormOpen(false);
    setEditing(null);
  }

  async function saveQuickUpdate(input: EnquiryUpdateInput) {
    if (!updating) return;
    await addUpdate.mutateAsync({ id: updating.id, input });
    setUpdating(null);
  }

  async function markStatus(enquiry: Enquiry, status: EnquiryStatus) {
    try {
      setActionError("");
      await addUpdate.mutateAsync({
        id: enquiry.id,
        input: {
          status,
          note: `Marked as ${statusLabel(status)}`,
          follow_up_at: enquiry.follow_up_at || undefined,
        },
      });
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Unable to update status."
      );
    }
  }

  async function removeEnquiry(enquiry: Enquiry) {
    const name =
      enquiry.display_customer_name || enquiry.customer_name || "this enquiry";
    const confirmed = window.confirm(`Archive enquiry for "${name}"?`);
    if (!confirmed) return;

    try {
      setActionError("");
      await deleteEnquiry.mutateAsync(enquiry.id);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Unable to archive enquiry."
      );
    }
  }

  const filters: Array<{ key: FilterKey; label: string; href: string }> = [
    { key: "all", label: "All", href: "/dashboard/enquiries" },
    { key: "today", label: "Due today", href: "/dashboard/enquiries?filter=today" },
    {
      key: "overdue",
      label: "Overdue",
      href: "/dashboard/enquiries?filter=overdue",
    },
    { key: "new", label: "New", href: "/dashboard/enquiries?filter=new" },
    { key: "open", label: "In pipeline", href: "/dashboard/enquiries?filter=open" },
    { key: "won", label: "Won", href: "/dashboard/enquiries?filter=won" },
    { key: "lost", label: "Lost", href: "/dashboard/enquiries?filter=lost" },
  ];

  return (
    <section className="w-full space-y-6 text-left">
      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Lead management
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Enquiries
          </h1>
          <p className="text-sm text-muted-foreground">
            Capture leads, schedule follow-ups, and keep the whole company on
            the same pipeline — per tenant.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setChannelsOpen(true)}
          >
            <Radio className="h-4 w-4" />
            Channels
          </Button>
          <Button className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New enquiry
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Due today"
          value={String(summary?.due_today ?? 0)}
          hint={`${summary?.overdue_followups ?? 0} overdue`}
          icon={AlarmClock}
        />
        <KpiCard
          title="New leads"
          value={String(summary?.status_new ?? 0)}
          hint={`${summary?.this_month ?? 0} this month`}
          icon={Inbox}
        />
        <KpiCard
          title="Open pipeline"
          value={String(summary?.open_pipeline ?? 0)}
          hint={money.format(summary?.pipeline_value ?? 0)}
          icon={Target}
        />
        <KpiCard
          title="Won"
          value={String(summary?.won ?? 0)}
          hint={`${summary?.lost ?? 0} lost`}
          icon={Trophy}
        />
      </div>

      {summary?.by_channel?.length ? (
        <div className="flex flex-wrap gap-2">
          {summary.by_channel.map((row) => (
            <Badge key={row.channel} variant="secondary">
              {row.channel}: {row.total}
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, phone, enquiry..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <Button
              key={item.key}
              size="sm"
              variant={filter === item.key ? "default" : "outline"}
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

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Loading enquiries...
            </div>
          ) : error ? (
            <div className="flex h-64 flex-col items-start justify-center gap-2 p-6 text-left">
              <p className="text-sm font-medium text-destructive">
                Unable to load enquiries.
              </p>
              <p className="max-w-xl text-xs text-muted-foreground">
                {(() => {
                  const apiMessage =
                    error instanceof Error ? error.message.trim() : "";
                  const isGeneric =
                    !apiMessage ||
                    /^unable to load enquiries\.?$/i.test(apiMessage) ||
                    /^something went wrong\.?$/i.test(apiMessage);

                  if (!isGeneric) return apiMessage;

                  return "Check that /enquiries is mounted on the server, the enquiry tables exist in MySQL, and pm2 was restarted.";
                })()}
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Phone}
              title={
                search || filter !== "all"
                  ? "No enquiries match your filters"
                  : "No enquiries yet"
              }
              description={
                search || filter !== "all"
                  ? "Clear search or filters to see all leads."
                  : "Log the first call or WhatsApp lead — channels seed themselves."
              }
              actionLabel={
                search || filter !== "all" ? undefined : "Add First Enquiry"
              }
              onAction={
                search || filter !== "all" ? undefined : openCreate
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Enquiry</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Follow-up</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((enquiry) => {
                  const overdue = isOverdue(enquiry);
                  const dueToday = isDueToday(enquiry);

                  return (
                    <TableRow key={enquiry.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">
                            {enquiry.display_customer_name ||
                              enquiry.customer_name ||
                              "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {enquiry.display_phone || enquiry.phone || "—"}
                            {enquiry.assigned_to_name
                              ? ` · ${enquiry.assigned_to_name}`
                              : ""}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <Badge
                              variant="outline"
                              className={priorityClass(enquiry.priority)}
                            >
                              {enquiry.priority}
                            </Badge>
                            {enquiry.estimated_value ? (
                              <Badge variant="secondary">
                                {money.format(enquiry.estimated_value)}
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p
                          className="max-w-[280px] truncate text-sm"
                          title={enquiry.enquiry_data || undefined}
                        >
                          {enquiry.enquiry_data || "—"}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {enquiry.channel_name || enquiry.channel || "—"}
                      </TableCell>
                      <TableCell>
                        {enquiry.follow_up_at ? (
                          <div className="space-y-1">
                            <p className="text-sm">
                              {new Date(enquiry.follow_up_at).toLocaleString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                            {overdue ? (
                              <Badge variant="destructive">Overdue</Badge>
                            ) : dueToday ? (
                              <Badge variant="outline">Today</Badge>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            enquiry.status === "won"
                              ? "default"
                              : enquiry.status === "lost"
                                ? "outline"
                                : "secondary"
                          }
                        >
                          {statusLabel(enquiry.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setUpdating(enquiry)}
                            >
                              <MessageSquarePlus className="h-4 w-4" />
                              Quick update
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEdit(enquiry)}>
                              <Edit3 className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            {enquiry.status !== "won" ? (
                              <DropdownMenuItem
                                onClick={() => markStatus(enquiry, "won")}
                              >
                                <Trophy className="h-4 w-4" />
                                Mark won
                              </DropdownMenuItem>
                            ) : null}
                            {enquiry.status !== "lost" ? (
                              <DropdownMenuItem
                                onClick={() => markStatus(enquiry, "lost")}
                              >
                                Mark lost
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => removeEnquiry(enquiry)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Archive
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <EnquiryFormSheet
        open={formOpen}
        enquiry={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={saveEnquiry}
      />

      <EnquiryUpdateDialog
        open={Boolean(updating)}
        enquiry={updating}
        onClose={() => setUpdating(null)}
        onSave={saveQuickUpdate}
      />

      <EnquiryChannelsDialog
        open={channelsOpen}
        onClose={() => setChannelsOpen(false)}
      />
    </section>
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
