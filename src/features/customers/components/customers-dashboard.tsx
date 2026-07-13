"use client";

import { useMemo, useState } from "react";
import {
  Edit3,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CustomerFormModal } from "../addform/customer-form-modal";
import {
  useCreateCustomer,
  useCustomers,
  useDeleteCustomer,
  useUpdateCustomer,
} from "../hooks/use-customers";
import type { Customer, CustomerInput } from "../types";

export function CustomersDashboard() {
  const { data: customers = [], isLoading, error } = useCustomers();

  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] =
    useState<Customer | null>(null);
  const [actionError, setActionError] = useState("");

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return customers;

    return customers.filter((customer) =>
      [
        customer.customer_name,
        customer.customer_business_name || "",
        customer.customer_phone || "",
        customer.customer_email || "",
        customer.customer_gst || "",
      ].some((value) => value.toLowerCase().includes(term))
    );
  }, [customers, search]);

  const gstRegistered = customers.filter(
    (customer) => customer.customer_gst
  ).length;

  const emailAvailable = customers.filter(
    (customer) => customer.customer_email
  ).length;

  function openCreate() {
    setEditingCustomer(null);
    setActionError("");
    setFormOpen(true);
  }

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
        err instanceof Error
          ? err.message
          : "Unable to save customer."
      );
    }
  }

  async function removeCustomer(customer: Customer) {
    const accepted = window.confirm(
      `Archive "${customer.customer_name}"?`
    );

    if (!accepted) return;

    try {
      setActionError("");

      await deleteCustomer.mutateAsync(customer.id);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Unable to delete customer."
      );
    }
  }

  return (
    <section className="min-h-screen bg-[#111113] p-5 pt-20 text-white lg:p-8 lg:pt-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#FFCC00]">
            Contacts
          </p>

          <h1 className="mt-1 text-3xl font-bold">Customers</h1>

          <p className="mt-2 text-sm text-zinc-400">
            Manage customer contacts, addresses, and GST details.
          </p>
        </div>

        <Button
          onClick={openCreate}
          className="bg-[#FFCC00] font-bold text-black hover:bg-yellow-400"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-3">
        <KpiCard
          label="Total Customers"
          value={customers.length}
        />

        <KpiCard
          label="GST Registered"
          value={gstRegistered}
        />

        <KpiCard
          label="Email Available"
          value={emailAvailable}
        />
      </div>

      <Card className="mt-7 border-zinc-800 bg-[#1e1e24] text-white">
        <CardContent className="p-0">
          <div className="flex flex-col gap-4 border-b border-zinc-800 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold">
                Customer Directory
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                {filteredCustomers.length} customer
                {filteredCustomers.length === 1 ? "" : "s"} shown
              </p>
            </div>

            <div className="relative w-full md:w-[330px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

              <Input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search customers..."
                className="border-zinc-700 bg-[#151517] pl-10"
              />
            </div>
          </div>

          {actionError && (
            <p className="mx-5 mt-5 rounded-xl border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-300">
              {actionError}
            </p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="border-b border-zinc-800 text-xs uppercase text-zinc-400">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">GST Details</th>
                  <th className="px-6 py-4">Billing Address</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-14 text-center text-zinc-400"
                    >
                      <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin" />
                      Loading customers...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-14 text-center text-red-300"
                    >
                      Unable to load customers.
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-14 text-center text-zinc-500"
                    >
                      No customers found. Add your first customer.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-zinc-800/70 hover:bg-zinc-800/30"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFCC00]/15 font-bold text-[#FFCC00]">
                            {customer.customer_name
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="font-bold text-white">
                              {customer.customer_name}
                            </p>

                            <p className="mt-1 text-xs text-zinc-500">
                              {customer.customer_business_name ||
                                "Individual customer"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        {customer.customer_phone && (
                          <p className="flex items-center gap-2 text-zinc-300">
                            <Phone className="h-3.5 w-3.5 text-zinc-500" />
                            {customer.customer_phone}
                          </p>
                        )}

                        {customer.customer_email && (
                          <p className="mt-2 flex items-center gap-2 text-zinc-400">
                            <Mail className="h-3.5 w-3.5 text-zinc-500" />
                            {customer.customer_email}
                          </p>
                        )}

                        {!customer.customer_phone &&
                          !customer.customer_email && (
                            <span className="text-zinc-500">
                              No contact details
                            </span>
                          )}
                      </td>

                      <td className="px-6 py-5">
                        {customer.customer_gst ? (
                          <>
                            <Badge className="bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15">
                              GST Registered
                            </Badge>

                            <p className="mt-2 font-mono text-xs text-zinc-400">
                              {customer.customer_gst}
                            </p>
                          </>
                        ) : (
                          <Badge className="bg-zinc-700 text-zinc-300 hover:bg-zinc-700">
                            Unregistered
                          </Badge>
                        )}
                      </td>

                      <td className="max-w-[250px] px-6 py-5">
                        <p className="line-clamp-2 text-zinc-400">
                          {customer.customer_billing_address ||
                            "No billing address"}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(customer)}
                            className="text-zinc-400 hover:bg-zinc-800 hover:text-[#FFCC00]"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              void removeCustomer(customer)
                            }
                            className="text-zinc-400 hover:bg-red-950/40 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {formOpen && (
        <CustomerFormModal
          customer={editingCustomer}
          onClose={() => {
            setFormOpen(false);
            setEditingCustomer(null);
          }}
          onSave={saveCustomer}
        />
      )}
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
    <Card className="border-zinc-800 bg-[#1e1e24] text-white">
      <CardContent className="p-5">
        <Users className="mb-4 h-5 w-5 text-[#FFCC00]" />

        <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
          {label}
        </p>

        <p className="mt-2 text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}