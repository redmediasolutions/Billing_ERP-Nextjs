import { apiRequest } from "@/lib/api";
import type {
  Department,
  Employee,
  EmployeeInput,
} from "../types";

export const employeesRepository = {
  list: () => apiRequest<Employee[]>("/employees"),

  departments: () =>
    apiRequest<Department[]>("/employees/departments"),

  create: (input: EmployeeInput) =>
    apiRequest<Employee>("/employees", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  update: (id: number, input: EmployeeInput) =>
    apiRequest<Employee>(`/employees/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  remove: (id: number) =>
    apiRequest<void>(`/employees/${id}`, {
      method: "DELETE",
    }),
};