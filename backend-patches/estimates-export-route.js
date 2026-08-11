// Paste into Modules/estimates.js
// 1) At top: const { rowsToCsv, validateExportRange, endExclusive, sendCsv } = require("./csv");
// 2) Place this route BEFORE router.get("/:id", ...)

router.get("/export", verifyToken, async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    if (!tenantId) return fail(res, "Tenant context missing", 403);

    const range = validateExportRange(req.query);
    if (range.error) return fail(res, range.error, 400);
    const { from, to } = range;

    let sql = `
      SELECT
        e.estimate_number, e.reference_number, e.estimate_date, e.valid_until, e.is_draft,
        COALESCE(c.customer_name, '') AS customer_name,
        COALESCE(c.customer_phone, '') AS customer_phone,
        COALESCE(c.customer_email, '') AS customer_email,
        COALESCE(c.customer_gst, '') AS customer_gst,
        COALESCE(c.customer_business_name, '') AS customer_business_name,
        COALESCE(e.custom_billing_address, '') AS billing_address,
        COALESCE(e.custom_delivery_address, '') AS delivery_address,
        COALESCE(e.payment_terms, '') AS payment_terms,
        e.subtotal, e.total_discount, e.total_tax,
        e.grand_total, e.rounded_total,
        COALESCE(e.notes, '') AS notes,
        e.created_at
      FROM estimates e
      LEFT JOIN customers c ON c.id = e.customer_id AND c.tenant_id = e.tenant_id
      WHERE e.tenant_id = ? AND e.is_archived = 0
    `;
    const params = [tenantId];

    if (from && to) {
      sql += ` AND e.estimate_date IS NOT NULL AND e.estimate_date >= ? AND e.estimate_date < ?`;
      params.push(from, endExclusive(to));
    }

    sql += ` ORDER BY e.estimate_date DESC, e.created_at DESC`;

    const [rows] = await db.query(sql, params);

    const headers = [
      "Estimate Number", "Reference Number", "Estimate Date", "Valid Until", "Status",
      "Customer Name", "Customer Phone", "Customer Email", "Customer GST", "Customer Business",
      "Billing Address", "Delivery Address", "Payment Terms",
      "Subtotal", "Discount", "Tax", "Grand Total", "Rounded Total", "Notes", "Created At",
    ];

    const mapped = rows.map((r) => ({
      "Estimate Number": r.estimate_number,
      "Reference Number": r.reference_number || "",
      "Estimate Date": r.estimate_date ? new Date(r.estimate_date).toISOString().slice(0, 10) : "",
      "Valid Until": r.valid_until ? new Date(r.valid_until).toISOString().slice(0, 10) : "",
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
      "Created At": r.created_at ? new Date(r.created_at).toISOString() : "",
    }));

    const stamp = from && to
      ? `${from.toISOString().slice(0, 10)}_to_${to.toISOString().slice(0, 10)}`
      : "all";

    return sendCsv(res, `estimates-export-${stamp}.csv`, rowsToCsv(headers, mapped));
  } catch (err) {
    console.error("GET /estimates/export error:", err);
    return fail(res, "Failed to export estimates");
  }
});
