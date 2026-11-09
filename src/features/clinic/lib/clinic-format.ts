// Shared helpers for the clinic modules merged from Anwy Med.
//
// The API sends clinic date-times as IST wall-clock strings
// ("2026-11-10 17:30:00"). They are parsed as local parts (never through
// UTC), so a browser in another timezone still shows the clinic's time.

export const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export const NO_EXPIRY_DATE = "2099-12-31";

function parts(value?: string | null) {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(
    String(value)
  );
  if (!m) return null;
  return new Date(
    Number(m[1]),
    Number(m[2]) - 1,
    Number(m[3]),
    Number(m[4] || 0),
    Number(m[5] || 0),
    Number(m[6] || 0)
  );
}

export function formatDate(value?: string | null) {
  const d = parts(value);
  if (!d) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(value?: string | null) {
  const d = parts(value);
  if (!d) return "";
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDateTime(value?: string | null) {
  if (!value) return "—";
  return `${formatDate(value)}, ${formatTime(value)}`;
}

export function formatExpiry(value?: string | null) {
  if (!value || value === NO_EXPIRY_DATE) return "No expiry";
  return formatDate(value);
}

export function ageFrom(dob?: string | null) {
  const d = parts(dob);
  if (!d) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const beforeBirthday =
    now.getMonth() < d.getMonth() ||
    (now.getMonth() === d.getMonth() && now.getDate() < d.getDate());
  if (beforeBirthday) age -= 1;
  return age >= 0 ? age : null;
}

/** API wall-clock -> <input type="datetime-local"> value */
export function toLocalInput(value?: string | null) {
  if (!value) return "";
  return String(value).replace(" ", "T").slice(0, 16);
}

/** <input type="datetime-local"> value -> API wall-clock */
export function fromLocalInput(value: string) {
  if (!value) return "";
  const text = value.replace("T", " ");
  return text.length === 16 ? `${text}:00` : text;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function todayInput() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Next quarter hour, as a datetime-local value */
export function nextSlotInput(minutesAhead = 15) {
  const d = new Date(Date.now() + minutesAhead * 60000);
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export function isToday(value?: string | null) {
  return Boolean(value) && String(value).slice(0, 10) === todayInput();
}

export function initials(name?: string | null) {
  const text = (name || "?").trim();
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
  return text.slice(0, 2).toUpperCase();
}

export function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback;
}

export const toneClass = {
  green:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400",
  amber:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-400",
  blue:
    "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-400",
  red:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400",
  muted: "",
} as const;

export type Tone = keyof typeof toneClass;
