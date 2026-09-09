-- ERP SaaS licence (vendor → tenant companies)
-- Safe to re-run: uses IF NOT EXISTS (MariaDB 10.0.2+).
-- If you already ran part of an older script, this will only add what's missing.

-- 1) See what you already have (optional)
-- SHOW COLUMNS FROM tenants LIKE 'subscription%';
-- SHOW COLUMNS FROM users LIKE 'is_platform_admin';

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS subscription_cycle ENUM('monthly', 'yearly') NULL AFTER subscription_expiry;

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS subscription_started_on DATE NULL AFTER subscription_cycle;

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS subscription_amount DECIMAL(12, 2) NULL AFTER subscription_started_on;

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS subscription_status ENUM('trial', 'active', 'cancelled') NULL AFTER subscription_amount;

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS subscription_seats INT NULL AFTER subscription_status;

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS subscription_auto_renew TINYINT(1) NOT NULL DEFAULT 0 AFTER subscription_seats;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_platform_admin TINYINT(1) NOT NULL DEFAULT 0 AFTER tenant_id;

CREATE TABLE IF NOT EXISTS subscription_invoices (
  id INT NOT NULL AUTO_INCREMENT,
  tenant_id INT NOT NULL,
  invoice_number VARCHAR(40) NOT NULL,
  billed_on DATE NOT NULL,
  period_start DATE NULL,
  period_end DATE NULL,
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  status ENUM('paid', 'unpaid', 'overdue', 'void') NOT NULL DEFAULT 'paid',
  plan_code VARCHAR(40) NULL,
  billing_cycle ENUM('monthly', 'yearly') NULL,
  notes VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_sub_inv_number (tenant_id, invoice_number),
  KEY idx_sub_inv_tenant (tenant_id)
);

CREATE TABLE IF NOT EXISTS subscription_renew_requests (
  id INT NOT NULL AUTO_INCREMENT,
  tenant_id INT NOT NULL,
  plan_code VARCHAR(40) NULL,
  billing_cycle ENUM('monthly', 'yearly') NULL,
  amount DECIMAL(12, 2) NULL,
  notes VARCHAR(500) NULL,
  status ENUM('open', 'processed', 'rejected') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_sub_req_tenant (tenant_id),
  KEY idx_sub_req_status (status)
);

-- If the table was created from an older script, add missing columns:
ALTER TABLE subscription_renew_requests
  ADD COLUMN IF NOT EXISTS plan_code VARCHAR(40) NULL AFTER tenant_id;

ALTER TABLE subscription_renew_requests
  ADD COLUMN IF NOT EXISTS billing_cycle ENUM('monthly', 'yearly') NULL AFTER plan_code;

ALTER TABLE subscription_renew_requests
  ADD COLUMN IF NOT EXISTS amount DECIMAL(12, 2) NULL AFTER billing_cycle;

ALTER TABLE subscription_renew_requests
  ADD COLUMN IF NOT EXISTS notes VARCHAR(500) NULL AFTER amount;

ALTER TABLE subscription_renew_requests
  ADD COLUMN IF NOT EXISTS status ENUM('open', 'processed', 'rejected') NOT NULL DEFAULT 'open' AFTER notes;

ALTER TABLE subscription_renew_requests
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER status;
