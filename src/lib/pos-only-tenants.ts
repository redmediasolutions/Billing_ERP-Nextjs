export const POS_ONLY_TENANT_IDS = [9] as const;

export function isPosOnlyTenant(tenantId: number | null | undefined) {
  return tenantId != null && POS_ONLY_TENANT_IDS.includes(tenantId as 9);
}
