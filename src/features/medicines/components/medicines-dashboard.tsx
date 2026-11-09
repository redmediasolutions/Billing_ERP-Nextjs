"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Boxes,
  CalendarClock,
  Edit3,
  Loader2,
  MoreHorizontal,
  PackagePlus,
  Pill,
  Plus,
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
import { matchesSearch } from "@/lib/erp-search";
import { useUrlParam, useUrlSearchParam } from "@/lib/use-url-search";
import {
  NO_EXPIRY_DATE,
  errorMessage,
  formatExpiry,
  money,
  todayInput,
  toneClass,
} from "@/features/clinic/lib/clinic-format";

import { MedicineFormSheet } from "../addform/medicine-form-sheet";
import { MedicineBatchesSheet } from "./medicine-batches-sheet";
import { useArchiveMedicine, useMedicines, useSaveMedicine } from "../hooks/use-medicines";
import type { Medicine, MedicineInput } from "../types";

const LOW_STOCK = 10;
const EXPIRY_DAYS = 60;

function daysUntil(date?: string | null) {
  if (!date || date === NO_EXPIRY_DATE) return null;
  return Math.round((new Date(date).getTime() - new Date(todayInput()).getTime()) / 86400000);
}

export function MedicinesDashboard() {
  const searchParams = useSearchParams();
  const { data: medicines = [], isLoading, error } = useMedicines();
  const { value: search, setSearch } = useUrlSearchParam();
  const filter = useUrlParam("filter") || "all";
  const save = useSaveMedicine();
  const archive = useArchiveMedicine();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Medicine | null>(null);
  const [batchesFor, setBatchesFor] = useState<number | null>(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (searchParams.get("create") === "1") {
      setEditing(null);
      setFormOpen(true);
    }
  }, [searchParams]);

  const lowStock = medicines.filter((m) => m.total_stock <= LOW_STOCK);
  const expiring = medicines.filter((m) => {
    const d = daysUntil(m.nearest_expiry);
    return d !== null && d <= EXPIRY_DAYS;
  });
  const stockValue = medicines.reduce((s, m) => s + m.total_stock * m.selling_price, 0);

  const filtered = useMemo(() => {
    const base =
      filter === "low" ? lowStock : filter === "expiring" ? expiring : medicines;
    return base.filter((m) => matchesSearch(search, [m.name, m.category, m.manufacturer, m.item_code]));
  }, [medicines, lowStock, expiring, filter, search]);

  async function submit(input: MedicineInput) {
    const saved = await save.mutateAsync({ id: editing?.id, input });
    setFormOpen(false);
    // brand-new medicine: go straight to adding its first batch
    if (!editing && saved?.id) setBatchesFor(saved.id);
    setEditing(null);
  }

  async function del(m: Medicine) {
    if (!window.confirm(`Archive "${m.name}"? Its stock history is kept.`)) return;
    try {
      setActionError("");
      await archive.mutateAsync(m.id);
    } catch (err) {
      setActionError(errorMessage(err, "Unable to archive medicine."));
    }
  }

  const filters = [
    { key: "all", label: "All", href: "/dashboard/medicines" },
    { key: "low", label: `Low stock (${lowStock.length})`, href: "/dashboard/medicines?filter=low" },
    { key: "expiring", label: `Expiring (${expiring.length})`, href: "/dashboard/medicines?filter=expiring" },
  ];

  return (
    <section className="w-full space-y-6 text-left">
      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Clinic</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Medicines</h1>
          <p className="text-sm text-muted-foreground">
            Pharmacy stock by batch and expiry. Same stock as Items and Inventory.
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> New medicine
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi title="Medicines" value={String(medicines.length)} hint="in catalogue" icon={Pill} />
        <Kpi title="Stock value" value={money.format(stockValue)} hint="at selling price" icon={Boxes} />
        <Kpi title="Low stock" value={String(lowStock.length)} hint={`${LOW_STOCK} or fewer`} icon={AlertTriangle} />
        <Kpi title="Expiring" value={String(expiring.length)} hint={`within ${EXPIRY_DAYS} days`} icon={CalendarClock} />
      </div>

      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search medicine, form, maker..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Button key={f.key} size="sm" variant={filter === f.key ? "default" : "outline"} asChild>
              <Link href={f.href}>{f.label}</Link>
            </Button>
          ))}
        </div>
      </div>

      {actionError ? <p className="text-sm font-medium text-destructive">{actionError}</p> : null}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-56 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" /> Loading medicines...
            </div>
          ) : error ? (
            <p className="p-6 text-sm font-medium text-destructive">{errorMessage(error, "Unable to load medicines.")}</p>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Pill}
              title={search || filter !== "all" ? "Nothing matches" : "No medicines yet"}
              description="Add medicines, then add stock as batches with expiry dates."
              actionLabel={search || filter !== "all" ? undefined : "Add First Medicine"}
              onAction={search || filter !== "all" ? undefined : () => setFormOpen(true)}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[280px]">Medicine</TableHead>
                  <TableHead>Form</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Next expiry</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m) => {
                  const d = daysUntil(m.nearest_expiry);
                  const tone = d === null ? "muted" : d < 0 ? "red" : d <= EXPIRY_DAYS ? "amber" : "green";
                  return (
                    <TableRow key={m.id}>
                      <TableCell>
                        <button type="button" className="text-left" onClick={() => setBatchesFor(m.id)}>
                          <p className="font-medium hover:underline">{m.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {m.item_code}
                            {m.manufacturer ? ` · ${m.manufacturer}` : ""}
                          </p>
                        </button>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{m.category || "—"}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-semibold ${m.total_stock <= LOW_STOCK ? "text-amber-600" : ""}`}>
                          {m.total_stock}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {m.batch_count} batch{m.batch_count === 1 ? "" : "es"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {m.nearest_expiry ? (
                          <Badge variant="outline" className={toneClass[tone]}>
                            {formatExpiry(m.nearest_expiry)}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">{money.format(m.selling_price)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setBatchesFor(m.id)}>
                            <PackagePlus className="h-3.5 w-3.5" /> Stock
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditing(m);
                                  setFormOpen(true);
                                }}
                              >
                                <Edit3 className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/items/${m.id}`}>
                                  <Boxes className="mr-2 h-4 w-4" /> Stock ledger
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => void del(m)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Archive
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <MedicineFormSheet
        open={formOpen}
        medicine={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={submit}
      />

      <MedicineBatchesSheet medicineId={batchesFor} onClose={() => setBatchesFor(null)} />
    </section>
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
