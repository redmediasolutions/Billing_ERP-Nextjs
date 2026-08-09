"use client";
import { useEffect, useMemo, useState } from "react";
import { Store } from "lucide-react";
import { Select } from "@/features/pos/ui/input";
import { customersService } from "@/features/customers/services/customers.service";
import type { Customer } from "@/features/customers/types";
import { useCart } from "../hooks/useCart";

export function CustomerPicker() {
  const { channel, customerId, setCustomerId, setCustomerLabel } = useCart();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [walkInLoading, setWalkInLoading] = useState(false);

  useEffect(() => {
    customersService.list().then(setCustomers).catch(() => setCustomers([]));
  }, []);

  useEffect(() => {
    if (channel !== "walk_in") return;
    let active = true;
    setWalkInLoading(true);
    customersService
      .getWalkIn()
      .then((customer) => {
        if (!active) return;
        setCustomerId(customer.id);
        setCustomerLabel(customer.customer_name);
      })
      .finally(() => active && setWalkInLoading(false));
    return () => {
      active = false;
    };
  }, [channel, setCustomerId, setCustomerLabel]);

  const cloudCustomers = useMemo(
    () => customers.filter((customer) => customer.customer_name !== "Walk-in Customer"),
    [customers]
  );

  if (channel === "walk_in") {
    return <div className="customer-chip"><Store size={14} />{walkInLoading ? "Loading walk-in customer…" : "Walk-in Customer"}</div>;
  }

  return (
    <Select
      value={customerId ?? ""}
      onChange={(event) => {
        const id = Number(event.target.value) || null;
        const customer = cloudCustomers.find((row) => row.id === id);
        setCustomerId(id);
        setCustomerLabel(customer?.customer_name ?? "");
      }}
    >
      <option value="">Select cloud kitchen customer…</option>
      {cloudCustomers.map((customer) => <option key={customer.id} value={customer.id}>{customer.customer_name}{customer.customer_phone ? ` · ${customer.customer_phone}` : ""}</option>)}
    </Select>
  );
}
