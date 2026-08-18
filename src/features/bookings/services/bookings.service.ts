import { bookingsRepository } from "../repository/bookings.repository";
import {
  asBool,
  toLocalInput,
  toNum,
} from "../lib/booking-utils";
import type {
  Booking,
  BookingAvailability,
  BookingInput,
  BookingKind,
  BookingLine,
  BookingResource,
  BookingResourceInput,
  BookingResourceType,
  BookingResourceTypeInput,
  BookingStatus,
  BookingStatusInput,
  BookingSummary,
} from "../types";

function normalizeLine(line: BookingLine): BookingLine {
  return {
    ...line,
    id: String(line.id),
    resource_ref: line.resource_ref ? Number(line.resource_ref) : null,
    item_ref: line.item_ref ? Number(line.item_ref) : null,
    employee_ref: line.employee_ref ? Number(line.employee_ref) : null,
    quantity: toNum(line.quantity, 1),
    occupancy: toNum(line.occupancy, 1),
    unit_price: toNum(line.unit_price),
    amount_before_tax: toNum(line.amount_before_tax),
    tax_rate: toNum(line.tax_rate),
    tax_amount: toNum(line.tax_amount),
    line_discount: toNum(line.line_discount),
    line_total: toNum(line.line_total),
    line_starts_at: line.line_starts_at
      ? toLocalInput(line.line_starts_at)
      : null,
    line_ends_at: line.line_ends_at ? toLocalInput(line.line_ends_at) : null,
  };
}

function normalizeBooking(booking: Booking): Booking {
  const kind = String(booking.booking_kind || "appointment") as BookingKind;
  const status = String(booking.status || "draft") as BookingStatus;
  const lines = (booking.lines || []).map(normalizeLine);

  const linesSubtotal = lines.reduce((sum, line) => sum + line.amount_before_tax, 0);
  const linesTax = lines.reduce((sum, line) => sum + line.tax_amount, 0);
  const linesTotal = lines.reduce((sum, line) => sum + line.line_total, 0);

  return {
    ...booking,
    booking_kind: ["appointment", "stay", "event"].includes(kind)
      ? kind
      : "appointment",
    status,
    customer_ref: booking.customer_ref ? Number(booking.customer_ref) : null,
    enquiry_ref: booking.enquiry_ref ? Number(booking.enquiry_ref) : null,
    employee_ref: booking.employee_ref ? Number(booking.employee_ref) : null,
    invoice_ref: booking.invoice_ref ? Number(booking.invoice_ref) : null,
    party_size: toNum(booking.party_size, 1),
    starts_at: toLocalInput(booking.starts_at),
    ends_at: toLocalInput(booking.ends_at),
    all_day: asBool(booking.all_day),
    deposit_amount: toNum(booking.deposit_amount),
    subtotal: toNum(booking.subtotal) || linesSubtotal,
    discount_amount: toNum(booking.discount_amount),
    tax_amount: toNum(booking.tax_amount) || linesTax,
    grand_total: toNum(booking.grand_total) || linesTotal,
    is_archived: asBool(booking.is_archived),
    display_customer_name:
      booking.display_customer_name || booking.customer_name || null,
    display_phone: booking.display_phone || booking.phone || null,
    display_email: booking.display_email || booking.email || null,
    lines,
  };
}

function normalizeType(row: BookingResourceType): BookingResourceType {
  return {
    ...row,
    default_duration_min:
      row.default_duration_min == null
        ? null
        : toNum(row.default_duration_min),
    allows_staff: asBool(row.allows_staff),
    is_active: asBool(row.is_active),
    is_system: asBool(row.is_system),
    sort_order: toNum(row.sort_order),
  };
}

function normalizeResource(row: BookingResource): BookingResource {
  return {
    ...row,
    type_ref: Number(row.type_ref),
    item_ref: row.item_ref ? Number(row.item_ref) : null,
    employee_ref: row.employee_ref ? Number(row.employee_ref) : null,
    capacity: toNum(row.capacity, 1),
    buffer_before_min: toNum(row.buffer_before_min),
    buffer_after_min: toNum(row.buffer_after_min),
    is_active: asBool(row.is_active),
    is_archived: asBool(row.is_archived),
  };
}

function normalizeSummary(summary: BookingSummary): BookingSummary {
  return {
    total: toNum(summary.total),
    today: toNum(summary.today),
    upcoming: toNum(summary.upcoming),
    in_progress: toNum(summary.in_progress),
    arriving_today: toNum(summary.arriving_today),
    departing_today: toNum(summary.departing_today),
    unbilled: toNum(summary.unbilled),
    this_month_value: toNum(summary.this_month_value),
    by_kind: summary.by_kind || [],
    by_status: summary.by_status || [],
  };
}

export const bookingsService = {
  async list() {
    const rows = await bookingsRepository.list();
    return rows.map(normalizeBooking);
  },

  async summary() {
    const summary = await bookingsRepository.summary();
    return normalizeSummary(summary);
  },

  async calendar(from: string, to: string) {
    const rows = await bookingsRepository.calendar(from, to);
    return rows.map(normalizeBooking);
  },

  async getById(id: number) {
    const booking = await bookingsRepository.getById(id);
    return normalizeBooking(booking);
  },

  async create(input: BookingInput) {
    const booking = await bookingsRepository.create(input);
    return normalizeBooking(booking);
  },

  async update(id: number, input: BookingInput) {
    const booking = await bookingsRepository.update(id, input);
    return normalizeBooking(booking);
  },

  async changeStatus(id: number, input: BookingStatusInput) {
    const booking = await bookingsRepository.changeStatus(id, input);
    return normalizeBooking(booking);
  },

  async convertToInvoice(id: number) {
    const result = await bookingsRepository.convertToInvoice(id);
    return {
      ...result,
      booking: normalizeBooking(result.booking),
      invoice_id: Number(result.invoice_id),
    };
  },

  remove: (id: number) => bookingsRepository.remove(id),

  async availability(input: Parameters<typeof bookingsRepository.availability>[0]) {
    const result = await bookingsRepository.availability(input);
    return result as BookingAvailability;
  },

  async resourceTypes() {
    const rows = await bookingsRepository.resourceTypes();
    return rows.map(normalizeType);
  },

  createResourceType: (input: BookingResourceTypeInput) =>
    bookingsRepository.createResourceType(input),

  updateResourceType: (id: number, input: BookingResourceTypeInput) =>
    bookingsRepository.updateResourceType(id, input),

  async resources() {
    const rows = await bookingsRepository.resources();
    return rows.map(normalizeResource);
  },

  async createResource(input: BookingResourceInput) {
    const row = await bookingsRepository.createResource(input);
    return normalizeResource(row);
  },

  async updateResource(id: number, input: BookingResourceInput) {
    const row = await bookingsRepository.updateResource(id, input);
    return normalizeResource(row);
  },
};
