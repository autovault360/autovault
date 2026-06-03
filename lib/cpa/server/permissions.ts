import type { AuthUser } from "@/lib/vehicles/server/utils";

const CPA_PORTAL_ROLES: AuthUser["role"][] = [
  "super_admin",
  "owner",
  "manager",
  "cpa",
];

const ADMIN_ROLES: AuthUser["role"][] = ["super_admin", "owner", "manager"];

export function canAccessCpaPortal(role: AuthUser["role"]): boolean {
  return CPA_PORTAL_ROLES.includes(role);
}

export function canManageCpaNotes(role: AuthUser["role"]): boolean {
  return ADMIN_ROLES.includes(role);
}

export function isCpaReadOnly(role: AuthUser["role"]): boolean {
  return role === "cpa";
}
