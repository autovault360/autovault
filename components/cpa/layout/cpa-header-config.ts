export type CpaHeaderBackLink = {
  href: string;
  label: string;
};

export type CpaHeaderDefaults = {
  title: string;
  subtitle: string;
  showViewMode: boolean;
  showMonthNav: boolean;
  backLink?: CpaHeaderBackLink;
};

const PAGE_DEFAULTS: Record<string, CpaHeaderDefaults> = {
  "/cpa/dashboard": {
    title: "CPA Dashboard",
    subtitle: "Real-time financials, tax reporting & compliance center",
    showViewMode: true,
    showMonthNav: true,
  },
  "/cpa/dashboard/monthly-financial": {
    title: "Monthly Financials",
    subtitle: "Detailed financial summary and activity",
    showViewMode: false,
    showMonthNav: true,
    backLink: { href: "/cpa/dashboard", label: "Back to Dashboard" },
  },
  "/cpa/yearly-financials": {
    title: "Yearly Financials",
    subtitle: "Annual financial overview and year-end reporting",
    showViewMode: true,
    showMonthNav: false,
  },
  "/cpa/sales-tax": {
    title: "Sales Tax Center",
    subtitle: "CDTFA filings, tax collected, and payment history",
    showViewMode: false,
    showMonthNav: true,
  },
  "/cpa/dashboard/payroll-commissions": {
    title: "Payroll & Commissions",
    subtitle: "Track payroll expenses and sales commissions for your team.",
    showViewMode: true,
    showMonthNav: true,
  },
  "/cpa/payroll": {
    title: "Payroll & Commissions",
    subtitle: "Track payroll expenses and sales commissions for your team.",
    showViewMode: true,
    showMonthNav: true,
  },
  "/cpa/deal-jackets": {
    title: "Deal Jacket Review",
    subtitle: "Deal documentation status and compliance review",
    showViewMode: false,
    showMonthNav: true,
  },
  "/cpa/audit": {
    title: "Audit Readiness",
    subtitle: "Audit preparation status and documentation checklist",
    showViewMode: false,
    showMonthNav: true,
  },
  "/cpa/files": {
    title: "Files & Storage",
    subtitle: "Document storage, folders, and file management",
    showViewMode: false,
    showMonthNav: false,
  },
  "/cpa/exports": {
    title: "Exports & Reports",
    subtitle: "Download financial reports and export packages",
    showViewMode: false,
    showMonthNav: true,
  },
  "/cpa/ai-assistant": {
    title: "AI CPA Assistant",
    subtitle: "AI-powered financial analysis and CPA support",
    showViewMode: false,
    showMonthNav: false,
  },
};

export function getCpaHeaderDefaults(pathname: string): CpaHeaderDefaults {
  if (PAGE_DEFAULTS[pathname]) {
    return PAGE_DEFAULTS[pathname];
  }

  if (/^\/cpa\/deal-jackets\/[^/]+$/.test(pathname)) {
    return {
      title: "Deal Jacket Review",
      subtitle: "Review deal documentation, expenses, and supporting files",
      showViewMode: false,
      showMonthNav: false,
      backLink: { href: "/cpa/deal-jackets", label: "Back to Deal Jackets" },
    };
  }

  if (/^\/cpa\/payroll\/employee\/[^/]+$/.test(pathname)) {
    return {
      title: "Payroll & Commissions",
      subtitle: "Employee payroll and commission details",
      showViewMode: false,
      showMonthNav: false,
      backLink: { href: "/cpa/dashboard/payroll-commissions", label: "Back to Payroll" },
    };
  }

  for (const [route, config] of Object.entries(PAGE_DEFAULTS)) {
    if (route !== "/cpa/dashboard" && pathname.startsWith(`${route}/`)) {
      return config;
    }
  }

  return {
    title: "CPA Portal",
    subtitle: "AutoVault360 accounting and compliance center",
    showViewMode: false,
    showMonthNav: true,
  };
}
