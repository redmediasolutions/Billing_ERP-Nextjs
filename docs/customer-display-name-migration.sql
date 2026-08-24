-- Customer identity fields
-- Run once against the API database before deploying the frontend.
ALTER TABLE customers
  ADD COLUMN customer_title VARCHAR(16) NULL AFTER customer_name,
  ADD COLUMN customer_display_name VARCHAR(255) NULL AFTER customer_title;

-- Preserve the current sales-facing label for existing customers.
UPDATE customers
SET customer_display_name = customer_name
WHERE customer_display_name IS NULL OR TRIM(customer_display_name) = '';

-- New customer writes should store both fields. Customer search and every
-- invoice/estimate customer JOIN should select customer_display_name too.
