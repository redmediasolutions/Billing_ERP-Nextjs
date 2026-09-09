/**
 * Paste on API server as:
 *   /home/ubuntu/billing-erp/src/Modules/subscription/subscription.shared.js
 *
 * Fix: shapeTenantRow accepts both DB column names (subscription_plan)
 * and list-query aliases (plan_code, expires_on, amount).
 */
const GRACE_DAYS = 7;

const PLAN_NAMES = {
  starter: "Starter",
  professional: "Professional",
  business: "Business",
  enterprise: "Enterprise",
};

function dateOnly(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return String(value).slice(0, 10);
}

function addDays(iso, days) {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function diffDays(iso) {
  if (!iso) return null;
  const target = new Date(`${iso}T00:00:00`);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function bannerWithinDays(cycle) {
  return cycle === "monthly" ? 7 : 15;
}

function deriveStatus(expiresOn, storedStatus, cycle) {
  const reported = String(storedStatus || "").toLowerCase();
  if (reported === "cancelled") return "cancelled";
  if (reported === "trial") {
    const remaining = diffDays(expiresOn);
    if (remaining != null && remaining < 0) {
      return deriveStatus(expiresOn, null, cycle);
    }
    return "trial";
  }
  if (!expiresOn) return "unconfigured";

  const remaining = diffDays(expiresOn);
  if (remaining == null) return "unconfigured";
  if (remaining > bannerWithinDays(cycle)) return "active";
  if (remaining >= 0) return "due_soon";

  const untilLock = diffDays(addDays(expiresOn, GRACE_DAYS));
  if (untilLock != null && untilLock >= 0) return "grace";
  return "locked";
}

function shapeTenantRow(row) {
  const planCode = row.subscription_plan ?? row.plan_code ?? null;
  const expiresOn = dateOnly(row.subscription_expiry ?? row.expires_on);
  const cycle = row.subscription_cycle ?? row.billing_cycle ?? null;
  const storedStatus = row.subscription_status ?? null;
  const startedOn = dateOnly(row.subscription_started_on ?? row.started_on);
  const amountRaw = row.subscription_amount ?? row.amount;

  return {
    plan_code: planCode || null,
    plan_name: PLAN_NAMES[planCode] || planCode,
    billing_cycle: cycle,
    status: deriveStatus(expiresOn, storedStatus, cycle),
    started_on: startedOn,
    expires_on: expiresOn,
    grace_ends_on: addDays(expiresOn, GRACE_DAYS),
    days_remaining: diffDays(expiresOn),
    amount: amountRaw == null ? null : Number(amountRaw),
    currency: "INR",
    auto_renew: Boolean(row.subscription_auto_renew),
    seats:
      row.subscription_seats == null ? null : Number(row.subscription_seats),
  };
}

async function loadTenantSubscription(db, tenantId) {
  const [rows] = await db.query(
    `SELECT
      id,
      business_name,
      reference,
      subscription_plan,
      subscription_expiry,
      subscription_cycle,
      subscription_started_on,
      subscription_amount,
      subscription_status,
      subscription_seats,
      subscription_auto_renew
     FROM tenants
     WHERE id = ?
     LIMIT 1`,
    [tenantId]
  );
  return rows[0] || null;
}

async function nextInvoiceNumber(db, tenantId) {
  const year = new Date().getFullYear();
  const [[row]] = await db.query(
    `SELECT COUNT(*) AS n FROM subscription_invoices
     WHERE tenant_id = ? AND YEAR(billed_on) = ?`,
    [tenantId, year]
  );
  const seq = String((row?.n || 0) + 1).padStart(4, "0");
  return `SUB-${year}-${seq}`;
}

module.exports = {
  GRACE_DAYS,
  PLAN_NAMES,
  dateOnly,
  addDays,
  diffDays,
  deriveStatus,
  shapeTenantRow,
  loadTenantSubscription,
  nextInvoiceNumber,
};
