export const DEALER_ROUTES = {
  dashboard: "/dealer/dashboard",
  inventory: "/dealer/inventory",
  transactions: "/dealer/transactions",
  soldVehicles: "/dealer/sold-vehicles",
  arbitration: "/dealer/dashboard/arbitration",
} as const;

export const DEALER_SECTION_IDS = {
  dashboard: "dashboard-top",
  inventory: "inventory-overview",
  transactions: "dealer-transactions",
  expenses: "expenses",
  documents: "documents",
} as const;

export type DealerSectionId =
  (typeof DEALER_SECTION_IDS)[keyof typeof DEALER_SECTION_IDS];

export type DealerExpandAction =
  | "inventory-add"
  | "inventory-edit"
  | "transaction-add"
  | "sold-add"
  | "expense-add";

export function scrollToSection(
  sectionId: DealerSectionId,
  options?: { behavior?: ScrollBehavior; block?: ScrollLogicalPosition },
) {
  const el = document.getElementById(sectionId);
  if (!el) return;
  el.scrollIntoView({
    behavior: options?.behavior ?? "smooth",
    block: options?.block ?? "start",
  });
}

export function pushSectionHash(sectionId: DealerSectionId) {
  if (typeof window === "undefined") return;
  const hash = sectionId === "dashboard-top" ? "" : sectionId;
  const url = hash
    ? `${window.location.pathname}#${hash}`
    : window.location.pathname;
  window.history.pushState(null, "", url);
}

export function parseHashSection(hash: string): DealerSectionId | null {
  const id = hash.replace(/^#/, "");
  if (!id) return DEALER_SECTION_IDS.dashboard;
  const values = Object.values(DEALER_SECTION_IDS);
  return values.includes(id as DealerSectionId)
    ? (id as DealerSectionId)
    : null;
}
