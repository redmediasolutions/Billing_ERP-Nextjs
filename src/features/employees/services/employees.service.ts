import { employeesRepository } from "../repository/employees.repository";
import type { EmployeeInput } from "../types";

export const employeesService = {
  list: () => employeesRepository.list(),

  departments: () =>
    employeesRepository.departments(),

  create: (input: EmployeeInput) =>
    employeesRepository.create(input),

  update: (id: number, input: EmployeeInput) =>
    employeesRepository.update(id, input),

  remove: (id: number) =>
    employeesRepository.remove(id),
};