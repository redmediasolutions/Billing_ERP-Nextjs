export interface Employee {
  id: number;
  full_name: string;
  email: string | null;
  phone: string | null;
  gender: string | null;
  nationality: string | null;
  empId: string | null;
  onboarding_date: string | null;

  department: number | null;
  department_name: string | null;

  tenant_id: number;
  created_at: string;
}

export interface Department {
  id: number;
  department: string;
  created_at: string;
}

export interface EmployeeInput {
  full_name: string;
  email: string;
  phone: string;
  gender: string;
  nationality: string;
  empId: string;
  onboarding_date: string;
  department: number;
}