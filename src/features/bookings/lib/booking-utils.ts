import type {
  Booking,
  BookingKind,
  BookingLineInput,
  BookingStatus,
} from "../types";
import { BOOKING_STATUSES } from "../types";

export function toNum(value: unknown, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export function asBool(value: unknown) {
  return value === true || value === 1 || value === "1";
}

export function toLocalInput(value: string | null | undefined) {
  if (!value) return "";
  const text = String(value).trim();
  if (!text) return "";
  if (text.includes("T")) return text.slice(0, 16);
  if (text.includes(" ")) return text.replace(" ", "T").slice(0, 16);
  return text.slice(0, 16);
}

export function nowLocal() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function toDatetimeLocal(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function addMinutesLocal(local: string, minutes: number) {
  const date = new Date(local);
  if (Number.isNaN(date.getTime())) return local;
  date.setMinutes(date.getMinutes() + minutes);
  return toDatetimeLocal(date);
}

export function nightsBetween(start: string, end: string) {
  const from = new Date(start);
  const to = new Date(end);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 1;
  const nights = Math.round((to.getTime() - from.getTime()) / 86400000);
  return Math.max(1, nights);
}

export function stayWindow(
  checkInDate: string,
  nights: number,
  checkInHour = 14,
  checkOutHour = 11
) {
  const checkIn = new Date(`${checkInDate}T00:00:00`);
  if (Number.isNaN(checkIn.getTime())) {
    return { starts_at: "", ends_at: "" };
  }

  checkIn.setHours(checkInHour, 0, 0, 0);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + Math.max(1, nights));
  checkOut.setHours(checkOutHour, 0, 0, 0);

  return {
    starts_at: toDatetimeLocal(checkIn),
    ends_at: toDatetimeLocal(checkOut),
  };
}

export function formatWhen(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function statusLabel(status: BookingStatus | string, kind?: BookingKind) {
  const row = BOOKING_STATUSES.find((item) => item.value === status);
  if (!row) return status;
  if (kind === "appointment") return row.appointment;
  if (kind === "stay") return row.stay;
  return row.label;
}

export function kindLabel(kind: BookingKind | string) {
  if (kind === "stay") return "Stay";
  if (kind === "event") return "Event";
  return "Appointment";
}

export function isSameDay(value: string, day = new Date()) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return (
    date.getFullYear() === day.getFullYear() &&
    date.getMonth() === day.getMonth() &&
    date.getDate() === day.getDate()
  );
}

export function isActiveBooking(booking: Booking) {
  return ["held", "confirmed", "in_progress"].includes(booking.status);
}

export function computeLineTotals(line: BookingLineInput) {
  const quantity = Math.max(0, toNum(line.quantity, 1));
  const unitPrice = toNum(line.unit_price);
  const discount = toNum(line.line_discount);
  const amountBeforeTax = Math.max(0, quantity * unitPrice - discount);
  const taxRate = toNum(line.tax_rate);
  const taxAmount = Number(((amountBeforeTax * taxRate) / 100).toFixed(2));
  const lineTotal = Number((amountBeforeTax + taxAmount).toFixed(2));

  return {
    quantity,
    unit_price: unitPrice,
    line_discount: discount,
    amount_before_tax: Number(amountBeforeTax.toFixed(2)),
    tax_rate: taxRate,
    tax_amount: taxAmount,
    line_total: lineTotal,
  };
}

export const bookingMoney = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const bookingMoneyExact = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
