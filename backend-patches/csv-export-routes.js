/**
 * CSV EXPORT ROUTES — paste into Modules/invoices.js and Modules/estimates.js
 *
 * IMPORTANT: Place GET /export BEFORE GET /:id so "export" is not treated as an id.
 *
 * Invoice fields (RFC 4180 CSV, UTF-8 with BOM for Excel):
 * Invoice Number, Invoice Date, Due Date, Status, Sales Channel, Order Type,
 * Customer Name, Customer Phone, Customer Email, Customer GST, Customer Business,
 * Billing Address, Delivery Address, Payment Terms,
 * Subtotal, Discount, Tax, Grand Total, Rounded Total, Notes, Created At
 *
 * Estimate fields:
 * Estimate Number, Reference Number, Estimate Date, Valid Until, Status,
 * Customer Name, Customer Phone, Customer Email, Customer GST, Customer Business,
 * Billing Address, Delivery Address, Payment Terms,
 * Subtotal, Discount, Tax, Grand Total, Rounded Total, Notes, Created At
 *
 * Query params:
 *   ?from=YYYY-MM-DD&to=YYYY-MM-DD  → inclusive date range on document date
 *   (omit both for full tenant export)
 */

// ── Shared helpers (add once near top of each file, or extract to utils/csv.js) ──

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
  // BOM helps Excel open UTF-8 correctly (₹, Indian names, etc.)
  return `\uFEFF${lines.join("\r\n")}`;
}

function parseDateOnly(value) {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function sendCsv(res, filename, csv) {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}"`
  );
  return res.status(200).send(csv);
}

// ═══════════════════════════════════════════════════════════════════════════
// ADD TO invoices.js — BEFORE router.get("/:id", ...)
// ═══════════════════════════════════════════════════════════════════════════

/*
router.get("/export", verifyToken, async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;

    if (!tenantId) {
      return fail(res, "Tenant context missing", 403);
    }

    const from = parseDateOnly(req.query.from);
    const to = parseDateOnly(req.query.to);

    if ((req.query.from && !from) || (req.query.to && !to)) {
      return fail(res, "Invalid from/to date. Use YYYY-MM-DD.", 400);
    }

    if ((from && !to) || (!from && to)) {
      return fail(res, "Provide both from and to, or neither for full export.", 400);
    }

    if (from && to && from > to) {
      return fail(res, "from must be on or before to", 400);
    }

    let sql = `
      SELECT
        i.invoice_number,
        i.invoice_date,
        i.due_date,
        i.is_draft,
        i.sales_channel,
        i.order_type,
        COALESCE(c.customer_name, '') AS customer_name,
        COALESCE(c.customer_phone, '') AS customer_phone,
        COALESCE(c.customer_email, '') AS customer_email,
        COALESCE(c.customer_gst, '') AS customer_gst,
        COALESCE(c.customer_business_name, '') AS customer_business_name,
        COALESCE(i.custom_billing_address, '') AS billing_address,
        COALESCE(i.custom_delivery_address, '') AS delivery_address,
        COALESCE(i.payment_terms, '') AS payment_terms,
        i.subtotal,
        i.discount_amount,
        i.tax_amount,
        i.grand_total,
        i.rounded_total,
        COALESCE(i.notes, '') AS notes,
        i.created_at
      FROM invoices i
      LEFT JOIN customers c
        ON c.id = i.customer_id
       AND c.tenant_id = i.tenant_id
      WHERE i.tenant_id = ?
        AND i.is_archived = 0
    `;

    const params = [tenantId];

    if (from && to) {
      sql += ` AND i.invoice_date IS NOT NULL
               AND i.invoice_date >= ?
               AND i.invoice_date < ?`;
      params.push(from, new Date(endOfDay(to).getTime() + 1));
    }

    sql += ` ORDER BY i.invoice_date DESC, i.created_at DESC`;

    const [rows] = await db.query(sql, params);

    const headers = [
      "Invoice Number",
      "Invoice Date",
      "Due Date",
      "Status",
      "Sales Channel",
      "Order Type",
      "Customer Name",
      "Customer Phone",
      "Customer Email",
      "Customer GST",
      "Customer Business",
      "Billing Address",
      "Delivery Address",
      "Payment Terms",
      "Subtotal",
      "Discount",
      "Tax",
      "Grand Total",
      "Rounded Total",
      "Notes",
      "Created At",
    ];

    const mapped = rows.map((r) => ({
      "Invoice Number": r.invoice_number,
      "Invoice Date": r.invoice_date
        ? new Date(r.invoice_date).toISOString().slice(0, 10)
        : "",
      "Due Date": r.due_date
        ? new Date(r.due_date).toISOString().slice(0, 10)
        : "",
      Status: Number(r.is_draft) === 1 ? "Draft" : "Finalized",
      "Sales Channel": r.sales_channel || "",
      "Order Type": r.order_type || "",
      "Customer Name": r.customer_name,
      "Customer Phone": r.customer_phone,
      "Customer Email": r.customer_email,
      "Customer GST": r.customer_gst,
      "Customer Business": r.customer_business_name,
      "Billing Address": r.billing_address,
      "Delivery Address": r.delivery_address,
      "Payment Terms": r.payment_terms,
      Subtotal: Number(r.subtotal) || 0,
      Discount: Number(r.discount_amount) || 0,
      Tax: Number(r.tax_amount) || 0,
      "Grand Total": Number(r.grand_total) || 0,
      "Rounded Total": Number(r.rounded_total) || 0,
      Notes: r.notes,
      "Created At": r.created_at
        ? new Date(r.created_at).toISOString()
        : "",
    }));

    const stamp =
      from && to
        ? `${from.toISOString().slice(0, 10)}_to_${to.toISOString().slice(0, 10)}`
        : "all";

    return sendCsv(res, `invoices-export-${stamp}.csv`, rowsToCsv(headers, mapped));
  } catch (err) {
    console.error("GET /invoices/export error:", err);
    return fail(res, "Failed to export invoices");
  }
});
*/

