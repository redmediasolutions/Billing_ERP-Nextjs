import type { Employee } from "@/features/employees/types";

export interface PayrollRow {
  id: number;
  fullName: string;
  totalLoans: number;
  totalDeductions: number;
  remaining: number;
  status: "Active" | "Cleared";
}

export interface Loan {
  id: number;
  employee_id: number;
  amount: number;
  date: string;
  reason: string | null;
  created_at: string;
}

export interface Deduction {
  id: number;
  employee_id: number;
  amount: number;
  date: string;
  source: string | null;
  notes: string | null;
  created_at: string;
}

export interface PayrollDetails {
  loans: Loan[];
  deductions: Deduction[];
  summary: {
    totalLoans: number;
    totalDeductions: number;
    remaining: number;
  };
}

export interface LoanInput {
  employee_id: number;
  amount: number;
  date: string;
  reason: string;
}

export interface DeductionInput {
  employee_id: number;
  amount: number;
  date: string;
  source: string;
  notes: string;
}



export interface Remuneration {
  id?: number;
  employee_id: number;
  tenant_id: number;
  basic_pay: number;
  hra: number;
  bonus: number;
  overtime: number;
  pf_deduction: number;
  professional_tax: number;
  loans: number;
  advance: number;
  lop: number;
  esi: number;
  created_at?: string;
}

export interface RemunerationInput {
  basic_pay: number;
  hra: number;
  bonus: number;
  overtime: number;
  pf_deduction: number;
  professional_tax: number;
  advance: number;
  lop: number;
  esi: number;
}

export interface RemunerationDetails {
  employee: Pick<Employee, "id" | "full_name" | "empId" | "department">;
  remuneration: Remuneration;
}