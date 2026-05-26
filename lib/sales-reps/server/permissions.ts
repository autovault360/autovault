import type { AuthUser } from "@/lib/vehicles/server/utils";

const MANAGER_ROLES = new Set<AuthUser["role"]>(["owner", "manager", "super_admin"]);

export function canManageSalesReps(role: AuthUser["role"]): boolean {
  return MANAGER_ROLES.has(role);
}
