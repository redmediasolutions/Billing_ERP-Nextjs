import { customersRepository } from "../repository/customers.repository";
import type { Customer, CustomerInput } from "../types";

function normalizeCustomer(customer: Customer): Customer {
  return {
    ...customer,
    is_archived: Number(customer.is_archived) === 1,
  };
}

export const customersService = {
  async list() {
    const customers = await customersRepository.list();
    return customers.map(normalizeCustomer);
  },

  async create(input: CustomerInput) {
    const customer = await customersRepository.create(input);
    return normalizeCustomer(customer);
  },

  async update(id: number, input: CustomerInput) {
    const customer = await customersRepository.update(id, input);
    return normalizeCustomer(customer);
  },

  remove: (id: number) => customersRepository.remove(id),
};