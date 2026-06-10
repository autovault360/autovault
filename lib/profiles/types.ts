import type { AuthUser } from "@/lib/vehicles/server/utils";

export type BaseProfile = {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type SalesRepProfile = BaseProfile & {
  address: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  hireDate: string | null;
  commissionRate: number;
  monthlyGoal: number;
};

export type ManagerProfile = BaseProfile & {
  department: string | null;
  canApprove: boolean;
};

export type WholesaleDealerProfile = BaseProfile & {
  companyName: string | null;
  businessPhone: string | null;
  contactPerson: string | null;
  taxId: string | null;
  licenseNumber: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
};

export type OwnerProfile = BaseProfile & {
  phone: string | null;
  title: string | null;
};

export type CpaProfile = BaseProfile & {
  firstName: string | null;
  lastName: string | null;
  status: "PENDING" | "ACTIVE" | "DISABLED";
  lastLogin: string | null;
};

export type AnyProfile =
  | SalesRepProfile
  | ManagerProfile
  | WholesaleDealerProfile
  | OwnerProfile
  | CpaProfile;

export function getProfileTableForRole(role: AuthUser["role"]): string | null {
  switch (role) {
    case "sales_rep":
      return "sales_rep_profiles";
    case "manager":
      return "manager_profiles";
    case "wholesale_dealer":
      return "wholesale_dealer_profiles";
    case "owner":
      return "owner_profiles";
    case "cpa":
      return "cpa_profiles";
    default:
      return null;
  }
}

export function getProfileTypeForRole(role: AuthUser["role"]): string | null {
  switch (role) {
    case "sales_rep":
      return "SalesRepProfile";
    case "manager":
      return "ManagerProfile";
    case "wholesale_dealer":
      return "WholesaleDealerProfile";
    case "owner":
      return "OwnerProfile";
    case "cpa":
      return "CpaProfile";
    default:
      return null;
  }
}
