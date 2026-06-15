export function getDashboardPathForRole(role: string | null | undefined): string {
  switch (role) {
    case "cpa":
      return "/cpa/dashboard";
    case "sales_rep":
      return "/sales-rep/dashboard";
    case "wholesale_dealer":
      return "/dealer/dashboard";
    default:
      return "/dashboard";
  }
}
