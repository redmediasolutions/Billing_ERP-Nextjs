import type { Customer } from "./types";

/**
 * One consistent, backwards-compatible label for a customer. Old records did
 * not have a display name, so their contact name remains the safe fallback.
 */
export function customerDisplayName(customer: Pick<Customer, "customer_name"> & { customer_display_name?: string | null }) {
  return customer.customer_display_name?.trim() || customer.customer_name || "Customer";
}

export function customerContactName(customer: Pick<Customer, "customer_name" | "customer_title">) {
  return [customer.customer_title?.trim(), customer.customer_name].filter(Boolean).join(" ");
}
