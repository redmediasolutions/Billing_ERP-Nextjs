"use client";

import { useMemo, useState } from "react";
import {
  Edit3,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
  WalletCards,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { RemunerationFormModal } from "@/features/payroll/components/remuneration-form-modal";

import { EmployeeFormModal } from "../addform/employee-form-modal";
import {
  useCreateEmployee,
  useDeleteEmployee,
  useEmployees,
  useUpdateEmployee,
} from "../hooks/use-employees";
import type { Employee, EmployeeInput } from "../types";

export function EmployeesDashboard() {
  const { data: employees = [], isLoading, error } = useEmployees();

  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] =
    useState<Employee | null>(null);
  const [salaryEmployee, setSalaryEmployee] =
    useState<Employee | null>(null);
  const [actionError, setActionError] = useState("");

  const filteredEmployees = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return employees;

    return employees.filter((employee) =>
      [
        employee.full_name,
        employee.empId || "",
        employee.email || "",
        employee.phone || "",
        employee.nationality || "",
        employee.department_name || "",
      ].some((value) => value.toLowerCase().includes(term))
    );
  }, [employees, search]);

  const joinedThisMonth = employees.filter((employee) => {
    if (!employee.onboarding_date) return false;

    const date = new Date(employee.onboarding_date);
    const now = new Date();

    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }).length;

  const departments = new Set(
    employees
      .map((employee) => employee.department)
      .filter((department): department is number => Boolean(department))
  ).size;

  function openCreate() {
    setEditingEmployee(null);
    setActionError("");
    setFormOpen(true);
  }

  function openEdit(employee: Employee) {
    setEditingEmployee(employee);
    setActionError("");
    setFormOpen(true);
  }

  async function saveEmployee(input: EmployeeInput) {
    try {
      setActionError("");

      if (editingEmployee) {
        await updateEmployee.mutateAsync({
          id: editingEmployee.id,
          input,
        });
      } else {
        await createEmployee.mutateAsync(input);
      }

      setFormOpen(false);
      setEditingEmployee(null);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Unable to save employee."
      );
    }
  }

  async function removeEmployee(employee: Employee) {
    const accepted = window.confirm(
      `Delete employee "${employee.full_name}"?`
    );

    if (!accepted) return;

    try {
      setActionError("");
      await deleteEmployee.mutateAsync(employee.id);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Unable to delete employee."
      );
    }
  }

  return (
    <section className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Workforce
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Employees
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage employee records, departments, and monthly salary details.
          </p>
        </div>

        <Button onClick={openCreate} className="gap-2 self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Total Employees" value={employees.length} />
        <KpiCard label="Joined This Month" value={joinedThisMonth} />
        <KpiCard label="Departments" value={departments} />
      </div>

      {/* Main Directory Table */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Employee Directory
              </h2>

              <p className="text-xs text-muted-foreground">
                {filteredEmployees.length} employee
                {filteredEmployees.length === 1 ? "" : "s"} shown
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search employees..."
                className="pl-9"
              />
            </div>
          </div>

          {actionError ? (
            <p className="text-sm font-medium text-destructive">
              {actionError}
            </p>
          ) : null}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[280px]">Employee</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Onboarding</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-32 text-center text-muted-foreground"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span>Loading employees...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-32 text-center text-destructive"
                    >
                      Unable to load employees.
                    </TableCell>
                  </TableRow>
                ) : filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-32 text-center text-muted-foreground"
                    >
                      No employees found. Add your first employee.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      {/* Name & Avatar */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {employee.full_name.slice(0, 2).toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">
                              {employee.full_name}
                            </p>

                            <p className="truncate text-xs text-muted-foreground">
                              {employee.gender || "Employee"} ·{" "}
                              {employee.nationality || "—"}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Contact Info */}
                      <TableCell>
                        <div className="space-y-1 text-xs">
                          {employee.email ? (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Mail className="h-3.5 w-3.5" />
                              <span>{employee.email}</span>
                            </div>
                          ) : null}

                          {employee.phone ? (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Phone className="h-3.5 w-3.5" />
                              <span>{employee.phone}</span>
                            </div>
                          ) : null}

                          {!employee.email && !employee.phone ? (
                            <span className="italic text-muted-foreground">
                              No contact details
                            </span>
                          ) : null}
                        </div>
                      </TableCell>

                      {/* Employee ID */}
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-xs">
                          {employee.empId || "Not assigned"}
                        </Badge>
                      </TableCell>

                      {/* Department */}
                      <TableCell className="text-xs text-foreground">
                        {employee.department_name || "No department"}
                      </TableCell>

                      {/* Onboarding Date */}
                      <TableCell className="text-xs text-muted-foreground">
                        {employee.onboarding_date
                          ? new Date(
                              employee.onboarding_date
                            ).toLocaleDateString("en-IN")
                          : "—"}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSalaryEmployee(employee)}
                            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                          >
                            <WalletCards className="h-4 w-4" />
                            <span>Salary</span>
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(employee)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            title="Edit employee"
                          >
                            <Edit3 className="h-4 w-4" />
                            <span className="sr-only">Edit employee</span>
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => void removeEmployee(employee)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            title="Delete employee"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete employee</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {formOpen ? (
        <EmployeeFormModal
          employee={editingEmployee}
          onClose={() => {
            setFormOpen(false);
            setEditingEmployee(null);
          }}
          onSave={saveEmployee}
        />
      ) : null}

      {salaryEmployee ? (
        <RemunerationFormModal
          employee={salaryEmployee}
          onClose={() => setSalaryEmployee(null)}
        />
      ) : null}
    </section>
  );
}

function KpiCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
