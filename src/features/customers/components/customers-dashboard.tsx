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
    <section className="customers-dashboard">
      <div className="customers-dashboard__header">
        <div>
          <p className="customers-dashboard__eyebrow">
            Contacts
          </p>

          <h1 className="customers-dashboard__title">Customers</h1>

          <p className="customers-dashboard__intro">
            Manage customer contacts, addresses, and GST details.
          </p>
        </div>

        <Button
          onClick={openCreate}
          className="customers-dashboard__primary-action"
        >
          <Plus size={16} />
          Add Customer
        </Button>
      </div>

      <div className="customers-dashboard__kpis">
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

      <Card className="customers-dashboard__directory">
        <CardContent className="customers-dashboard__directory-content">
          <div className="customers-dashboard__directory-head">
            <div>
              <h2 className="customers-dashboard__directory-title">
                Customer Directory
              </h2>

              <p className="customers-dashboard__directory-count">
                {filteredCustomers.length} customer
                {filteredCustomers.length === 1 ? "" : "s"} shown
              </p>
            </div>

            <div className="customers-dashboard__search">
              <Search className="customers-dashboard__search-icon" />

              <Input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search customers..."
                className="customers-dashboard__search-input"
              />
            </div>
          </div>

          {actionError && (
            <p className="customers-dashboard__error">
              {actionError}
            </p>
          )}

          <div className="customers-dashboard__table-scroll">
            <table className="customers-dashboard__table">
              <thead>
                <tr>
                  <th>Customer</th><th>Contact</th><th>GST Details</th><th>Billing Address</th><th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="customers-dashboard__state"
                    >
                      <Loader2 className="customers-dashboard__spinner" />
                      Loading customers...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="customers-dashboard__state customers-dashboard__state--error"
                    >
                      Unable to load customers.
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="customers-dashboard__state"
                    >
                      No customers found. Add your first customer.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="customers-dashboard__row"
                    >
                      <td><div className="customers-dashboard__customer">
                          <div className="customers-dashboard__avatar">
                            {customer.customer_name
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="customers-dashboard__customer-name">
                              {customer.customer_name}
                            </p>

                            <p className="customers-dashboard__customer-company">
                              {customer.customer_business_name ||
                                "Individual customer"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td>
                        {customer.customer_phone && (
                          <p className="customers-dashboard__contact"><Phone size={14} />
                            {customer.customer_phone}
                          </p>
                        )}

                        {customer.customer_email && (
                          <p className="customers-dashboard__contact customers-dashboard__contact--email"><Mail size={14} />
                            {customer.customer_email}
                          </p>
                        )}

                        {!customer.customer_phone &&
                          !customer.customer_email && (
                            <span className="customers-dashboard__empty">
                              No contact details
                            </span>
                          )}
                      </td>

                      <td>
                        {customer.customer_gst ? (
                          <>
                            <Badge className="customers-dashboard__badge">
                              GST Registered
                            </Badge>

                            <p className="customers-dashboard__gst">
                              {customer.customer_gst}
                            </p>
                          </>
                        ) : (
                          <Badge className="customers-dashboard__badge">
                            Unregistered
                          </Badge>
                        )}
                      </td>

                      <td className="customers-dashboard__address"><p>
                          {customer.customer_billing_address ||
                            "No billing address"}
                        </p>
                      </td>

                      <td><div className="customers-dashboard__actions">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(customer)}
                            className="customers-dashboard__icon-action"
                          >
                            <Edit3 size={16} />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              void removeCustomer(customer)
                            }
                            className="customers-dashboard__icon-action"
                          >
                            <Trash2 size={16} />
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
    <Card className="customers-kpi"><CardContent className="customers-kpi__content">
        <Users size={20} className="customers-kpi__icon" />

        <p className="customers-kpi__label">
          {label}
        </p>

        <p className="customers-kpi__value">{value}</p>
      </CardContent>
    </Card>
  );
}
