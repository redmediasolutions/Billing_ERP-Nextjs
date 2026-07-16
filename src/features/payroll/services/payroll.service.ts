import { payrollRepository } from "../repository/payroll.repository";
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

function normalizeRow(row: PayrollRow): PayrollRow {
  return {
    ...row,
    totalLoans: Number(row.totalLoans || 0),
    totalDeductions: Number(row.totalDeductions || 0),
    remaining: Number(row.remaining || 0),
  };
}

function normalizeDetails(details: PayrollDetails): PayrollDetails {
  return {
    loans: details.loans.map((loan) => ({
      ...loan,
      amount: Number(loan.amount || 0),
    })),

    deductions: details.deductions.map((deduction) => ({
      ...deduction,
      amount: Number(deduction.amount || 0),
    })),

    summary: {
      totalLoans: Number(details.summary.totalLoans || 0),
      totalDeductions: Number(
        details.summary.totalDeductions || 0
      ),
      remaining: Number(details.summary.remaining || 0),
    },
  };
}

export const payrollService = {
  async dashboard() {
    const rows = await payrollRepository.dashboard();
    return rows.map(normalizeRow);
  },

  async details(employeeId: number) {
    const details = await payrollRepository.details(employeeId);
    return normalizeDetails(details);
  },

  addLoan: (input: LoanInput) =>
    payrollRepository.addLoan(input),

  addDeduction: (input: DeductionInput) =>
    payrollRepository.addDeduction(input),

  getRemuneration: (employeeId: number) =>
  payrollRepository.getRemuneration(employeeId),

saveRemuneration: (
  employeeId: number,
  data: RemunerationInput
) => payrollRepository.saveRemuneration(employeeId, data),
};