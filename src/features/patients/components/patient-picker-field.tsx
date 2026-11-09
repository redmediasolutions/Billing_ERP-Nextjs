"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Phone, Plus, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { matchesSearch } from "@/lib/erp-search";
import { initials } from "@/features/clinic/lib/clinic-format";

import { PatientFormSheet } from "../addform/patient-form-sheet";
import { useCreatePatient, usePatients } from "../hooks/use-patients";
import type { Patient, PatientInput } from "../types";

/** Search-as-you-type patient chooser with "register new patient". */
export function PatientPickerField({
  value,
  onChange,
  disabled,
  autoFocus,
}: {
  value: Patient | null;
  onChange: (patient: Patient | null) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  const { data: patients = [], isLoading } = usePatients();
  const createPatient = useCreatePatient();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(event: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const results = useMemo(
    () =>
      patients
        .filter((p) => matchesSearch(query, [p.name, p.display_name, p.phone, p.email]))
        .slice(0, 8),
    [patients, query]
  );

  async function register(input: PatientInput) {
    const created = await createPatient.mutateAsync(input);
    onChange(created);
    setFormOpen(false);
    setOpen(false);
    setQuery("");
  }

  if (value) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2 border-border">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {initials(value.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{value.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {value.phone || "No phone"}
            </p>
          </div>
        </div>
        {!disabled ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onChange(null)}
            aria-label="Change patient"
          >
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="relative" ref={boxRef}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        disabled={disabled}
        autoFocus={autoFocus}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        placeholder="Search patient by name or phone..."
        className="pl-9"
      />

      {open ? (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border bg-popover shadow-lg border-border">
          {isLoading ? (
            <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading patients...
            </div>
          ) : results.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">
              {query ? "No patient found." : "No patients yet."}
            </p>
          ) : (
            <ul className="max-h-64 overflow-y-auto py-1">
              {results.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-accent"
                    onClick={() => {
                      onChange(p);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {initials(p.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {p.phone || "—"}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t p-1 border-border">
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-accent"
              onClick={() => setFormOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Register new patient{query ? ` "${query}"` : ""}
            </button>
          </div>
        </div>
      ) : null}

      <PatientFormSheet
        open={formOpen}
        patient={null}
        initialName={/\d{5,}/.test(query) ? "" : query}
        onClose={() => setFormOpen(false)}
        onSave={register}
      />
    </div>
  );
}
