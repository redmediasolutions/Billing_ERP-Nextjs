"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CalendarCheck,
  CircleDot,
  Edit3,
  Loader2,
  MoreHorizontal,
  Plus,
  ReceiptText,
  Search,
  Trash2,
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
import { ApiError } from "@/lib/api";
import { matchesSearch } from "@/lib/erp-search";
import { useUrlParam, useUrlSearchParam } from "@/lib/use-url-search";

import { BookingFormSheet } from "../addform/booking-form-sheet";
import { BookingStatusDialog } from "../addform/booking-status-dialog";
import { ResourceTypesDialog } from "../addform/resource-types-dialog";
import {
  useBookings,
  useBookingSummary,
  useChangeBookingStatus,
  useConvertBookingToInvoice,
  useCreateBooking,
  useDeleteBooking,
  useUpdateBooking,
} from "../hooks/use-bookings";
import {
  bookingMoney,
  formatWhen,
  isSameDay,
  kindLabel,
  statusLabel,
} from "../lib/booking-utils";
import type {
  Booking,
  BookingInput,
  BookingKind,
  BookingStatus,
  BookingStatusInput,
} from "../types";

type FilterKey =
  | "all"
  | "today"
  | "upcoming"
  | "in_progress"
  | "unbilled"
  | "appointment"
  | "stay"
  | "event";

function statusVariant(status: BookingStatus) {
  if (status === "confirmed" || status === "completed") return "default" as const;
  if (status === "cancelled" || status === "no_show") return "outline" as const;
  if (status === "in_progress") return "secondary" as const;
  return "secondary" as const;
}

