// Paste into Modules/invoices.js
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
        i.invoice_number, i.invoice_date, i.due_date, i.is_draft,
        i.sales_channel, i.order_type,
        COALESCE(c.customer_name, '') AS customer_name,
        COALESCE(c.customer_phone, '') AS customer_phone,
        COALESCE(c.customer_email, '') AS customer_email,
        COALESCE(c.customer_gst, '') AS customer_gst,
        COALESCE(c.customer_business_name, '') AS customer_business_name,
        COALESCE(i.custom_billing_address, '') AS billing_address,
        COALESCE(i.custom_delivery_address, '') AS delivery_address,
        COALESCE(i.payment_terms, '') AS payment_terms,
        i.subtotal, i.discount_amount, i.tax_amount,
        i.grand_total, i.rounded_total,
        COALESCE(i.notes, '') AS notes,
        i.created_at
      FROM invoices i
      LEFT JOIN customers c ON c.id = i.customer_id AND c.tenant_id = i.tenant_id
      WHERE i.tenant_id = ? AND i.is_archived = 0
    `;
    const params = [tenantId];

    if (from && to) {
      sql += ` AND i.invoice_date IS NOT NULL AND i.invoice_date >= ? AND i.invoice_date < ?`;
      params.push(from, endExclusive(to));
    }

    sql += ` ORDER BY i.invoice_date DESC, i.created_at DESC`;

    const [rows] = await db.query(sql, params);

    const headers = [
      "Invoice Number", "Invoice Date", "Due Date", "Status", "Sales Channel", "Order Type",
      "Customer Name", "Customer Phone", "Customer Email", "Customer GST", "Customer Business",
      "Billing Address", "Delivery Address", "Payment Terms",
      "Subtotal", "Discount", "Tax", "Grand Total", "Rounded Total", "Notes", "Created At",
    ];

    const mapped = rows.map((r) => ({
      "Invoice Number": r.invoice_number,
      "Invoice Date": r.invoice_date ? new Date(r.invoice_date).toISOString().slice(0, 10) : "",
      "Due Date": r.due_date ? new Date(r.due_date).toISOString().slice(0, 10) : "",
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
      "Created At": r.created_at ? new Date(r.created_at).toISOString() : "",
    }));

    const stamp = from && to
      ? `${from.toISOString().slice(0, 10)}_to_${to.toISOString().slice(0, 10)}`
      : "all";

    return sendCsv(res, `invoices-export-${stamp}.csv`, rowsToCsv(headers, mapped));
  } catch (err) {
    console.error("GET /invoices/export error:", err);
    return fail(res, "Failed to export invoices");
  }
});
