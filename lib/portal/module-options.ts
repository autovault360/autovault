export type PortalBasePath = "/dashboard" | "/cpa";

export type PortalModuleOptions = {
  /** When true, hide create/edit/delete actions; keep view, print, export, download. */
  readOnly?: boolean;
  /** When false, omit AdminHeader (CPA pages use CpaHeader in the page shell). */
  showAdminHeader?: boolean;
  /** Base path for in-module links (deal jackets, payroll employees, etc.). */
  basePath?: PortalBasePath;
};

export const DEFAULT_PORTAL_MODULE_OPTIONS: Required<PortalModuleOptions> = {
  readOnly: false,
  showAdminHeader: true,
  basePath: "/dashboard",
};

export function resolvePortalModuleOptions(
  options?: PortalModuleOptions,
): Required<PortalModuleOptions> {
  return {
    ...DEFAULT_PORTAL_MODULE_OPTIONS,
    ...options,
  };
}
