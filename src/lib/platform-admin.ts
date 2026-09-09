/**
 * Platform operators who manage tenant licences and custom pricing.
 * Set NEXT_PUBLIC_PLATFORM_ADMIN_EMAILS in .env.local (comma-separated).
 */
const PLATFORM_ADMIN_EMAILS = (
  process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAILS || ""
)
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export function isPlatformAdmin(email: string | null | undefined) {
  if (!email) return false;
  return PLATFORM_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}