// ═══════════════════════════════════════════════════════════════════════════
// ADD TO estimates.js — BEFORE router.get("/:id", ...)
// ═══════════════════════════════════════════════════════════════════════════

/*
router.get("/export", verifyToken, async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;

    if (!tenantId) {
      return fail(res, "Tenant context missing", 403);
    }

    const from = parseDateOnly(req.query.from);
    const to = parseDateOnly(req.query.to);

    if ((req.query.from && !from) || (req.query.to && !to)) {
      return fail(res, "Invalid from/to date. Use YYYY-MM-DD.", 400);
    }

    if ((from && !to) || (!from && to)) {
      return fail(res, "Provide both from and to, or neither for full export.", 400);
    }

    if (from && to && from > to) {
      return fail(res, "from must be on or before to", 400);
    }

    let sql = `
      SELECT
        e.estimate_number,
        e.reference_number,
        e.estimate_date,
        e.valid_until,
        e.is_draft,
        COALESCE(c.customer_name, '') AS customer_name,
        COALESCE(c.customer_phone, '') AS customer_phone,
        COALESCE(c.customer_email, '') AS customer_email,
        COALESCE(c.customer_gst, '') AS customer_gst,
        COALESCE(c.customer_business_name, '') AS customer_business_name,
        COALESCE(e.custom_billing_address, '') AS billing_address,
        COALESCE(e.custom_delivery_address, '') AS delivery_address,
        COALESCE(e.payment_terms, '') AS payment_terms,
        e.subtotal,
        e.total_discount,
        e.total_tax,
        e.grand_total,
        e.rounded_total,
        COALESCE(e.notes, '') AS notes,
        e.created_at
      FROM estimates e
      LEFT JOIN customers c
        ON c.id = e.customer_id
       AND c.tenant_id = e.tenant_id
      WHERE e.tenant_id = ?
        AND e.is_archived = 0
    `;

    const params = [tenantId];

    if (from && to) {
      sql += ` AND e.estimate_date IS NOT NULL
               AND e.estimate_date >= ?
               AND e.estimate_date < ?`;
      params.push(from, new Date(endOfDay(to).getTime() + 1));
    }

    sql += ` ORDER BY e.estimate_date DESC, e.created_at DESC`;

    const [rows] = await db.query(sql, params);

    const headers = [
      "Estimate Number",
      "Reference Number",
      "Estimate Date",
      "Valid Until",
      "Status",
      "Customer Name",
      "Customer Phone",
      "Customer Email",
      "Customer GST",
      "Customer Business",
      "Billing Address",
      "Delivery Address",
      "Payment Terms",
      "Subtotal",
      "Discount",
      "Tax",
      "Grand Total",
      "Rounded Total",
      "Notes",
      "Created At",
    ];

    const mapped = rows.map((r) => ({
      "Estimate Number": r.estimate_number,
      "Reference Number": r.reference_number || "",
      "Estimate Date": r.estimate_date
        ? new Date(r.estimate_date).toISOString().slice(0, 10)
        : "",
      "Valid Until": r.valid_until
        ? new Date(r.valid_until).toISOString().slice(0, 10)
        : "",
      Status: Number(r.is_draft) === 1 ? "Draft" : "Finalized",
      "Customer Name": r.customer_name,
      "Customer Phone": r.customer_phone,
      "Customer Email": r.customer_email,
      "Customer GST": r.customer_gst,
      "Customer Business": r.customer_business_name,
      "Billing Address": r.billing_address,
      "Delivery Address": r.delivery_address,
      "Payment Terms": r.payment_terms,
      Subtotal: Number(r.subtotal) || 0,
      Discount: Number(r.total_discount) || 0,
      Tax: Number(r.total_tax) || 0,
      "Grand Total": Number(r.grand_total) || 0,
      "Rounded Total": Number(r.rounded_total) || 0,
      Notes: r.notes,
      "Created At": r.created_at
        ? new Date(r.created_at).toISOString()
        : "",
    }));

    const stamp =
      from && to
        ? `${from.toISOString().slice(0, 10)}_to_${to.toISOString().slice(0, 10)}`
        : "all";

    return sendCsv(res, `estimates-export-${stamp}.csv`, rowsToCsv(headers, mapped));
  } catch (err) {
    console.error("GET /estimates/export error:", err);
    return fail(res, "Failed to export estimates");
  }
});
*/
