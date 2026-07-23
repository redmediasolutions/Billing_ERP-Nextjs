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
    <section className="employees-dashboard">
      <div className="employees-dashboard__header">
        <div>
          <p className="employees-dashboard__eyebrow">
            Workforce
          </p>

          <h1 className="employees-dashboard__title">Employees</h1>

          <p className="employees-dashboard__intro">
            Manage employee records, departments, and monthly salary details.
          </p>
        </div>

        <Button
          onClick={openCreate}
          className="employees-dashboard__primary-action"
        >
          <Plus size={16} />
          Add Employee
        </Button>
      </div>

      <div className="employees-dashboard__kpis">
        <KpiCard label="Total Employees" value={employees.length} />
        <KpiCard label="Joined This Month" value={joinedThisMonth} />
        <KpiCard label="Departments" value={departments} />
      </div>

      <Card className="employees-dashboard__directory">
        <CardContent className="employees-dashboard__directory-content">
          <div className="employees-dashboard__directory-head">
            <div>
              <h2 className="employees-dashboard__directory-title">Employee Directory</h2>

              <p className="employees-dashboard__directory-count">
                {filteredEmployees.length} employee
                {filteredEmployees.length === 1 ? "" : "s"} shown
              </p>
            </div>

            <div className="employees-dashboard__search">
              <Search className="employees-dashboard__search-icon" />

              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search employees..."
                className="employees-dashboard__search-input"
              />
            </div>
          </div>

          {actionError ? (
            <p className="employees-dashboard__error">
              {actionError}
            </p>
          ) : null}

          <div className="employees-dashboard__table-scroll">
            <table className="employees-dashboard__table">
              <thead>
                <tr>
                  <th>Employee</th><th>Contact</th><th>Employee ID</th><th>Department</th><th>Onboarding</th><th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="employees-dashboard__state">
                      <Loader2 className="employees-dashboard__spinner" />
                      Loading employees...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="employees-dashboard__state employees-dashboard__state--error">
                      Unable to load employees.
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="employees-dashboard__state">
                      No employees found. Add your first employee.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="employees-dashboard__row"
                    >
                      <td><div className="employees-dashboard__employee"><div className="employees-dashboard__avatar">
                            {employee.full_name.slice(0, 2).toUpperCase()}
                          </div>

                          <div>
                            <p className="employees-dashboard__employee-name">
                              {employee.full_name}
                            </p>

                            <p className="employees-dashboard__employee-meta">
                              {employee.gender || "Employee"} ·{" "}
                              {employee.nationality || "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td>
                        {employee.email ? (
                          <p className="employees-dashboard__contact"><Mail size={14} />
                            {employee.email}
                          </p>
                        ) : null}

                        {employee.phone ? (
                          <p className="employees-dashboard__contact employees-dashboard__contact--phone"><Phone size={14} />
                            {employee.phone}
                          </p>
                        ) : null}

                        {!employee.email && !employee.phone ? (
                          <span className="employees-dashboard__empty">
                            No contact details
                          </span>
                        ) : null}
                      </td>

                      <td><Badge className="employees-dashboard__id-badge">
                          {employee.empId || "Not assigned"}
                        </Badge>
                      </td>

                      <td className="employees-dashboard__department">
                        {employee.department_name || "No department"}
                      </td>

                      <td className="employees-dashboard__date">
                        {employee.onboarding_date
                          ? new Date(
                              employee.onboarding_date
                            ).toLocaleDateString("en-IN")
                          : "—"}
                      </td>

                      <td><div className="employees-dashboard__actions">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSalaryEmployee(employee)}
                            className="employees-dashboard__salary-action"
                          >
                            <WalletCards size={16} />
                            Salary
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(employee)}
                            className="employees-dashboard__icon-action"
                            title="Edit employee"
                          >
                            <Edit3 size={16} />
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => void removeEmployee(employee)}
                            className="employees-dashboard__icon-action"
                            title="Delete employee"
                          >
                            <Trash2 size={16} />
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
    <Card className="employees-kpi"><CardContent className="employees-kpi__content">
        <Users size={20} className="employees-kpi__icon" />

        <p className="employees-kpi__label">
          {label}
        </p>

        <p className="employees-kpi__value">{value}</p>
      </CardContent>
    </Card>
  );
}
