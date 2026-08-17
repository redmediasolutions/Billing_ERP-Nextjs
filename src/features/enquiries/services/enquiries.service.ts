import { enquiriesRepository } from "../repository/enquiries.repository";
import type {
  Enquiry,
  EnquiryChannel,
  EnquiryChannelInput,
  EnquiryInput,
  EnquiryStatus,
  EnquirySummary,
  EnquiryUpdate,
  EnquiryUpdateInput,
} from "../types";

function asBool(value: unknown) {
  return value === true || value === 1 || value === "1";
}

function asNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const next = Number(value);
  return Number.isFinite(next) ? next : null;
}

function parseUpdates(raw: unknown): EnquiryUpdate[] {
  if (Array.isArray(raw)) return raw as EnquiryUpdate[];
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function toLocalInput(value: string | null | undefined) {
  if (!value) return "";
  const text = String(value).trim();
  if (!text) return "";
  if (text.includes("T")) return text.slice(0, 16);
  if (text.includes(" ")) return text.replace(" ", "T").slice(0, 16);
  return text.slice(0, 16);
}

function normalizeEnquiry(enquiry: Enquiry & { updates_json?: unknown }): Enquiry {
  const status = String(enquiry.status || "new").toLowerCase() as EnquiryStatus;

  return {
    ...enquiry,
    status,
    priority: (String(enquiry.priority || "medium").toLowerCase() as Enquiry["priority"]),
    estimated_value: asNumber(enquiry.estimated_value),
    is_archived: asBool(enquiry.is_archived),
    updates: parseUpdates(
      enquiry.updates ?? (enquiry as { updates_json?: unknown }).updates_json
    ),
    call_datetime: enquiry.call_datetime
      ? toLocalInput(enquiry.call_datetime)
      : null,
    follow_up_at: enquiry.follow_up_at
      ? toLocalInput(enquiry.follow_up_at)
      : null,
  };
}

function normalizeChannel(channel: EnquiryChannel): EnquiryChannel {
  return {
    ...channel,
    is_active: asBool(channel.is_active),
    is_system: asBool(channel.is_system),
  };
}

function normalizeSummary(summary: EnquirySummary): EnquirySummary {
  return {
    total: Number(summary.total) || 0,
    status_new: Number(summary.status_new) || 0,
    open_pipeline: Number(summary.open_pipeline) || 0,
    won: Number(summary.won) || 0,
    lost: Number(summary.lost) || 0,
    overdue_followups: Number(summary.overdue_followups) || 0,
    due_today: Number(summary.due_today) || 0,
    this_month: Number(summary.this_month) || 0,
    pipeline_value: Number(summary.pipeline_value) || 0,
    by_channel: summary.by_channel || [],
    by_status: summary.by_status || [],
  };
}

export const enquiriesService = {
  async list() {
    const rows = await enquiriesRepository.list();
    return rows.map(normalizeEnquiry);
  },

  async summary() {
    const summary = await enquiriesRepository.summary();
    return normalizeSummary(summary);
  },

  async create(input: EnquiryInput) {
    const enquiry = await enquiriesRepository.create(input);
    return normalizeEnquiry(enquiry);
  },

  async update(id: number, input: EnquiryInput) {
    const enquiry = await enquiriesRepository.update(id, input);
    return normalizeEnquiry(enquiry);
  },

  async addUpdate(id: number, input: EnquiryUpdateInput) {
    const enquiry = await enquiriesRepository.addUpdate(id, input);
    return normalizeEnquiry(enquiry);
  },

  remove: (id: number) => enquiriesRepository.remove(id),

  async channels() {
    const channels = await enquiriesRepository.channels();
    return channels.map(normalizeChannel);
  },

  createChannel: (input: EnquiryChannelInput) =>
    enquiriesRepository.createChannel(input),

  updateChannel: (id: number, input: EnquiryChannelInput) =>
    enquiriesRepository.updateChannel(id, input),
};
