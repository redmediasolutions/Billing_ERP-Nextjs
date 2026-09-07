const STORAGE_PREFIX = "billing-erp.subscription.nag";

function todayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function storageKey(tenantId: number | string | null | undefined) {
  return `${STORAGE_PREFIX}:${tenantId ?? "unknown"}`;
}

export function wasNagDismissedToday(
  tenantId: number | string | null | undefined,
  fingerprint: string
) {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.localStorage.getItem(storageKey(tenantId));
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { day?: string; fingerprint?: string };
    return parsed.day === todayKey() && parsed.fingerprint === fingerprint;
  } catch {
    return false;
  }
}

export function dismissNagToday(
  tenantId: number | string | null | undefined,
  fingerprint: string
) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    storageKey(tenantId),
    JSON.stringify({ day: todayKey(), fingerprint })
  );
}

export function nagFingerprint(input: {
  status: string;
  daysRemaining: number | null;
  daysUntilLock: number | null;
}) {
  return [
    input.status,
    input.daysRemaining ?? "na",
    input.daysUntilLock ?? "na",
  ].join(":");
}
