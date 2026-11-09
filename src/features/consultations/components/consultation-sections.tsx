"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  Activity,
  CalendarPlus,
  Eye,
  FileText,
  ImageIcon,
  Loader2,
  Paperclip,
  Pill,
  Plus,
  Syringe,
  Trash2,
  Upload,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClinicServices } from "@/features/clinic-services/hooks/use-clinic-services";
import { useMedicines } from "@/features/medicines/hooks/use-medicines";
import {
  errorMessage,
  formatDateTime,
  fromLocalInput,
  money,
} from "@/features/clinic/lib/clinic-format";

import { consultationsService } from "../services/consultations.service";
import { useConsultationActions } from "../hooks/use-consultations";
import {
  FREQUENCY_PRESETS,
  type ConsultationDetail,
  type ConsultationVitals,
} from "../types";

type Actions = ReturnType<typeof useConsultationActions>;

export function SectionCard({
  icon: Icon,
  title,
  action,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Icon className="h-4 w-4 text-muted-foreground" /> {title}
          </h2>
          {action}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

// ------------------------------------------------------------------ VITALS
const VITAL_FIELDS: Array<{ key: keyof ConsultationVitals; label: string; placeholder: string }> = [
  { key: "blood_pressure", label: "BP", placeholder: "120/80" },
  { key: "pulse", label: "Pulse", placeholder: "bpm" },
  { key: "temperature", label: "Temp", placeholder: "°F" },
  { key: "oxygen_saturation", label: "SpO₂", placeholder: "%" },
  { key: "weight", label: "Weight", placeholder: "kg" },
  { key: "height", label: "Height", placeholder: "cm" },
];

export function VitalsSection({ detail, actions, locked }: { detail: ConsultationDetail; actions: Actions; locked: boolean }) {
  const latest = detail.vitals[0];
  const [form, setForm] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setForm({
      blood_pressure: latest?.blood_pressure || "",
      pulse: latest?.pulse || "",
      temperature: latest?.temperature || "",
      oxygen_saturation: latest?.oxygen_saturation || "",
      weight: latest?.weight || "",
      height: latest?.height || "",
      bmi: latest?.bmi || "",
      notes: latest?.notes || "",
    });
  }, [latest]);

  const w = Number(form.weight);
  const h = Number(form.height) / 100;
  const autoBmi = w > 0 && h > 0 ? (w / (h * h)).toFixed(1) : "";

  async function save(event: FormEvent) {
    event.preventDefault();
    try {
      setMsg("");
      await actions.saveVitals.mutateAsync({ ...form, bmi: form.bmi || autoBmi });
      setMsg("Saved");
    } catch (err) {
      setMsg(errorMessage(err, "Unable to save vitals."));
    }
  }

  return (
    <SectionCard icon={Activity} title="Vitals" action={latest?.created_at ? <span className="text-xs text-muted-foreground">{formatDateTime(latest.created_at)}</span> : null}>
      <form onSubmit={save} className="space-y-3">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-7">
          {VITAL_FIELDS.map((f) => (
            <div key={f.key} className="space-y-1">
              <Label className="text-xs">{f.label}</Label>
              <Input
                className="h-8"
                disabled={locked}
                placeholder={f.placeholder}
                value={form[f.key] || ""}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              />
            </div>
          ))}
          <div className="space-y-1">
            <Label className="text-xs">BMI</Label>
            <Input
              className="h-8"
              disabled={locked}
              placeholder={autoBmi || "auto"}
              value={form.bmi || ""}
              onChange={(e) => setForm({ ...form, bmi: e.target.value })}
            />
          </div>
        </div>
        {!locked ? (
          <div className="flex items-center justify-end gap-3">
            {msg ? <span className="text-xs text-muted-foreground">{msg}</span> : null}
            <Button type="submit" size="sm" variant="outline" disabled={actions.saveVitals.isPending}>
              {actions.saveVitals.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Save vitals
            </Button>
          </div>
        ) : null}
      </form>
    </SectionCard>
  );
}

// ------------------------------------------------------------------ PROCEDURES
export function ProceduresSection({ detail, actions, locked }: { detail: ConsultationDetail; actions: Actions; locked: boolean }) {
  const { data: services = [] } = useClinicServices();
  const [serviceId, setServiceId] = useState("");
  const [name, setName] = useState("");
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");

  async function add(event: FormEvent) {
    event.preventDefault();
    try {
      setError("");
      await actions.addProcedure.mutateAsync({
        service_id: serviceId && serviceId !== "custom" ? Number(serviceId) : null,
        procedure_name: name.trim() || undefined,
        quantity: Number(qty) || 1,
        price: price === "" ? null : Number(price),
      });
      setServiceId("");
      setName("");
      setQty("1");
      setPrice("");
    } catch (err) {
      setError(errorMessage(err, "Unable to add procedure."));
    }
  }

  const total = detail.procedures.reduce((s, p) => s + p.quantity * p.price, 0);

  return (
    <SectionCard icon={Syringe} title="Procedures" action={total ? <span className="text-sm font-semibold">{money.format(total)}</span> : null}>
      {detail.procedures.length ? (
        <div className="divide-y rounded-lg border border-border divide-border">
          {detail.procedures.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 p-3 text-sm">
              <div>
                <p className="font-medium">{p.procedure_name}</p>
                <p className="text-xs text-muted-foreground">
                  {p.quantity} × {money.format(p.price)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{money.format(p.quantity * p.price)}</span>
                {!locked ? (
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => void actions.deleteProcedure.mutateAsync(p.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No procedures added.</p>
      )}

      {!locked ? (
        <form onSubmit={add} className="grid grid-cols-2 items-end gap-2 sm:grid-cols-[1.5fr_1fr_70px_90px_auto]">
          <div className="col-span-2 space-y-1 sm:col-span-1">
            <Label className="text-xs">Service</Label>
            <Select
              value={serviceId}
              onValueChange={(v) => {
                setServiceId(v);
                const s = services.find((x) => String(x.id) === v);
                if (s) setPrice(String(s.cost));
              }}
            >
              <SelectTrigger className="h-8 w-full">
                <SelectValue placeholder="Choose service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name} · {money.format(s.cost)}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Other (type a name)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-1 sm:col-span-1">
            <Label className="text-xs">Name</Label>
            <Input
              className="h-8"
              placeholder={serviceId === "custom" ? "Procedure name" : "Optional"}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Qty</Label>
            <Input className="h-8" type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Price</Label>
            <Input className="h-8" type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <Button type="submit" size="sm" variant="outline" className="gap-1" disabled={actions.addProcedure.isPending || (!serviceId && !name.trim())}>
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
          {error ? <p className="col-span-full text-xs font-medium text-destructive">{error}</p> : null}
        </form>
      ) : null}
    </SectionCard>
  );
}

// ------------------------------------------------------------------ PRESCRIPTIONS
export function PrescriptionsSection({
  detail,
  actions,
  locked,
  onPrint,
}: {
  detail: ConsultationDetail;
  actions: Actions;
  locked: boolean;
  onPrint: () => void;
}) {
  const { data: medicines = [] } = useMedicines();
  const [medicineId, setMedicineId] = useState("");
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("1-0-1");
  const [duration, setDuration] = useState("");
  const [instructions, setInstructions] = useState("");
  const [error, setError] = useState("");

  async function add(event: FormEvent) {
    event.preventDefault();
    try {
      setError("");
      await actions.addPrescription.mutateAsync({
        medicine_id: medicineId && medicineId !== "custom" ? Number(medicineId) : null,
        medicine_name: name.trim() || undefined,
        dosage: dosage.trim(),
        frequency: frequency.trim(),
        duration: duration.trim(),
        instructions: instructions.trim(),
      });
      setMedicineId("");
      setName("");
      setDosage("");
      setDuration("");
      setInstructions("");
    } catch (err) {
      setError(errorMessage(err, "Unable to add medicine."));
    }
  }

  return (
    <SectionCard
      icon={Pill}
      title="Prescription"
      action={
        <Button size="sm" variant="outline" className="gap-1.5" onClick={onPrint}>
          <FileText className="h-3.5 w-3.5" /> Print Rx
        </Button>
      }
    >
      {detail.prescriptions.length ? (
        <div className="divide-y rounded-lg border border-border divide-border">
          {detail.prescriptions.map((p) => {
            const med = medicines.find((m) => m.id === p.medicine_id);
            return (
              <div key={p.id} className="flex items-start justify-between gap-3 p-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium">
                    {p.medicine_name}
                    {med ? (
                      <Badge variant="secondary" className="ml-2">
                        {med.total_stock} in stock
                      </Badge>
                    ) : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {[p.dosage, p.frequency, p.duration].filter(Boolean).join(" · ") || "—"}
                    {p.instructions ? ` — ${p.instructions}` : ""}
                  </p>
                </div>
                {!locked ? (
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => void actions.deletePrescription.mutateAsync(p.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No medicines prescribed.</p>
      )}

      {!locked ? (
        <form onSubmit={add} className="space-y-2">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Medicine</Label>
              <Select value={medicineId} onValueChange={setMedicineId}>
                <SelectTrigger className="h-8 w-full">
                  <SelectValue placeholder="From pharmacy stock" />
                </SelectTrigger>
                <SelectContent>
                  {medicines.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {m.name} ({m.total_stock})
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Not in stock (type name)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Name</Label>
              <Input
                className="h-8"
                placeholder={medicineId === "custom" ? "Medicine name" : "Optional"}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Dose</Label>
              <Input className="h-8" placeholder="500 mg" value={dosage} onChange={(e) => setDosage(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Frequency</Label>
              <Input
                className="h-8"
                list="rx-frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              />
              <datalist id="rx-frequency">
                {FREQUENCY_PRESETS.map((f) => (
                  <option key={f} value={f} />
                ))}
              </datalist>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Duration</Label>
              <Input className="h-8" placeholder="5 days" value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Instructions</Label>
              <Input
                className="h-8"
                placeholder="After food"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              size="sm"
              variant="outline"
              className="gap-1"
              disabled={actions.addPrescription.isPending || (!medicineId && !name.trim()) || (medicineId === "custom" && !name.trim())}
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </div>
          {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
        </form>
      ) : null}
    </SectionCard>
  );
}

// ------------------------------------------------------------------ FOLLOW-UP
export function FollowupSection({ detail, actions, defaultDoctor }: { detail: ConsultationDetail; actions: Actions; defaultDoctor: string }) {
  const [when, setWhen] = useState("");
  const [notes, setNotes] = useState("");
  const [book, setBook] = useState(true);
  const [msg, setMsg] = useState("");

  async function add(event: FormEvent) {
    event.preventDefault();
    if (!when) return;
    try {
      setMsg("");
      await actions.addFollowup.mutateAsync({
        followup_date: fromLocalInput(when),
        notes: notes.trim(),
        book_appointment: book,
        doctor_name: defaultDoctor,
      });
      setWhen("");
      setNotes("");
      setMsg(book ? "Follow-up booked as an appointment." : "Follow-up note saved.");
    } catch (err) {
      setMsg(errorMessage(err, "Unable to save follow-up."));
    }
  }

  return (
    <SectionCard icon={CalendarPlus} title="Follow-up">
      {detail.followups.length || detail.followup_notes.length ? (
        <div className="space-y-2">
          {detail.followups.map((f) => (
            <div key={`a${f.id}`} className="flex items-center justify-between rounded-lg border p-2 text-sm border-border">
              <span>{formatDateTime(f.appointment_datetime)}</span>
              <Badge variant="secondary">{f.status.replace("_", " ")}</Badge>
            </div>
          ))}
          {detail.followup_notes
            .filter((n) => !detail.followups.some((f) => f.appointment_datetime === n.followup_date))
            .map((n) => (
              <div key={`n${n.id}`} className="rounded-lg border p-2 text-sm border-border">
                <span className="font-medium">{formatDateTime(n.followup_date)}</span>
                {n.notes ? <span className="text-muted-foreground"> — {n.notes}</span> : null}
              </div>
            ))}
        </div>
      ) : null}
      <form onSubmit={add} className="space-y-2">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Input type="datetime-local" className="h-8" value={when} onChange={(e) => setWhen(e.target.value)} />
          <Input className="h-8" placeholder="Reason / note" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" checked={book} onChange={(e) => setBook(e.target.checked)} />
            Book it as an appointment (WhatsApp reminders)
          </label>
          <Button type="submit" size="sm" variant="outline" disabled={!when || actions.addFollowup.isPending}>
            Save follow-up
          </Button>
        </div>
        {msg ? <p className="text-xs text-muted-foreground">{msg}</p> : null}
      </form>
    </SectionCard>
  );
}

// ------------------------------------------------------------------ ATTACHMENTS
export function AttachmentsSection({ detail, actions }: { detail: ConsultationDetail; actions: Actions }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [opening, setOpening] = useState<number | null>(null);

  async function upload(file: File) {
    try {
      setError("");
      await actions.uploadAttachment.mutateAsync({ file, title: title.trim() });
      setTitle("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setError(errorMessage(err, "Upload failed."));
    }
  }

  async function view(id: number, key: string) {
    try {
      setOpening(id);
      setError("");
      const { viewUrl } = await consultationsService.viewUrl(key);
      window.open(viewUrl, "_blank", "noopener");
    } catch (err) {
      setError(errorMessage(err, "Unable to open file."));
    } finally {
      setOpening(null);
    }
  }

  return (
    <SectionCard icon={Paperclip} title="Reports & images">
      {detail.attachments.length ? (
        <div className="divide-y rounded-lg border border-border divide-border">
          {detail.attachments.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-3 p-2 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                {a.file_type === "image" ? (
                  <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <span className="truncate">{a.title || "Attachment"}</span>
              </span>
              <div className="flex gap-1">
                <Button size="icon-sm" variant="ghost" onClick={() => void view(a.id, a.file_key)} disabled={opening === a.id}>
                  {opening === a.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    if (window.confirm("Delete this attachment?")) void actions.deleteAttachment.mutateAsync(a.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No files attached.</p>
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input className="h-8" placeholder="Title (e.g. Blood report)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
          }}
        />
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          disabled={actions.uploadAttachment.isPending}
          onClick={() => fileRef.current?.click()}
        >
          {actions.uploadAttachment.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          Upload
        </Button>
      </div>
      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
    </SectionCard>
  );
}

