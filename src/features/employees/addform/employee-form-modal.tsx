"use client";

import { FormEvent, useState } from "react";
import { Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { Employee, EmployeeInput } from "../types";

import { useDepartments } from "../hooks/use-employees";

const emptyEmployee: EmployeeInput = {
    full_name: "",
    email: "",
    phone: "",
    gender: "",
    nationality: "Indian",
    empId: "",
    onboarding_date: "",
    department: 0,
};

export function EmployeeFormModal({
    employee,
    onClose,
    onSave,
}: {
    employee: Employee | null;
    onClose: () => void;
    onSave: (input: EmployeeInput) => Promise<void>;
}) {
    const [form, setForm] = useState<EmployeeInput>(
        employee
            ? {
                full_name: employee.full_name || "",
                email: employee.email || "",
                phone: employee.phone || "",
                gender: employee.gender || "",
                nationality: employee.nationality || "",
                empId: employee.empId || "",
                onboarding_date: employee.onboarding_date
                    ? employee.onboarding_date.slice(0, 10)
                    : "",
                department: Number(employee.department || 0),
            }
            : emptyEmployee
    );

    const { data: departments = [], isLoading: loadingDepartments } =
        useDepartments();

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    function setValue<K extends keyof EmployeeInput>(
        key: K,
        value: EmployeeInput[K]
    ) {
        setForm((current) => ({
            ...current,
            [key]: value,
        }));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!form.full_name.trim()) {
            setError("Employee name is required.");
            return;
        }

        if (!form.empId.trim()) {
            setError("Employee ID is required.");
            return;
        }

        if (!form.department || form.department < 1) {
            setError("Enter a valid Department ID.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            await onSave({
                ...form,
                full_name: form.full_name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                gender: form.gender.trim(),
                nationality: form.nationality.trim(),
                empId: form.empId.trim(),
            });
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to save employee."
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border-zinc-800 bg-[#1e1e24] text-white">
                <DialogHeader className="flex flex-row items-center justify-between">
                    <DialogTitle className="text-2xl">
                        {employee ? "Edit Employee" : "Add New Employee"}
                    </DialogTitle>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="grid gap-5 md:grid-cols-2">
                        <Field label="Full Name *">
                            <Input
                                value={form.full_name}
                                onChange={(event) =>
                                    setValue("full_name", event.target.value)
                                }
                                placeholder="e.g. Rahul Sharma"
                                className="border-zinc-700 bg-[#151517]"
                            />
                        </Field>

                        <Field label="Employee ID *">
                            <Input
                                value={form.empId}
                                onChange={(event) =>
                                    setValue("empId", event.target.value)
                                }
                                placeholder="e.g. EMP-001"
                                className="border-zinc-700 bg-[#151517]"
                            />
                        </Field>

                        <Field label="Email Address">
                            <Input
                                type="email"
                                value={form.email}
                                onChange={(event) =>
                                    setValue("email", event.target.value)
                                }
                                placeholder="employee@company.com"
                                className="border-zinc-700 bg-[#151517]"
                            />
                        </Field>

                        <Field label="Phone Number">
                            <Input
                                value={form.phone}
                                onChange={(event) =>
                                    setValue("phone", event.target.value)
                                }
                                placeholder="e.g. 9876543210"
                                className="border-zinc-700 bg-[#151517]"
                            />
                        </Field>

                        <Field label="Gender">
                            <select
                                value={form.gender}
                                onChange={(event) =>
                                    setValue("gender", event.target.value)
                                }
                                className="w-full rounded-md border border-zinc-700 bg-[#151517] px-3 py-2 text-sm text-white outline-none focus:border-[#FFCC00]"
                            >
                                <option value="">Select gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </Field>

                        <Field label="Nationality">
                            <Input
                                value={form.nationality}
                                onChange={(event) =>
                                    setValue("nationality", event.target.value)
                                }
                                placeholder="e.g. Indian"
                                className="border-zinc-700 bg-[#151517]"
                            />
                        </Field>

                        <Field label="Onboarding Date">
                            <Input
                                type="date"
                                value={form.onboarding_date}
                                onChange={(event) =>
                                    setValue(
                                        "onboarding_date",
                                        event.target.value
                                    )
                                }
                                className="border-zinc-700 bg-[#151517]"
                            />
                        </Field>

                        <Field label="Department *">
                            <select
                                value={form.department || ""}
                                onChange={(event) =>
                                    setValue("department", Number(event.target.value))
                                }
                                className="w-full rounded-md border border-zinc-700 bg-[#151517] px-3 py-2 text-sm text-white outline-none focus:border-[#FFCC00]"
                            >
                                <option value="">
                                    {loadingDepartments
                                        ? "Loading departments..."
                                        : "Select a department"}
                                </option>

                                {departments.map((department) => (
                                    <option key={department.id} value={department.id}>
                                        {department.department}
                                    </option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    {error && (
                        <p className="rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-300">
                            {error}
                        </p>
                    )}

                    <div className="flex justify-end gap-3 border-t border-zinc-800 pt-5">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="border-zinc-600 bg-transparent"
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={saving}
                            className="bg-[#FFCC00] font-bold text-black hover:bg-yellow-400"
                        >
                            {saving && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}

                            {employee ? "Save Changes" : "Add Employee"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <Label className="mb-2 block text-xs font-bold uppercase text-zinc-400">
                {label}
            </Label>

            {children}
        </div>
    );
}