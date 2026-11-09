import type { Consultation, ConsultationPrescription, ConsultationVitals } from "../types";
import { ageFrom, formatDate } from "@/features/clinic/lib/clinic-format";

function esc(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Opens a clean, printable prescription (Rx) in a new window. */
export function printPrescription({
  clinicName,
  clinicAddress,
  clinicPhone,
  doctorName,
  consultation,
  vitals,
  prescriptions,
}: {
  clinicName: string;
  clinicAddress?: string | null;
  clinicPhone?: string | null;
  doctorName?: string | null;
  consultation: Consultation;
  vitals?: ConsultationVitals | null;
  prescriptions: ConsultationPrescription[];
}) {
  const age = ageFrom(consultation.dob);
  const v = vitals;
  const vitalBits = v
    ? [
        v.blood_pressure && `BP ${v.blood_pressure}`,
        v.pulse && `Pulse ${v.pulse}`,
        v.temperature && `Temp ${v.temperature}`,
        v.oxygen_saturation && `SpO₂ ${v.oxygen_saturation}`,
        v.weight && `Wt ${v.weight} kg`,
      ].filter(Boolean)
    : [];

  const rows = prescriptions
    .map(
      (p, i) => `<tr>
        <td>${i + 1}</td>
        <td><strong>${esc(p.medicine_name)}</strong>${p.instructions ? `<div class="muted">${esc(p.instructions)}</div>` : ""}</td>
        <td>${esc(p.dosage)}</td>
        <td>${esc(p.frequency)}</td>
        <td>${esc(p.duration)}</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Prescription ${esc(consultation.consultation_number)}</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#111827;margin:32px;font-size:13px}
    h1{margin:0;font-size:20px} .muted{color:#6b7280;font-size:12px}
    header{display:flex;justify-content:space-between;border-bottom:2px solid #111827;padding-bottom:12px;margin-bottom:16px}
    .row{display:flex;gap:24px;flex-wrap:wrap;margin:6px 0}
    table{width:100%;border-collapse:collapse;margin-top:12px} th,td{text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;vertical-align:top}
    th{font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#6b7280}
    .rx{font-size:28px;font-weight:700;margin-top:16px} footer{margin-top:48px;text-align:right}
    @media print{body{margin:16mm}}
  </style></head><body>
  <header>
    <div><h1>${esc(clinicName)}</h1><div class="muted">${esc(clinicAddress || "")}${clinicPhone ? ` · ${esc(clinicPhone)}` : ""}</div></div>
    <div style="text-align:right"><strong>${esc(doctorName || consultation.doctor_name || "")}</strong><div class="muted">${esc(consultation.consultation_number)} · ${esc(formatDate(consultation.consultation_date))}</div></div>
  </header>
  <div class="row"><div><strong>Patient:</strong> ${esc(consultation.patient_name)}</div>
    ${age !== null ? `<div><strong>Age:</strong> ${age}</div>` : ""}
    ${consultation.gender ? `<div><strong>Sex:</strong> ${esc(consultation.gender)}</div>` : ""}
    ${consultation.patient_phone ? `<div><strong>Phone:</strong> ${esc(consultation.patient_phone)}</div>` : ""}</div>
  ${vitalBits.length ? `<div class="row muted">${vitalBits.map(esc).join(" · ")}</div>` : ""}
  ${consultation.chief_complaint ? `<div class="row"><div><strong>Complaint:</strong> ${esc(consultation.chief_complaint)}</div></div>` : ""}
  ${consultation.diagnosis ? `<div class="row"><div><strong>Diagnosis:</strong> ${esc(consultation.diagnosis)}</div></div>` : ""}
  <div class="rx">℞</div>
  <table><thead><tr><th>#</th><th>Medicine</th><th>Dose</th><th>Frequency</th><th>Duration</th></tr></thead><tbody>
  ${rows || `<tr><td colspan="5" class="muted">No medicines prescribed.</td></tr>`}
  </tbody></table>
  ${consultation.notes ? `<p style="margin-top:16px"><strong>Advice:</strong> ${esc(consultation.notes)}</p>` : ""}
  <footer><div style="margin-top:40px">______________________</div><div class="muted">Signature</div></footer>
  <script>window.onload=function(){window.print()}</script>
  </body></html>`;

  const w = window.open("", "_blank", "width=820,height=1000");
  if (!w) {
    alert("Allow pop-ups to print the prescription.");
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}
