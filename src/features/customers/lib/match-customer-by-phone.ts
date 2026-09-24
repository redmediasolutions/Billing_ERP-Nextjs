import { customersService } from "../services/customers.service";
import type { Customer } from "../types";

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

export async function matchCustomerByPhone(
  phone: string
): Promise<Customer | null> {
  const digits = normalizePhone(phone);
  if (digits.length < 8) return null;

  const query = digits.length > 10 ? digits.slice(-10) : digits;
  const matches = await customersService.search(query);
  if (!matches.length) return null;

  const exact = matches.find(
    (customer) =>
      customer.customer_phone &&
      normalizePhone(customer.customer_phone) === digits
  );

  return exact || matches[0] || null;
}
