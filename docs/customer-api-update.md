# Customer display-name API update

The frontend now sends `customer_title` and `customer_display_name` on every
customer create/update. Update the pasted Express customer route as follows:

- Include both fields in the `req.body` destructure, defaulting to `""`.
- Store them in the `INSERT` and `UPDATE` statements.
- Use `customer_display_name` in the customer search predicate.
- In invoice and estimate list/detail queries, select
  `COALESCE(NULLIF(c.customer_display_name, ''), c.customer_name) AS customer_display_name`
  from the joined `customers c` row. This gives historical records a safe
  fallback and ensures all sales screens and documents can show the chosen
  display name.

`customer_name` remains the contact's legal/full name; `customer_business_name`
is the company name. Neither is automatically substituted for the display name.