export function BookingsDashboard() {
  const router = useRouter();
  const { data: bookings = [], isLoading, error } = useBookings();
  const { data: summary } = useBookingSummary();
  const { value: search, setSearch } = useUrlSearchParam();
  const filter = (useUrlParam("filter") || "all") as FilterKey;
  const view = useUrlParam("view") || "list";

  const createBooking = useCreateBooking();
  const updateBooking = useUpdateBooking();
  const changeStatus = useChangeBookingStatus();
  const convertToInvoice = useConvertBookingToInvoice();
  const deleteBooking = useDeleteBooking();

  const [formOpen, setFormOpen] = useState(false);
  const [typesOpen, setTypesOpen] = useState(false);
  const [editing, setEditing] = useState<Booking | null>(null);
  const [statusTarget, setStatusTarget] = useState<Booking | null>(null);
  const [defaultKind, setDefaultKind] = useState<BookingKind>("appointment");
  const [actionError, setActionError] = useState("");

  const filtered = useMemo(() => {
    const now = Date.now();
    return bookings.filter((booking) => {
      const matchesQuery = matchesSearch(search, [
        booking.booking_number,
        booking.display_customer_name,
        booking.customer_name,
        booking.display_phone,
        booking.phone,
        booking.notes,
        booking.employee_name,
      ]);
      if (!matchesQuery) return false;
      if (filter === "today") return isSameDay(booking.starts_at);
      if (filter === "upcoming") {
        return (
          new Date(booking.starts_at).getTime() > now &&
          ["held", "confirmed"].includes(booking.status)
        );
      }
      if (filter === "in_progress") return booking.status === "in_progress";
      if (filter === "unbilled") {
        return !booking.invoice_ref && booking.status !== "cancelled";
      }
      if (filter === "appointment" || filter === "stay" || filter === "event") {
        return booking.booking_kind === filter;
      }
      return true;
    });
  }, [bookings, filter, search]);

  const calendarDays = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      const items = filtered.filter((booking) => isSameDay(booking.starts_at, day));
      return { day, items };
    });
  }, [filtered]);

  function openCreate(kind: BookingKind = "appointment") {
    setDefaultKind(kind);
    setEditing(null);
    setActionError("");
    setFormOpen(true);
  }

  function openEdit(booking: Booking) {
    setDefaultKind(booking.booking_kind);
    setEditing(booking);
    setActionError("");
    setFormOpen(true);
  }

  async function saveBooking(input: BookingInput) {
    if (editing?.id) {
      await updateBooking.mutateAsync({ id: editing.id, input });
    } else {
      await createBooking.mutateAsync(input);
    }
    setFormOpen(false);
    setEditing(null);
  }

  async function saveStatus(input: BookingStatusInput) {
    if (!statusTarget) return;
    await changeStatus.mutateAsync({ id: statusTarget.id, input });
    setStatusTarget(null);
  }

  async function billBooking(booking: Booking) {
    try {
      setActionError("");
      const result = await convertToInvoice.mutateAsync(booking.id);
      if (result.invoice_id) {
        router.push(`/dashboard/invoices/${result.invoice_id}`);
      }
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Unable to create invoice."
      );
    }
  }

  async function removeBooking(booking: Booking) {
    const name =
      booking.display_customer_name ||
      booking.customer_name ||
      booking.booking_number;
    const confirmed = window.confirm(`Archive booking for "${name}"?`);
    if (!confirmed) return;

    try {
      setActionError("");
      await deleteBooking.mutateAsync(booking.id);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Unable to archive booking."
      );
    }
  }

  const filters: Array<{ key: FilterKey; label: string; href: string }> = [
    { key: "all", label: "All", href: "/dashboard/bookings" },
    { key: "today", label: "Today", href: "/dashboard/bookings?filter=today" },
    {
      key: "upcoming",
      label: "Upcoming",
      href: "/dashboard/bookings?filter=upcoming",
    },
    {
      key: "in_progress",
      label: "In progress",
      href: "/dashboard/bookings?filter=in_progress",
    },
    {
      key: "unbilled",
      label: "Unbilled",
      href: "/dashboard/bookings?filter=unbilled",
    },
    {
      key: "appointment",
      label: "Appointments",
      href: "/dashboard/bookings?filter=appointment",
    },
    { key: "stay", label: "Stays", href: "/dashboard/bookings?filter=stay" },
  ];

  return (
    <section className="w-full space-y-6 text-left">
      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Reservations
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Bookings
          </h1>
          <p className="text-sm text-muted-foreground">
            Appointments, hotel stays, and venue slots on one calendar — then
            convert to an invoice when you charge.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setTypesOpen(true)}
          >
            Resource types
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => openCreate("stay")}
          >
            New stay
          </Button>
          <Button className="gap-2" onClick={() => openCreate("appointment")}>
            <Plus className="h-4 w-4" />
            New booking
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Today"
          value={String(summary?.today ?? 0)}
          hint={`${summary?.arriving_today ?? 0} arriving · ${summary?.departing_today ?? 0} departing`}
          icon={CalendarDays}
        />
        <KpiCard
          title="In progress"
          value={String(summary?.in_progress ?? 0)}
          hint="On chair or in-house"
          icon={CircleDot}
        />
        <KpiCard
          title="Upcoming"
          value={String(summary?.upcoming ?? 0)}
          hint={`${summary?.unbilled ?? 0} still unbilled`}
          icon={CalendarCheck}
        />
        <KpiCard
          title="This month"
          value={bookingMoney.format(summary?.this_month_value ?? 0)}
          hint={`${summary?.total ?? 0} bookings`}
          icon={ReceiptText}
        />
      </div>

      {summary?.by_kind?.length ? (
        <div className="flex flex-wrap gap-2">
          {summary.by_kind.map((row) => (
            <Badge key={row.booking_kind} variant="secondary">
              {kindLabel(row.booking_kind)}: {row.total}
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
            placeholder="Search guest, phone, booking no..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={view === "calendar" ? "default" : "outline"}
            asChild
          >
            <Link href="/dashboard/bookings?view=calendar">Calendar</Link>
          </Button>
          {filters.map((item) => (
            <Button
              key={item.key}
              size="sm"
              variant={filter === item.key && view !== "calendar" ? "default" : "outline"}
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

      {view === "calendar" ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
          {calendarDays.map(({ day, items }) => (
            <Card key={day.toISOString()}>
              <CardContent className="space-y-3 p-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {day.toLocaleDateString("en-IN", { weekday: "short" })}
                  </p>
                  <p className="text-lg font-semibold">
                    {day.toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                </div>
                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No bookings</p>
                ) : (
                  <ul className="space-y-2">
                    {items.map((booking) => (
                      <li key={booking.id}>
                        <button
                          type="button"
                          className="w-full rounded-lg border border-border p-2 text-left text-xs hover:bg-accent/50"
                          onClick={() => openEdit(booking)}
                        >
                          <p className="font-medium">
                            {booking.display_customer_name ||
                              booking.customer_name ||
                              "Guest"}
                          </p>
                          <p className="text-muted-foreground">
                            {formatWhen(booking.starts_at)} ·{" "}
                            {kindLabel(booking.booking_kind)}
                          </p>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                Loading bookings...
              </div>
            ) : error ? (
              <div className="flex h-64 flex-col items-start justify-center gap-2 p-6 text-left">
                <p className="text-sm font-medium text-destructive">
                  Unable to load bookings.
                </p>
                <p className="max-w-xl text-xs text-muted-foreground">
                  {error instanceof ApiError
                    ? `${error.status}: ${error.message}`
                    : error instanceof Error
                      ? error.message
                      : "Unknown error"}
                </p>
                <p className="max-w-xl text-xs text-muted-foreground">
                  If this is a 500, the `bookings` tables are usually missing.
                  Run schema.sql on MariaDB, then restart pm2.
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title={
                  search || filter !== "all"
                    ? "No bookings match your filters"
                    : "No bookings yet"
                }
                description={
                  search || filter !== "all"
                    ? "Clear search or filters to see the full book."
                    : "Add rooms or chairs under Resources, then take the first appointment or stay."
                }
                actionLabel={
                  search || filter !== "all" ? undefined : "Add first booking"
                }
                onAction={
                  search || filter !== "all" ? undefined : () => openCreate()
                }
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest</TableHead>
                    <TableHead>When</TableHead>
                    <TableHead>Kind</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">
                            {booking.display_customer_name ||
                              booking.customer_name ||
                              "Guest"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {booking.booking_number}
                            {booking.display_phone || booking.phone
                              ? ` · ${booking.display_phone || booking.phone}`
                              : ""}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{formatWhen(booking.starts_at)}</p>
                        <p className="text-xs text-muted-foreground">
                          to {formatWhen(booking.ends_at)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {kindLabel(booking.booking_kind)}
                        </Badge>
                        {booking.employee_name ? (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {booking.employee_name}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(booking.status)}>
                          {statusLabel(booking.status, booking.booking_kind)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">
                          {bookingMoney.format(booking.grand_total)}
                        </p>
                        {booking.invoice_ref ? (
                          <Link
                            href={`/dashboard/invoices/${booking.invoice_ref}`}
                            className="text-xs text-primary hover:underline"
                          >
                            Invoice
                          </Link>
                        ) : (
                          <p className="text-xs text-muted-foreground">Unbilled</p>
                        )}
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
                            <DropdownMenuItem onClick={() => openEdit(booking)}>
                              <Edit3 className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setStatusTarget(booking)}
                            >
                              Move status
                            </DropdownMenuItem>
                            {!booking.invoice_ref &&
                            booking.status !== "cancelled" ? (
                              <DropdownMenuItem
                                onClick={() => billBooking(booking)}
                              >
                                <ReceiptText className="h-4 w-4" />
                                Convert to invoice
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => removeBooking(booking)}
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
      )}

      <BookingFormSheet
        open={formOpen}
        booking={editing}
        defaultKind={defaultKind}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={saveBooking}
      />

      <BookingStatusDialog
        open={Boolean(statusTarget)}
        booking={statusTarget}
        onClose={() => setStatusTarget(null)}
        onSave={saveStatus}
      />

      <ResourceTypesDialog
        open={typesOpen}
        onClose={() => setTypesOpen(false)}
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
