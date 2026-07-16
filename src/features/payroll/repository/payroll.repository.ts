import { apiRequest } from "@/lib/api";
import type {
  DeductionInput,
  LoanInput,
  PayrollDetails,
  PayrollRow,
} from "../types";

import type {
  RemunerationDetails,
  RemunerationInput,
} from "../types";

//for employee salary
export const payrollRepository = {
  dashboard: () =>
    apiRequest<PayrollRow[]>("/payroll"),

  details: (employeeId: number) =>
    apiRequest<PayrollDetails>(`/payroll/${employeeId}`),

  addLoan: (input: LoanInput) =>
    apiRequest<void>("/payroll/loans", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  addDeduction: (input: DeductionInput) =>
    apiRequest<void>("/payroll/deductions", {
      method: "POST",
      body: JSON.stringify(input),
    }),

    getRemuneration: (employeeId: number) =>
  apiRequest<RemunerationDetails>(
    `/payroll/remuneration/${employeeId}`
  ),

saveRemuneration: (employeeId: number, data: RemunerationInput) =>
  apiRequest(`/payroll/remuneration/${employeeId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
};