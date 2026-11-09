"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { HeartPulse, Link2, Loader2, Mail, MapPin, Phone, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import {
  ResizableSheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/resizable-sheet-content";
import { Textarea } from "@/components/ui/textarea";
import { useCustomers } from "@/features/customers/hooks/use-customers";
import { errorMessage } from "@/features/clinic/lib/clinic-format";

import { usePatients } from "../hooks/use-patients";
import { BLOOD_GROUPS, type Patient, type PatientInput } from "../types";

const EMPTY: PatientInput = {
  name: "",
  phone: "",
  email: "",
  address: "",
  gender: "",
  dob: "",
  blood_group: "",
};

function digits(value?: string | null) {
  return String(value || "").replace(/\D/g, "").slice(-10);
}

export function PatientFormSheet({
  open,
  patient,
  initialName,
  onClose,
  onSave,
}: {
  open: boolean;
  patient: Patient | null;
  initialName?: string;
  onClose: () => void;
  onSave: (input: PatientInput) => Promise<void>;
}) {
  const [form, setForm] = useState<PatientInput>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const { data: customers = [] } = useCustomers();
  const { data: patients = [] } = usePatients();

  useEffect(() => {
    if (!open) return;
    setError("");
    if (patient) {
      setForm({
        name: patient.name || "",
        phone: patient.phone || "",
        email: patient.email || "",
        address: patient.address || "",
        gender: patient.gender || "",
        dob: patient.dob || "",
        blood_group: patient.blood_group || "",
      });
    } else {
      setForm({ ...EMPTY, name: initialName || "" });
    }
  }, [open, patient, initialName]);

  // An ERP customer with the same phone who is not a patient yet:
  // offer to link them so the person is not stored twice.
  const matchingCustomer = useMemo(() => {
    if (patient || form.customer_id) return null;
    const phone = digits(form.phone);
    if (phone.length < 10) return null;
    const patientIds = new Set(patients.map((p) => p.id));
    return (
      customers.find(
        (c) => digits(c.customer_phone) === phone && !patientIds.has(c.id)
      ) || null
    );
  }, [customers, patients, form.phone, form.customer_id, patient]);

  const existingPatient = useMemo(() => {
    if (patient) return null;
    const phone = digits(form.phone);
    if (phone.length < 10) return null;
    return patients.find((p) => digits(p.phone) === phone) || null;
  }, [patients, form.phone, patient]);

  function set<K extends keyof PatientInput>(key: K, value: PatientInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim() && !form.customer_id) {
      setError("Enter the patient's name.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      await onSave(form);
    } catch (err) {
      setError(errorMessage(err, "Unable to save patient."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <ResizableSheetContent
        defaultWidth={520}
        minWidth={400}
        maxWidth={900}
        storageKey="patients-sheet-width"
        className="flex w-full flex-col gap-0 p-0"
      >
        <SheetHeader className="border-b p-6 pb-4 border-border">
          <SheetTitle>{patient ? "Edit Patient" : "Register Patient"}</SheetTitle>
          <SheetDescription>
            Patients are saved as customers too, so their invoices, estimates
            and enquiries stay in one place.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex-1 space-y-6 overflow-y-auto p-6">
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <User className="h-3.5 w-3.5" /> Patient
            </h3>

            <div className="space-y-1.5">
              <Label htmlFor="patient_name">Full name *</Label>
              <Input
                id="patient_name"
                required={!form.customer_id}
                disabled={Boolean(form.customer_id)}
                placeholder="e.g. Suma Rao"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="patient_phone">Mobile</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="patient_phone"
                    className="pl-9"
                    inputMode="tel"
                    placeholder="98450 00000"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Used for WhatsApp appointment reminders.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="patient_email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="patient_email"
                    type="email"
                    className="pl-9"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {existingPatient ? (
              <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                {existingPatient.name} is already registered with this number.
              </p>
            ) : null}

            {matchingCustomer ? (
              <div className="flex flex-col gap-2 rounded-lg border bg-muted/40 p-3 text-sm sm:flex-row sm:items-center sm:justify-between border-border">
                <span>
                  <span className="font-medium">{matchingCustomer.customer_name}</span>{" "}
                  is already a customer with this number.
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      customer_id: matchingCustomer.id,
                      name: matchingCustomer.customer_name,
                    }))
                  }
                >
                  <Link2 className="h-3.5 w-3.5" />
                  Use this customer
                </Button>
              </div>
            ) : null}

            {form.customer_id ? (
              <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                <span>Linking existing customer — their invoices will show in the patient history.</span>
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  onClick={() => setForm((prev) => ({ ...prev, customer_id: undefined }))}
                >
                  Undo
                </Button>
              </div>
            ) : null}
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <HeartPulse className="h-3.5 w-3.5" /> Medical profile
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="patient_gender">Gender</Label>
                <Select
                  value={form.gender || "none"}
                  onValueChange={(v) => set("gender", v === "none" ? "" : v)}
                >
                  <SelectTrigger id="patient_gender" className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not set</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="patient_dob">Date of birth</Label>
                <Input
                  id="patient_dob"
                  type="date"
                  value={form.dob}
                  onChange={(e) => set("dob", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="patient_blood">Blood group</Label>
                <Select
                  value={form.blood_group || "none"}
                  onValueChange={(v) => set("blood_group", v === "none" ? "" : v)}
                >
                  <SelectTrigger id="patient_blood" className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not set</SelectItem>
                    {BLOOD_GROUPS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label htmlFor="patient_address" className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" /> Address
            </Label>
            <Textarea
              id="patient_address"
              rows={2}
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </div>

          {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

          <SheetFooter className="border-t px-0 pt-4 border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {patient ? "Update Patient" : form.customer_id ? "Link as Patient" : "Register Patient"}
            </Button>
          </SheetFooter>
        </form>
      </ResizableSheetContent>
    </Sheet>
  );
}
