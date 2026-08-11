/**
 * DROP-IN: Modules/csv.js
 * Shared CSV helpers used by invoices + estimates export routes.
 */

function escapeCsv(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function rowsToCsv(headers, rows) {
  const lines = [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) => headers.map((h) => escapeCsv(row[h])).join(",")),
  ];
  return `\uFEFF${lines.join("\r\n")}`;
}

function parseDateOnly(value) {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function endExclusive(toDate) {
  const x = new Date(toDate);
  x.setDate(x.getDate() + 1);
  x.setHours(0, 0, 0, 0);
  return x;
}

function sendCsv(res, filename, csv) {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  return res.status(200).send(csv);
}

function validateExportRange(query) {
  const from = parseDateOnly(query.from);
  const to = parseDateOnly(query.to);

  if ((query.from && !from) || (query.to && !to)) {
    return { error: "Invalid from/to date. Use YYYY-MM-DD." };
  }

  if ((from && !to) || (!from && to)) {
    return { error: "Provide both from and to, or neither for full export." };
  }

  if (from && to && from > to) {
    return { error: "from must be on or before to" };
  }

  return { from, to };
}

module.exports = {
  rowsToCsv,
  validateExportRange,
  endExclusive,
  sendCsv,
};
