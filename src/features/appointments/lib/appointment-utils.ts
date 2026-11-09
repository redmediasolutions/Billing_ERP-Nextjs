import type { Tone } from "@/features/clinic/lib/clinic-format";

import { APPOINTMENT_STATUSES, type AppointmentStatus } from "../types";

export function statusLabel(status: string) {
  return APPOINTMENT_STATUSES.find((s) => s.value === status)?.label || status;
}

export function statusTone(status: AppointmentStatus | string): Tone {
  switch (status) {
    case "confirmed":
      return "blue";
    case "completed":
      return "green";
    case "cancelled":
    case "no_show":
      return "red";
    default:
      return "amber";
  }
}
