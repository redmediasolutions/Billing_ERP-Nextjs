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
    <section className="min-h-screen bg-[#111113] p-5 pt-20 text-white lg:p-8 lg:pt-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#FFCC00]">
            Workforce
          </p>

          <h1 className="mt-1 text-3xl font-bold">Employees</h1>

          <p className="mt-2 text-sm text-zinc-400">
            Manage employee records, departments, and monthly salary details.
          </p>
        </div>

        <Button
          onClick={openCreate}
          className="bg-[#FFCC00] font-bold text-black hover:bg-yellow-400"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-3">
        <KpiCard label="Total Employees" value={employees.length} />
        <KpiCard label="Joined This Month" value={joinedThisMonth} />
        <KpiCard label="Departments" value={departments} />
      </div>

      <Card className="mt-7 border-zinc-800 bg-[#1e1e24] text-white">
        <CardContent className="p-0">
          <div className="flex flex-col gap-4 border-b border-zinc-800 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold">Employee Directory</h2>

              <p className="mt-1 text-sm text-zinc-500">
                {filteredEmployees.length} employee
                {filteredEmployees.length === 1 ? "" : "s"} shown
              </p>
            </div>

            <div className="relative w-full md:w-[330px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search employees..."
                className="border-zinc-700 bg-[#151517] pl-10"
              />
            </div>
          </div>

          {actionError ? (
            <p className="mx-5 mt-5 rounded-xl border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-300">
              {actionError}
            </p>
          ) : null}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="border-b border-zinc-800 text-xs uppercase text-zinc-400">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Employee ID</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Onboarding</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-14 text-center text-zinc-400">
                      <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin" />
                      Loading employees...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="p-14 text-center text-red-300">
                      Unable to load employees.
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-14 text-center text-zinc-500">
                      No employees found. Add your first employee.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="border-b border-zinc-800/70 hover:bg-zinc-800/30"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFCC00]/15 font-bold text-[#FFCC00]">
                            {employee.full_name.slice(0, 2).toUpperCase()}
                          </div>

                          <div>
                            <p className="font-bold text-white">
                              {employee.full_name}
                            </p>

                            <p className="mt-1 text-xs text-zinc-500">
                              {employee.gender || "Employee"} ·{" "}
                              {employee.nationality || "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        {employee.email ? (
                          <p className="flex items-center gap-2 text-zinc-300">
                            <Mail className="h-3.5 w-3.5 text-zinc-500" />
                            {employee.email}
                          </p>
                        ) : null}

                        {employee.phone ? (
                          <p className="mt-2 flex items-center gap-2 text-zinc-400">
                            <Phone className="h-3.5 w-3.5 text-zinc-500" />
                            {employee.phone}
                          </p>
                        ) : null}

                        {!employee.email && !employee.phone ? (
                          <span className="text-zinc-500">
                            No contact details
                          </span>
                        ) : null}
                      </td>

                      <td className="px-6 py-5">
                        <Badge className="bg-[#FFCC00]/10 font-mono text-[#FFCC00] hover:bg-[#FFCC00]/10">
                          {employee.empId || "Not assigned"}
                        </Badge>
                      </td>

                      <td className="px-6 py-5 text-zinc-300">
                        {employee.department_name || "No department"}
                      </td>

                      <td className="px-6 py-5 text-zinc-400">
                        {employee.onboarding_date
                          ? new Date(
                              employee.onboarding_date
                            ).toLocaleDateString("en-IN")
                          : "—"}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSalaryEmployee(employee)}
                            className="text-zinc-400 hover:bg-[#FFCC00]/10 hover:text-[#FFCC00]"
                          >
                            <WalletCards className="mr-2 h-4 w-4" />
                            Salary
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(employee)}
                            className="text-zinc-400 hover:bg-zinc-800 hover:text-[#FFCC00]"
                            title="Edit employee"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => void removeEmployee(employee)}
                            className="text-zinc-400 hover:bg-red-950/40 hover:text-red-400"
                            title="Delete employee"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
    <Card className="border-zinc-800 bg-[#1e1e24] text-white">
      <CardContent className="p-5">
        <Users className="mb-4 h-5 w-5 text-[#FFCC00]" />

        <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
          {label}
        </p>

        <p className="mt-2 text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}