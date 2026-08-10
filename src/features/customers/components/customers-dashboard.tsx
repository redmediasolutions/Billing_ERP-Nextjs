"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Edit3,
  Loader2,
  Mail,
  Phone,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomerFormSheet } from "../addform/customer-form-sheet";
import { matchesSearch } from "@/lib/erp-search";
import { useUrlParam, useUrlSearchParam } from "@/lib/use-url-search";
import {
  useArchiveCustomer,
  useCreateCustomer,
  useCustomers,
  useUpdateCustomer,
} from "../hooks/use-customers";
import type { Customer, CustomerInput } from "../types";

export function CustomersDashboard() {
  const searchParams = useSearchParams();
  const { data: customers = [], isLoading, error } = useCustomers();
  const { value: search, setSearch } = useUrlSearchParam();
  const gstFilter = useUrlParam("gst");

  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const archiveCustomer = useArchiveCustomer();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (searchParams.get("create") === "1") {
      setEditingCustomer(null);
      setActionError("");
      setFormOpen(true);
    }
  }, [searchParams]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesQuery = matchesSearch(search, [
        customer.customer_name,
        customer.customer_business_name,
        customer.customer_phone,
        customer.customer_email,
        customer.customer_gst,
      ]);

      if (!matchesQuery) return false;

      if (gstFilter === "yes") {
        return Boolean(customer.customer_gst);
      }

      return true;
    });
  }, [customers, search, gstFilter]);

  const gstRegistered = customers.filter((customer) => customer.customer_gst).length;
  const emailAvailable = customers.filter((customer) => customer.customer_email).length;

  function openEdit(customer: Customer) {
    setEditingCustomer(customer);
    setActionError("");
    setFormOpen(true);
  }

  async function saveCustomer(input: CustomerInput) {
    try {
      setActionError("");

      if (editingCustomer) {
        await updateCustomer.mutateAsync({
          id: editingCustomer.id,
          input,
        });
      } else {
        await createCustomer.mutateAsync(input);
      }

      setFormOpen(false);
      setEditingCustomer(null);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Unable to save customer."
      );
    }
  }

  async function removeCustomer(customer: Customer) {
    const accepted = window.confirm(`Archive "${customer.customer_name}"?`);
    if (!accepted) return;

    try {
      setActionError("");
      await archiveCustomer.mutateAsync(customer.id);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Unable to delete customer."
      );
    }
  }

  return (
    <section className="w-full space-y-6 text-left">
      {/* Header */}
      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Contacts
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Customers
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage customer contacts, addresses, and GST details.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Total Customers" value={customers.length} />
        <KpiCard label="GST Registered" value={gstRegistered} />
        <KpiCard label="Email Available" value={emailAvailable} />
      </div>

      {/* Main Content Card */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex w-full flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Customer Directory
              </h2>
              <p className="text-xs text-muted-foreground">
                {filteredCustomers.length} customer
                {filteredCustomers.length === 1 ? "" : "s"} shown
                {gstFilter === "yes" ? " (GST registered)" : ""}
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search customers..."
                className="pl-9"
              />
            </div>
          </div>

          {actionError && (
            <p className="mb-4 text-sm font-medium text-destructive">
              {actionError}
            </p>
          )}

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[280px]">Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>GST Details</TableHead>
                  <TableHead>Billing Address</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-left text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span>Loading customers...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-left text-destructive">
                      Unable to load customers.
                    </TableCell>
                  </TableRow>
                ) : filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-left text-muted-foreground">
                      {search || gstFilter
                        ? "No customers match your search or filters."
                        : "No customers found. Use &ldquo;Add Customer&rdquo; in the top navigation."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {customer.customer_name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">
                              {customer.customer_name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {customer.customer_business_name || "Individual customer"}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1 text-xs">
                          {customer.customer_phone && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Phone className="h-3.5 w-3.5" />
                              <span>{customer.customer_phone}</span>
                            </div>
                          )}

                          {customer.customer_email && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Mail className="h-3.5 w-3.5" />
                              <span>{customer.customer_email}</span>
                            </div>
                          )}

                          {!customer.customer_phone && !customer.customer_email && (
                            <span className="italic text-muted-foreground">
                              No contact details
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          {customer.customer_gst ? (
                            <>
                              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400">
                                GST Registered
                              </Badge>
                              <p className="font-mono text-xs text-muted-foreground">
                                {customer.customer_gst}
                              </p>
                            </>
                          ) : (
                            <Badge variant="secondary">Unregistered</Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <p className="max-w-[220px] truncate text-xs text-muted-foreground" title={customer.customer_billing_address || undefined}>
                          {customer.customer_billing_address || "No billing address"}
                        </p>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(customer)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <Edit3 className="h-4 w-4" />
                            <span className="sr-only">Edit customer</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => void removeCustomer(customer)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete customer</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <CustomerFormSheet
        open={formOpen}
        customer={editingCustomer}
        onClose={() => {
          setFormOpen(false);
          setEditingCustomer(null);
        }}
        onSave={saveCustomer}
      />
    </section>
  );
}

function KpiCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
