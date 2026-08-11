/**
 * Client-side CSV helpers (RFC 4180 + UTF-8 BOM for Excel).
 */

export function escapeCsv(value: unknown) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function rowsToCsv(
  headers: string[],
  rows: Array<Record<string, unknown>>
) {
  const lines = [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) =>
      headers.map((header) => escapeCsv(row[header])).join(",")
    ),
  ];

  return `\uFEFF${lines.join("\r\n")}`;
}

export function downloadCsvFile(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function toIsoDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function inDateRange(
  value: string | null | undefined,
  from?: string,
  to?: string
) {
  if (!from && !to) return true;

  const iso = toIsoDate(value);
  if (!iso) return false;

  if (from && iso < from) return false;
  if (to && iso > to) return false;
  return true;
}
